/// <reference types="cypress" />
import spok from 'cy-spok'

import { calculateDistanceBetweenTwoAirports } from "../../support/utils"
import { endpoints } from "../../support/endpoints"
import { dataGenerator } from "../../support/testData"
import schemas from '../../fixtures/schemas.json'
import errors from '../../fixtures/errors.json'
import airports from '../../fixtures/airports.json'

const { status_200, status_422 } = schemas.calculateDistance
const { status_422_error } = errors.calculateDistance
const { request, response } = airports.headers['content-type']
const departureId = dataGenerator.validIATACode().iataCode
const destinationId = dataGenerator.validIATACode().iataCode

describe('calculates the distance between two airports', () => {
    
    context('200 status code', () => {

        it('calculates the distance between two airports', () => {
            calculateDistanceBetweenTwoAirports(endpoints.distance, departureId, destinationId)
                .then(response => {
                    expect(response.status, 'status code').to.equal(200)
                    expect(response.body.data.id, 'id').to.equal(`${departureId}-${destinationId}`)
                    expect(response.body.data.attributes.kilometers).to.be.at.least(0)
                    expect(response.body.data.attributes.miles).to.be.at.least(0)
                    expect(response.body.data.attributes.nautical_miles).to.be.at.least(0)
                })
        })

        it('checks headers: content type', () => {
            calculateDistanceBetweenTwoAirports(
                endpoints.distance,
                departureId,
                destinationId,
            ).should(
                spok({
                    status: 200,
                    headers: {
                        'content-type': response.json,
                    },
                    requestHeaders: {
                        'content-type': request.json,
                    },
                }),
            )
        })
    
        it('verifies schema for request with two valid IATA codes', () => {
            calculateDistanceBetweenTwoAirports(endpoints.distance, departureId, destinationId)
                .validateSchema(status_200)
        })
    })
    
    context('422 status code', () => {
    
        it(`error by sending the non-existing IATA code of the departure airport`, () => {
            calculateDistanceBetweenTwoAirports(endpoints.distance, 'led', destinationId).should(
                spok({
                    status: 422,
                    headers: {
                        'content-type': response.json,
                    },
                    requestHeaders: {
                        'content-type': request.json,
                    },
                    body: status_422_error
                })
            )
        })
    
        it(`error by sending the non-existing IATA code of the destination airport`, () => {
            calculateDistanceBetweenTwoAirports(endpoints.distance, departureId, 'led').should(
                spok({
                    status: 422,
                    headers: {
                        'content-type': response.json,
                    },
                    requestHeaders: {
                        'content-type': request.json,
                    },
                    body: status_422_error
                })
            )     
        })
    
        it(`error by sending the non-existing IATA code of both airports`, () => {
            calculateDistanceBetweenTwoAirports(endpoints.distance, 'kid', 'led').should(
                spok({
                    status: 422,
                    headers: {
                        'content-type': response.json,
                    },
                    requestHeaders: {
                        'content-type': request.json,
                    },
                    body: status_422_error
                })
            )     
        })
    
        it('verifies schema for request with the non-existing IATA code of the departure airport', () => {
            calculateDistanceBetweenTwoAirports(endpoints.distance, 'xxx', destinationId)
                .validateSchema(status_422)
        })
    
        it('verifies schema for request with the non-existing IATA code of the destination airport', () => {
            calculateDistanceBetweenTwoAirports(endpoints.distance, departureId, 'xxx')
                .validateSchema(status_422)
        })
    
        it('verifies schema for request with the non-existing IATA code of both airports', () => {
            calculateDistanceBetweenTwoAirports(endpoints.distance, 'xxx', 'yyy')
                .validateSchema(status_422)
        })
    
    })
})
