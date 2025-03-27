/// <reference types="cypress" />
import airports from '../../../fixtures/airports.json'
import { endpoints } from '../../../support/endpoints'
import errors from '../../../fixtures/errors.json'
import spok from 'cy-spok'
import { faker } from '@faker-js/faker'
import { dataGenerator } from '../../../support/testData'
import {
    setTokenAsEnvVariable,
    clearAllFavoriteAirports,
    retrieveAllFavoriteAirports,
    addRandomNumberOfFavoriteAirports,
    retrieveTotalPagesFavoriteAirports,
    getNumberOfPagesFavAirport,
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

    beforeEach('precondition', () => {
        cy.log('add favorite airports and save favorite airports data as an alias')
        const randomNumberFavAirports = Cypress._.random(1,30)
        addRandomNumberOfFavoriteAirports(
            endpoints.airports,
            endpoints.favorites,
            Cypress.env('token'),
            randomNumberFavAirports,
            'favAirportData'
        )
        getNumberOfPagesFavAirport(randomNumberFavAirports, airports.pagination.defaultLimit).as('totalFavPages')
    })

    afterEach(() => {
        clearAllFavoriteAirports(endpoints.clearAll, Cypress.env('token')).then(
            (response) => expect(response.status).to.equal(204)
        )
    })

    context('200 status code', () => {

        it('retrieves favorite airports saved to account - fist page', function() {
            retrieveAllFavoriteAirports(endpoints.favorites, Cypress.env('token')).should(spok({
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
            retrieveAllFavoriteAirports(endpoints.favorites, Cypress.env('token')).then(function(resp) {
                expect(resp.body.data).to.have.deep.members(this.favAirportData)
            })
        })
       
    })

})