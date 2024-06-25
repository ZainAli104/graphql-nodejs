const {buildSchema} = require('graphql');

module.exports = buildSchema(`
    type TestData {
        text: String!
        views: Int!
    }

    type RootQuery {
        hello: TestData!
    }

    type User {
        _id: ID!
        email: String!
        name: String!
        password: String
    }

    input UserInputData {
        email: String!
        name: String!
        password: String!
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
        deleteUser(userId: ID!): User!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);