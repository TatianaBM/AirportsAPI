/// <reference types="cypress" />
import schemas from '../../../fixtures/schemas.json'
import airports from '../../../fixtures/airports.json'
import { endpoints } from '../../../support/endpoints'
import errors from '../../../fixtures/errors.json'
import spok from 'cy-spok'
import { faker } from '@faker-js/faker'
import { dataGenerator } from '../../../support/testData'
import {
    setTokenAsEnvVariable,
    clearAllFavoriteAirports,
    addRandomNumberOfFavoriteAirports,
    fetchAllFavoriteAirports,
    getNumberOfPagesFavAirport,
} from '../../../support/utils'

const { status_401 } = schemas.receiveToken
const { status_200 } = schemas.favorite.fetchFavoriteAirport
const { status_401_error } = errors.token
const invalidTestDataToken = dataGenerator.invalidToken()
const link = `${Cypress.config('baseUrl')}${endpoints.airports}`

describe('/favorites returns all the favorite airports saved to your Airport Gap account', () => {

    const { email, password } = Cypress.env('credentials')

    before(() => {
        cy.log('set token as an environmental variable')
        setTokenAsEnvVariable(endpoints.token, email, password)

        cy.log('delete all favorite airports')
        cy.then(() => {
            clearAllFavoriteAirports(
                endpoints.clearAll,
                Cypress.env('token'),
            ).then((response) => expect(response.status).to.equal(204))
        })
        
    })

    context('200 status code', () => {

        beforeEach('precondition: add favorite airports and save favorite airports data as an alias', () => {
            const randomNumberFavAirports = Cypress._.random(1,10)
            addRandomNumberOfFavoriteAirports(
                endpoints.airports,
                endpoints.favorites,
                Cypress.env('token'),
                randomNumberFavAirports,
                'favAirportData'
            )
            getNumberOfPagesFavAirport(randomNumberFavAirports, airports.pagination.defaultLimit).as('totalFavPages')
        })
    
        afterEach('delete all favorite airports', () => {
            clearAllFavoriteAirports(endpoints.clearAll, Cypress.env('token')).then(
                (response) => expect(response.status).to.equal(204)
            )
        })

        it('retrieves favorite airports saved to account - fist page', function() {
            fetchAllFavoriteAirports(endpoints.favorites, Cypress.env('token')).should(spok({
                status: 200,
                body: {
                    data: spok.arrayElements(this.favAirportData.length),
                    links: {
                        first: link,
                        self: link,
                        last: `${link}?page=${this.totalFavPages}`,
                        prev: `${link}`,
                        next: `${link}`,
                    }
                }
            }))
        })

        it('retrieved data matches all saved favorite airports', () => {
            fetchAllFavoriteAirports(endpoints.favorites, Cypress.env('token')).then(function(resp) {
                expect(resp.body.data).to.have.deep.members(this.favAirportData)
            })
        })

        it('returns an ampty array when delete all favorite airports', () => {
            clearAllFavoriteAirports(endpoints.clearAll, Cypress.env('token'))
            fetchAllFavoriteAirports(endpoints.favorites, Cypress.env('token')).should(spok({
                status: 200,
                body: {
                    data: spok.arrayElements(0)
                }
            }))
        })

        it('checks schema - no favorite airports are saved to account', () => {
            clearAllFavoriteAirports(endpoints.clearAll, Cypress.env('token'))
            fetchAllFavoriteAirports(endpoints.favorites, Cypress.env('token')).validateSchema(status_200.schema_2)
        })

        it('checks schema - favorite airports are saved to account', () => {
            fetchAllFavoriteAirports(endpoints.favorites, Cypress.env('token')).validateSchema(status_200.schema_1)
        })
       
    })

    context('401 status code', () => {

        before('precondition: add favorite airports and save favorite airports data as an alias', () => {
            const randomNumberFavAirports = Cypress._.random(1,10)
            addRandomNumberOfFavoriteAirports(
                endpoints.airports,
                endpoints.favorites,
                Cypress.env('token'),
                randomNumberFavAirports,
                'favAirportData'
            )
            getNumberOfPagesFavAirport(randomNumberFavAirports, airports.pagination.defaultLimit).as('totalFavPages')
        })
    
        after('delete all favorite airports', () => {
            clearAllFavoriteAirports(endpoints.clearAll, Cypress.env('token')).then(
                (response) => expect(response.status).to.equal(204)
            )
        })

        it('shoud error with empty token', function() {
            const token = ''
            fetchAllFavoriteAirports(endpoints.favorites, token).should(spok({
                status: 401,
                body: status_401_error
            }))
        })

        it('should error with invalid token', function() {
            const sampleOfInvalidToken = Cypress._.sampleSize(invalidTestDataToken, 1)
            fetchAllFavoriteAirports(endpoints.favorites, sampleOfInvalidToken).should(spok({
                status: 401,
                body: status_401_error
            }))
        })

        it('should error with modified valid token', function() {
            const invalidToken = Cypress.env('token') + faker.string.alpha()
            fetchAllFavoriteAirports(endpoints.favorites, invalidToken).should(spok({
                status: 401,
                body: status_401_error
            }))
        })

        it('checks schema', () => {
            const token = ''
            fetchAllFavoriteAirports(endpoints.favorites, token).validateSchema(status_401)
        })
       
    })

})