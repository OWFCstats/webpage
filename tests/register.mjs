// src/ imports without file extensions because Vite resolves them; Node's ESM
// loader doesn't. One resolve hook keeps the unit tests dependency-free — the
// alternative is a test runner with its own bundler, which is a lot of
// node_modules to buy the same two characters.
import { register } from 'node:module';

register('./extensionless.mjs', import.meta.url);
