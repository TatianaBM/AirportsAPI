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

**Configuration (cypress.env.json)**

Sensitive data such as authentication tokens and user credentials are not hardcoded in test files. Instead, we store them in the cypress.env.json file and retrieve them using Cypress environment variables.
For successful test execution on your local machine, you need to register on the website `https://airportgap.com/api` and create a `cypress.env.json` file in the root of your project. Then, add the registered email and password to this file. Example:

``` json
{
    "userSecrets": {
        "staging": { 
            "email": "your-registered-email@example.com", 
            "password": "your-secure-password" 
        }
    }
}
```

**Running Tests:**

*Run all tests in headless mode:*

`npx cypress run`

*Open Cypress test runner:*

`npx cypress open`

For more details on available test scripts, check the `scripts` section in the `package.json` file. To run a script, use:  

`npm run <script-name>`  

For example:  

`npm run test:run:chrome`

**Plugins Used:**

- cypress-ajv-schema-validator - Validates API responses against JSON schemas to ensure data integrity.

- cypress-plugin-api - Enables flexible assertions for API responses, allowing for partial matching and constraints.

- cy-spok - Simplifies API testing with custom Cypress commands.

- @faker-js/faker - Generates dynamic test data for improved test coverage.

- @bahmutov/cy-grep - Enables running only specific tests by filtering them based on keywords in their `it` or `describe` titles.

- cypress-data-session - Manages and caches test data between tests to avoid unnecessary setup and speed up test runs.

- cypress-split - Splits Cypress test files across multiple CI containers or threads to enable parallel test execution and reduce overall run time.

- mochawesome - Generates detailed test reports in JSON and HTML formats from Mocha/Cypress runs.

- mochawesome-merge - Merges multiple mochawesome JSON reports into a single file for consolidated reporting.

- mochawesome-report-generator - Creates readable HTML reports with charts and details from mochawesome JSON output.

- rimraf - Cross-platform utility for deleting files and folders, often used for cleanup before tests or report generation.

**Test Organization**

To improve the structure and maintainability of the tests, we use context blocks to separate different test scenarios. Each API endpoint has its own dedicated spec file, making it easier to manage and scale tests.