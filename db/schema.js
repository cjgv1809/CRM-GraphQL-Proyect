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

  type Client {
    id: ID
    name: String
    lastName: String
    company: String
    email: String
    phone: String
    seller: ID
  }

  type Order {
    id: ID
    order: [OrderGroup]
    total: Float
    client: ID
    seller: ID
    createdAt: String
    status: OrderStatus
  }

  type OrderGroup {
    id: ID
    quantity: Int
    name: String
    price: Float
  }

  type TopClient {
    total: Float
    client: [Client]
  }

  type TopSeller {
    total: Float
    seller: [User]
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

  input ClientInput {
    name: String!
    lastName: String!
    company: String!
    email: String!
    phone: String
  }

  input OrderItemInput {
    id: ID
    quantity: Int
    name: String
    price: Float
  }

  input OrderInput {
    order: [OrderItemInput]
    total: Float
    client: ID
    status: OrderStatus
  }

  enum OrderStatus {
    Pending
    Delivered
    Cancelled
  }

  type Query {
    #Users
    getUser: User

    #Products
    getProducts: [Product]
    getProduct(id: ID!): Product

    #Clients
    getClients: [Client]
    getClientsBySeller: [Client]
    getClient(id: ID!): Client

    #Orders
    getOrders: [Order]
    getOrdersBySeller: [Order]
    getOrder(id: ID!): Order
    getOrdersByStatus(status: OrderStatus!): [Order]

    #Advanced Queries
    getBestClients: [TopClient]
    getBestSellers: [TopSeller]
    searchProduct(text: String!): [Product]
  }

  type Mutation {
    #Users
    newUser(input: UserInput): User
    authenticateUser(input: AuthenticateInput): Token

    #Products
    newProduct(input: ProductInput): Product
    updateProduct(id: ID!, input: ProductInput): Product
    deleteProduct(id: ID!): String

    #Clients
    newClient(input: ClientInput): Client
    updateClient(id: ID!, input: ClientInput): Client
    deleteClient(id: ID!): String

    #Orders
    newOrder(input: OrderInput): Order
    updateOrder(id: ID!, input: OrderInput): Order
    deleteOrder(id: ID!): String
  }
`;

module.exports = typeDefs;
