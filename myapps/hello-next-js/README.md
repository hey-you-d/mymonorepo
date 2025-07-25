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
##### [Frontend layer - Client-side components variant - React.js components which are rendered via Page router] 
- **DEFAULT PAGE:** [http://localhost:3000/hello-next-js/task-crud-fullstack](http://localhost:3000/hello-next-js/task-crud-fullstack)
- **CACHED WITH VERCEL SWR PAGE (leveraging Page router's getServerSideProps):** [http://localhost:3000/hello-next-js/task-crud-fullstack/with-swr](http://localhost:3000/hello-next-js/task-crud-fullstack/with-swr)
- **GRAPHQL SERVER DEMO PAGE:** [http://localhost:3000/hello-next-js/task-crud-fullstack/graphql](http://localhost:3000/hello-next-js/task-crud-fullstack/graphql)
- **GRAPHQL CLIENT + SERVER DEMO PAGE:** [http://localhost:3000/hello-next-js/task-crud-fullstack/graphql/apolloClient](http://localhost:3000/hello-next-js/task-crud-fullstack/graphql/apolloClient)
- **Optimised filtering feature with React's useDeferredValue:** [http://localhost:3000/hello-next-js/task-crud-fullstack/with-search-filter](http://localhost:3000/hello-next-js/task-crud-fullstack/with-search-filter)
- **BFF ENDPOINT URL**: [http://localhost:3000/hello-next-js/api/tasks/v1/bff](http://localhost:3000/hello-next-js/api/tasks/v1/bff)
##### [Frontend layer - Server-side components variant - React.js Server Components which are rendered via App router]
- **DEFAULT PAGE:** [http://localhost:3000/hello-next-js/task-crud-fullstack/use-server](http://localhost:3000/hello-next-js/task-crud-fullstack/use-server)
- **CACHED WITH VERCEL SWR PAGE:** [http://localhost:3000/hello-next-js/task-crud-fullstack/use-server/with-swr](http://localhost:3000/hello-next-js/task-crud-fullstack/use-server/with-swr)
- **GRAPHQL SERVER DEMO PAGE:** [http://localhost:3000/hello-next-js/task-crud-fullstack/use-server/graphql](http://localhost:3000/hello-next-js/task-crud-fullstack/use-server/graphql)
##### [Backend layer]
- **API ENDPOINT URL (PROTECTED BY API KEY)**: [http://localhost:3000/hello-next-js/api/tasks/v1/sql](http://localhost:3000/hello-next-js/api/tasks/v1/sql)
- **API ENDPOINT URL (GraphQL server)**: [http://localhost:3000/hello-next-js/api/tasks/v1/sql/graphql](http://localhost:3000/hello-next-js/api/tasks/v1/sql/graphql)
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
    - [Client-side components variant - React.js components which are rendered via Next.js Page router]
        - Localhost URL: [localhost:3000/hello-next-js/task-crud-fullstack](http://localhost:3000/hello-next-js/task-crud-fullstack)
        - MVVM - model component: [TaskModel.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/models/Task/use-client/TaskModel.ts)
        - MVVM - viewmodel component: [useTasksViewModel.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/viewModels/Task/use-client/useTasksViewModel.ts)
        - MVVM - view component: [taskPage.tsx](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/views/Task/use-client/taskPage.tsx)
        - MVVM - view component #2: [taskDetailPage.tsx](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/views/Task/use-client/taskDetailPage.tsx)
        - Next.js Page router: [/hello-next-js/page/task-crud-fullstack/](https://github.com/hey-you-d/mymonorepo/tree/master/myapps/hello-next-js/pages/task-crud-fullstack)
    - [Server-side components variant - React.js Server Components which are rendered via Next.js App router]
        - Localhost URL: [localhost:3000/hello-next-js/task-crud-fullstack/use-server](http://localhost:3000/hello-next-js/task-crud-fullstack/use-server)
        - MVVM - model component: [TaskModel.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/models/Task/use-server/TaskModel.ts)
        - MVVM - viewmodel component: [getTasksViewModel.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/viewModels/Task/use-server/getTasksViewModel.ts)
        - MVVM - view component: [taskPage.tsx](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/views/Task/use-server/taskPage.tsx)
        - MVVM - view component #2: [taskDetailPage.tsx](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/views/Task/use-server/taskDetailPage.tsx)
        - Next.js App router: [/task-crud-fullstack/use-server/page.tsx](https://github.com/hey-you-d/mymonorepo/tree/master/myapps/hello-next-js/src/app/task-crud-fullstack/use-server/page.tsx)
        - Next.js App router #2: [/task-crud-fullstack/use-server/edit/[id]](https://github.com/hey-you-d/mymonorepo/tree/master/myapps/hello-next-js/src/app/task-crud-fullstack/use-server/edit/[id]/page.tsx)    
4. Authentication & Authorization with Basic Auth & JWT (No refresh token implementation) 
    - [API Authorization with JWT (bearer token in Authorization header)] **STATUS: DONE** 
        - [Merged PR](https://github.com/hey-you-d/mymonorepo/pull/83)    
    - [API endpoint] **STATUS: DONE**
        - [user API endpoint](https://github.com/hey-you-d/mymonorepo/tree/master/myapps/hello-next-js/pages/api/tasks/v1/sql/user)
    - [Client-side components variant - React.js components which are rendered via Next.js Page router] 
        - SQL Query implementation: **STATUS: DONE** 
            - Model component: [TaskUserModel.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/models/Task/use-client/TaskUserModel.ts) 
            - ViewModel component: [useTaskUserViewModel.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/viewModels/Task/use-client/useTaskUserViewModel.ts)
            - View component: [taskUser.tsx](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/views/Task/use-client/taskUser.tsx)
    - [Server-side components variant - React.js Server Components which are rendered via Next.js App router] **STATUS: DONE**
        - SQL Query implementation:
            - Model component: [TaskUserModel.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/models/Task/use-server/TaskUserModel.ts)
            - ViewModel component: [getTasksUserViewModel.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/viewModels/Task/use-server/getTasksUserViewModel.ts)
            - View component: [taskUser.tsx](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/views/Task/use-server/taskUser.tsx)
        - GraphQL Query variant:
            - Model component: [TaskUserGraphqlClient.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/models/Task/use-server/TaskUserGraphqlClient.ts)
            - ViewModel component: [getTasksUserGraphQLViewModel.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/viewModels/Task/use-server/getTasksUserGraphQLViewModel.ts)
            - View component: [taskUserGraphQL.tsx](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/views/Task/use-server/taskUserGraphQL.tsx)       
5. Authentication & Authorization with OAUTH 2.0 & OIDC via AUTH0 Identity Service (Access Token & Refresh Token implementation) - **STATUS: TODO**
6. Frontend feature [Client-side components variant only]: Client-side Caching implementation with Vercel SWR  
    - [Client-side components variant - React.js components which are rendered via Next.js Page router] **STATUS: DONE**
        - Localhost URL: [localhost:3000/hello-next-js/task-crud-fullstack/with-swr](http://localhost:3000/hello-next-js/task-crud-fullstack/with-swr)  
        - MVVM - model component: reusing the default implementation
        - MVVM - viewModel component: [useTasksViewModelWithSwr.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/viewModels/Task/use-client/useTasksViewModelWithSwr.ts)
        - MVVM - view component: [taskWithSWRPage.tsx](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/views/Task/use-client/taskWithSWRPage.tsx)
    - [Server-side components variant - React.js Server Components which are rendered via Next.js App router] **STATUS: DONE**
        - Localhost URL: [http://localhost:3000/hello-next-js/task-crud-fullstack/use-server/with-swr](http://localhost:3000/hello-next-js/task-crud-fullstack/use-server/with-swr)
        - MVVM - model component: reusing the default use-server component implementation
        - MVVM - viewmodel component: [getTasksViewModelWithSwr.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/viewModels/Task/use-server/getTasksViewModelWithSwr.ts)
        - MVVM - view component: [taskWithSwrPage.tsx](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/views/Task/use-server/taskWithSwrPage.tsx)
        - MVVM - view component #2: [taskDetailWithSwrPage.tsx](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/views/Task/use-server/taskDetailWithSwrPage.tsx)
        - Next.js App router: [/task-crud-fullstack/use-server/with-swr](https://github.com/hey-you-d/mymonorepo/tree/master/myapps/hello-next-js/src/app/task-crud-fullstack/use-server/with-swr/page.tsx)
        - Next.js App router #2: [/task-crud-fullstack/use-server/edit/with-swr/[id]](https://github.com/hey-you-d/mymonorepo/tree/master/myapps/hello-next-js/src/app/task-crud-fullstack/use-server/edit/with-swr/[id]/page.tsx)
7. Server-side Caching - **STATUS: TODO** 
8. Swagger Doc integration - **STATUS: DONE**  
    - Localhost URL: [http://localhost:3000/hello-next-js/task-crud-fullstack/swagger](http://localhost:3000/hello-next-js/task-crud-fullstack/swagger)
    - Merged PR: [https://github.com/hey-you-d/mymonorepo/pull/37/files](https://github.com/hey-you-d/mymonorepo/pull/37/files)
9. Frontend feature: Alternative data query with Apollo GraphQL Server **STATUS: DONE**
    - [API ENDPOINT URL (GraphQL server)]:
        - [graphql.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/pages/api/tasks/v1/sql/graphql.ts)
    - [Client-side components variant - React.js components which are rendered via Next.js Page router]
        - Localhost URL: [http://localhost:3000/hello-next-js/task-crud-fullstack/graphql](http://localhost:3000/hello-next-js/task-crud-fullstack/graphql)
        - Model component: [TaskGraphqlClient.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/models/Task/use-client/TaskGraphqlClient.ts)
        - Viewmodel component: [useTaskGraphQLViewModel.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/viewModels/Task/use-client/useTaskGraphQLViewModel.ts)
        - View component: [taskGraphQLPage.tsx](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/views/Task/use-client/taskGraphQLPage.tsx)
    - [Server-side components variant - React.js Server Components which are rendered via Next.js App router]
        - Localhost URL: [http://localhost:3000/hello-next-js/task-crud-fullstack/use-server/graphql](http://localhost:3000/hello-next-js/task-crud-fullstack/use-server/graphql)
        - Model component: [TaskGraphqlClient.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/models/Task/use-server/TaskGraphqlClient.ts)
        - Viewmodel component: [getTaskGraphQLViewModel.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/viewModels/Task/use-server/getTaskGraphQLViewModel.ts)
        - View component: [taskGraphQLPage.tsx](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/views/Task/use-server/taskGraphQLPage.tsx)
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
13. Experimental Features leveraging AI Agent with OpenAI Langchain.js - **STATUS: TODO**
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

4. Create the necessary tables via the postgresql-client
```bash
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL COLLATE "en_US.utf8",
  detail TEXT NOT NULL COLLATE "en_US.utf8",
  completed BOOLEAN DEFAULT FALSE, 
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  auth_type TEXT COLLATE "en_US.utf8" NOT NULL DEFAULT 'basic_auth',
  admin_access BOOLEAN DEFAULT FALSE,  
  email TEXT COLLATE "en_US.utf8" NOT NULL,
  hashed_pwd TEXT COLLATE "en_US.utf8" NOT NULL,
  jwt TEXT COLLATE "en_US.utf8" NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_email UNIQUE (email)
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
```

and then set an admin account record in the users table  
credentials - email: **admin@guy.com** , password: **1234567**
```bash
INSERT INTO users (email, hashed_pwd, auth_type, admin_access, jwt)
VALUES (
    'admin@guy.com', 
    '$argon2id$v=19$m=65536,t=5,p=1$Q3mQEKY6fT8ECMDWYRTfeA$uiHc/ijlO7mPlkk7KjiqBF+zu3LrSSkrO2U4Fund8CA', 
    'basic_auth',
    TRUE,
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAbm90ZXhpc3QuY29tIiwiaGFzaGVkUGFzc3dvcmQiOiIkYXJnb24yaWQkdj0xOSRtPTY1NTM2LHQ9NSxwPTEkeUtVVGp4Z2ZwSXB6NjhnT1EzYU5ZQSRjVWliSmMyR2V5UDVoOWJRU05kV3dHUlZUcmVKS0Q0YTUwcW02bktQK3EwIiwiaWF0IjoxNzQ4ODI2MDU5LCJleHAiOjE3NDg4Mjk2NTl9.HqBZvMiCq0S6XDbPu8dZJMWA3s6zx5cqGaTjLpUeHLM'
)
ON CONFLICT (email) DO NOTHING;
```

For more info, have a look at [sql_create_tables.sql](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/lib/db/sql_create_tables.sql) and [sql_db_seed.sql](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/lib/db/sql_db_seed.sql)

5. To kickstart the db for localhost development (no need to redo step 1)
```bash
docker start hellonextjs-postgresdb
```

6. Add the following environment variables in .env.local:
```bash
APP_ENV=LOCAL
SECRETKEY_LOCATION=LOCAL
TEST_JWT_SECRET=12345
TEST_API_KEY=67890
```

7. run the dev build of hello-next-js
```bash
yarn workspace hello-next-js dev
```
or 
run the optimised build for prod of hello-next-js (recommended approach)
```bash
yarn workspace hello-next-js build
```
then
```bash
yarn workspace hello-next-js start
```
 
8. The URL (Client components MVVM): [localhost:3000/hello-next-js/task-crud-fullstack](http://localhost:3000/hello-next-js/task-crud-fullstack)

9. The URL (Server components MVVM): [localhost:3000/hello-next-js/task-crud-fullstack/use-server](http://localhost:3000/hello-next-js/task-crud-fullstack/use-server)

10. For the rest of demo pages: [localhost demo](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/README.md#localhost-demo)
