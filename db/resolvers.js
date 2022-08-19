const User = require("../models/User");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const createToken = (user, secret, expiresIn) => {
  const { id, name, lastName, email } = user;
  // params: payload, secretWord, expiresInTime
  return jwt.sign({ id, name, lastName, email }, secret, { expiresIn });
};

// resolvers
const resolvers = {
  Query: {
    getUser: async (_, { token }) => {
      // must be the same secretKey as in createToken to verify the token
      const userId = await jwt.verify(token, process.env.SECRET_KEY);
      return userId;
    },
  },
  Mutation: {
    newUser: async (_, { input }) => {
      // check if user exists
      const user = await User.findOne({ email: input.email });
      if (user) {
        throw new Error("User already exists");
      }
      // hash password
      const salt = await bcryptjs.genSalt(10);
      input.password = await bcryptjs.hash(input.password, salt);

      try {
        // create new user
        const newUser = new User(input);
        // save user in db
        await newUser.save();
        console.log("User created");
        return newUser;
      } catch (error) {
        console.log(error);
      }
    },
    authenticateUser: async (_, { input }) => {
      // check if user exists
      const user = await User.findOne({ email: input.email });
      if (!user) {
        throw new Error("User not found");
      }
      // check if password is correct
      const isMatch = await bcryptjs.compare(input.password, user.password);
      if (!isMatch) {
        throw new Error("Password incorrect");
      }
      // create token
      return { token: createToken(user, process.env.SECRET_KEY, "24h") };
    },
  },
};

module.exports = resolvers;
