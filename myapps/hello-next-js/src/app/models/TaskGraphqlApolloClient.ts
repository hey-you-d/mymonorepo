import { ApolloClient, InMemoryCache } from "@apollo/client";

// dev note: absolute URI for SSR, relative URI for CSR
// SSR: 'http://localhost:3000/api/tasks/v1/sql/graphql'
// CSR: '/api/tasks/v1/sql/graphql'
const apolloClient = new ApolloClient({
    uri: '/api/tasks/v1/sql/graphql', 
    cache: new InMemoryCache(), // InMemoryCache setup
});
  
export default apolloClient;
