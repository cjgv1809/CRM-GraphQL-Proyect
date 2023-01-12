const User = require("../models/User");
const Product = require("../models/Product");
const Client = require("../models/Client");
const Order = require("../models/Order");
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
    getUser: async (_, { token }, ctx) => {
      // must be the same secretKey as in createToken to verify the token
      // const userId = await jwt.verify(token, process.env.SECRET_KEY);
      // return userId;
      return ctx.user;
    },
    getProducts: async () => {
      try {
        const products = await Product.find({});
        return products;
      } catch (error) {
        console.log(error);
      }
    },
    getProduct: async (_, { id }) => {
      // check if product exists
      const product = await Product.findById(id);
      if (!product) {
        throw new Error("Product not found");
      }
      return product;
    },
    getClients: async () => {
      try {
        const clients = await Client.find({});
        return clients;
      } catch (error) {
        console.log(error);
      }
    },
    getClientsBySeller: async (_, {}, ctx) => {
      try {
        const clients = await Client.find({ seller: ctx.user.id.toString() });
        return clients;
      } catch (error) {
        console.log(error);
      }
    },
    getClient: async (_, { id }, ctx) => {
      const client = await Client.findById(id);
      // check if client exists
      if (!client) {
        throw new Error("Client not found");
      }
      // the seller who created the client is the only one who can see it
      if (client.seller.toString() !== ctx.user?.id) {
        throw new Error("Not authorized");
      }
      return client;
    },
    getOrders: async () => {
      try {
        const orders = await Order.find({});
        return orders;
      } catch (error) {
        console.log(error);
      }
    },
    getOrdersBySeller: async (_, {}, ctx) => {
      try {
        const orders = await Order.find({ seller: ctx.user.id });
        return orders;
      } catch (error) {
        console.log(error);
      }
    },
    getOrder: async (_, { id }, ctx) => {
      // check if order exists
      const order = await Order.findById(id);
      if (!order) {
        throw new Error("Order not found");
      }

      // the seller who created the order is the only one who can see it
      if (order.seller.toString() !== ctx.user.id) {
        throw new Error("Not authorized");
      }
      return order;
    },
    getOrdersByStatus: async (_, { status }, ctx) => {
      try {
        const orders = await Order.find({ seller: ctx.user.id, status });
        return orders;
      } catch (error) {
        console.log(error);
      }
    },
    getBestClients: async () => {
      const clients = await Order.aggregate([
        { $match: { status: "Delivered" } },
        { $group: { _id: "$client", total: { $sum: "$total" } } },
        {
          $lookup: {
            from: "clients",
            localField: "_id",
            foreignField: "_id",
            as: "client",
          },
        },
        { $limit: 10 },
        { $sort: { total: -1 } },
      ]);
      return clients;
    },
    getBestSellers: async () => {
      const sellers = await Order.aggregate([
        { $match: { status: "Delivered" } },
        { $group: { _id: "$seller", total: { $sum: "$total" } } },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "seller",
          },
        },
        { $limit: 5 },
        { $sort: { total: -1 } },
      ]);
      return sellers;
    },
    searchProduct: async (_, { text }) => {
      const products = await Product.find({
        $text: { $search: text },
      }).limit(10);
      return products;
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
    newProduct: async (_, { input }) => {
      try {
        const newProduct = new Product(input);
        const result = await newProduct.save();
        console.log("Product created");
        return result;
      } catch (error) {
        console.log(error);
      }
    },
    updateProduct: async (_, { id, input }) => {
      // check if product exists
      let product = await Product.findById(id);
      if (!product) {
        throw new Error("Product not found");
      }

      // update product in db
      product = await Product.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });
      return product;
    },
    deleteProduct: async (_, { id }) => {
      // check if product exists
      const product = await Product.findById(id);
      if (!product) {
        throw new Error("Product not found");
      }
      // delete product from db
      await Product.findOneAndDelete({ _id: id });
      return "Product deleted";
    },
    newClient: async (_, { input }, ctx) => {
      // check if client exists
      const client = await Client.findOne({ email: input.email });
      if (client) {
        throw new Error("Client already exists");
      }
      const newClient = new Client(input);

      // assign seller to client
      newClient.seller = ctx.user.id;

      try {
        // Save Client in db
        const result = await newClient.save();
        console.log("Client created");
        return result;
      } catch (error) {
        console.log(error);
      }
    },
    updateClient: async (_, { id, input }, ctx) => {
      // check if client exists
      let client = await Client.findById(id);
      if (!client) {
        throw new Error("Client not found");
      }

      // the seller who created the client is the only one who can update it
      if (client.seller.toString() !== ctx.user?.id) {
        throw new Error("Not authorized");
      }

      // update client in db
      client = await Client.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });
      return client;
    },
    deleteClient: async (_, { id }, ctx) => {
      // check if client exists
      const client = await Client.findById(id);
      if (!client) {
        throw new Error("Client not found");
      }
      // the seller who created the client is the only one who can delete it
      if (client.seller.toString() !== ctx.user?.id) {
        throw new Error("Not authorized");
      }
      // delete client from db
      await Client.findOneAndDelete({ _id: id });
      return "Client deleted";
    },
    newOrder: async (_, { input }, ctx) => {
      // check if client exists
      const client = await Client.findById(input.client);
      if (!client) {
        throw new Error("Client not found");
      }

      // the seller who created the client is the only one who can create an order
      if (client.seller.toString() !== ctx.user.id) {
        throw new Error("Not authorized");
      }

      // check stock first using async operator
      // async operator is used to iterate over an array
      for await (const item of input.order) {
        const { id } = item;
        const product = await Product.findById(id);
        if (item.quantity > product.stock) {
          throw new Error(`The item ${product.name} has insufficient stock`);
        } else {
          // subtract stock from product
          product.stock = product.stock - item.quantity;
          await product.save();
        }
      }

      // create order
      const newOrder = new Order(input);

      // assign seller to order
      newOrder.seller = ctx.user?.id;

      try {
        // Save Order in db
        const result = await newOrder.save();
        console.log("Order created");
        return result;
      } catch (error) {
        console.log(error);
      }
    },
    updateOrder: async (_, { id, input }, ctx) => {
      // check if order exists
      let order = await Order.findById(id);
      if (!order) {
        throw new Error("Order not found");
      }

      // check if client exists
      const client = await Client.findById(input.client);
      if (!client) {
        throw new Error("Client not found");
      }

      // the seller who created the order is the only one who can update it
      if (order.seller.toString() !== ctx.user.id) {
        throw new Error("Not authorized");
      }

      // check stock first using async operator
      if (input.order) {
        for await (const item of input.order) {
          const { id } = item;
          const product = await Product.findById(id);
          if (item.quantity > product.stock) {
            throw new Error(`The item ${product.name} has insufficient stock`);
          } else {
            // subtract stock from product
            product.stock = product.stock - item.quantity;
            await product.save();
          }
        }
      }

      // update order in db
      const result = await Order.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });
      return result;
    },
    deleteOrder: async (_, { id }, ctx) => {
      // check if order exists
      const order = await Order.findById(id);
      if (!order) {
        throw new Error("Order not found");
      }

      // the seller who created the order is the only one who can delete it
      if (order.seller.toString() !== ctx.user.id) {
        throw new Error("Not authorized");
      }

      // delete order from db
      await Order.findOneAndDelete({ _id: id });
      return "Order deleted";
    },
  },
};

module.exports = resolvers;
