-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  role text not null check (role in ('admin', 'teacher', 'admission')),
  full_name text not null default '',
  created_at timestamptz default now()
);

-- Exam links table
create table exam_links (
  id uuid primary key default uuid_generate_v4(),
  label text not null,
  url text not null default '',
  updated_at timestamptz default now(),
  updated_by uuid references profiles(id)
);

-- Sessions table
create table sessions (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  date date not null,
  time time not null,
  duration_minutes int not null default 60,
  exam_link_id uuid references exam_links(id),
  status text not null default 'open' check (status in ('open', 'closed')),
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Registrations table
create table registrations (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references sessions(id) not null,
  full_name text not null,
  email text not null,
  phone text not null,
  gender text not null,
  country text not null,
  admission_number text not null,
  upload_token text unique not null default uuid_generate_v4()::text,
  upload_status text not null default 'pending' check (upload_status in ('pending', 'uploaded', 'closed')),
  registered_at timestamptz default now()
);

-- Uploads table
create table uploads (
  id uuid primary key default uuid_generate_v4(),
  registration_id uuid references registrations(id) not null,
  file_url text not null,
  uploaded_at timestamptz default now(),
  verified_by uuid references profiles(id),
  verified_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'verified'))
);

-- Seed exam links
insert into exam_links (label, url) values
  ('Link 1', 'https://example.com/exam/link1'),
  ('Link 2', 'https://example.com/exam/link2'),
  ('Link 3', 'https://example.com/exam/link3'),
  ('Link 4', 'https://example.com/exam/link4');

-- Auto-create profile on user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, role, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'teacher'),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
