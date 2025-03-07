const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://airportgap.com/api',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
