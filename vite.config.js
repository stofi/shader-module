// vite.config.js
import { splitVendorChunkPlugin, defineConfig } from 'vite'
import { threeMinifier } from '@yushijinhun/three-minifier-rollup'
const path = require('path')

module.exports = defineConfig({
  plugins: [{ ...threeMinifier(), enforce: 'pre' }, splitVendorChunkPlugin()],
  build: {
    minify: 'terser',
    terserOptions: {
      
    },
    lib: {
      entry: path.resolve(__dirname, 'lib/main.ts'),
      name: 'MyLib',
      fileName: (format) => `shader.${format}.js`,
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {},
      },
    },
  },
})
