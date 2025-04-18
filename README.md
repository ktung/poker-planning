# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Run locally

```sh
pnpm supabase start
# fill .env.local
npm run dev
```

- Localhost URL : http://localhost:5173
- Studio URL: http://localhost:54323

## i18n

```
pnpx @inlang/cli lint --project project.inlang
pnpx @inlang/cli machine translate --project project.inlang
```

Inspired by :

- https://www.atlassian.com/blog/platform/scrum-poker-for-agile-projects
- https://www.mountaingoatsoftware.com/agile/planning-poker
- https://fr.wikipedia.org/wiki/Planning_poker
- https://github.com/rangzen/poker-sliders
- https://www.pointingpoker.com/
