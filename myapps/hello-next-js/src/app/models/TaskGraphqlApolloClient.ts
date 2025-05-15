import { ApolloClient, InMemoryCache } from "@apollo/client";

// dev note: absolute URI for SSR, relative (proper) or absolute (if no choice) URI for CSR
// SSR: 'http://localhost:3000/api/tasks/v1/sql/graphql'
// CSR: '/api/tasks/v1/sql/graphql'
// dev note: can't be prepended with "/hello-next-js/" 
const apolloClient = new ApolloClient({
    uri: `/api/tasks/v1/bff/graphql`, 
    cache: new InMemoryCache(), // InMemoryCache setup
});
  
export default apolloClient;
