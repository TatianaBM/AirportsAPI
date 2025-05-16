const { defineConfig } = require("cypress");
const fs = require('fs');
const cypressSplit = require('cypress-split')

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
    inlineAssets: true,            // Inline JS/CSS into HTML file (no external links)
    saveAllAttempts: true,          // Save screenshots from all retry attempts, set to false to save only the last attempt
    overwrite: true,                // Overwrite previous reports
    videoOnFailOnly: true           // Add the videos to report only to tests with failures
  },
  env: {
    "staging": {
      "baseUrl": "https://airportgap.com/api"
    },
    "sandbox": {
      "baseUrl": "https://airportgap-sandbox.com/api"
    },
    "preprod": {
      "baseUrl": "https://airportgap-preprod.com/api"
    }
  },
  e2e: {
    retries: 1,
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on)
      const envName = config.env['type-of-environment'] || 'staging'
      const envType = config.env[envName] 
      config.baseUrl = envType.baseUrl
      const credentials = JSON.parse(fs.readFileSync('cypress.env.json', 'utf8'))
      config.env.credentials = credentials.userSecrets[envName]
      cypressSplit(on, config)
      return config
    },
  },
});
