// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import 'cypress-plugin-api'
import 'cypress-ajv-schema-validator'
import 'cypress-mochawesome-reporter/register'
import registerCypressGrep from '@bahmutov/cy-grep/src/support'
registerCypressGrep()
import 'cypress-data-session'

before(()=>{
    Cypress.on('uncaught:exception', (err, runnable) => {
    return false
  })
})

Cypress.on('test:after:run', (test, runnable) => {
  if (Cypress.config('video')) {

    const videoFile = `../videos/${Cypress.spec.name}.mp4`
    if (Cypress.Mochawesome) {
      Cypress.Mochawesome.context.push(videoFile)
    }
  }
})