import "./App.css";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import AuthService from "./utils/auth";

// Create a link to the GraphQL server
const httpLink = createHttpLink({
  uri: "http://localhost:3001/graphql", // GraphQL endpoint
});

const authLink = setContext((_, { headers }) => {
  // Set the token in the headers for each request
  const token = AuthService.getToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Set up Apollo Client
const client = new ApolloClient({
  link: authLink.concat(httpLink), // Add the authentication link to the HTTP link
  cache: new InMemoryCache(), // Use the InMemoryCache for caching
});

function App() {
  // Wrap the App component in ApolloProvider to provide the Apollo Client instance
  return (
    <ApolloProvider client={client}>
      <Navbar />
      <Outlet />
    </ApolloProvider>
  );
}

export default App;
