-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Table: classes
create table classes (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Table: users (Admins & Teachers)
create table users (
  id uuid default uuid_generate_v4() primary key,
  username text not null unique,
  password text not null, -- Storing plain for this demo as requested (Not production secure)
  name text not null,
  role text not null check (role in ('admin', 'teacher')),
  subject text, -- Nullable, for teachers
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Seed Default Admin
insert into users (username, password, name, role) 
values ('admin', 'admin', 'Administrator', 'admin')
on conflict (username) do nothing;

-- 3. Table: students
create table students (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  nis text not null,
  gender text check (gender in ('L', 'P')),
  class_id uuid references classes(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Table: schedules
create table schedules (
  id uuid default uuid_generate_v4() primary key,
  day text not null,
  start_time text not null,
  end_time text not null,
  subject text not null,
  class_id uuid references classes(id) on delete cascade not null,
  teacher_id uuid references users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Table: attendance
create table attendance (
  id uuid default uuid_generate_v4() primary key,
  date text not null, -- Storing as YYYY-MM-DD string for simplicity matching frontend
  subject text not null,
  status text not null check (status in ('present', 'absent', 'late', 'sick')),
  student_id uuid references students(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Basic Policies (Enable RLS later if needed, currently Open for prototyping)
alter table classes enable row level security;
alter table users enable row level security;
alter table students enable row level security;
alter table schedules enable row level security;
alter table attendance enable row level security;

-- Allow public access for now (Simplest migration)
create policy "Public Access" on classes for all using (true);
create policy "Public Access" on users for all using (true);
create policy "Public Access" on students for all using (true);
create policy "Public Access" on schedules for all using (true);
create policy "Public Access" on attendance for all using (true);
