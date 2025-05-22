/// <reference types="cypress" />

import {
    fetchAirports,
    fetchAirportsByPage,
    retrieveTotalPages
} from '../../support/utils'
import { endpoints } from '../../support/endpoints'
import spok from 'cy-spok'
import airports from '../../fixtures/airports.json'
import errors from '../../fixtures/errors.json'
import schemas from '../../fixtures/schemas.json'
import { dataGenerator } from '../../support/testData'

const { defaultLimit } = airports.pagination
const { response } = airports.headers['content-type']
const { status_404_error } = errors.fetchAllAirports
const { status_200 } = schemas.getAllAirports
const link = `${Cypress.config('baseUrl')}${endpoints.airports}`

describe('fetches all airports', () => {

    before('set total number of pages as an environmental variable', () => {
        retrieveTotalPages(endpoints.airports).then(number => {
            Cypress.env('numberTotalPages', number)
        })
    })

    context('200 status code', () => {

        it('returns default limit from the first page without sending page parameter', () => {
            fetchAirports(endpoints.airports).should(
                spok({
                    status: 200,
                    headers: {
                        'content-type': response.json
                    },
                    body: {
                        data: spok.arrayElements(defaultLimit),
                        links: {
                            first: link,
                            self: link,
                            last: `${link}?page=${Cypress.env('numberTotalPages')}`,
                            prev: `${link}`,
                            next: `${link}?page=2`,
                        },
                    },
                }),
            )
        })

        it('returns default limit from the first page', () => {
            let firstPage = 1
            fetchAirportsByPage(endpoints.airports, firstPage).should(
                spok({
                    status: 200,
                    headers: {
                        'content-type': response.json
                    },
                    body: {
                        data: spok.arrayElements(defaultLimit),
                        links: {
                            first: `${link}`,
                            self: `${link}?page=${firstPage}`,
                            last: `${link}?page=${Cypress.env('numberTotalPages')}`,
                            prev: `${link}`,
                            next: `${link}?page=${firstPage + 1}`,
                        },
                    },
                }),
            )
        })

        it('returns default limit from random page', () => {
            let randomPage = Cypress._.random(2, Cypress.env('numberTotalPages') - 1)
            fetchAirportsByPage(endpoints.airports, randomPage).should(
                spok({
                    status: 200,
                    headers: {
                        'content-type': response.json
                    },
                    body: {
                        data: spok.arrayElements(defaultLimit),
                        links: {
                            first: `${link}`,
                            self: `${link}?page=${randomPage}`,
                            last: `${link}?page=${Cypress.env('numberTotalPages')}`,
                            prev: `${link}?page=${randomPage - 1}`,
                            next: `${link}?page=${randomPage + 1}`,
                        },
                    },
                }),
            )
        })

        it('returns last page', () => {
            fetchAirportsByPage(
                endpoints.airports,
                Cypress.env('numberTotalPages'),
            ).should(
                spok({
                    status: 200,
                    headers: {
                        'content-type': response.json
                    },
                    body: {
                        data: spok.array,
                        links: {
                            first: `${link}`,
                            self: `${link}?page=${Cypress.env('numberTotalPages')}`,
                            last: `${link}?page=${Cypress.env('numberTotalPages')}`,
                            prev: `${link}?page=${Cypress.env('numberTotalPages') - 1}`,
                            next: `${link}`,
                        },
                    },
                }),
            )
        })

        it('returns an empty array for pages exceeding total pages ', () => {
            let exceedTotalPages = Cypress.env('numberTotalPages') + 1
            function hasZeroElements(array) {
                return array.length === 0
            }
            fetchAirportsByPage(endpoints.airports, exceedTotalPages).should(
                spok({
                    status: 200,
                    headers: {
                        'content-type': response.json
                    },
                    body: {
                        data: hasZeroElements,
                    },
                }),
            )
        })

        it('verifies schema first page', () => {
            fetchAirports(endpoints.airports).validateSchema(
                status_200.schema_2,
            )
        })

        it('verifies schema when retrieving a page', () => {
            let page = Cypress._.random(2, Cypress.env('numberTotalPages') - 1)
            fetchAirportsByPage(endpoints.airports, page).validateSchema(
                status_200.schema_2,
            )
        })

        it('verifies schema for pages exceeding total pages', () => {
            let page = Cypress._.random(
                Cypress.env('numberTotalPages') + 1,
                Cypress.env('numberTotalPages') + 100,
            )
            fetchAirportsByPage(endpoints.airports, page).validateSchema(
                status_200.schema_1,
            )
        })
    })

    context('404 status code', () => {
        dataGenerator.invalidPageParameters.forEach((invalidPage) => {
            it(`it errors when fetching non existing page = ${invalidPage}`, () => {
                fetchAirportsByPage(endpoints.airports, invalidPage).should(
                    spok({
                        status: 404,
                        body: status_404_error,
                        headers: {
                            'content-type': response.json,
                        }
                    })
                )
            })
        })
    })
})
