/// <reference types="cypress" />
import spok from 'cy-spok'

import { calculateDistanceBetweenTwoAirports } from "../../support/utils"
import { endpoints } from "../../support/endpoints"
import { dataGenerator } from "../../support/testData"
import schemas from '../../fixtures/schemas.json'

const { status_200 } = schemas.calculateDistance
const { status_422 } = schemas.calculateDistance
const departureId = dataGenerator.validIATACode().iataCode
const destinationId = dataGenerator.validIATACode().iataCode

describe('200 status code', () => {

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

    it('verifies schema for request with two valid IATA codes', () => {
        calculateDistanceBetweenTwoAirports(endpoints.distance, departureId, destinationId)
            .validateSchema(status_200)
    })
})

describe('422 status code', () => {

    it(`error by sending the non-existing IATA code of the departure airport`, () => {
        calculateDistanceBetweenTwoAirports(endpoints.distance, 'led', destinationId).should(
            spok({
                status: 422,
                body: {
                    "errors": [
                        {
                            "status": "422",
                            "title": "Unable to process request",
                            "detail": "Please enter valid 'from' and 'to' airports."
                        }
                    ]
                }
            })
        )
    })

    it(`error by sending the non-existing IATA code of the destination airport`, () => {
        calculateDistanceBetweenTwoAirports(endpoints.distance, departureId, 'led').should(
            spok({
                status: 422,
                body: {
                    "errors": [
                        {
                            "status": "422",
                            "title": "Unable to process request",
                            "detail": "Please enter valid 'from' and 'to' airports."
                        }
                    ]
                }
            })
        )     
    })

    it(`error by sending the non-existing IATA code of both airports`, () => {
        calculateDistanceBetweenTwoAirports(endpoints.distance, 'kid', 'led').should(
            spok({
                status: 422,
                body: {
                    "errors": [
                        {
                            "status": "422",
                            "title": "Unable to process request",
                            "detail": "Please enter valid 'from' and 'to' airports."
                        }
                    ]
                }
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