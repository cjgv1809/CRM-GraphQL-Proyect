const { gql } = require("apollo-server");

// schema
// ! means that this is a required field
const typeDefs = gql`
  type Course {
    title: String
  }

  type Technology {
    technology: String
  }

  type User {
    id: ID
    name: String
    lastName: String
    email: String
    createdAt: String
  }

  input CourseInput {
    technology: String
  }

  input UserInput {
    name: String!
    lastName: String!
    email: String!
    password: String!
  }

  type Query {
    getCourses(input: CourseInput!): [Course]
    getTechnologies: [Technology]
  }

  type Mutation {
    newUser(input: UserInput): User
  }
`;

module.exports = typeDefs;
