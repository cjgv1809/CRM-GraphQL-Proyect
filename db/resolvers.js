const User = require("../models/User");
const bcryptjs = require("bcryptjs");

const courses = [
  {
    title: "JavaScript Moderno Guía Definitiva Construye +10 Proyectos",
    technology: "JavaScript ES6",
  },
  {
    title: "React – La Guía Completa: Hooks Context Redux MERN +15 Apps",
    technology: "React",
  },
  {
    title: "Node.js – Bootcamp Desarrollo Web inc. MVC y REST API’s",
    technology: "Node.js",
  },
  {
    title: "ReactJS Avanzado – FullStack React GraphQL y Apollo",
    technology: "React",
  },
];

// resolvers
const resolvers = {
  Query: {
    getCourses: (_, { input }, ctx, info) => {
      const result = courses.filter((course) => {
        return course.technology === input.technology;
      });
      return result;
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
  },
};

module.exports = resolvers;
