/// <reference types="cypress" />
import { retrieveTotalPages, calculateDistanceBetweenTwoAirports, pickRandomAirport } from '../../support/utils'
import { endpoints } from '../../support/endpoints'
import schemas from '../../fixtures/schemas.json'
import spok from 'cy-spok'
import { dataGenerator } from '../../support/testData'
import errors from '../../fixtures/errors.json'

const { status_200 } = schemas.calculateDistance
const { responseBody } = errors.calculateDistance.status_422
let totalPages

describe('calculates the distance between two airports', () => {
    before(() => {retrieveTotalPages(endpoints.airports).then((number) => (totalPages = number))
    })
    
    context('200 status code', () => {
        it('returns the distance between two different airports', () => {
            pickRandomAirport(totalPages, endpoints.airports).then(departureAirport => {
            cy.log(departureAirport)
            const departureAirportIata = departureAirport.attributes.iata
            pickRandomAirport(totalPages, endpoints.airports).then(destinationAirport => {
                cy.log(destinationAirport)
                const destinationAirportIata = destinationAirport.attributes.iata
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
                                    id: Cypress._.isNumber,
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
                                    id: Cypress._.isNumber,
                                    latitude: destinationAirport.attributes.latitude,
                                    longitude: destinationAirport.attributes.longitude,
                                    name: destinationAirport.attributes.name,
                                    timezone: destinationAirport.attributes.timezone
                                },
                                kilometers: spok.number,
                                miles:spok.number,
                                nautical_miles:spok.number
                                }
                            }
                        }
                    }))
                })
            })
        })

    it('returns distance = 0 when departure and destination airports are the same', () => {
        pickRandomAirport(totalPages, endpoints.airports).then(airport => {
            cy.log(airport)
            const airportIata = airport.attributes.iata
                cy.log('calculate distance')
                calculateDistanceBetweenTwoAirports(endpoints.distance, airportIata, airportIata).should(spok({
                    status: 200,
                    body: {
                        data: {
                            type: 'airport_distance',
                            id: `${airportIata}-${airportIata}`,
                            attributes: {
                                from_airport: {
                                    altitude: airport.attributes.altitude,
                                    city: airport.attributes.city,
                                    country: airport.attributes.country,
                                    iata: airportIata,
                                    icao: airport.attributes.icao,
                                    id: Cypress._.isNumber,
                                    latitude: airport.attributes.latitude,
                                    longitude: airport.attributes.longitude,
                                    name: airport.attributes.name,
                                    timezone: airport.attributes.timezone
                                },
                                to_airport: {
                                    altitude: airport.attributes.altitude,
                                    city: airport.attributes.city,
                                    country: airport.attributes.country,
                                    iata: airportIata,
                                    icao: airport.attributes.icao,
                                    id: Cypress._.isNumber,
                                    latitude: airport.attributes.latitude,
                                    longitude: airport.attributes.longitude,
                                    name: airport.attributes.name,
                                    timezone: airport.attributes.timezone
                                },
                                kilometers: 0,
                                miles: 0,
                                nautical_miles: 0
                            }
                        }
                    }
                }))
            
        })
    })    

        it('checks schema', () => {
            pickRandomAirport(totalPages, endpoints.airports).then(departureAirport => {
            cy.log(departureAirport)
            const departureAirportIata = departureAirport.attributes.iata
            pickRandomAirport(totalPages, endpoints.airports).then(destinationAirport => {
                cy.log(destinationAirport)
                const destinationAirportIata = destinationAirport.attributes.iata
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
                            const destinationAirportIata =
                                destinationAirport.attributes.iata
                            calculateDistanceBetweenTwoAirports(
                                endpoints.distance,
                                invalidIataCodeDepartureAirport,
                                destinationAirportIata,
                            ).should(
                                spok({
                                    status: 422,
                                    body: responseBody,
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
                            const departureAirportIata =
                                departureAirport.attributes.iata
                            calculateDistanceBetweenTwoAirports(
                                endpoints.distance,
                                departureAirportIata,
                                invalidIataCodeDestinationAirport,
                            ).should(
                                spok({
                                    status: 422,
                                    body: responseBody,
                                }),
                            )
                        },
                    )
                })
            },
        )
        it('errors when Iata code airport is of wrong data type', () => {
            pickRandomAirport(totalPages, endpoints.airports).then(
                (departureAirport) => {
                    cy.log(departureAirport)
                    const departureAirportIata = [
                        departureAirport.attributes.iata,
                    ]
                    pickRandomAirport(totalPages, endpoints.airports).then(
                        (destinationAirport) => {
                            cy.log(destinationAirport)
                            const destinationAirportIata = [
                                destinationAirport.attributes.iata,
                            ]
                            cy.log('calculate distance')
                            calculateDistanceBetweenTwoAirports(
                                endpoints.distance,
                                departureAirportIata,
                                destinationAirportIata,
                            ).should(
                                spok({
                                    status: 422,
                                    body: responseBody,
                                }),
                            )
                        },
                    )
                },
            )
        })
    })
})