import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    pkg: 'src/pkg/index.ts',
    bootstrap: 'src/bootstrap/index.ts'
  },
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
})

