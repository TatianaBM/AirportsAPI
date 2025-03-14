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
