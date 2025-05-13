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
const { json } = airports.headers.request['content-type']
const { status_404_error } = errors.fetchAllAirports
const { status_200 } = schemas.getAllAirports
const link = `${Cypress.config('baseUrl')}${endpoints.airports}`

describe('returns all airports in the Airport Gap database', () => {

    beforeEach(() => {
        retrieveTotalPages(endpoints.airports).as('numberTotalPages')
    })

    context('200 status code', () => {
        it('returns default limit from the first page without sending page parameter', function () {
            fetchAirports(endpoints.airports).should(
                spok({
                    status: 200,
                    headers: {
                        'content-type': json
                    },
                    body: {
                        data: spok.arrayElements(defaultLimit),
                        links: {
                            first: link,
                            self: link,
                            last: `${link}?page=${this.numberTotalPages}`,
                            prev: `${link}`,
                            next: `${link}?page=2`,
                        },
                    },
                }),
            )
        })

        it('returns default limit from the first page', function () {
            let firstPage = 1
            fetchAirportsByPage(endpoints.airports, firstPage).should(
                spok({
                    status: 200,
                    headers: {
                        'content-type': json
                    },
                    body: {
                        data: spok.arrayElements(defaultLimit),
                        links: {
                            first: `${link}`,
                            self: `${link}?page=${firstPage}`,
                            last: `${link}?page=${this.numberTotalPages}`,
                            prev: `${link}`,
                            next: `${link}?page=${firstPage + 1}`,
                        },
                    },
                }),
            )
        })

        it('returns default limit from random page', function () {
            let randomPage = Cypress._.random(2, this.numberTotalPages - 1)
            fetchAirportsByPage(endpoints.airports, randomPage).should(
                spok({
                    status: 200,
                    headers: {
                        'content-type': json
                    },
                    body: {
                        data: spok.arrayElements(defaultLimit),
                        links: {
                            first: `${link}`,
                            self: `${link}?page=${randomPage}`,
                            last: `${link}?page=${this.numberTotalPages}`,
                            prev: `${link}?page=${randomPage - 1}`,
                            next: `${link}?page=${randomPage + 1}`,
                        },
                    },
                }),
            )
        })

        it('returns last page', function () {
            fetchAirportsByPage(
                endpoints.airports,
                this.numberTotalPages,
            ).should(
                spok({
                    status: 200,
                    headers: {
                        'content-type': json
                    },
                    body: {
                        data: spok.array,
                        links: {
                            first: `${link}`,
                            self: `${link}?page=${this.numberTotalPages}`,
                            last: `${link}?page=${this.numberTotalPages}`,
                            prev: `${link}?page=${this.numberTotalPages - 1}`,
                            next: `${link}`,
                        },
                    },
                }),
            )
        })

        it('returns an empty array for pages exceeding total pages ', function () {
            let exceedTotalPages = this.numberTotalPages + 1
            function hasZeroElements(array) {
                return array.length === 0
            }
            fetchAirportsByPage(endpoints.airports, exceedTotalPages).should(
                spok({
                    status: 200,
                    headers: {
                        'content-type': json
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

        it('verifies schema when retrieving a page', function () {
            let page = Cypress._.random(2, this.numberTotalPages - 1)
            fetchAirportsByPage(endpoints.airports, page).validateSchema(
                status_200.schema_2,
            )
        })

        it('verifies schema for pages exceeding total pages', function () {
            let page = Cypress._.random(
                this.numberTotalPages + 1,
                this.numberTotalPages + 100,
            )
            fetchAirportsByPage(endpoints.airports, page).validateSchema(
                status_200.schema_1,
            )
        })
    })

    context('404 status code', () => {
        dataGenerator.invalidPageParameters.forEach((invalidPage) => {
            it(`it errors when fetching non existing page = ${invalidPage}`, () => {
                console.log(status_404_error)
                fetchAirportsByPage(endpoints.airports, invalidPage).should(
                    spok({
                        status: 404,
                        body: status_404_error,
                        headers: {
                            'content-type': json,
                        }
                    })
                )
            })
        })
    })
})
