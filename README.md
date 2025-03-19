# API Airports - Automated Testing

**Overview**

API Airports is an automated testing project designed to validate the functionality of an airport-related API. The project includes end-to-end testing for API endpoints using Cypress and JavaScript. It ensures that the API responses conform to the expected schema and verifies various scenarios, including valid and invalid requests.

The tests are performed on the following API base URL:

`https://airportgap.com/api`

**Installation:**

1. Clone the repository:

`git clone https://github.com/TatianaBM/AirportsAPI.git`

2. Install dependencies: 

`npm ci`

**Running Tests:**

*Run all tests in headless mode:*

`npx cypress run`

*Open Cypress test runner:*

`npx cypress open`

**Plugins Used:**

- cypress-ajv-schema-validator - Validates API responses against JSON schemas to ensure data integrity.

- cypress-plugin-api - Enables flexible assertions for API responses, allowing for partial matching and constraints.

- cy-spok - Simplifies API testing with custom Cypress commands.

- @faker-js/faker - Generates dynamic test data for improved test coverage.

**Test Organization**

To improve the structure and maintainability of the tests, we use context blocks to separate different test scenarios. Each API endpoint has its own dedicated spec file, making it easier to manage and scale tests.