/// <reference types="cypress" />
import spok from 'cy-spok'

import {
    fetchAirportsByPage,
    retrieveTotalPages,
    fetchAirportById
} from '../../support/utils'
import { endpoints } from '../../support/endpoints'
import airports from '../../fixtures/airports.json'
import schemas from '../../fixtures/schemas.json'
import { dataGenerator } from '../../support/testData'
import errors from '../../fixtures/errors.json'

const { status_200, status_404 } = schemas.getAirportById
const { status_404_error } = errors.getAirportById
const { json } = airports.headers['content-type'].response
const invalidTestData = dataGenerator.invalidIATACode()
const validTestData = dataGenerator.validIATACode()

describe('get the airport by ID', () => {

    before(() => {
        retrieveTotalPages(endpoints.airports).as('numberTotalPages')
    })

    context('200 status code', () => {

        it('returns the airport by the faker generated IATA code', () => {
            fetchAirportById(endpoints.airports, validTestData.iataCode).then(response => {
                cy.log(response.body)
                expect(response.status, 'status code').to.equal(200)
                // expect(response.body.data.attributes.name, 'airport name').to.equal(validTestData.name)
                expect(response.body.data.id, 'airport id').to.equal(validTestData.iataCode)
                expect(response.headers['content-type']).to.eq(json)
            })
        })
        
        it('returns the airport specified by IATA code and checks its name', function() {
            let randomPage = Cypress._.random(1, this.numberTotalPages)
            let randomAirportNumber = Cypress._.random(0, airports.pagination.defaultLimit)
            cy.log(randomPage, randomAirportNumber)
            let airportsId, airportsName
            //get the airport from random page and with random sequence number
            //and retrieve airportsId and airportsName
            fetchAirportsByPage(endpoints.airports, randomPage).then(response => {
                airportsId = response.body.data[randomAirportNumber].id
                airportsName = response.body.data[randomAirportNumber].attributes.name
                return airportsId
            }).then(airportsId => {
            //get airport by retrieved airportsId
                return fetchAirportById(endpoints.airports, airportsId)
            }).then(response => {
            //check if name of the airport in the body meets retrieved airportsName
                expect(response.status, 'code status').to.equal(200)
                expect(response.body.data.attributes.name).to.equal(airportsName)
                expect(response.body.data.id).to.equal(airportsId)
                expect(response.headers['content-type']).to.eq(json)
            })
        })
    
        it('verifies schema for request with valid IATA code', () => {
            fetchAirportById(endpoints.airports, validTestData.iataCode)
                .validateSchema(status_200)
        })
        
    })
    
    context('404 status code', () => {
    
        for (let invalidId in invalidTestData) {
            it(`error by sending the non-existing IATA code: ${invalidId}`, () => {
                fetchAirportById(
                    endpoints.airports,
                    invalidTestData[invalidId],
                ).should(
                    spok({
                        status: 404,
                        headers: {
                            'content-type': json,
                        },
                        body: status_404_error,
                    }),
                )
            })
        }
    
        for (let invalidId in invalidTestData) {
            it(`verifies schema for request with non-existing IATA code: ${invalidId}`, () => {
                fetchAirportById(endpoints.airports, invalidTestData[invalidId])
                    .validateSchema(status_404)
            })
        }
         
    })

})


