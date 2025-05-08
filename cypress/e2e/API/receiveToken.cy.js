/// <reference types="cypress" />
import spok from 'cy-spok'

import { dataGenerator } from "../../support/testData"
import { returnToken, setTokenAsEnvVariable } from "../../support/utils"
import { endpoints } from "../../support/endpoints"
import errors from '../../fixtures/errors.json'
import schemas from '../../fixtures/schemas.json'

const { status_401_error } = errors.token
const { status_200 } = schemas.receiveToken
const { status_401 } = schemas.receiveToken

describe('receive token', {tags: ['@smoke', 'token']}, () => {

    const { email, password } = Cypress.env('credentials')

    context('registered user', () => {
        // let user = dataGenerator.userData()
        before(() => { 
            // not used because of captcha:
            // cy.generateTokenViaUI(user.email, user.password)
            // cy.retrieveTokenFromTokensPage()
            setTokenAsEnvVariable(endpoints.token, email, password)
        })

        it('returns the API token with correct credentials', () => {
            returnToken(endpoints.token, email, password).then(response => {
                expect(response.status, 'status code').to.equal(200)
                if (response.body.token !== Cypress.env('token')) {
                    throw new Error('Not correct token value')
                }
                if (response.body.token.length !== 24 || typeof(response.body.token) !== 'string') {
                    throw new Error('Wrong length or type of token value')
                }
            })            
        })

        it('verifies schema for request with correct credentials', () => {
            returnToken(endpoints.token, email, password)
                .validateSchema(status_200)
        })

        it('error by sending request without email', () => {
            returnToken(endpoints.token, '', password).should(
                spok({
                    status: 401,
                    body: status_401_error
                })
            )
        })

        it('error by sending request without password', () => {
            returnToken(endpoints.token, email, '').should(
                spok({
                    status: 401,
                    body: status_401_error
                })
            )
        })

        it('error by sending request without email and password', () => {
            returnToken(endpoints.token, '', '').should(
                spok({
                    status: 401,
                    body: status_401_error
                })
            )
        })

        it('error by sending request with invalid password', () => {
            let invalidPassword = dataGenerator.userData().password
            returnToken(endpoints.token, email, invalidPassword).should(
                spok({
                    status: 401,
                    body: status_401_error
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
                    body: status_401_error
                })
            )
        })

        it('verifies schema for request with unregistered user credentials', () => {
            returnToken(endpoints.token, user.email, user.password)
                .validateSchema(status_401)
        })

    })

})