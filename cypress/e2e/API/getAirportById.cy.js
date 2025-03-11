/// <reference types="cypress" />
import { faker } from '@faker-js/faker'

import {
    fetchAirportsByPage,
    retrieveTotalPages,
    fetchAirportById
} from '../../support/utils'
import { endpoints } from '../../support/endpoints'
import spok from 'cy-spok'
import airports from '../../fixtures/airports.json'
import schemas from '../../fixtures/schemas.json'
import { dataGenerator } from '../../support/testData'

const { defaultLimit } = airports.pagination
const { status_200 } = schemas.airports
const requestUrl = `${Cypress.config('baseUrl')}${endpoints.airports}`
const testData = dataGenerator.invalidIATACode()

let totalPages

before(() => {
    retrieveTotalPages(endpoints.airports).then((number) => totalPages = number)
})

describe('200 status code', () => {

    it('returns the airport by the faker generated IATA code', () => {
        let randomAirportInfo = faker.airline.airport()
        // without spok:
        // fetchAirportById(endpoints.airports, randomAirportInfo.iataCode).then(response => {
        //     cy.log(response.body)
        //     expect(response.status).to.equal(200)
        //     expect(response.body.data.attributes.name).to.equal(randomAirportInfo.name)
        // })
        fetchAirportById(endpoints.airports, randomAirportInfo.iataCode).should(
            spok({
                status: 200,
                body: {
                    data: {
                        attributes: {
                            name: randomAirportInfo.name,
                            iata: randomAirportInfo.iataCode
                        }
                    }                    
                }
            })
        )
    })
    
    it('returns the airport specified by IATA code and checks its name', () => {
        let randomPage = Cypress._.random(1, totalPages)
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
            expect(response.status).to.equal(200)
            expect(response.body.data.attributes.name).to.equal(airportsName)
        })
    })
    
})

describe('404 status code', () => {

    for (let invalidId in testData) {
        it(`error by sending the non-existing IATA code: ${invalidId}`, () => {
            fetchAirportById(endpoints.airports, testData[invalidId]).then(response => {
                expect(response.status).to.equal(404)
                expect(response.statusText).to.equal('Not Found')
            })
        })
    }
    
})