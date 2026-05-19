-- Enable RLS on all tables
alter table profiles enable row level security;
alter table exam_links enable row level security;
alter table sessions enable row level security;
alter table registrations enable row level security;
alter table uploads enable row level security;

-- Helper function to get current user role
create or replace function get_user_role()
returns text as $$
  select role from profiles where id = auth.uid();
$$ language sql security definer;

-- PROFILES policies
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on profiles for select
  using (get_user_role() = 'admin');

-- EXAM LINKS policies
create policy "Anyone can read exam links"
  on exam_links for select
  using (true);

create policy "Admins can update exam links"
  on exam_links for update
  using (get_user_role() = 'admin');

-- SESSIONS policies
create policy "Anyone can read open sessions"
  on sessions for select
  using (status = 'open' or get_user_role() in ('admin', 'teacher', 'admission'));

create policy "Admins can insert sessions"
  on sessions for insert
  with check (get_user_role() = 'admin');

create policy "Admins can update sessions"
  on sessions for update
  using (get_user_role() = 'admin');

create policy "Admins can delete sessions"
  on sessions for delete
  using (get_user_role() = 'admin');

-- REGISTRATIONS policies (service role bypasses RLS for public inserts)
create policy "Staff can read registrations"
  on registrations for select
  using (get_user_role() in ('admin', 'teacher', 'admission'));

create policy "Admins can update registrations"
  on registrations for update
  using (get_user_role() = 'admin');

-- UPLOADS policies (service role bypasses RLS for public uploads)
create policy "Staff can read uploads"
  on uploads for select
  using (get_user_role() in ('admin', 'teacher', 'admission'));

create policy "Teachers can update uploads"
  on uploads for update
  using (get_user_role() in ('admin', 'teacher'));
