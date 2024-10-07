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

// Create an HTTP link to the GraphQL endpoint
const httpLink = createHttpLink({
  uri: "https://mern-booklook.onrender.com/graphql",
});

// Attach token to headers for authorization
const authLink = setContext((_, { headers }) => {
  const token = AuthService.getToken();
  console.log("Token:", token);
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Set up Apollo Client with authentication link and cache
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Navbar />
      <Outlet />
    </ApolloProvider>
  );
}

export default App;
