#frontend   

rm -rf node_modules  .next
bun install
npx tsc --noEmit
bun run build
bun run dev


bun run analyze
