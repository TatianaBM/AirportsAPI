/// <reference types="cypress" />
import spok from 'cy-spok'

import { setTokenAsEnvVariable,
    addFavoriteAirportsAndReturnIdList, 
    clearAllFavoriteAirports,
    getFavoriteAirportByRecordId } from '../../../support/utils'
import { endpoints } from '../../../support/endpoints'
import { dataGenerator } from '../../../support/testData'
import errors from '../../../fixtures/errors.json'
import schemas from '../../../fixtures/schemas.json'
import { headers } from '../../../fixtures/airports.json'

const { status_401_error } = errors.token
const { status_404_error } = errors.getAirportById
const { status_401 } = schemas.receiveToken
const { status_200, status_404 } = schemas.updateNoteOfFavoriteAirport

describe('get one of the favorite airport by record ID', () => {

    const { email, password } = Cypress.env('credentials')

    before('set token as an environmental variable', () => {
        setTokenAsEnvVariable(endpoints.token, email, password)
    })

    context('200 status code', () => {
        
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

        it('returns the airport by its record ID', () => {
            cy.get('@airportIdList').then(airportIdList => {
                airportIdList.forEach(id => {
                    getFavoriteAirportByRecordId(endpoints.favorites, id, Cypress.env('token'))
                        .should(
                            spok({
                                status: 200,
                                body: { 
                                    "data": {
                                        "id": id,
                                        "type": "favorite",                                       
                                    }
                                }                                
                            })
                        )
                })
            })
        })

        it('checks custom header Authorization', () => {
            cy.get('@airportIdList').then((ids) => {
                console.log(ids)
                const id = Cypress._.sample(ids)
                getFavoriteAirportByRecordId(
                    endpoints.favorites,
                    id,
                    Cypress.env('token'),
                ).then((data) => {
                    expect(data.status).to.eq(200)
                    expect(data.requestHeaders).to.have.property(
                        'Authorization',
                    )
                    if (
                        !data.requestHeaders.Authorization ||
                        typeof data.requestHeaders.Authorization !== 'string' ||
                        !data.requestHeaders.Authorization.includes(
                            headers.Authorization,
                        )
                    ) {
                        throw new Error(
                            'Missing header Autorization value or wrong data type',
                        )
                    }
                })
            })
        })        

        it('verifies schema for request with correct favorite record ID', () => {
            cy.get('@airportIdList').then(airportIdList => {
                airportIdList.forEach(id => {
                    getFavoriteAirportByRecordId(endpoints.favorites, id, Cypress.env('token'))
                        .validateSchema(status_200)
                })
            })
        })

    })

    context('401 status code', () => {
        
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

        it('error by sending request without token', () => {
            cy.get('@airportIdList').then(airportIdList => {
                airportIdList.forEach(id => {
                    getFavoriteAirportByRecordId(endpoints.favorites, id)
                        .should(
                            spok({
                                status: 401,
                                body: status_401_error                             
                            })
                        )
                })
            })
        })

        it('verifies schema for request without token', () => {
            cy.get('@airportIdList').then(airportIdList => {
                getFavoriteAirportByRecordId(endpoints.favorites, airportIdList[0])
                    .validateSchema(status_401)
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
            getFavoriteAirportByRecordId(endpoints.favorites, wrongRecordId, Cypress.env('token'))
                .then(response => {
                    expect(response.status).to.equal(404)
                    expect(response.body).to.deep.equal(status_404_error)
            })
        })

        it('error by sending request with empty favorite record ID', () => {
            getFavoriteAirportByRecordId(endpoints.favorites, '', Cypress.env('token'))
                .then(response => {
                    expect(response.status).to.equal(404)
                })
        })

        it ('verifies schema for request with wrong favorite record ID', () => {
            const wrongRecordId = dataGenerator.invalidFavoritRecordId()
            getFavoriteAirportByRecordId(endpoints.favorites, wrongRecordId, Cypress.env('token'))
                .validateSchema(status_404)
        })

    })
    
})
