import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

function assertConfigured() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Add your Supabase URL and publishable key to .env.local.')
  }
}

function snakeToCamel(value) {
  if (Array.isArray(value)) return value.map(snakeToCamel)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
        snakeToCamel(item),
      ])
    )
  }
  return value
}

function camelToSnake(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return input

  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
        .toLowerCase(),
      value,
    ])
  )
}

function getUserRecord(user) {
  if (!user) return null
  return {
    id: user.id,
    uid: user.id,
    email: user.email,
    fullName: user.user_metadata?.full_name || user.user_metadata?.fullName || user.email?.split('@')[0] || '',
    username: user.user_metadata?.username || user.email?.split('@')[0] || '',
    phone: user.user_metadata?.phone || '',
    freeFireUid: user.user_metadata?.free_fire_uid || '',
    freeFireNickname: user.user_metadata?.free_fire_nickname || '',
    photoURL: user.user_metadata?.avatar_url || user.user_metadata?.photo_url || '',
    walletBalance: 0,
    role: 'user',
    stats: { tournamentsPlayed: 0, wins: 0, kills: 0, totalWinnings: 0 },
    createdAt: user.created_at,
  }
}

export async function registerUser({ fullName, username, email, password, phone }) {
  assertConfigured()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        username: username.trim(),
        phone: phone || '',
      },
    },
  })

  if (error) throw error
  const user = data?.user
  if (!user) throw new Error('Account creation failed.')

  const row = {
    id: user.id,
    full_name: fullName,
    username: username.trim(),
    email,
    phone: phone || '',
    free_fire_uid: '',
    free_fire_nickname: '',
    avatar_url: '',
    wallet_balance: 0,
    role: 'user',
    stats: {
      tournaments_played: 0,
      wins: 0,
      kills: 0,
      total_winnings: 0,
    },
    created_at: user.created_at,
  }

  const { error: profileError } = await supabase.from('profiles').upsert(row, { onConflict: 'id' })
  if (profileError) throw profileError

  return getUserRecord(user)
}

export async function loginUser(email, password) {
  assertConfigured()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data?.user
}

export async function loginWithGoogle() {
  assertConfigured()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  })

  if (error) throw error
  return data
}

export async function logoutUser() {
  assertConfigured()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email) {
  assertConfigured()
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw error
}

export function watchAuthState(callback) {
  if (!isSupabaseConfigured || !supabase) {
    callback(null)
    return () => {}
  }

  const { data: subscription } = supabase.auth.onAuthStateChange((event, user) => {
    callback(user)
  })

  return () => subscription.subscription.unsubscribe()
}

async function fetchTournaments(status) {
  let query = supabase.from('tournaments').select('*')
  if (status) query = query.eq('status', status)
  query = query.order('date', { ascending: true })

  const { data, error } = await query
  if (error) throw error
  return (data || []).map((item) => snakeToCamel(item))
}

export function listenTournaments(status, callback) {
  if (!isSupabaseConfigured || !supabase) {
    callback([])
    return () => {}
  }

  const refresh = async () => {
    try {
      const list = await fetchTournaments(status)
      callback(list)
    } catch (error) {
      callback([])
    }
  }

  refresh()

  const channel = supabase.channel(`tournaments:${status || 'all'}`)
  const subscription = channel
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments' }, refresh)
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

export async function getTournament(tournamentId) {
  assertConfigured()
  const { data, error } = await supabase.from('tournaments').select('*').eq('id', tournamentId).maybeSingle()
  if (error) throw error
  return data ? snakeToCamel(data) : null
}

export function listenTournament(tournamentId, callback) {
  if (!isSupabaseConfigured || !supabase) {
    callback(null)
    return () => {}
  }

  const refresh = async () => {
    try {
      const { data, error } = await supabase.from('tournaments').select('*').eq('id', tournamentId).maybeSingle()
      if (error) throw error
      callback(data ? snakeToCamel(data) : null)
    } catch {
      callback(null)
    }
  }

  refresh()

  const channel = supabase.channel(`tournament:${tournamentId}`)
  const subscription = channel
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments', filter: `id=eq.${tournamentId}` }, refresh)
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

export async function joinTournament({ tournamentId, userId, freeFireUid, freeFireNickname, teamName }) {
  assertConfigured()

  const { data, error } = await supabase.rpc('join_tournament', {
    p_tournament_id: tournamentId,
    p_user_id: userId,
    p_free_fire_uid: freeFireUid,
    p_free_fire_nickname: freeFireNickname,
    p_team_name: teamName,
  })

  if (error) throw error
  return data?.new_balance ?? null
}

export function listenUserParticipations(userId, callback) {
  if (!isSupabaseConfigured || !supabase) {
    callback([])
    return () => {}
  }

  const refresh = async () => {
    try {
      const { data, error } = await supabase.from('participants').select('*').eq('user_id', userId).order('joined_at', { ascending: false })
      if (error) throw error
      callback((data || []).map((item) => snakeToCamel(item)))
    } catch {
      callback([])
    }
  }

  refresh()

  const channel = supabase.channel(`participants:${userId}`)
  const subscription = channel
    .on('postgres_changes', { event: '*', schema: 'public', table: 'participants', filter: `user_id=eq.${userId}` }, refresh)
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

export async function isUserRegistered(tournamentId, userId) {
  assertConfigured()
  const { data, error } = await supabase
    .from('participants')
    .select('id')
    .eq('tournament_id', tournamentId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return Boolean(data)
}

export function listenResults(tournamentId, callback) {
  if (!isSupabaseConfigured || !supabase) {
    callback([])
    return () => {}
  }

  const refresh = async () => {
    try {
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('rank', { ascending: true })
      if (error) throw error
      callback((data || []).map((item) => snakeToCamel(item)))
    } catch {
      callback([])
    }
  }

  refresh()

  const channel = supabase.channel(`results:${tournamentId}`)
  const subscription = channel
    .on('postgres_changes', { event: '*', schema: 'public', table: 'results', filter: `tournament_id=eq.${tournamentId}` }, refresh)
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

export function listenWalletTransactions(userId, callback, count = 50) {
  if (!isSupabaseConfigured || !supabase) {
    callback([])
    return () => {}
  }

  const refresh = async () => {
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(count)
      if (error) throw error
      callback((data || []).map((item) => snakeToCamel(item)))
    } catch {
      callback([])
    }
  }

  refresh()

  const channel = supabase.channel(`wallet:${userId}`)
  const subscription = channel
    .on('postgres_changes', { event: '*', schema: 'public', table: 'wallet_transactions', filter: `user_id=eq.${userId}` }, refresh)
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

export async function submitDeposit({ userId, amount, referenceId, senderPhone, screenshotUrl }) {
  assertConfigured()
  const { error } = await supabase.from('deposits').insert({
    user_id: userId,
    amount,
    reference_id: referenceId,
    sender_phone: senderPhone,
    screenshot_url: screenshotUrl || null,
    status: 'pending',
    created_at: new Date().toISOString(),
  })

  if (error) throw error
}

export function listenDeposits(userId, callback) {
  if (!isSupabaseConfigured || !supabase) {
    callback([])
    return () => {}
  }

  const refresh = async () => {
    try {
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      callback((data || []).map((item) => snakeToCamel(item)))
    } catch {
      callback([])
    }
  }

  refresh()

  const channel = supabase.channel(`deposits:${userId}`)
  const subscription = channel
    .on('postgres_changes', { event: '*', schema: 'public', table: 'deposits', filter: `user_id=eq.${userId}` }, refresh)
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

export async function submitWithdrawal({ userId, amount, phone, accountName, note }) {
  assertConfigured()

  const { data: profile, error: profileError } = await supabase.from('profiles').select('wallet_balance').eq('id', userId).single()
  if (profileError) throw profileError
  if ((profile?.wallet_balance || 0) < amount) {
    throw new Error('Insufficient wallet balance for this withdrawal.')
  }

  const { error } = await supabase.from('withdrawals').insert({
    user_id: userId,
    amount,
    phone,
    account_name: accountName,
    note: note || '',
    status: 'pending',
    created_at: new Date().toISOString(),
  })

  if (error) throw error
}

export function listenWithdrawals(userId, callback) {
  if (!isSupabaseConfigured || !supabase) {
    callback([])
    return () => {}
  }

  const refresh = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      callback((data || []).map((item) => snakeToCamel(item)))
    } catch {
      callback([])
    }
  }

  refresh()

  const channel = supabase.channel(`withdrawals:${userId}`)
  const subscription = channel
    .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals', filter: `user_id=eq.${userId}` }, refresh)
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

export function listenNotifications(userId, callback) {
  if (!isSupabaseConfigured || !supabase) {
    callback([])
    return () => {}
  }

  const refresh = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      callback((data || []).map((item) => snakeToCamel(item)))
    } catch {
      callback([])
    }
  }

  refresh()

  const channel = supabase.channel(`notifications:${userId}`)
  const subscription = channel
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, refresh)
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

export async function markNotificationRead(notificationId) {
  assertConfigured()
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', notificationId)
  if (error) throw error
}

export function listenUserDoc(userId, callback) {
  if (!isSupabaseConfigured || !supabase) {
    callback(null)
    return () => {}
  }

  const refresh = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
      if (error) throw error
      callback(data ? snakeToCamel(data) : null)
    } catch {
      callback(null)
    }
  }

  refresh()

  const channel = supabase.channel(`profiles:${userId}`)
  const subscription = channel
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, refresh)
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

export async function updateUserProfile(userId, updates) {
  assertConfigured()
  const { error } = await supabase.from('profiles').update(camelToSnake(updates)).eq('id', userId)
  if (error) throw error
}

export function listenMatchRoom(tournamentId, callback) {
  return listenTournament(tournamentId, callback)
}

export default supabase
