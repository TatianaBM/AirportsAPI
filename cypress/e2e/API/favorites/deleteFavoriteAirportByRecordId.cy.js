/// <reference types="cypress" />

import { setTokenAsEnvVariable,
         addFavoriteAirportsAndReturnIdList, 
         clearAllFavoriteAirports,
         deleteFavoriteAirportById,
         fetchAirportById } from '../../../support/utils'
import { endpoints } from '../../../support/endpoints'
import { dataGenerator } from '../../../support/testData'
import errors from '../../../fixtures/errors.json'
import schemas from '../../../fixtures/schemas.json'

const { status_401_error } = errors.token
const { status_404_error } = errors.getAirportById
const { status_401 } = schemas.receiveToken
const { status_404 } = schemas.getAirportById

const email = Cypress.env('email')
const password = Cypress.env('password')

describe('delete one of the favorite airport by record ID', () => {

    before('set token as an environmental variable', () => {
        setTokenAsEnvVariable(endpoints.token, email, password)
    })

    context('204 status code', () => {
           
        beforeEach('precondition: add favorite airports', () => {
            const randomNumber = Cypress._.random(1, 7)
            addFavoriteAirportsAndReturnIdList(randomNumber, endpoints.favorites, Cypress.env('token'))
                .then(arrayOfId => cy.wrap(arrayOfId).as('airportIdList'))    
        })

        afterEach('clear all favorite airports', () => {
            clearAllFavoriteAirports(endpoints.clearAll, Cypress.env('token')).then(response => {
                expect(response.status).to.equal(204)
            })
        })

        it('deletes airport by correct record ID', () => {
            cy.get('@airportIdList').then(airportIdList => {
                airportIdList.forEach(id => {
                    deleteFavoriteAirportById(endpoints.favorites, id, Cypress.env('token'))
                        .then(response => {
                            expect(response.status).to.equal(204)
                            expect(response.body).to.be.empty
                    })
                })                
            })
            cy.get('@airportIdList').then(airportIdList => {
                airportIdList.forEach(id => {
                    fetchAirportById(endpoints.airports, id).then(response => {
                        expect(response.status).to.equal(404)
                        expect(response.body).to.deep.equal(status_404_error)
                    })
                })
            })   
        })

    })

    context('404 status code', () => {

        beforeEach('clear all favorite airports', () => {
            clearAllFavoriteAirports(endpoints.clearAll, Cypress.env('token')).then(response => {
                expect(response.status).to.equal(204)
            })
        })

        it('error by sending request with wrong favorite record ID', () => {
            const wrongRecordId = dataGenerator.invalidFavoritRecordId()
            deleteFavoriteAirportById(endpoints.favorites, wrongRecordId, Cypress.env('token'))
                .then(response => {
                    expect(response.status).to.equal(404)
                    expect(response.body).to.deep.equal(status_404_error)
            })
        })

        it('error by sending request with empty favorite record ID', () => {
            deleteFavoriteAirportById(endpoints.favorites, '', Cypress.env('token'))
                .then(response => {
                    expect(response.status).to.equal(404)
                })
        })

        it ('verifies schema for request with wrong favorite record ID', () => {
            const wrongRecordId = dataGenerator.invalidFavoritRecordId()
            deleteFavoriteAirportById(endpoints.favorites, wrongRecordId, Cypress.env('token'))
                .validateSchema(status_404)
        })

    })

    context('401 status code', () => {

        beforeEach('precondition: add favorite airports', () => {
            const randomNumber = Cypress._.random(1, 5)
            addFavoriteAirportsAndReturnIdList(randomNumber, endpoints.favorites, Cypress.env('token'))
                .then(arrayOfId => cy.wrap(arrayOfId).as('airportIdList'))            
        })

        it('error by sending request without token', () => {
            cy.get('@airportIdList').then(airportIdList => {
                airportIdList.forEach(id => {
                    deleteFavoriteAirportById(endpoints.favorites, id).then(response => {
                        expect(response.status).to.equal(401)
                        expect(response.body).to.deep.equal(status_401_error)
                    })
                })
            })
        })

        it('verifies schema for request without token', () => {
            cy.get('@airportIdList').then(airportIdList => {
                deleteFavoriteAirportById(endpoints.favorites, airportIdList[0])
                    .validateSchema(status_401)
            })
        })
    })

})