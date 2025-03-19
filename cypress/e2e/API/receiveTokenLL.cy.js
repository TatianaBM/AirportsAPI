/// <reference types="cypress" />
import spok from 'cy-spok'

import { dataGenerator } from "../../support/testData"
import { returnToken } from "../../support/utils"
import { endpoints } from "../../support/endpoints"
import schemas from '../../fixtures/schemas.json'

const { status_200 } = schemas.receiveToken
const { status_401 } = schemas.receiveToken

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
                if (response.body.token.length !== 24 || typeof(response.body.token) !== 'string') {
                    throw new Error('Wrong length or type of token value')
                }
            })            
        })

        it('verifies schema for request with correct credentials', () => {
            returnToken(endpoints.token, user.email, user.password)
                .validateSchema(status_200)
        })

        it('error by sending request without email', () => {
            returnToken(endpoints.token, '', user.password).should(
                spok({
                    status: 401,
                    body: {
                        "errors": [
                            {
                                "status": "401",
                                "title": "Unauthorized",
                                "detail": "You are not authorized to perform the requested action."
                            }
                        ]
                    }
                })
            )
        })

        it('error by sending request without password', () => {
            returnToken(endpoints.token, user.email, '').should(
                spok({
                    status: 401,
                    body: {
                        "errors": [
                            {
                                "status": "401",
                                "title": "Unauthorized",
                                "detail": "You are not authorized to perform the requested action."
                            }
                        ]
                    }
                })
            )
        })

        it('error by sending request without email and password', () => {
            returnToken(endpoints.token, '', '').should(
                spok({
                    status: 401,
                    body: {
                        "errors": [
                            {
                                "status": "401",
                                "title": "Unauthorized",
                                "detail": "You are not authorized to perform the requested action."
                            }
                        ]
                    }
                })
            )
        })

        it('error by sending request with invalid password', () => {
            let invalidPassword = dataGenerator.userData().password
            returnToken(endpoints.token, user.email, invalidPassword).should(
                spok({
                    status: 401,
                    body: {
                        "errors": [
                            {
                                "status": "401",
                                "title": "Unauthorized",
                                "detail": "You are not authorized to perform the requested action."
                            }
                        ]
                    }
                })
            )
        })

    })

    context('unregistered user', () => {
        let user = dataGenerator.userData()

        it('error by sending unregistered user credentials', () => {
            returnToken(endpoints.token, user.email, user.password).should(
                spok({
                    status: 401,
                    body: {
                        "errors": [
                            {
                                "status": "401",
                                "title": "Unauthorized",
                                "detail": "You are not authorized to perform the requested action."
                            }
                        ]
                    }
                })
            )
        })

        it('verifies schema for request with unregistered user credentials', () => {
            returnToken(endpoints.token, user.email, user.password)
                .validateSchema(status_401)
        })

    })

})