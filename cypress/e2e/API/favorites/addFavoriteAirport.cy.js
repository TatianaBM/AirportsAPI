/// <reference types="cypress" />
import { endpoints } from '../../../support/endpoints'
import errors from '../../../fixtures/errors.json'
import schemas from '../../../fixtures/schemas.json'
import { headers } from '../../../fixtures/airports.json'
import spok from 'cy-spok'
import { faker } from '@faker-js/faker'
import { dataGenerator } from '../../../support/testData'
import {
    saveFavoriteAirport,
    pickRandomAirport,
    retrieveTotalPages,
    setTokenAsEnvVariable,
    clearAllFavoriteAirports,
} from '../../../support/utils'

const { status_201, status_422 } = schemas.favorite.addFavoriteAirport
const { status_401 } = schemas.receiveToken
const { request, response } = headers['content-type']
const invalidTestDataIata = dataGenerator.invalidIATACode()
const invalidTestDataToken = dataGenerator.invalidToken()
const { status_401_error } = errors.token
const { status_422_error_2, status_422_error_1 } =
    errors.favorite.addFavoriteAirport

describe('/favorites allows you to save a favorite airport to your Airport Gap account', () => {
    const { email, password } = Cypress.env('credentials')

    before('set token as an environmental variable', () => {
        setTokenAsEnvVariable(endpoints.token, email, password)
    })

    context('201 status code', () => {

        beforeEach('precondition', () => {
            cy.log('pick a random airport')
            retrieveTotalPages(endpoints.airports).then((totalPages) => {
                pickRandomAirport(totalPages, endpoints.airports).then(
                    (airportData) => {
                        cy.wrap(airportData).as('airportData')
                    },
                )
            })
        })

        afterEach(() => {
            clearAllFavoriteAirports(
                endpoints.clearAll,
                Cypress.env('token'),
            ).then((response) => expect(response.status).to.equal(204))
        })

        it('adds favorite airport with optional parameter note', () => {
            cy.get('@airportData').then((airportData) => {
                const requestBody = {
                    airport_id: airportData.attributes.iata,
                    note: faker.lorem.sentence(5),
                }
                saveFavoriteAirport(
                    endpoints.favorites,
                    Cypress.env('token'),
                    requestBody,
                ).should(
                    spok({
                        status: 201,
                        body: {
                            data: {
                                attributes: {
                                    airport: {
                                        altitude:
                                            airportData.attributes.altitude,
                                        city: airportData.attributes.city,
                                        country: airportData.attributes.country,
                                        iata: airportData.attributes.iata,
                                        icao: airportData.attributes.icao,
                                        id: spok.number,
                                        latitude:
                                            airportData.attributes.latitude,
                                        longitude:
                                            airportData.attributes.longitude,
                                        name: airportData.attributes.name,
                                        timezone:
                                            airportData.attributes.timezone,
                                    },
                                    note: requestBody.note,
                                },
                                id: spok.string,
                                type: 'favorite',
                            },
                        },
                    }),
                )
            })
        })

        it('adds favorite airport without optional parameter note', () => {
            cy.get('@airportData').then((airportData) => {
                const requestBody = {
                    airport_id: airportData.attributes.iata,
                }
                saveFavoriteAirport(
                    endpoints.favorites,
                    Cypress.env('token'),
                    requestBody,
                ).should(
                    spok({
                        status: 201,
                        body: {
                            data: {
                                attributes: {
                                    airport: {
                                        altitude:
                                            airportData.attributes.altitude,
                                        city: airportData.attributes.city,
                                        country: airportData.attributes.country,
                                        iata: airportData.attributes.iata,
                                        icao: airportData.attributes.icao,
                                        id: spok.number,
                                        latitude:
                                            airportData.attributes.latitude,
                                        longitude:
                                            airportData.attributes.longitude,
                                        name: airportData.attributes.name,
                                        timezone:
                                            airportData.attributes.timezone,
                                    },
                                    note: null,
                                },
                                id: spok.string,
                                type: 'favorite',
                            },
                        },
                    }),
                )
            })
        })

        it('checks header content type and custom header Authorization', () => {
            cy.get('@airportData').then((airportData) => {
                const requestBody = {
                    airport_id: airportData.attributes.iata,
                    note: faker.lorem.sentence(5),
                }
                saveFavoriteAirport(
                    endpoints.favorites,
                    Cypress.env('token'),
                    requestBody,
                ).then((data) => {
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

        it('checks schema with optional parameter note', () => {
            cy.get('@airportData').then((airportData) => {
                const requestBody = {
                    airport_id: airportData.attributes.iata,
                    note: faker.lorem.sentence(5),
                }
                saveFavoriteAirport(
                    endpoints.favorites,
                    Cypress.env('token'),
                    requestBody,
                ).validateSchema(status_201)
            })
        })

        it('checks schema without optional parameter note', () => {
            cy.get('@airportData').then((airportData) => {
                const requestBody = {
                    airport_id: airportData.attributes.iata,
                }
                saveFavoriteAirport(
                    endpoints.favorites,
                    Cypress.env('token'),
                    requestBody,
                ).validateSchema(status_201)
            })
        })
    })

    context('401 status code', () => {
        beforeEach('precondition', () => {
            cy.log('pick a random airport')
            retrieveTotalPages(endpoints.airports).then((totalPages) => {
                pickRandomAirport(totalPages, endpoints.airports).then(
                    (airportData) => {
                        cy.wrap(airportData).as('airportData')
                    },
                )
            })
        })

        afterEach(() => {
            clearAllFavoriteAirports(
                endpoints.clearAll,
                Cypress.env('token'),
            ).then((response) => expect(response.status).to.equal(204))
        })

        it('errors with invalid token', () => {
            const sampleOfInvalidToken = Cypress._.sampleSize(
                invalidTestDataToken,
                1,
            )
            cy.get('@airportData').then((airportData) => {
                const requestBody = {
                    airport_id: airportData.attributes.iata,
                }
                saveFavoriteAirport(
                    endpoints.favorites,
                    sampleOfInvalidToken,
                    requestBody,
                ).should(
                    spok({
                        status: 401,
                        body: status_401_error,
                    }),
                )
            })
        })

        it('checks header content type and custom header Authorization', () => {
            const sampleOfInvalidToken = Cypress._.sampleSize(
                invalidTestDataToken,
                1,
            )
            cy.get('@airportData').then((airportData) => {
                const requestBody = {
                    airport_id: airportData.attributes.iata,
                }
                saveFavoriteAirport(
                    endpoints.favorites,
                    sampleOfInvalidToken,
                    requestBody,
                ).then((data) => {
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

        it('checks schema', () => {
            const sampleOfInvalidToken = Cypress._.sampleSize(
                invalidTestDataToken,
                1,
            )
            cy.get('@airportData').then((airportData) => {
                const requestBody = {
                    airport_id: airportData.attributes.iata,
                }
                saveFavoriteAirport(
                    endpoints.favorites,
                    sampleOfInvalidToken,
                    requestBody,
                ).validateSchema(status_401)
            })
        })
    })

    context('422 status code', () => {
        beforeEach('precondition', () => {
            cy.log('pick a random airport')
            retrieveTotalPages(endpoints.airports).then((totalPages) => {
                pickRandomAirport(totalPages, endpoints.airports).then(
                    (airportData) => {
                        cy.wrap(airportData).as('airportData')
                    },
                )
            })
        })

        afterEach(() => {
            clearAllFavoriteAirports(
                endpoints.clearAll,
                Cypress.env('token'),
            ).then((response) => expect(response.status).to.equal(204))
        })

        it('errors with empty iata code ', () => {
            const requestBody = {
                airport_id: '',
                note: faker.lorem.sentence(4),
            }
            saveFavoriteAirport(
                endpoints.favorites,
                Cypress.env('token'),
                requestBody,
            ).should(
                spok({
                    status: 422,
                    body: status_422_error_1,
                }),
            )
        })

        for (let invalidIATACode in invalidTestDataIata) {
            it(`errors with invalid iata code: ${invalidIATACode}`, () => {
                const requestBody = {
                    airport_id: invalidTestDataIata[invalidIATACode],
                    note: faker.lorem.sentence(4),
                }
                saveFavoriteAirport(
                    endpoints.favorites,
                    Cypress.env('token'),
                    requestBody,
                ).should(
                    spok({
                        status: 422,
                        body: status_422_error_1,
                    }),
                )
            })
        }

        it('errors with missing required field iata code ', () => {
            const requestBody = {
                note: faker.lorem.sentence(4),
            }
            saveFavoriteAirport(
                endpoints.favorites,
                Cypress.env('token'),
                requestBody,
            ).should(
                spok({
                    status: 422,
                    body: status_422_error_1,
                }),
            )
        })

        it('errors with empty payload', () => {
            const requestBody = {}
            saveFavoriteAirport(
                endpoints.favorites,
                Cypress.env('token'),
                requestBody,
            ).should(
                spok({
                    status: 422,
                    body: status_422_error_1,
                }),
            )
        })

        it('errors when saving the same airport as a favorite', () => {
            cy.get('@airportData').then((airportData) => {
                const requestBody = {
                    airport_id: airportData.attributes.iata,
                    note: faker.lorem.sentence(5),
                }
                cy.log('save the airpot as a favorite')
                saveFavoriteAirport(
                    endpoints.favorites,
                    Cypress.env('token'),
                    requestBody,
                )
                    .its('status')
                    .should('eq', 201)
                cy.log('attempt to save the same airpot as a favorite')
                saveFavoriteAirport(
                    endpoints.favorites,
                    Cypress.env('token'),
                    requestBody,
                ).should(
                    spok({
                        status: 422,
                        body: status_422_error_2,
                    }),
                )
            })
        })

        it('checks schema', () => {
            const requestBody = {
                note: faker.lorem.sentence(4),
            }
            saveFavoriteAirport(
                endpoints.favorites,
                Cypress.env('token'),
                requestBody,
            ).validateSchema(status_422)
        })
    })
})
