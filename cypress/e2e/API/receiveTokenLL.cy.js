/// <reference types="cypress" />

import { dataGenerator } from "../../support/testData"
import { returnToken } from "../../support/utils"
import { endpoints } from "../../support/endpoints"

describe('receive token', () => {

    context('registered user', () => {
        let user = dataGenerator.userData()
        before(() => { 
            cy.generateTokenViaUI(user.email, user.password)
            cy.retrieveTokenFromTokensPage()
        })

        it('returns the API token with correct credentials', () => {
            returnToken(endpoints.token, user.email, user.password).then(response => {
                expect(response.status, 'status code').to.equal(200)
                if (response.body.token !== Cypress.env('authToken')) {
                    throw new Error('Not correct token value')
                }
            })            
        })
    })

    context('unregistered user', () => {
        let user = dataGenerator.userData()
        it('returns the API token', () => {
            returnToken(endpoints.token, user.email, user.password).then(response => {
                expect(response.status, 'status code').to.equal(401)
            })            
        })
    })
})