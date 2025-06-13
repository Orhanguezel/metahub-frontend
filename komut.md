 

cp .env.anastasia .env.production
bun run dev


gelistirme ortami: 
cp .env.anastasia .env.local
bun run dev


cp .env.metahub .env.local
bun run dev



export NODE_ENV=production
export TENANT_NAME=anastasia
export NEXT_PUBLIC_APP_ENV=anastasia
...
bun run build


bun install
export TENANT_NAME=anastasia
export NODE_ENV=production
bun run build
