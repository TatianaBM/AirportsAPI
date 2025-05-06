/// <reference types="cypress" />
import { endpoints } from '../../../support/endpoints'
import errors from '../../../fixtures/errors.json'
import spok from 'cy-spok'
import { faker } from '@faker-js/faker'
import { dataGenerator } from '../../../support/testData'
import {
    setTokenAsEnvVariable,
    clearAllFavoriteAirports,
    isEmptyString,
    includesTextPlain,
    addRandomNumberOfFavoriteAirports
} from '../../../support/utils'

const { status_401_error } = errors.token
const invalidTestDataToken = dataGenerator.invalidToken()

describe('/favorites/clear_all', () => {

    const { email, password } = Cypress.env('credentials')

    before('set token as an environmental variable', () => {
        setTokenAsEnvVariable(endpoints.token, email, password)
    })

    context('204 status code', () => {

        before('precondition: add favorite airports', () => {
            const randomNumberFavAirports = Cypress._.random(1,15)
            addRandomNumberOfFavoriteAirports(
                endpoints.airports,
                endpoints.favorites,
                Cypress.env('token'),
                randomNumberFavAirports,
            )
        })

        it('deletes all favorite airports', () => {
            clearAllFavoriteAirports(endpoints.clearAll, Cypress.env('token')).should(spok({
                status: 204,
                body: isEmptyString,
                headers: {
                    "content-type": includesTextPlain
                }
            }))
        })

        it('return 204 if no favorite airport is added ', () => {
            clearAllFavoriteAirports(endpoints.clearAll, Cypress.env('token')).should(spok({
                status: 204,
                body: isEmptyString
            }))
        })
       
    })

    context('401 status code', () => {

        beforeEach('precondition: add favorite airports', () => {
            const randomNumberFavAirports = Cypress._.random(1,30)
            addRandomNumberOfFavoriteAirports(
                endpoints.airports,
                endpoints.favorites,
                Cypress.env('token'),
                randomNumberFavAirports,
            )
        })
        
        it('should error with invalid token', () => {
            const sampleOfInvalidToken = Cypress._.sampleSize(invalidTestDataToken, 1)
            clearAllFavoriteAirports(endpoints.clearAll, sampleOfInvalidToken).should(spok({
                status: 401,
                body: status_401_error
            }))
        })

        it('should error with empty token string', () => {
            const token = ''
            clearAllFavoriteAirports(endpoints.clearAll, token).should(spok({
                status: 401,
                body: status_401_error
            }))
        })

        it('should error with modified valid token', () => {
            const invalidToken = Cypress.env('token') + faker.string.alpha()
            clearAllFavoriteAirports(endpoints.clearAll, invalidToken).should(spok({
                status: 401,
                body: status_401_error
            }))
        })

    })

})