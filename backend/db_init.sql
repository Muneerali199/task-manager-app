-- Run this to create the project management schema

create table users (
  id serial primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz default now()
);

create table projects (
  id serial primary key,
  name text not null,
  description text,
  created_by int references users(id),
  created_at timestamptz default now()
);

create table project_members (
  id serial primary key,
  project_id int references projects(id) on delete cascade,
  user_id int references users(id) on delete cascade,
  role text not null check (role in ('admin','member'))
);

create table tasks (
  id serial primary key,
  project_id int references projects(id) on delete cascade,
  title text not null,
  description text,
  assigned_to int references users(id),
  status text not null default 'todo' check (status in ('todo','in_progress','done')),
  due_date date,
  created_at timestamptz default now()
);
