require("dotenv").config(); // Load environment variables

const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const path = require("path");
const { typeDefs, resolvers } = require("./schemas");
const db = require("./config/connection");
const { authMiddleware } = require("./utils/auth");

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
  cache: "bounded", // Add cache settings to prevent memory exhaustion
  persistedQueries: false, // Disable persisted queries for security
});

server.start().then(() => {
  server.applyMiddleware({ app, path: "/graphql" });

  const cors = require("cors");
  app.use(cors());
  const helmet = require("helmet");
  app.use(helmet());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/dist")));
  }

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });

  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(
        `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
});
