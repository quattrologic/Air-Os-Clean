-- Run once in Supabase SQL Editor as project owner. No client service-role key.
begin;
create table public.air_notes (
 owner uuid primary key references auth.users(id) on delete cascade,
 revision bigint not null default 0 check (revision >= 0),
 notes jsonb not null default '[]'::jsonb
 check (jsonb_typeof(notes) = 'array' and jsonb_array_length(notes) <= 200
        and octet_length(notes::text) <= 110000000)
);
alter table public.air_notes enable row level security;
alter table public.air_notes force row level security;
revoke all on public.air_notes from anon, authenticated;
grant select on public.air_notes to authenticated;
create policy own_notes on public.air_notes for select to authenticated using (owner = (select auth.uid()));
-- CAS is the only authenticated write path. Never accepts a client owner ID.
create function public.air_notes_commit(expected_revision bigint, new_notes jsonb)
returns bigint language plpgsql security definer set search_path = '' as $$
declare next_revision bigint;
begin
 if auth.uid() is null then raise exception 'Unauthenticated'; end if;
 update public.air_notes set notes = new_notes, revision = revision + 1
 where owner = auth.uid() and revision = expected_revision
 returning revision into next_revision;
 return next_revision;
end;
$$;
revoke all on function public.air_notes_commit(bigint,jsonb) from public, anon;
grant execute on function public.air_notes_commit(bigint,jsonb) to authenticated;
create function public.air_notes_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
 insert into public.air_notes(owner) values(new.id) on conflict do nothing;
 return new;
end;
$$;
revoke all on function public.air_notes_new_user() from public, anon, authenticated;
create trigger air_notes_on_signup after insert on auth.users
for each row execute function public.air_notes_new_user();
insert into public.air_notes(owner) select id from auth.users on conflict do nothing;
commit;
