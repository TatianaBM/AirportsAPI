import { faker } from '@faker-js/faker'

export const dataGenerator = {
    invalidIATACode: function() {
        return {
            number: faker.number.int(100),
            'lower case': faker.airline.airport().iataCode.toLowerCase(),
            'more than 3 characters': faker.string.alpha(4).toUpperCase(),
            'less than 3 characters': faker.string.alpha(2).toUpperCase(),
            'special characters': faker.string.symbol(3),
            'mixed alphanumeric': faker.string.alphanumeric(3),
            'null value': null,
            'undefined value': undefined
        }
    },
    validIATACode: function() {
        return faker.airline.airport()
    },
    invalidPageParameters: [0,-1,'&', '/' , '@', '$', '#' , '_', '!',null,undefined, faker.string.alpha(1)]

}