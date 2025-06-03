export default {
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: 'index.html',
          businesses: 'businesses.html',
          dunhill: 'example-dunhill-links.html',
          bogogno: 'julia-bogogno-theme.html'
        }
      },
      emptyOutDir: true
    },
    server: {
      port: 3000
    },
    base: './'
  }