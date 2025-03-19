// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('generateTokenViaUI', (email, password) => {
    cy.visit('https://airportgap.com/')
    cy.get('a').contains('Generate Token').click()
    cy.get('input#user_email').type(email, {log: false})
    cy.get('input#user_password').type(password, {log: false})
    cy.get('input').contains('Generate Token').click()
    cy.url().should('include', '/tokens')
    cy.get('p#user_email_address').should('contain', email)
})

Cypress.Commands.add('retrieveTokenFromTokensPage', () => {
    cy.get('p#user_auth_token').invoke('text').then((text => {
        if (!text) {
            throw new Error('Missing token value')
        }
        const token = text.split(':')[1].trim()
        Cypress.env('authToken', token)
    }))
})