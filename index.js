const { ApolloServer, gql } = require("apollo-server");
const typeDefs = require("./db/schema");
const resolvers = require("./db/resolvers");
const connectDB = require("./config/db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Connection to db
connectDB();

// server and registering the types and resolvers
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // context is passed to every resolver
    const token = req.headers["authorization"] || "";

    if (token) {
      try {
        const user = jwt.verify(
          token.replace("Bearer ", ""),
          process.env.SECRET_KEY
        );
        return { user };
      } catch (error) {
        console.log(error);
      }
    }
  },
});

// start the ApolloServer
server
  .listen({ port: process.env.PORT || 4000 })
  .then(({ url }) => {
    console.log(`Server ready at ${url}`);
  })
  .catch((err) => {
    console.log(err);
  });
