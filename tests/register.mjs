// Two hooks, both bridging the same gap: src/ is written for Vite, and the
// unit tests read it with nothing but Node. extensionless.mjs resolves the
// imports that leave the .js off; build-env.mjs stands `process.env` in for
// `import.meta.env`. Each is a few lines, and together they keep the tests
// dependency-free — the alternative is a test runner with its own bundler,
// which is a lot of node_modules to buy the same two things.
import { register } from 'node:module';

register('./extensionless.mjs', import.meta.url);
register('./build-env.mjs', import.meta.url);
