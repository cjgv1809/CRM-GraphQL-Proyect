const { gql } = require("apollo-server");

// schema
// ! means that this is a required field
const typeDefs = gql`
  type User {
    id: ID
    name: String
    lastName: String
    email: String
    createdAt: String
  }

  type Token {
    token: String
  }

  type Product {
    id: ID
    name: String
    stock: Int
    price: Float
    createdAt: String
  }

  input UserInput {
    name: String!
    lastName: String!
    email: String!
    password: String!
  }

  input AuthenticateInput {
    email: String!
    password: String!
  }

  input ProductInput {
    name: String!
    stock: Int!
    price: Float!
  }

  type Query {
    #Users
    getUser(token: String!): User

    #Products
    getProducts: [Product]
    getProduct(id: ID!): Product
  }

  type Mutation {
    #Users
    newUser(input: UserInput): User
    authenticateUser(input: AuthenticateInput): Token

    #Products
    newProduct(input: ProductInput): Product
    updateProduct(id: ID!, input: ProductInput): Product
    deleteProduct(id: ID!): String
  }
`;

module.exports = typeDefs;
