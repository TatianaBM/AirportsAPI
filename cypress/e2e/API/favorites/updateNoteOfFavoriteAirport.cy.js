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

const { status_404_error } = errors.getAirportById
const { status_401_error } = errors.token
const { status_401 } = schemas.receiveToken
const email = Cypress.env('email')
const password = Cypress.env('password')

describe('updates the note of one of the favorite airport', () => {

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