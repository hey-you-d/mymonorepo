# hello-next-js

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## URLs
- Prod: [https://www.yudimankwanmas.com/hello-next-js](https://www.yudimankwanmas.com/hello-next-js)
- Dev:  [https://dev.yudimankwanmas.com/hello-next-js](https://dev.yudimankwanmas.com/hello-next-js)

## Getting Started

To run the development server:
```bash
yarn workspace hello-next-js dev
```
To run the production ready build:
```bash
yarn workspace hello-next-js build
#followed by
yarn workspace hello-next-js start
```
To run the test suite
```bash
yarn workspace hello-next-js test
```
To run the linter
```bash
yarn workspace hello-next-js lint
```

## BFF (Backend for Frontend) Demo

### RESTFul API demo
Covered Tech Stacks:
1. Backend framework: Next.JS API
2. RDBMS: PostgreSQL DB
3. Data Query Language: direct SQL and via Apollo GraphQL
4. API Authentication: JWT-based auth
5. Client-side Caching: Vercel SWR (for non-graphql) and Apollo Client in-Memory cache
6. Server-side Caching: To be determined. 
7. Documentation: Swagger API Doc.
8. Unit Test: Jest Testing Framework.

#### Localhost demo
- **FRONTEND URL:** [http://localhost:3000/hello-next-js/bff-tasks-db](http://localhost:3000/hello-next-js/bff-tasks-db)
- **FRONTEND GRAPHQL DEMO URL:** [http://localhost:3000/hello-next-js/bff-tasks-db/graphql](http://localhost:3000/hello-next-js/bff-tasks-db/graphql)
- **FRONTEND CACHED GRAPHQL DEMO URL:** [http://localhost:3000/hello-next-js/bff-tasks-db/graphql/apolloClient](http://localhost:3000/hello-next-js/bff-tasks-db/graphql/apolloClient)
- **API ENDPOINT URL**: [http://localhost:3000/hello-next-js/api/tasks/v1/sql](http://localhost:3000/hello-next-js/api/tasks/v1/sql)
- **API DOC URL**: [http://localhost:3000/hello-next-js/bff-tasks-db/swagger](http://localhost:3000/hello-next-js/bff-tasks-db/swagger)

- **Build with:** 
```bash
yarn workspace hello-next-js dev
```
- **STATUS: WIP**
1. Core API Endpoint implementation - **STATUS: DONE**  
    - endpoint URL: **/api/tasks/v1/sql** - check out the Swagger doc (bullet point #6). 
    - endpoint module: [https://github.com/hey-you-d/mymonorepo/tree/master/myapps/hello-next-js/pages/api](https://github.com/hey-you-d/mymonorepo/tree/master/myapps/hello-next-js/pages/api) 
2. Barebones frontend implementation with unit test - **STATUS: DONE**  
    - Localhost URL: [localhost:3000/hello-next-js/bff-tasks-db](http://localhost:3000/hello-next-js/bff-tasks-db)
    - MVVM - model component: [TaskModel.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/app/models/TaskModel.ts)
    - MVVM - viewmodel component: [useTasksViewModel.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/app/viewModels/useTasksViewModel.ts)
    - MVVM - view component: [taskPage.tsx](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/app/views/taskPage.tsx)
    - MVVM - view component #2: [taskDetailPage.tsx](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/app/views/taskDetailPage.tsx)
    - Next.js SSR/CSR toggle flag: [tasksBff.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/constants/tasksBff.ts)
3. API Authentication with JWT - **STATUS: TODO**
4. API Authorization (role-based access control (RBAC) or attribute-based access (ABAC)) - **STATUS: TODO**
5. Client-side Caching implementation with Vercel SWR - **STATUS: DONE**
    - Localhost URL: [localhost:3000/hello-next-js/bff-tasks-db](http://localhost:3000/hello-next-js/bff-tasks-db)  
    - Model component: reusing the default implementation
    - ViewModel component: [useTasksViewModelWithSwr.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/app/viewModels/useTasksViewModelWithSwr.ts)
    - View component: reusing the default implementation
6. Server-side Caching implementation with Redis - **STATUS: TODO** 
7. Swagger Doc integration - **STATUS: DONE**  
    - Localhost URL: [http://localhost:3000/hello-next-js/bff-tasks-db/swagger](http://localhost:3000/hello-next-js/bff-tasks-db/swagger)
    - Merged PR: [https://github.com/hey-you-d/mymonorepo/pull/37/files](https://github.com/hey-you-d/mymonorepo/pull/37/files)
8. Alternative data query with Apollo GraphQL Server **STATUS: DONE**  
    - Localhost URL: [http://localhost:3000/hello-next-js/bff-tasks-db/graphql](http://localhost:3000/hello-next-js/bff-tasks-db/graphql)
    - Model component: [TaskGraphqlClient.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/app/models/TaskGraphqlClient.ts)
    - Viewmodel component: [useTaskGraphQLViewModel.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/app/viewModels/useTaskGraphQLViewModel.ts)
    - View component: [taskGraphQLPage.tsx](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/app/views/taskGraphQLPage.tsx)
9. Alternative GraphQL frontend implementation with Apollo Client (with in-memory cache enabled)
    - Localhost URL: [http://localhost:3000/hello-next-js/bff-tasks-db/graphql/apolloClient](http://localhost:3000/hello-next-js/bff-tasks-db/graphql/apolloClient)  
    - Model component: reusing the default graphql implementation
    - Viewmodel component: [useTaskApolloClientViewModel.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/app/viewModels/useTaskApolloClientViewModel.ts)
    - View component: [taskApolloClientPage.tsx](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/app/views/taskApolloClientPage.tsx)
10. (optional) A feature relying on an event-driven system using Apache Kafka - **STATUS: TODO**

#### Remote site demo (Prod & Dev branches)
- **Prod URL:** [https://www.yudimankwanmas.com/hello-next-js/bff-tasks-db](https://www.yudimankwanmas.com/hello-next-js/bff-tasks-db) 
- **Dev URL:** [https://dev.yudimankwanmas.com/hello-next-js/bff-tasks-db](https://dev.yudimankwanmas.com/hello-next-js/bff-tasks-db)
- **STATUS: NOT READY**
Will commence after the localhost development is complete.
Point of consideration for PROD build: 
1. Determine the remote RDBMS (Candidate: AWS RDS or Supabase)
2. Set CORS to expose the API for external use (e.g hello-react-js as the client)
3. Rate limiting as a protection layer (redis based?). 
4. Secure Networking (HTTPS + ALB).s

### Step by step instruction to set up the localhost DB for the Tasks API demo
1. For DEV env sql db, Use Docker - Quick, isolated, no OS clutter. To build & run postgres db from scratch (internet connection is needed) 
```bash
docker run --name hellonextjs-postgresdb -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=tasks-db -p 5432:5432 -d postgres
```
2. Install the Postgresql-client
```bash
#For Linux ubuntu
sudo apt update
#followed by
sudo apt install postgresql-client
```
3. To interact with the database via the postgresql-client
```bash
psql -U postgres -d tasks-db -h localhost
```

4. Create a table via the postgresql-client
```bash
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL COLLATE "en_US.utf8",
  detail TEXT NOT NULL COLLATE "en_US.utf8",
  completed BOOLEAN DEFAULT FALSE, 
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

5. To kickstart the db for localhost development (no need to redo step 1)
```bash
docker start hellonextjs-postgresdb
```

6. run the dev build of hello-next-js
```bash
yarn workspace hello-next-js dev
```

7. The URL: [localhost:3000/hello-next-js/bff-tasks-db](http://localhost:3000/hello-next-js/bff-tasks-db)

8. The GraphQL version URL: [localhost:3000/hello-next-js/bff-tasks-db/graphql](http://localhost:3000/hello-next-js/bff-tasks-db/graphql)

9. The GraphQL version with Apollo Client URL: [localhost:3000/hello-next-js/bff-tasks-db/graphql/apolloClient](http://localhost:3000/hello-next-js/bff-tasks-db/graphql/apolloClient)


10. The Swagger Doc URL: [http://localhost:3000/hello-next-js/bff-tasks-db/swagger](http://localhost:3000/hello-next-js/bff-tasks-db/swagger) 