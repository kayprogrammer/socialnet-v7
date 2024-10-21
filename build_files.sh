echo "BUILD START"
npm install
npx ts-node seeding/data.ts  # Use npx to run ts-node from local node_modules
npx tsc  # Use npx to run the TypeScript compiler
echo "BUILD END"