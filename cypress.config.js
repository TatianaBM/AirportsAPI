const { defineConfig } = require("cypress");
const fs = require('fs');
const cypressSplit = require('cypress-split')

module.exports = defineConfig({
  viewportHeight: 1080,
  viewportWidth: 1920,
  watchForFileChanges: false,
  video: true,
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/results',   
    charts: true,                   
    embeddedScreenshots: true,      
    inlineAssets: true,            
    saveAllAttempts: true,           
    overwrite: true,                
    videoOnFailOnly: true           
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
