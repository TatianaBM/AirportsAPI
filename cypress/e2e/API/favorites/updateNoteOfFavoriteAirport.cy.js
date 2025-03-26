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
const { status_200, status_404 } = schemas.updateNoteOfFavoriteAirport
const email = Cypress.env('email')
const password = Cypress.env('password')

describe('updates the note of one of the favorite airport', () => {
    before(() => {
        setTokenAsEnvVariable(endpoints.token, email, password) 
    })

    context('200 status code, updates an existing favorite airport note', () => {
        beforeEach(() => {
            const requestBody = {
                airport_id: dataGenerator.validIATACode().iataCode,
                note: dataGenerator.note(),
            }
            saveFavoriteAirport(endpoints.favorites, Cypress.env('token'), requestBody)
                .then(response => {  
                    expect(response.status, 'status code').to.equal(201) 
                    expect(response.body.data.attributes.airport.note).not.to.equal(null)               
                    cy.wrap(response.body.data.id).as('favoriteRecordId')
            })
        })
        afterEach(() => {
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
        beforeEach(() => {
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
        afterEach(() => {
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

})