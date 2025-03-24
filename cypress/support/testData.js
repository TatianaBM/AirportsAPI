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
    invalidPageParameters: [0,-1,'&', '/' , '@', '$', '#' , '_', '!',null,undefined, faker.string.alpha(1)],
    userData: function() {
        return {
            "email": faker.internet.email(),
            "password": faker.internet.password()
        }
    },
    invalidToken: function() {
        return {
            number: faker.number.int(100),
            'numeric string of 24 char': faker.string.numeric(24),
            'more than 24 characters': faker.string.alphanumeric(25),
            'mixed alphanumeric': faker.string.alphanumeric(24),
            'less than 24 characters': faker.string.alphanumeric(23),
            'special characters': faker.string.symbol(24),
            'null value': null,
            'undefined value': undefined
        }
    },
    note: function() {
        return faker.lorem.sentence(5)
    },
    invalidFavoritRecordId: function() {
        return faker.number.int(100)
    }

}