/// <reference types="cypress" />
import { faker, Faker } from '@faker-js/faker'

import {
    fetchAirports,
    fetchAirportsByPage,
    retrieveTotalPages,
    fetchAirportById
} from '../../support/utils'
import { endpoints } from '../../support/endpoints'
import spok from 'cy-spok'
import airports from '../../fixtures/airports.json'

const { defaultLimit } = airports.pagination
const requestUrl = `${Cypress.config('baseUrl')}${endpoints.airports}`

let totalPages

before(() => {
    retrieveTotalPages(endpoints.airports).then((number) => totalPages = number)
})

describe('200 status code', () => {
    it('returns default number of airports', () => {
        fetchAirports(endpoints.airports).should(
            spok({
                status: 200,
                body: {
                    data: spok.arrayElements(defaultLimit),
                    links: {
                        first: requestUrl,
                        self: requestUrl,
                        last: `${requestUrl}?page=${totalPages}`,
                        prev: `${requestUrl}`,
                        next: `${requestUrl}?page=2`,
                    }
                }
            })
        )
    })

    it('returns first page', () => {
        let firstPage = 1
        fetchAirportsByPage(endpoints.airports, firstPage).should(
            spok({
                status: 200,
                body: {
                    data: spok.arrayElements(defaultLimit),
                    links: {
                        first: `${requestUrl}`,
                        self: `${requestUrl}?page=${firstPage}`,
                        last: `${requestUrl}?page=${totalPages}`,
                        prev: `${requestUrl}`,
                        next: `${requestUrl}?page=${firstPage + 1}`,
                    }
                }
            })
        )
    })

    it('returns default limit from random page', () => {
        let randomPage = Cypress._.random(2, totalPages - 1)
        fetchAirportsByPage(endpoints.airports, randomPage).should(
            spok({
                status: 200,
                body: {
                    data: spok.arrayElements(defaultLimit),
                    links: {
                        first: `${requestUrl}`,
                        self: `${requestUrl}?page=${randomPage}`,
                        last: `${requestUrl}?page=${totalPages}`,
                        prev: `${requestUrl}?page=${randomPage - 1}`,
                        next: `${requestUrl}?page=${randomPage + 1}`,
                    }
                }
            })
        )
    })

    it('returns last page', () => {
        fetchAirportsByPage(endpoints.airports, totalPages).should(
            spok({
                status: 200,
                body: {
                    data: spok.array,
                    links: {
                        first: `${requestUrl}`,
                        self: `${requestUrl}?page=${totalPages}`,
                        last: `${requestUrl}?page=${totalPages}`,
                        prev: `${requestUrl}?page=${totalPages - 1}`,
                        next: `${requestUrl}`,
                    }
                }
            })
        )
    })

    it('returns the airport by the faker generated id', () => {
        let randomAirportInfo = faker.airline.airport()
        fetchAirportById(endpoints.airports, randomAirportInfo.iataCode).then(response => {
            expect(response.status).to.equal(200)
            expect(response.body.data.attributes.name).to.equal(randomAirportInfo.name)
        })
    })

    it('returns the airport specified by the ID and checks its name', () => {
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
    it('errors when fetching non existing page ', () => {
        let page = 0
        fetchAirportsByPage(endpoints.airports, page).should(
            spok({
                status: 404
            })
        )
    })
    
    it('errors when fetching non existing page ', () => {
        let page = -1
        fetchAirportsByPage(endpoints.airports, page).should(
            spok({
                status: 404
            })
        )
    })

    it.only('error by sending the non-existing airportsId', () => {
        let invalidAirportsId = faker.lorem.word(4).toUpperCase()
        fetchAirportById(endpoints.airports, invalidAirportsId).then(response => {
            expect(response.status).to.equal(404)
            expect(response.statusText).to.equal('Not Found')
        })
    })

})

// describe('429 status code', () => {
//     //we simulate multiple requests to an endpoint and ensure that the API enforces rate limiting 
//     //by returning a 429 Too Many Requests status after a threshold
//     for (let i = 1; i <= airports.rateLimit; i++) {
//         it('errors when reaching rate limit', () => {
//             fetchAirports(requestUrl).then(response => {
//                 if(i == airports.rateLimit){
//                     expect(response.status).to.eq(429)
//                 } else {
//                     expect(response.status).to.eq(200)
//                 }
//             }) 
//         })
//     }
// })
