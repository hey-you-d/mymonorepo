// for reference: Because we are using fetch or something that depends on Request (like new Request(...)) in 
// your code or in a library like Apollo, SWR, or GraphQL client — and Node doesn't provide Request by default.
import 'whatwg-fetch'; // adds the missing browser native / Polyfills fetch, Request, Response, Headers, etc.

// for reference: Because we are using a library (like Apollo Client, or SWR, or something that does 
// data serialization/deserialization) that internally relies on TextEncoder, for GraphQL or fetch-related logic.
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;
