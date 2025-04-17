# Supabase

## Local

https://supabase.com/docs/guides/local-development?queryGroups=package-manager&package-manager=pnpm

```sh
pnpm add supabase --save-dev
pnpm supabase init
pnpm supabase start
pnpm supabase stop
```

Setup `.env.local` with `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` (from command menu)

Studio URL: http://localhost:54323

## DB

```sh
pnpm supabase migration new <name>

pnpm supabase migration list --local
pnpm supabase migration up --local
```

## Supabase realtime

https://supabase.com/docs/guides/realtime/concepts
https://github.com/supabase/realtime
https://supabase.com/blog/supabase-realtime-multiplayer-general-availability

## Doc

- https://supabase.com/docs/reference/javascript/introduction?queryGroups=platform&platform=pnpm
