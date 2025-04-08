const { defineConfig } = require("cypress");

module.exports = defineConfig({
  viewportHeight: 1080,
  viewportWidth: 1920,
  watchForFileChanges: false,
  video: false,
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/results',   // Folder where the reports will be saved
    // reportFilename: '"[status]_[datetime]-[name]-report"',
    charts: true,                   // Show charts (e.g., pie charts) in the HTML report
    embeddedScreenshots: true,      // Embed screenshots directly into the report
    inlineAssets: false,            // Inline JS/CSS into HTML file (no external links)
    saveAllAttempts: true,          // Save screenshots from all retry attempts, set to false to save only the last attempt
    overwrite: true,                // Overwrite previous reports
    videoOnFailOnly: true           // Add the videos to report only to tests with failures
  },
  e2e: {
    baseUrl: 'https://airportgap.com/api',
    retries: 1,
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on)
    },
  },
});
