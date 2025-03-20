/// <reference types="cypress" />
import { retrieveTotalPages, calculateDistanceBetweenTwoAirports, pickRandomAirport, isMoreThanZero } from '../../support/utils'
import { endpoints } from '../../support/endpoints'
import schemas from '../../fixtures/schemas.json'
import spok from 'cy-spok'
import { dataGenerator } from '../../support/testData'
import errors from '../../fixtures/errors.json'

const { status_200, status_422 } = schemas.calculateDistance
const { status_422_error } = errors.calculateDistance

describe('calculates the distance between two airports', () => {
    let totalPages
    let departureAirportIata
    let destinationAirportIata

    before(() => {retrieveTotalPages(endpoints.airports).then((number) => (totalPages = number))
    })
    
    context('200 status code', () => {
        it('returns the distance between two different airports', () => {
            pickRandomAirport(totalPages, endpoints.airports).then(departureAirport => {
            cy.log(departureAirport)
            departureAirportIata = departureAirport.attributes.iata
            pickRandomAirport(totalPages, endpoints.airports).then(destinationAirport => {
                cy.log(destinationAirport)
                destinationAirportIata = destinationAirport.attributes.iata
                cy.log('calculate distance')
                calculateDistanceBetweenTwoAirports(endpoints.distance, departureAirportIata, destinationAirportIata).should(spok({
                    status: 200,
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

        it('returns distance = 0 when departure and destination airports are the same', () => {
            pickRandomAirport(totalPages, endpoints.airports).then((airport) => {
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

        it('checks schema', () => {
            pickRandomAirport(totalPages, endpoints.airports).then(departureAirport => {
            cy.log(departureAirport)
            departureAirportIata = departureAirport.attributes.iata
            pickRandomAirport(totalPages, endpoints.airports).then(destinationAirport => {
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
                it(`errors when departure airport is invalid: ${key}`, () => {
                    pickRandomAirport(totalPages, endpoints.airports).then(
                        (destinationAirport) => {
                            destinationAirportIata =
                                destinationAirport.attributes.iata
                            calculateDistanceBetweenTwoAirports(
                                endpoints.distance,
                                invalidIataCodeDepartureAirport,
                                destinationAirportIata,
                            ).should(
                                spok({
                                    status: 422,
                                    body: status_422_error,
                                }),
                            )
                        },
                    )
                })
            },
        )
        Object.entries(dataGenerator.invalidIATACode()).forEach(
            ([key, invalidIataCodeDestinationAirport]) => {
                it(`errors when destination airport is invalid: ${key}`, () => {
                    pickRandomAirport(totalPages, endpoints.airports).then(
                        (departureAirport) => {
                            departureAirportIata =
                                departureAirport.attributes.iata
                            calculateDistanceBetweenTwoAirports(
                                endpoints.distance,
                                departureAirportIata,
                                invalidIataCodeDestinationAirport,
                            ).should(
                                spok({
                                    status: 422,
                                    body: status_422_error,
                                }),
                            )
                        },
                    )
                })
            },
        )
        it('errors when both departure and destination airport are invalid',() => {
            // generate two random invalid Iata codes
            let invalidIataCodes = Cypress._.sampleSize(dataGenerator.invalidIATACode(), 2)
            departureAirportIata = invalidIataCodes[0]
            destinationAirportIata = invalidIataCodes[1]
            calculateDistanceBetweenTwoAirports(endpoints.distance, departureAirportIata, destinationAirportIata).should(spok({
                status: 422,
                body: status_422_error
            }))
        })

        it('errors when departure iata required parameter is missing',() => {
            pickRandomAirport(totalPages, endpoints.airports).then(
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
                            body: status_422_error,
                        })
                    )
                }
            ) 
        })

        it('errors when destination iata required parameter is missing',() => {
            pickRandomAirport(totalPages, endpoints.airports).then(
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
                            body: status_422_error,
                        })
                    )
                }
            ) 
        })

        it('errors when both required parameters are missing',() => {
            departureAirportIata = ''
            destinationAirportIata = ''
            calculateDistanceBetweenTwoAirports(
                endpoints.distance,
                departureAirportIata,
                destinationAirportIata,
            ).should(
                spok({
                    status: 422,
                    body: status_422_error,
                })) 
        })

        it('errors when both iata codes are of wrong data type', () => {
            pickRandomAirport(totalPages, endpoints.airports).then(
                (departureAirport) => {
                    cy.log(departureAirport)
                    departureAirportIata = [departureAirport.attributes.iata]
                    pickRandomAirport(totalPages, endpoints.airports).then(
                        (destinationAirport) => {
                            cy.log(destinationAirport)
                            destinationAirportIata = [destinationAirport.attributes.iata]
                            cy.log('calculate distance')
                            calculateDistanceBetweenTwoAirports(
                                endpoints.distance,
                                departureAirportIata,
                                destinationAirportIata,
                            ).should(
                                spok({
                                    status: 422,
                                    body: status_422_error,
                                })
                            )
                        }
                    )
                }
            )
        })

        it('errors when departure iata code is of wrong data type (array)', () => {
            pickRandomAirport(totalPages, endpoints.airports).then(
                (departureAirport) => {
                    cy.log(departureAirport)
                    departureAirportIata = [departureAirport.attributes.iata]
                    pickRandomAirport(totalPages, endpoints.airports).then(
                        (destinationAirport) => {
                            cy.log(destinationAirport)
                            destinationAirportIata = destinationAirport.attributes.iata
                            cy.log('calculate distance')
                            calculateDistanceBetweenTwoAirports(
                                endpoints.distance,
                                departureAirportIata,
                                destinationAirportIata,
                            ).should(
                                spok({
                                    status: 422,
                                    body: status_422_error,
                                })
                            )
                        }
                    )
                }
            )
        })

        it('errors when destination iata code is of wrong data type (array)', () => {
            pickRandomAirport(totalPages, endpoints.airports).then(
                (departureAirport) => {
                    cy.log(departureAirport)
                    departureAirportIata = departureAirport.attributes.iata
                    pickRandomAirport(totalPages, endpoints.airports).then(
                        (destinationAirport) => {
                            cy.log(destinationAirport)
                            destinationAirportIata = destinationAirport.attributes.iata
                            cy.log('calculate distance')
                            calculateDistanceBetweenTwoAirports(
                                endpoints.distance,
                                departureAirportIata,
                                destinationAirportIata,
                            ).should(
                                spok({
                                    status: 422,
                                    body: status_422_error,
                                })
                            )
                        }
                    )
                }
            )
        })

        it('errors when empty payload', () => {
            calculateDistanceBetweenTwoAirports(endpoints.distance).should(
                spok({
                    status: 422,
                    body: status_422_error,
                })
            )
        })

        it('checks schema', () => {
            pickRandomAirport(totalPages, endpoints.airports).then(
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