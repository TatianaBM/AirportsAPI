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
import registerCypressGrep from '@bahmutov/cy-grep/src/support'
registerCypressGrep()
import 'cypress-data-session'
import addContext from 'mochawesome/addContext'

before(() => {
    Cypress.on('uncaught:exception', (err, runnable) => {
        return false
    })
})

const titleToFileName = (title) => title.replace(/[:\/]/g, '')

Cypress.on('test:after:run', (test, runnable) => {
    let contextPath = (file) =>
        `screenshots/${Cypress.spec.name}/${file}`

    if (test.state === 'failed') {
        let parent = runnable.parent
        let filename = ''
        while (parent && parent.title) {
            filename = `${titleToFileName(parent.title)} -- ${filename}`
            parent = parent.parent
        }
        filename += `${titleToFileName(test.title)} (failed).png`
        addContext({ test }, contextPath('screenshot', filename))
    }

    const videoName = `${Cypress.spec.name}.mp4`
    addContext({ test }, `videos/${videoName}`)
})