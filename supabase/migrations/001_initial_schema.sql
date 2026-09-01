create extension if not exists pgcrypto;

create type tournament_status as enum ('registration_open', 'upcoming', 'ongoing', 'completed');
create type wallet_tx_type as enum ('deposit', 'withdrawal', 'tournament_entry', 'winnings');
create type request_status as enum ('pending', 'approved', 'rejected', 'processing', 'paid', 'completed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  username text not null default '',
  phone text default '',
  free_fire_uid text default '',
  free_fire_nickname text default '',
  avatar_url text default '',
  wallet_balance integer not null default 0,
  role text not null default 'user' check (role in ('user', 'admin')),
  stats jsonb not null default '{"tournamentsPlayed": 0, "wins": 0, "kills": 0, "totalWinnings": 0}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status tournament_status not null default 'registration_open',
  date date not null,
  start_time text,
  mode text not null,
  map text,
  entry_fee integer not null default 0,
  prize_pool integer not null default 0,
  per_kill_reward integer not null default 0,
  booyah_reward integer not null default 0,
  max_players integer not null default 0,
  current_players integer not null default 0,
  rules text,
  room_id text,
  room_password text,
  room_released boolean not null default false,
  results_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  free_fire_uid text not null,
  free_fire_nickname text not null,
  team_name text,
  status text not null default 'registered',
  joined_at timestamptz not null default now(),
  unique (tournament_id, user_id)
);

create table public.results (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  player_name text not null,
  rank integer not null,
  kills integer not null default 0,
  kill_reward integer not null default 0,
  placement_reward integer not null default 0,
  total_reward integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type wallet_tx_type not null,
  amount integer not null,
  status request_status not null default 'completed',
  description text not null,
  related_tournament_id uuid,
  created_at timestamptz not null default now()
);

create table public.deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null,
  reference_id text not null,
  sender_phone text not null,
  screenshot_url text,
  status request_status not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz
);

create table public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null,
  phone text not null,
  account_name text not null,
  note text default '',
  status request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_tournaments_status_date on public.tournaments(status, date);
create index idx_participants_user on public.participants(user_id);
create index idx_participants_tournament on public.participants(tournament_id);
create index idx_results_tournament on public.results(tournament_id, rank);
create index idx_wallet_transactions_user on public.wallet_transactions(user_id, created_at desc);
create index idx_deposits_user on public.deposits(user_id, created_at desc);
create index idx_withdrawals_user on public.withdrawals(user_id, created_at desc);
create index idx_notifications_user on public.notifications(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.tournaments enable row level security;
alter table public.participants enable row level security;
alter table public.results enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.deposits enable row level security;
alter table public.withdrawals enable row level security;
alter table public.notifications enable row level security;

create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = id);

create policy "tournaments_read_public" on public.tournaments
for select using (true);

create policy "tournaments_admin_write" on public.tournaments
for update using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "participants_select_own" on public.participants
for select using (auth.uid() = user_id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "participants_insert_own" on public.participants
for insert with check (auth.uid() = user_id);

create policy "results_read_public" on public.results
for select using (true);

create policy "wallet_transactions_select_own" on public.wallet_transactions
for select using (auth.uid() = user_id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "wallet_transactions_insert_admin_only" on public.wallet_transactions
for insert with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "deposits_select_own" on public.deposits
for select using (auth.uid() = user_id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "deposits_insert_own" on public.deposits
for insert with check (auth.uid() = user_id);

create policy "deposits_update_admin_only" on public.deposits
for update using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "withdrawals_select_own" on public.withdrawals
for select using (auth.uid() = user_id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "withdrawals_insert_own" on public.withdrawals
for insert with check (auth.uid() = user_id);

create policy "withdrawals_update_admin_only" on public.withdrawals
for update using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "notifications_select_own" on public.notifications
for select using (auth.uid() = user_id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "notifications_update_own" on public.notifications
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, username, phone, free_fire_uid, free_fire_nickname, avatar_url, wallet_balance, role, stats)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'free_fire_uid', ''),
    coalesce(new.raw_user_meta_data->>'free_fire_nickname', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    0,
    'user',
    '{"tournamentsPlayed": 0, "wins": 0, "kills": 0, "totalWinnings": 0}'::jsonb
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.join_tournament(
  p_tournament_id uuid,
  p_user_id uuid,
  p_free_fire_uid text,
  p_free_fire_nickname text,
  p_team_name text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tournament record;
  v_user record;
  v_new_balance integer;
begin
  select * into v_tournament from public.tournaments where id = p_tournament_id for update;
  if not found then
    raise exception 'Tournament not found.';
  end if;

  select * into v_user from public.profiles where id = p_user_id for update;
  if not found then
    raise exception 'User profile not found.';
  end if;

  if exists (select 1 from public.participants where tournament_id = p_tournament_id and user_id = p_user_id) then
    raise exception 'You are already registered for this tournament.';
  end if;

  if v_tournament.status <> 'registration_open' then
    raise exception 'Registration is not open for this tournament.';
  end if;

  if (v_tournament.current_players + 1) > v_tournament.max_players then
    raise exception 'This tournament is full.';
  end if;

  if v_user.wallet_balance < v_tournament.entry_fee then
    raise exception 'Insufficient wallet balance. Please add money to your wallet.';
  end if;

  v_new_balance := v_user.wallet_balance - v_tournament.entry_fee;

  update public.profiles
    set wallet_balance = v_new_balance
  where id = p_user_id;

  update public.tournaments
    set current_players = current_players + 1,
        updated_at = now()
  where id = p_tournament_id;

  insert into public.participants (tournament_id, user_id, free_fire_uid, free_fire_nickname, team_name, status, joined_at)
  values (p_tournament_id, p_user_id, p_free_fire_uid, p_free_fire_nickname, p_team_name, 'registered', now());

  insert into public.wallet_transactions (user_id, type, amount, status, description, related_tournament_id, created_at)
  values (p_user_id, 'tournament_entry', -v_tournament.entry_fee, 'completed', 'Entry: ' || v_tournament.name, p_tournament_id, now());

  insert into public.notifications (user_id, type, title, body, read, created_at)
  values (p_user_id, 'tournament_registration', 'Registration confirmed', 'You are in for ' || v_tournament.name || '.', false, now());

  return jsonb_build_object('new_balance', v_new_balance);
end;
$$;
