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
