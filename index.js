const { ApolloServer, gql } = require("apollo-server");
const typeDefs = require("./db/schema");
const resolvers = require("./db/resolvers");
const connectDB = require("./config/db");

// Connection to db
connectDB();

// server and registering the types and resolvers
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// start the ApolloServer
server
  .listen()
  .then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  })
  .catch((err) => {
    console.log(err);
  });
