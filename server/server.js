const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const path = require("path");
const { typeDefs, resolvers } = require("./schemas");
const db = require("./config/connection");
const { authMiddleware } = require("./utils/auth"); // Import auth middleware

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Apollo Server with caching and disabling persisted queries
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware, // Pass the auth middleware here
  cache: "bounded", // Use bounded cache to prevent memory exhaustion
  persistedQueries: false, // Disable persisted queries to avoid cache-related issues
});

server.start().then(() => {
  server.applyMiddleware({ app, path: "/graphql" });

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/build")));
  }

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
  });

  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(
        `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
});
