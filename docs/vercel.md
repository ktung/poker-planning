https://vercel.com/docs/builds/configure-a-build#corepack
ENABLE_EXPERIMENTAL_COREPACK=1 required for pnpm

https://vercel.com/guides/what-can-i-do-about-vercel-serverless-functions-timing-out
Increase timeout > enable Fluid Compute

## Log level

Add `PRIVATE_LOG_LEVEL` as `debug` to pre-prod env
