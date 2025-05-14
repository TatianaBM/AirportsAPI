/// <reference types="cypress" />
import { retrieveTotalPages, calculateDistanceBetweenTwoAirports, pickRandomAirport, isMoreThanZero } from '../../support/utils'
import { endpoints } from '../../support/endpoints'
import schemas from '../../fixtures/schemas.json'
import spok from 'cy-spok'
import { dataGenerator } from '../../support/testData'
import errors from '../../fixtures/errors.json'
import airports from '../../fixtures/airports.json'

const { status_200, status_422 } = schemas.calculateDistance
const { status_422_error } = errors.calculateDistance
const { request, response } = airports.headers['content-type']

describe('calculates the distance between two airports', () => {
    let departureAirportIata
    let destinationAirportIata

    beforeEach(() => {
        retrieveTotalPages(endpoints.airports).as('numberTotalPages')
    })
    
    context('200 status code', () => {
        it('returns the distance between two different airports', function() {
            pickRandomAirport(this.numberTotalPages, endpoints.airports).then(departureAirport => {
            cy.log(departureAirport)
            departureAirportIata = departureAirport.attributes.iata
            pickRandomAirport(this.numberTotalPages, endpoints.airports).then(destinationAirport => {
                cy.log(destinationAirport)
                destinationAirportIata = destinationAirport.attributes.iata
                cy.log('calculate distance')
                calculateDistanceBetweenTwoAirports(endpoints.distance, departureAirportIata, destinationAirportIata).should(spok({
                    status: 200,
                    headers: {
                        'content-type': response.json
                    },
                    requestHeaders: {
                        'content-type': request.json
                    },
                    body: {
                        data: {
                            type: 'airport_distance',
                            id: `${departureAirportIata}-${destinationAirportIata}`,
                            attributes: {
                                from_airport: {
                                    altitude: departureAirport.attributes.altitude,
                                    city: departureAirport.attributes.city,
                                    country: departureAirport.attributes.country,
                                    iata: departureAirportIata,
                                    icao: departureAirport.attributes.icao,
                                    id: spok.number,
                                    latitude: departureAirport.attributes.latitude,
                                    longitude: departureAirport.attributes.longitude,
                                    name: departureAirport.attributes.name,
                                    timezone: departureAirport.attributes.timezone
                                },
                                to_airport: {
                                    altitude: destinationAirport.attributes.altitude,
                                    city: destinationAirport.attributes.city,
                                    country: destinationAirport.attributes.country,
                                    iata: destinationAirportIata,
                                    icao: destinationAirport.attributes.icao,
                                    id: spok.number,
                                    latitude: destinationAirport.attributes.latitude,
                                    longitude: destinationAirport.attributes.longitude,
                                    name: destinationAirport.attributes.name,
                                    timezone: destinationAirport.attributes.timezone
                                },
                                kilometers: isMoreThanZero,
                                miles: isMoreThanZero,
                                nautical_miles: isMoreThanZero
                                }
                            }
                        }
                    }))
                })
            })
        })

        it('returns distance = 0 when departure and destination airports are the same', function() {
            pickRandomAirport(this.numberTotalPages, endpoints.airports).then((airport) => {
            cy.log(airport)
            departureAirportIata = airport.attributes.iata
            destinationAirportIata = airport.attributes.iata
            cy.log('calculate distance')
            calculateDistanceBetweenTwoAirports(
                endpoints.distance,
                departureAirportIata,
                destinationAirportIata,
            ).should(
                spok({
                    status: 200,
                    headers: {
                        'content-type': response.json
                    },
                    requestHeaders: {
                        'content-type': request.json
                    },
                    body: {
                        data: {
                            type: 'airport_distance',
                            id: `${departureAirportIata}-${destinationAirportIata}`,
                            attributes: {
                                from_airport: {
                                    altitude: airport.attributes.altitude,
                                    city: airport.attributes.city,
                                    country: airport.attributes.country,
                                    iata: departureAirportIata,
                                    icao: airport.attributes.icao,
                                    id: spok.number,
                                    latitude: airport.attributes.latitude,
                                    longitude: airport.attributes.longitude,
                                    name: airport.attributes.name,
                                    timezone: airport.attributes.timezone,
                                },
                                to_airport: {
                                    altitude: airport.attributes.altitude,
                                    city: airport.attributes.city,
                                    country: airport.attributes.country,
                                    iata: destinationAirportIata,
                                    icao: airport.attributes.icao,
                                    id: spok.number,
                                    latitude: airport.attributes.latitude,
                                    longitude: airport.attributes.longitude,
                                    name: airport.attributes.name,
                                    timezone: airport.attributes.timezone,
                                },
                                kilometers: 0,
                                miles: 0,
                                nautical_miles: 0,
                                }
                            }
                        }
                    })
                )
            })
        })    

        it('checks schema', function() {
            pickRandomAirport(this.numberTotalPages, endpoints.airports).then(departureAirport => {
            cy.log(departureAirport)
            departureAirportIata = departureAirport.attributes.iata
            pickRandomAirport(this.numberTotalPages, endpoints.airports).then(destinationAirport => {
                cy.log(destinationAirport)
                destinationAirportIata = destinationAirport.attributes.iata
                cy.log('calculate distance')
                calculateDistanceBetweenTwoAirports(endpoints.distance, departureAirportIata, destinationAirportIata).validateSchema(status_200)
                })
            })
        })
    })

    context('422 status code', () => {
        Object.entries(dataGenerator.invalidIATACode()).forEach(
            ([key, invalidIataCodeDepartureAirport]) => {
                it(`errors when departure airport is invalid: ${key}`, function () {
                    pickRandomAirport(
                        this.numberTotalPages,
                        endpoints.airports,
                    ).then((destinationAirport) => {
                        destinationAirportIata =
                            destinationAirport.attributes.iata
                        calculateDistanceBetweenTwoAirports(
                            endpoints.distance,
                            invalidIataCodeDepartureAirport,
                            destinationAirportIata,
                        ).should(
                            spok({
                                status: 422,
                                headers: {
                                    'content-type': response.json,
                                },
                                requestHeaders: {
                                    'content-type': request.json,
                                },
                                body: status_422_error,
                            }),
                        )
                    })
                })
            },
        )
        Object.entries(dataGenerator.invalidIATACode()).forEach(
            ([key, invalidIataCodeDestinationAirport]) => {
                it(`errors when destination airport is invalid: ${key}`, function () {
                    pickRandomAirport(
                        this.numberTotalPages,
                        endpoints.airports,
                    ).then((departureAirport) => {
                        departureAirportIata = departureAirport.attributes.iata
                        calculateDistanceBetweenTwoAirports(
                            endpoints.distance,
                            departureAirportIata,
                            invalidIataCodeDestinationAirport,
                        ).should(
                            spok({
                                status: 422,
                                headers: {
                                    'content-type': response.json,
                                },
                                requestHeaders: {
                                    'content-type': request.json,
                                },
                                body: status_422_error,
                            }),
                        )
                    })
                })
            },
        )
        it('errors when both departure and destination airport are invalid',() => {
            // generate two random invalid Iata codes
            let invalidIataCodes = Cypress._.sampleSize(dataGenerator.invalidIATACode(), 2)
            departureAirportIata = invalidIataCodes[0]
            destinationAirportIata = invalidIataCodes[1]
            calculateDistanceBetweenTwoAirports(
                endpoints.distance,
                departureAirportIata,
                destinationAirportIata,
            ).should(
                spok({
                    status: 422,
                    headers: {
                        'content-type': response.json,
                    },
                    requestHeaders: {
                        'content-type': request.json,
                    },
                    body: status_422_error,
                }),
            )
        })

        it('errors when departure iata required parameter is missing', function() {
            pickRandomAirport(this.numberTotalPages, endpoints.airports).then(
                (destinationAirport) => {
                    departureAirportIata = ''
                    destinationAirportIata = destinationAirport.attributes.iata
                    calculateDistanceBetweenTwoAirports(
                        endpoints.distance,
                        departureAirportIata,
                        destinationAirportIata,
                    ).should(
                        spok({
                            status: 422,
                            headers: {
                                'content-type': response.json,
                            },
                            requestHeaders: {
                                'content-type': request.json,
                            },
                            body: status_422_error,
                        }),
                    )
                }
            ) 
        })

        it('errors when destination iata required parameter is missing', function() {
            pickRandomAirport(this.numberTotalPages, endpoints.airports).then(
                (departureAirport) => {
                    departureAirportIata = departureAirport.attributes.iata
                    destinationAirportIata = ''
                    calculateDistanceBetweenTwoAirports(
                        endpoints.distance,
                        departureAirportIata,
                        destinationAirportIata,
                    ).should(
                        spok({
                            status: 422,
                            headers: {
                                'content-type': response.json,
                            },
                            requestHeaders: {
                                'content-type': request.json,
                            },
                            body: status_422_error,
                        }),
                    )
                }
            ) 
        })

        it('errors when both required parameters are missing', () => {
            departureAirportIata = ''
            destinationAirportIata = ''
            calculateDistanceBetweenTwoAirports(
                endpoints.distance,
                departureAirportIata,
                destinationAirportIata,
            ).should(
                spok({
                    status: 422,
                    headers: {
                        'content-type': response.json
                    },
                    requestHeaders: {
                        'content-type': request.json
                    },
                    body: status_422_error,
                })) 
        })

        it('errors when empty payload', () => {
            calculateDistanceBetweenTwoAirports(endpoints.distance).should(
                spok({
                    status: 422,
                    headers: {
                        'content-type': response.json
                    },
                    requestHeaders: {
                        'content-type': request.json
                    },
                    body: status_422_error,
                })
            )
        })

        it('checks schema', function() {
            pickRandomAirport(this.numberTotalPages, endpoints.airports).then(
                (destinationAirport) => {
                    departureAirportIata = ''
                    destinationAirportIata = destinationAirport.attributes.iata
                    calculateDistanceBetweenTwoAirports(
                        endpoints.distance,
                        departureAirportIata,
                        destinationAirportIata,
                    ).validateSchema(status_422)
                }
            )
        })
    })
})