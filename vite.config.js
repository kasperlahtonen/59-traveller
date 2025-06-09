export default {
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: 'index.html',
          businesses: 'businesses.html',
          about: 'about-us.html',
          dunhill: 'dunhill-links-theme.html',
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