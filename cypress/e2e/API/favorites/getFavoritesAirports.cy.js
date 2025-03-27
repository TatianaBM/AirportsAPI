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
    retrieveAllFavoriteAirports,
    addRandomNumberOfFavoriteAirports,
} from '../../../support/utils'

const { status_401_error } = errors.token
const invalidTestDataToken = dataGenerator.invalidToken()
const link = `${Cypress.config('baseUrl')}${endpoints.airports}`

describe('/favorites returns all the favorite airports saved to your Airport Gap account', () => {

    const userCredentials = {
        email: Cypress.env('email'),
        password: Cypress.env('password')
    }

    before('set token as an environmental variable', () => {
        setTokenAsEnvVariable(endpoints.token, userCredentials.email, userCredentials.password)
    })

    context('200 status code', () => {

        beforeEach('precondition', () => {
            cy.log('add favorite airports and save favorite airports data as an alias')
            addRandomNumberOfFavoriteAirports(endpoints.airports, endpoints.favorites, Cypress.env('token'), 'favAirportData')
        })

        afterEach(() => {
            clearAllFavoriteAirports(endpoints.clearAll, Cypress.env('token')).then(
                (response) => expect(response.status).to.equal(204)
            )
        })

        it('retrieves favorite airports saved to account', function() {
            retrieveAllFavoriteAirports(endpoints.favorites, Cypress.env('token')).should(spok({
                status: 200,
                body: {
                    data: spok.arrayElements(this.favAirportData.length)
                },
                links: {
                    first: link,
                    self: link,
                    last: `${link}?page=1`,
                    prev: `${link}`,
                    next: `${link}`,
                }
            }))
        })

        it('retrieved data matches all saved favorite airports', () => {
            retrieveAllFavoriteAirports(endpoints.favorites, Cypress.env('token')).then(function(resp) {
                expect(resp.body.data).to.have.deep.members(this.favAirportData)
            })
        })
       
    })

})