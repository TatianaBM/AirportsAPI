/// <reference types="cypress" />

import {
    fetchAirports,
    fetchAirportsByPage,
    retrieveTotalPages
} from '../../support/utils'
import { endpoints } from '../../support/endpoints'
import spok from 'cy-spok'
import airports from '../../fixtures/airports.json'
import schemas from '../../fixtures/schemas.json'
import { dataGenerator } from '../../support/testData'

const { defaultLimit } = airports.pagination
const { html } = airports.headers.request['content-type']
const { encoding } = airports.headers.request
const { header, title } = airports.responseBody['content-type'].html
const { status_200 } = schemas.getAllAirports
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

    it('returns an empty array for pages exceeding total pages ', () => {
        let exceedTotalPages = totalPages + 1
        function hasZeroElements(array) {
            return array.length === 0
        }
        fetchAirportsByPage(endpoints.airports, exceedTotalPages).should(
            spok({
                status: 200,
                body: {
                    data: hasZeroElements,
                }
            })
        )
    })

    it('verifies schema first page', () => {
        fetchAirports(endpoints.airports).validateSchema(status_200.schema_2)
    })

    it('verifies schema when retrieving a page', () => {
        let page = Cypress._.random(2,totalPages-1)
        fetchAirportsByPage(endpoints.airports, page).validateSchema(status_200.schema_2)
    })

    it('verifies schema for pages exceeding total pages', () => {
        let page = Cypress._.random(totalPages+1, totalPages+100)
        fetchAirportsByPage(endpoints.airports, page).validateSchema(status_200.schema_1)
    })
    
})

describe('404 status code', () => {
    dataGenerator.invalidPageParameters.forEach(invalidPage => {
        it(`checks status, response body when fetching non existing page = ${invalidPage}`, () => {
            fetchAirportsByPage(endpoints.airports, invalidPage).should((response) => {
                expect(response.status).to.eq(404)
                expect(response.body).to.include(title)
                expect(response.body).to.include(header.string_1)
                expect(response.body).to.include(header.string_2)
            })
        })

        it(`checks header content type when fetching non existing page = ${invalidPage}`, () => {
            fetchAirportsByPage(endpoints.airports, invalidPage)
                .its("headers['content-type']")
                .should('contain', html )
                .and('contain', encoding)
        })
    })
})


