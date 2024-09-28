const express = require("express");
const path = require("path");
const { ApolloServer } = require("apollo-server-express");
const { authMiddleware } = require("./utils/auth"); // Import the authMiddleware
const db = require("./config/connection");
const { typeDefs, resolvers } = require("./schemas");

// Connect to the MongoDB database

db.once("open", () => {
  console.log("��� MongoDB connection successful!");
});

// Import the schema, resolvers, and type definitions

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Apollo Server setup
const server = new ApolloServer({
  typeDefs, // Provide the type definitions
  resolvers,
  context: ({ req }) => authMiddleware({ req }), // Add authMiddleware to context
});

server.start().then(() => {
  // Start the server and connect to the database
  server.applyMiddleware({ app });

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json()); // Parse JSON bodies

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/build"))); // Serve static assets from the client/build folder in production mode
  }

  // Default route to serve the React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
  });

  // Start the server once the database is connected
  db.once("open", () => {
    app.listen(PORT, () => {
      // Log the server start message to the console
      console.log(`🌍 Now listening on localhost:${PORT}`);
      console.log(
        `🚀 GraphQL is now available at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
});
