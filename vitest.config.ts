import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'jsdom',
		include: ['src/**/*.test.ts', 'server/**/*.test.ts'],
		// Server tests point the dev store at a file through process.env; separate processes keep test files from sharing it.
		pool: 'forks',
	},
});
