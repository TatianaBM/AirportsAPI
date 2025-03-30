import { faker } from '@faker-js/faker'

// api support functions
/**
 * Fetches a list of airports from the specified API endpoint
 * @param {string} requestUrl - The URL of the API endpoint to fetch airport data from
 * @returns {Cypress.Chainable} - A Cypress chainable promise containing the API response
 */
export function fetchAirports(requestUrl) {
    return cy.api({
        url: requestUrl,
        method: 'GET',
        failOnStatusCode: false
    })
}
/**
 * 
 * Fetches a paginated list of airports from the specified API endpoint
 * @param {string} requestUrl - The URL of the API endpoint to fetch airport data from
 * @param {number} pageNumber - The page number to retrieve from the API
 * @returns {Cypress.Chainable} - A Cypress chainable promise containing the API response
 */
export function fetchAirportsByPage(requestUrl, pageNumber) {
    return cy.api({
        url: requestUrl,
        method: 'GET',
        qs: {
            page : pageNumber
        },
        failOnStatusCode: false
    })
}
/**
 * 
 * Retrieves the total number of pages from the API's pagination link
 * @param {string} requestUrl - The URL of the API endpoint to fetch pagination details from
 * @returns {Cypress.Chainable<number>} - A Cypress chainable containing the total number of pages
 */
export function retrieveTotalPages(requestUrl) {
    return cy.api({
        url: requestUrl,
        method: 'GET',
        failOnStatusCode: false
    }).its('body.links.last').then(link => {
        //Finds digits (\d+) at the end ($) of the string.
        const regex = /\d+$/
        const foundPages = link.match(regex)
        return cy.wrap(Number(foundPages[0]))
    })
}

/**
 * Fetches airport information by id 
 * @param {string} requestUrl - The URL of the API endpoint
 * @param {string} id - Id of the airport to fetch airport information
 * @returns {Cypress.Chainable} - A Cypress chainable promise containing the API response
 */
export function fetchAirportById(requestUrl, id) {
    return fetchAirports(`${requestUrl}/${id}`)
}
/**
 * Sends a request to calculate the distance between two airports.
 * @param {string} endpoint - The API endpoint for distance calculation.
 * @param {string} departureId - Iata of the departure airport.
 * @param {string} destinationId - Iata of the destination airport.
 * @returns {Cypress.Chainable<Response>} - A Cypress chainable object resolving to the API response.
 */
export function calculateDistanceBetweenTwoAirports(endpoint, departureId, destinationId) {
    return cy.api({
        url: endpoint,
        method: 'POST',
        body: {
            from: departureId,
            to: destinationId
        },
        failOnStatusCode: false
    })
}
/**
 * Picks a random airport from a paginated API response
 * @param {number} totalPages - The total number of pages available in the API
 * @param {string} requestUrl - The base URL for fetching airport data
 * @returns {Cypress.Chainable<Object>} - A Cypress chainable object resolving to a random airport
 */
export function pickRandomAirport(totalPages, requestUrl) {
    let randomPage = Cypress._.random(1, totalPages)
    return fetchAirportsByPage(requestUrl, randomPage)
        .should((response) => {
            expect(response.status).be.eq(200)
        })
        .its('body.data')
        .then((airportsArray) => {
            let randomIndex = Cypress._.random(0, airportsArray.length - 1)
            return airportsArray[randomIndex]
        })
}

/**
 * Sends a request to receive authorization token.
 * @param {string} endpoint - The API endpoint for getting token.
 * @param {string} email - users email.
 * @param {string} password - users password.
 * @returns {Cypress.Chainable<Response>} - A Cypress chainable object resolving to the API response.
 */
export function returnToken(endpoint, email, password) {
    return cy.api({
        url: endpoint,
        method: 'POST',
        body: {
            email: email,
            password: password
        },
        failOnStatusCode: false
    })
}
/**
 *Saves a favorite airport by sending a POST request.
 * @param {string} requestUrl - The API endpoint to save the favorite airport.
 * @param {string} token - The authentication token for the request.
 * @param {Object} options - The options object containing airport details.
 * @param {string} options.airport_id - The ID of the airport to be saved.
 * @param {string} [options.note] - An optional note for the favorite airport.
 * @returns {Cypress.Chainable} - Cypress request chainable response.
 */
export function saveFavoriteAirport(requestUrl, token, { airport_id, note }) {
    const requestBody = { airport_id }
    if( note !== undefined){
        requestBody.note = note
    }
    return cy.request({
        url: requestUrl,
        method: 'POST',
        headers: {
            Authorization: `Bearer token=${token}`
        },
        body: requestBody,
        failOnStatusCode: false
    })
}

/**
 *Updates the note of one of favorite airports by sending a PATCH request.
 * @param {string} endpoint - The API endpoint to update the note of the favorite airport.
 * @param {string} token - The authentication token for the request.
 * @param {string} favoriteRecordId - The ID of the favorite record whose note needs to be updated.
 * @param {string} note - An optional note to update for the favorite airport.
 * @returns {Cypress.Chainable} - Cypress request chainable response.
 */
export function updateNoteOfFavoriteAirport(endpoint, favoriteRecordId, token, note) {
    return cy.api({
        url: `${endpoint}/${favoriteRecordId}`,
        method: 'PATCH',
        headers: {
            "Authorization": `Bearer token=${token}`
        },
        body: {
            note: note
        },
        failOnStatusCode: false
    })
}

/**
 *Clears all favorite airports by sending a DELETE request.
 * @param {string} endpoint - The API endpoint to update the note of the favorite airport.
 * @param {string} token - The authentication token for the request.
 * @returns {Cypress.Chainable} - Cypress request chainable response.
 */
export function clearAllFavoriteAirports(endpoint, token) {
    return cy.api({
        url: endpoint,
        method: 'DELETE',
        headers: {
            "Authorization": `Bearer token=${token}`
        },
        failOnStatusCode: false
    })
}

/**
 * Authenticates a user and stores the received token as an environment variable in Cypress.
 * @param {string} endpoint - The API endpoint for authentication.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Cypress.Chainable} A Cypress chainable containing token.
 * @throws {Error} If the token is missing or not a string.
 */
export function setTokenAsEnvVariable(endpoint, email, password) {
    returnToken(endpoint, email, password).should((response) => {
            expect(response.status).to.eq(200)
        })
        .its('body.token')
        .then((token) => {
            if (!token || typeof token !== 'string') {
                throw new Error('Missing token value or wrong data type')
            }
            Cypress.env('token', token)
        })
}

/**
 * Retrieves all favorite airports from the given API endpoint.
 * @param {string} endpoint - The API endpoint to fetch favorite airports.
 * @param {string} token - The authentication token for authorization.
 * @returns {Cypress.Chainable} A Cypress chainable containing the API response.
 */
export function fetchAllFavoriteAirports(endpoint, token) {
    return cy.request({
        url: endpoint,
        method: 'GET', 
        headers: {
            "Authorization": `Bearer token=${token}`
        },
        failOnStatusCode: false
    })
}

/**
 * Adds a random number of favorite airports by selecting airports from available pages and sending POST requests.
 * @param {string} endpointAirports - The API endpoint to fetch available airports.
 * @param {string} endpointsFavorites - The API endpoint to save favorite airports.
 * @param {string} token - The authentication token for authorization.
 * @param {string} [aliasName='favoriteAirportList'] - The alias under which the favorite airport list will be stored in Cypress.
 * @param {number} totalNumberOfFavAirports - The total number of favorite airports to add.
 * @returns {void} The function wraps the favorite airport list using Cypress' `cy.wrap()`.
 */
export function addRandomNumberOfFavoriteAirports(
    endpointAirports,
    endpointsFavorites,
    token,
    totalNumberOfFavAirports,
    aliasName = 'favoriteAirportList'
    ) {
        retrieveTotalPages(endpointAirports).then((totalPages) => {
        let favoriteAirportList = []
        Cypress._.times(totalNumberOfFavAirports, () => {
            pickRandomAirport(totalPages, endpointAirports).then(
                (airportData) => {
                    const requestBody = {
                        airport_id: airportData.attributes.iata,
                        note: faker.lorem.sentence(5),
                    }
                    saveFavoriteAirport(endpointsFavorites, token, requestBody)
                        .should((response) => {
                            expect(response.status).to.eq(201)
                        })
                        .its('body')
                        .then((body) => {
                            favoriteAirportList.push(body.data)
                        })
                },
            )
        })
        cy.wrap(favoriteAirportList).as(`${aliasName}`)
    })
}

/**
 * Fetches a paginated list of favorite airports from the given API endpoint.
 *
 * @param {string} requestUrl - The API endpoint to fetch favorite airports.
 * @param {number} pageNumber - The page number to retrieve.
 * @param {string} token - The authentication token for authorization.
 * @returns {Cypress.Chainable} A Cypress chainable containing the API response.
 */
export function fetchFavoriteAirportsByPage(requestUrl, pageNumber, token) {
    return cy.api({
        url: requestUrl,
        method: 'GET',
        qs: {
            page : pageNumber
        },
        headers: {
            "Authorization": `Bearer token=${token}`
        },
        failOnStatusCode: false
    })
}

/**
 * Calculates the total number of pages based on the total number of airports
 * and the default limit per page.
 *
 * @param {number} numberAirports - The total number of favorite airports.
 * @param {number} defaultLimit - The number of airports displayed per page.
 * @returns {Cypress.Chainable<number>} A Cypress-wrapped promise resolving to the total number of pages.
 */
export function getNumberOfPagesFavAirport(numberAirports, defaultLimit) {
    let totalPages
    if(numberAirports === defaultLimit || numberAirports/defaultLimit < 1) {
        totalPages = 1
    }
    else {
        totalPages = Math.round(numberAirports/defaultLimit)
    }
    return cy.wrap(totalPages)
}

// js helper functions
/**
 * Checks if the given value is a number and greater than 0
 * @param {*} value - The value to check.
 * @returns {boolean} - Returns `true` if the value is a number greater than 0, otherwise `false`.
 */
export const isMoreThanZero = (value) => {
    return value > 0 && typeof value === 'number'
}

/**
 * Checks if a given value is an empty string.
 * @param {string} string - The input value to check.
 * @returns {boolean} Returns `true` if the input is a string and has a length of `0`, otherwise `false`. 
 */
export const isEmptyString = (string) => {
    return string.length === 0 && typeof string === 'string'
}

/**
 * Checks if a given string contains the substring "text/plain" (case-insensitive).
 * @param {string} string - The input string to check.
 * @returns {boolean} Returns `true` if the string is non-empty, is of type string, and includes "text/plain"; otherwise, returns `false`.
 */
export const includesTextPlain = (string) => {
    return string.length !== 0 && typeof string === 'string' && string.toLowerCase().includes('text/plain')
}