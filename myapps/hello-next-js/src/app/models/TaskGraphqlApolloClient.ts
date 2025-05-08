import { ApolloClient, InMemoryCache } from "@apollo/client";

const apolloClient = new ApolloClient({
    uri: '/api/tasks/v1/sql/graphql', // replace with your GraphQL server URL
    cache: new InMemoryCache(), // InMemoryCache setup
});
  
export default apolloClient;
