require("dotenv").config();

const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
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
  cache: "bounded",
  persistedQueries: false,
});

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://static.cloudflareinsights.com"],
        connectSrc: ["'self'", "https://www.googleapis.com"],
        imgSrc: ["'self'", "data:", "https://books.google.com"],
      },
    },
  })
);
app.use(cors());

server.start().then(() => {
  server.applyMiddleware({ app, path: "/graphql" });

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
