/// <reference types="cypress" />
import spok from 'cy-spok'

import { setTokenAsEnvVariable,
         addFavoriteAirportsAndReturnIdList, 
         clearAllFavoriteAirports,
         deleteFavoriteAirportById } from '../../../support/utils'
import { endpoints } from '../../../support/endpoints'
import { dataGenerator } from '../../../support/testData'

const email = Cypress.env('email')
const password = Cypress.env('password')

describe('delete one of the favorite airport by ID', () => {

    before('set token as an environmental variable', () => {
        setTokenAsEnvVariable(endpoints.token, email, password)
    })

    context('204 status code', () => {
           
        beforeEach('precondition: add favorite airports', () => {
            const randomNumber = Cypress._.random(1, 7)
            cy.log(randomNumber)

            addFavoriteAirportsAndReturnIdList(randomNumber, endpoints.favorites, Cypress.env('token'))
                .then(arrayOfId => cy.wrap(arrayOfId).as('airportIdList'))
            
        })

        afterEach('clean all favorite airports', () => {
            clearAllFavoriteAirports(endpoints.clearAll, Cypress.env('token'))
        })

        it('delete airport by ID with correct ID', () => {
            cy.get('@airportIdList').then(airportIdList => {
                airportIdList.forEach(id => {
                    deleteFavoriteAirportById(endpoints.favorites, id, Cypress.env('token'))
                        .then(response => {
                            expect(response.status).to.equal(204)
                            expect(response.body).to.be.empty
                    })
                })                
            })
            
        })
    })

})