# Supabase

## Local

https://supabase.com/docs/guides/local-development?queryGroups=package-manager&package-manager=pnpm

```sh
pnpm add supabase --save-dev
pnpx supabase init
pnpx supabase start
pnpx supabase stop
```

Setup `.env.local` with `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` (from command menu)

Studio URL: http://localhost:54323

## DB

### DB Data types

https://supabase.com/docs/guides/database/tables?queryGroups=language&language=js#data-types

### Commands

```sh
pnpm supabase migration new <name>

pnpm supabase migration list --local
pnpm supabase migration up --local

pnpm supabase db reset --local

pnpm supabase gen types typescript --local > src/lib/server/db/database.types.ts
LINKED_PROJECT_ID=$(pnpm supabase projects list -o json | jq -r '.[] | select(.linked==true) | .id')
pnpm supabase gen types typescript --project-id $LINKED_PROJECT_ID > src/lib/db/database.types.ts
```

```sh
pnpm supabase link
pnpm supabase migration list --linked
pnpm supabase migration up --linked
```

### RLS

https://supabase.com/docs/guides/database/postgres/row-level-security
https://supabase.com/docs/guides/api/api-keys

### pg_cron

https://supabase.com/docs/guides/cron

## Supabase realtime

https://supabase.com/docs/guides/realtime/concepts
https://github.com/supabase/realtime
https://supabase.com/blog/supabase-realtime-multiplayer-general-availability

## Doc

- https://supabase.com/docs/reference/javascript/introduction?queryGroups=platform&platform=pnpm
