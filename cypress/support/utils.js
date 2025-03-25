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