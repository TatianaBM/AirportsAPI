/// <reference types="cypress" />
import { retrieveTotalPages, calculateDistanceBetweenTwoAirports, pickRandomAirport } from '../../support/utils'
import { endpoints } from '../../support/endpoints'
import schemas from '../../fixtures/schemas.json'
import spok from 'cy-spok'

const { status_200 } = schemas.calculateDistance
let totalPages

before(() => {
    retrieveTotalPages(endpoints.airports).then((number) => totalPages = number)
})

describe('200 status code', () => {
    it('returns the distance between two airports ', () => {
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