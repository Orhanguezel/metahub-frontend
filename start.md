#frontend   

rm -rf node_modules  .next
bun install
npx tsc --noEmit
npm run build


bun run dev


bun run analyze

pm2 start .next/standalone/server.js --name metahub-frontend

