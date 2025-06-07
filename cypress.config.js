const { defineConfig } = require('cypress')
const fs = require('fs')
const cypressSplit = require('cypress-split')

module.exports = defineConfig({
    viewportHeight: 1080,
    viewportWidth: 1920,
    watchForFileChanges: false,
    video: true,
    reporter: 'mochawesome',
    reporterOptions: {
        embeddedScreenshots: true,
        useInlineDiffs: true,
        reportDir: 'cypress/results',
        reportFilename: '[name].html',
        overwrite: true
    },
    env: {
        staging: {
            baseUrl: 'https://airportgap.com/api',
        },
        sandbox: {
            baseUrl: 'https://airportgap-sandbox.com/api',
        },
        preprod: {
            baseUrl: 'https://airportgap-preprod.com/api',
        },
    },
    e2e: {
        retries: 1,
        setupNodeEvents(on, config) {
            const envName = config.env['type-of-environment'] || 'staging'
            const envType = config.env[envName]
            config.baseUrl = envType.baseUrl
            const credentials = JSON.parse(
                fs.readFileSync('cypress.env.json', 'utf8'),
            )
            config.env.credentials = credentials.userSecrets[envName]
            cypressSplit(on, config)
            return config
        },
    },
})
