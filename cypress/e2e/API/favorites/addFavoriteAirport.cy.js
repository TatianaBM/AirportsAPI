/// <reference types="cypress" />
import { endpoints } from '../../../support/endpoints'
import errors from '../../../fixtures/errors.json'
import schemas from '../../../fixtures/schemas.json'
import spok from 'cy-spok'
import { faker } from '@faker-js/faker'
import { dataGenerator } from '../../../support/testData'
import {
    saveFavoriteAirport,
    pickRandomAirport,
    retrieveTotalPages,
    setTokenAsEnvVariable
} from '../../../support/utils'

const { status_201, status_422 } = schemas.favorite.addFavoriteAirport
const { status_401 } = schemas.receiveToken
const invalidTestDataIata = dataGenerator.invalidIATACode()
const invalidTestDataToken = dataGenerator.invalidToken()
const { status_401_error } = errors.token
const { status_422_error } = errors.favorite.addFavoriteAirport

describe('allows you to save a favorite airport to your Airport Gap account', () => {
    const userCredentials = {
        email: Cypress.env('email'),
        password: Cypress.env('password')
    }
    let token
    before('set token as an environmental variable', () => {
        setTokenAsEnvVariable(endpoints.token, userCredentials.email, userCredentials.password)
        cy.then(() => token = Cypress.env('token'))
    })

    context('201 status code', () => {
        beforeEach('arrange', () => {
            cy.log('pick a random airport')
            retrieveTotalPages(endpoints.airports).then((totalPages) => {
                pickRandomAirport(totalPages, endpoints.airports).then(
                    (airportData) => {
                        cy.wrap(airportData).as('airportData')
                    },
                )
            })
        })

        it('adds favorite airport with optional parameter note', () => {
            cy.get('@airportData').then((airportData) => {
                const requestBody = {
                    airport_id: airportData.attributes.iata,
                    note: faker.lorem.sentence(5),
                }
                saveFavoriteAirport(
                    endpoints.favorites,
                    token,
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
                    token,
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

        it('checks schema with optional parameter note', () => {
            cy.get('@airportData').then((airportData) => {
                const requestBody = {
                    airport_id: airportData.attributes.iata,
                    note: faker.lorem.sentence(5),
                }
                saveFavoriteAirport(
                    endpoints.favorites,
                    token,
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
                    token,
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

        it('errors with invalid token', () => {
            const sampleOfInvalidToken = Cypress._.sampleSize(invalidTestDataToken, 1)
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

        it('checks schema', () => {
            const sampleOfInvalidToken = Cypress._.sampleSize(invalidTestDataToken, 1)
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

        it('errors with empty iata code ', () => {
            const requestBody = {
                airport_id: '',
                note: faker.lorem.sentence(4),
            }
            saveFavoriteAirport(
                endpoints.favorites,
                token,
                requestBody,
            ).should(
                spok({
                    status: 422,
                    body: status_422_error,
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
                    token,
                    requestBody,
                ).should(
                    spok({
                        status: 422,
                        body: status_422_error,
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
                token,
                requestBody,
            ).should(
                spok({
                    status: 422,
                    body: status_422_error,
                }),
            )
        })

        it('errors with empty payload', () => {
            const requestBody = {}
            saveFavoriteAirport(
                endpoints.favorites,
                token,
                requestBody,
            ).should(
                spok({
                    status: 422,
                    body: status_422_error,
                }),
            )
        })

        it('checks schema', () => {
            const requestBody = {
                note: faker.lorem.sentence(4)
            }
            saveFavoriteAirport(
                endpoints.favorites,
                token,
                requestBody,
            ).validateSchema(status_422)
        })
    })
})
