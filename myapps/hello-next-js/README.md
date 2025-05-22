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

## Full-stack development Demo (/hello-next-js/task-crud-fullstack)

### Tech Stacks:
1. Backend framework: Next.JS ver.15 API 
2. Frontend framework: Next.JS ver.15, and React.JS ver.9 + Typescript
2. RDBMS: PostgreSQL DB
3. Data Query Language: direct SQL and via Apollo GraphQL (Server & Client)
4. Restful API Authentication: API-key x-api-key via http header & JWT-based auth
5. Client-side Caching: Vercel SWR (for non-graphql) and Apollo Client in-Memory cache
6. Server-side Caching: To be determined. 
7. Documentation: Swagger API Doc.
8. Unit Test: Jest Testing Framework.
9. Frontend CSS Styling: Tailwind CSS

#### Localhost demo
##### [Frontend layer - Client-side components variant - is served via Next.js Page router] 
- **DEFAULT PAGE:** [http://localhost:3000/hello-next-js/task-crud-fullstack](http://localhost:3000/hello-next-js/task-crud-fullstack)
- **CACHED WITH VERCEL SWR PAGE:** [http://localhost:3000/hello-next-js/task-crud-fullstack/with-swr](http://localhost:3000/hello-next-js/task-crud-fullstack/with-swr)
- **GRAPHQL SERVER DEMO PAGE:** [http://localhost:3000/hello-next-js/task-crud-fullstack/graphql](http://localhost:3000/hello-next-js/task-crud-fullstack/graphql)
- **GRAPHQL CLIENT + SERVER DEMO PAGE:** [http://localhost:3000/hello-next-js/task-crud-fullstack/graphql/apolloClient](http://localhost:3000/hello-next-js/task-crud-fullstack/graphql/apolloClient)
- **BFF ENDPOINT URL**: [http://localhost:3000/hello-next-js/api/tasks/v1/bff](http://localhost:3000/hello-next-js/api/tasks/v1/bff)
##### [Frontend layer - Server-side components variant - is served via Next.js App router]
- **DEFAULT PAGE:** [http://localhost:3000/hello-next-js/task-crud-fullstack/use-server](http://localhost:3000/hello-next-js/task-crud-fullstack/use-server)
- **CACHED WITH VERCEL SWR PAGE:** [http://localhost:3000/hello-next-js/task-crud-fullstack/use-server/with-swr](http://localhost:3000/hello-next-js/task-crud-fullstack/use-server/with-swr)
##### [Backend layer]
- **API ENDPOINT URL (PROTECTED BY API KEY)**: [http://localhost:3000/hello-next-js/api/tasks/v1/sql](http://localhost:3000/hello-next-js/api/tasks/v1/sql)
- **API DOC URL**: [http://localhost:3000/hello-next-js/task-crud-fullstack/swagger](http://localhost:3000/hello-next-js/task-crud-fullstack/swagger)

- **Build with:** 
```bash
yarn workspace hello-next-js build
#followed by
yarn workspace hello-next-js start
#and then check the instruction at the bottom of this page to prepare & run the postgresql db for localhost env
```
- **PROGRESS:**
1. Core API Endpoint implementation - real API that talks to remote DB (protected by API key) - **STATUS: DONE**  
    - endpoint URL: **/api/tasks/v1/sql** - check out the Swagger doc. 
    - endpoint module: [https://github.com/hey-you-d/mymonorepo/tree/master/myapps/hello-next-js/pages/api/tasks/v1/sql](https://github.com/hey-you-d/mymonorepo/tree/master/myapps/hello-next-js/pages/api/tasks/v1/sql) 
2. Core BFF Endpoint implementation - safe route for frontend to hit (calls tasks/v1/sql) - **STATUS: DONE**
    - endpoint URL: **/api/tasks/v1/bff**
    - endpoint module: [https://github.com/hey-you-d/mymonorepo/tree/master/myapps/hello-next-js/pages/api/tasks/v1/bff](https://github.com/hey-you-d/mymonorepo/tree/master/myapps/hello-next-js/pages/api/tasks/v1/bff)
3. Core Frontend implementation (no styling) with unit test - **STATUS: DONE**  
    - [Client-side components variant - is served via Next.js Page router]
        - Localhost URL: [localhost:3000/hello-next-js/task-crud-fullstack](http://localhost:3000/hello-next-js/task-crud-fullstack)
        - MVVM - model component: [TaskModel.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/models/Task/use-client/TaskModel.ts)
        - MVVM - viewmodel component: [useTasksViewModel.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/viewModels/Task/use-client/useTasksViewModel.ts)
        - MVVM - view component: [taskPage.tsx](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/views/Task/use-client/taskPage.tsx)
        - MVVM - view component #2: [taskDetailPage.tsx](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/views/Task/use-client/taskDetailPage.tsx)
        - Next.js Page router: [/hello-next-js/page/task-crud-fullstack/](https://github.com/hey-you-d/mymonorepo/tree/master/myapps/hello-next-js/pages/task-crud-fullstack)
    - [Server-side components variant - is served via Next.js App router]
        - Localhost URL: [localhost:3000/hello-next-js/task-crud-fullstack/use-server](http://localhost:3000/hello-next-js/task-crud-fullstack/use-server)
        - MVVM - model component: [TaskModel.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/models/Task/use-server/TaskModel.ts)
        - MVVM - viewmodel component: [getTasksViewModel.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/viewModels/Task/use-server/getTasksViewModel.ts)
        - MVVM - view component: [taskPage.tsx](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/views/Task/use-server/taskPage.tsx)
        - MVVM - view component #2: [taskDetailPage.tsx](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/views/Task/use-server/taskDetailPage.tsx)
        - Next.js App router: [/task-crud-fullstack/use-server/page.tsx](https://github.com/hey-you-d/mymonorepo/tree/master/myapps/hello-next-js/src/app/task-crud-fullstack/use-server/page.tsx)
        - Next.js App router #2: [/task-crud-fullstack/use-server/edit/[id]](https://github.com/hey-you-d/mymonorepo/tree/master/myapps/hello-next-js/src/app/task-crud-fullstack/use-server/edit/[id]/page.tsx)    
4. User Login, authorization & API Authentication with JWT - **STATUS: TODO**
5. API Authorization (role-based access control (RBAC) or attribute-based access (ABAC)) - **STATUS: TODO**
6. Frontend feature [Client-side components variant only]: Client-side Caching implementation with Vercel SWR  
    - [Client-side components variant - is served via Next.js Page router] **STATUS: DONE**
        - Localhost URL: [localhost:3000/hello-next-js/task-crud-fullstack/with-swr](http://localhost:3000/hello-next-js/task-crud-fullstack/with-swr)  
        - Model component: reusing the default implementation
        - ViewModel component: [useTasksViewModelWithSwr.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/viewModels/Task/use-client/useTasksViewModelWithSwr.ts)
        - MVVM - view component: [taskWithSWRPage.tsx](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/views/Task/use-client/taskWithSWRPage.tsx)
    - [Server-side components variant - is served via Next.js App router] **STATUS: DONE**
        - Localhost URL: [http://localhost:3000/hello-next-js/task-crud-fullstack/use-server/with-swr](http://localhost:3000/hello-next-js/task-crud-fullstack/use-server/with-swr)
        - MVVM - model component: reusing the default use-server component implementation
        - MVVM - viewmodel component: [getTasksViewModelWithSwr.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/viewModels/Task/use-server/getTasksViewModelWithSwr.ts)
        - MVVM - view component: [taskWithSwrPage.tsx](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/views/Task/use-server/taskWithSwrPage.tsx)
        - MVVM - view component #2: [taskDetailWithSwrPage.tsx](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/views/Task/use-server/taskDetailWithSwrPage.tsx)
        - Next.js App router: [/task-crud-fullstack/use-server/with-swr](https://github.com/hey-you-d/mymonorepo/tree/master/myapps/hello-next-js/src/app/task-crud-fullstack/use-server/with-swr/page.tsx)
        - Next.js App router #2: [/task-crud-fullstack/use-server/edit/with-swr/[id]](https://github.com/hey-you-d/mymonorepo/tree/master/myapps/hello-next-js/src/app/task-crud-fullstack/use-server/edit/with-swr/[id]/page.tsx)
7. Server-side Caching implementation with Redis - **STATUS: TODO** 
8. Swagger Doc integration - **STATUS: DONE**  
    - Localhost URL: [http://localhost:3000/hello-next-js/task-crud-fullstack/swagger](http://localhost:3000/hello-next-js/task-crud-fullstack/swagger)
    - Merged PR: [https://github.com/hey-you-d/mymonorepo/pull/37/files](https://github.com/hey-you-d/mymonorepo/pull/37/files)
9. Frontend feature: Alternative data query with Apollo GraphQL Server
    - [Client-side components variant - is served via Next.js Page router] **STATUS: DONE**
        - Localhost URL: [http://localhost:3000/hello-next-js/task-crud-fullstack/graphql](http://localhost:3000/hello-next-js/task-crud-fullstack/graphql)
        - Model component: [TaskGraphqlClient.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/models/Task/use-client/TaskGraphqlClient.ts)
        - Viewmodel component: [useTaskGraphQLViewModel.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/viewModels/Task/use-client/useTaskGraphQLViewModel.ts)
        - View component: [taskGraphQLPage.tsx](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/views/Task/use-client/taskGraphQLPage.tsx)
    - [Server-side components variant - is served via Next.js App router] **STATUS: WIP**
        - Localhost URL: tba
        - Model component: tba
        - Viewmodel component: tba
        - View component: tba
10. Frontend feature: Alternative GraphQL implementation with Apollo Client (with in-memory cache enabled) **STATUS: DONE**
    - Localhost URL: [http://localhost:3000/hello-next-js/task-crud-fullstack/graphql/apolloClient](http://localhost:3000/hello-next-js/task-crud-fullstack/graphql/apolloClient)  
    - Model component: reusing the default graphql implementation
    - Viewmodel component: [useTaskApolloClientViewModel.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/viewModels/Task/use-client/useTaskApolloClientViewModel.ts)
    - View component: [taskApolloClientPage.tsx](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/views/Task/use-client/taskApolloClientPage.tsx)
11. Frontend feature: dynamic table filter functionality optimised with React's useDeferredValue **STATUS: DONE**  
    - Localhost URL: [http://localhost:3000/hello-next-js/task-crud-fullstack/with-search-filter](http://localhost:3000/hello-next-js/task-crud-fullstack/with-search-filter)
    - Model component: reusing the default implementation
    - Viewmodel component: reusing the default implementation
    - View component: [taskWithSearchFilterPage.tsx](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/views/Task/use-client/taskWithSearchFilterPage.tsx)
12. Frontend styling with Tailwind CSS **STATUS: TODO**
13. BFF <-> API communication protocol with RESTful API (API v1) - **STATUS: DONE**
14. BFF <-> API communication protocol with gRPC (API v2) - **STATUS: TODO**
15. BFF <-> API communication protocol with event-driven-system using Apache Kafka (API v3) - **STATUS: TODO**

#### Remote site demo (Prod & Dev branches)
- **Prod URL:** [https://www.yudimankwanmas.com/hello-next-js/task-crud-fullstack](https://www.yudimankwanmas.com/hello-next-js/task-crud-fullstack) 
- **Dev URL:** [https://dev.yudimankwanmas.com/hello-next-js/task-crud-fullstack](https://dev.yudimankwanmas.com/hello-next-js/task-crud-fullstack)
- **PROGRESS: NOT READY**
Will commence after the localhost development is complete.
Point of consideration for PROD build: Determine the remote RDBMS (Candidates: AWS RDS or Supabase)

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

7. The URL (Client components MVVM): [localhost:3000/hello-next-js/task-crud-fullstack](http://localhost:3000/hello-next-js/task-crud-fullstack)

8. The URL (Server components MVVM): [localhost:3000/hello-next-js/task-crud-fullstack/use-server](http://localhost:3000/hello-next-js/task-crud-fullstack/use-server)

9. For the rest of demo pages: [localhost demo](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/README.md#localhost-demo)
