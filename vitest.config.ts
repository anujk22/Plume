import {defineConfig} from 'vitest/config';
export default defineConfig({test:{include:['lib/plume/**/*.test.ts'],environment:'node'}});
