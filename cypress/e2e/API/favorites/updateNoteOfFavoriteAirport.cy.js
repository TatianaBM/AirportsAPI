/// <reference types="cypress" />
import spok from 'cy-spok'

import { updateNoteOfFavoriteAirport, 
         setTokenAsEnvVariable, 
         saveFavoriteAirport, 
         clearAllFavoriteAirports } from "../../../support/utils"
import { endpoints } from "../../../support/endpoints"
import { dataGenerator } from "../../../support/testData"
import schemas from '../../../fixtures/schemas.json'
import errors from '../../../fixtures/errors.json'
import { headers } from '../../../fixtures/airports.json'

const { status_404_error } = errors.getAirportById
const { status_401_error } = errors.token
const { request, response } = headers['content-type']
const { status_401 } = schemas.receiveToken
const { status_200, status_404 } = schemas.updateNoteOfFavoriteAirport

describe('updates the note of one of the favorite airport', () => {

    const { email, password } = Cypress.env('credentials')

    before('set token as an environmental variable', () => {
        setTokenAsEnvVariable(endpoints.token, email, password)
    })

    context('200 status code, updates an existing favorite airport note', () => {

        beforeEach('precondition: add favorite airport with note and save its record ID to alias', () => {
            const requestBody = {
                airport_id: dataGenerator.validIATACode().iataCode,
                note: dataGenerator.note(),
            }
            saveFavoriteAirport(endpoints.favorites, Cypress.env('token'), requestBody)
                .then(response => {  
                    expect(response.status, 'status code').to.equal(201) 
                    expect(response.body.data.attributes.note).not.to.equal(null)               
                    cy.wrap(response.body.data.id).as('favoriteRecordId')
            })
        })

        afterEach('clear all favorite airports', () => {
            clearAllFavoriteAirports(endpoints.clearAll, Cypress.env('token')).then(response => {
                expect(response.status).to.equal(204)
            })
        })

        it('updates the note of favorite airport with optional parameter note', () => {
            const note = dataGenerator.note()
            cy.get('@favoriteRecordId').then(id => {
                updateNoteOfFavoriteAirport(endpoints.favorites, id, Cypress.env('token'), note).should(
                    spok({
                        status: 200,
                        body: {
                            "data": {
                                "id": id,
                                "type": "favorite",
                                "attributes": {
                                    "note": note
                                }
                            }
                        }
                    })
                )
            })
        }) 

        it('checks custom header Authorization', () => {
            const note = dataGenerator.note()
            cy.get('@favoriteRecordId').then((id) => {
                updateNoteOfFavoriteAirport(
                    endpoints.favorites,
                    id,
                    Cypress.env('token'),
                    note,
                ).then((data) => {
                    expect(data.status).to.eq(200)
                    expect(data.headers['content-type']).to.eq(response.json)
                    expect(data.requestHeaders['content-type']).to.eq(
                        request.json,
                    )
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
        
        it('updates the note of favorite airport without optional parameter note', () => {
            cy.get('@favoriteRecordId').then(id => {
                updateNoteOfFavoriteAirport(endpoints.favorites, id, Cypress.env('token')).should(
                    spok({
                        status: 200,
                        body: {
                            "data": {
                                "id": id,
                                "type": "favorite",
                                "attributes": {
                                    "note": null
                                }
                            }
                        }
                    })
                )
            })
        })

    })

    context('200 status code, updates the empty favorite airport note', () => {

        beforeEach('precondition: add favorite airport without note and save its record ID to alias', () => {
            const requestBody = {
                airport_id: dataGenerator.validIATACode().iataCode,
            }
            saveFavoriteAirport(endpoints.favorites, Cypress.env('token'), requestBody)
                .then(response => {  
                    expect(response.status, 'status code') .to.equal(201) 
                    expect(response.body.data.attributes.note).to.be.null              
                    cy.wrap(response.body.data.id).as('favoriteRecordId')
            })
        })

        afterEach('clear all favorite airports', () => {
            clearAllFavoriteAirports(endpoints.clearAll, Cypress.env('token')).then(response => {
                expect(response.status).to.equal(204)
            })
        })

        it('updates the empty note of favorite airport with optional parameter note', () => {
            const note = dataGenerator.note()
            cy.get('@favoriteRecordId').then(id => {
                updateNoteOfFavoriteAirport(endpoints.favorites, id, Cypress.env('token'), note).should(
                    spok({
                        status: 200,
                        body: {
                            "data": {
                                "id": id,
                                "type": "favorite",
                                "attributes": {
                                    "note": note
                                }
                            }
                        }
                    })
                )
            })
        }) 
        
        it('updates the empty note of favorite airport without optional parameter note', () => {
            cy.get('@favoriteRecordId').then(id => {
                updateNoteOfFavoriteAirport(endpoints.favorites, id, Cypress.env('token')).should(
                    spok({
                        status: 200,
                        body: {
                            "data": {
                                "id": id,
                                "type": "favorite",
                                "attributes": {
                                    "note": null
                                }
                            }
                        }
                    })
                )
            })
        })

        it('verifies schema for request with correct favorite record ID', () => {
            cy.get('@favoriteRecordId').then(id => {
                updateNoteOfFavoriteAirport(endpoints.favorites, id, Cypress.env('token'))
                    .validateSchema(status_200)
            })        
        })

    })

    context('404 status code', () => {

        it('error by sending request with wrong favorite record ID', () => {
            updateNoteOfFavoriteAirport(
                endpoints.favorites,  
                dataGenerator.invalidFavoritRecordId(), 
                Cypress.env('token'), 
                dataGenerator.note()).should(
                    spok({
                        status: 404,
                        body: status_404_error
                    })
                )
        })

        it('verifies schema for request with wrong favorite record ID', () => {
            updateNoteOfFavoriteAirport(
                endpoints.favorites,  
                dataGenerator.invalidFavoritRecordId(), 
                Cypress.env('token'), 
                dataGenerator.note()).validateSchema(status_404)
        })
    })

    context('401 status code', () => {

        beforeEach('precondition: add favorite airport with note and save its record ID to alias', () => {
            const requestBody = {
                airport_id: dataGenerator.validIATACode().iataCode,
                note: dataGenerator.note(),
            }
            saveFavoriteAirport(endpoints.favorites, Cypress.env('token'), requestBody)
                .then(response => {  
                    expect(response.status, 'status code').to.equal(201) 
                    expect(response.body.data.attributes.note).not.to.equal(null)               
                    cy.wrap(response.body.data.id).as('favoriteRecordId')
            })
        })

        afterEach('clear all favorite airports', () => {
            clearAllFavoriteAirports(endpoints.clearAll, Cypress.env('token')).then(response => {
                expect(response.status).to.equal(204)
            })
        })

        it('error by sending request without token', () => {
            cy.get('@favoriteRecordId').then(id => {
                updateNoteOfFavoriteAirport(endpoints.favorites, id).should(
                    spok({
                        status: 401,
                        body: status_401_error
                    })
                )
            })
        })

        it('verifies schema for request without token', () => {
            cy.get('@favoriteRecordId').then(id => {
                updateNoteOfFavoriteAirport(endpoints.favorites, id)
                    .validateSchema(status_401)
            })
        })
    })

})