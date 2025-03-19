const { defineConfig } = require("cypress");

module.exports = defineConfig({
  viewportHeight: 1080,
  viewportWidth: 1920,
  watchForFileChanges: false,
  e2e: {
    baseUrl: 'https://airportgap.com/api',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
