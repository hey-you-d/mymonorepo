# MyMonorepo Side Project

## Objectives
1. Explore cloud-based serverless deployment automation (CI/CD) with AWS Copilot (Fargate launch type), dockerized container for ECR, and CI/CD implementation with Github Action 
**-- STATUS: FULFILLED**
2. Explore the current-trend of microservice architecture, and backend / server-side API development with Node.JS (Next.JS) 
**-- STATUS: WIP**
3. Explore the current-trend of microservice architecture, and backend / server-side API development with non-Node.JS based framework (.NET Core) 
**-- STATUS: TODO**   

## Infra: Covered tech stacks
1. Monorepo setup with yarn workspace
2. Serverless deployment with Docker, ECR, ECS, Copilot with Fargate Launch Type, ALB, CloudFormation
3. CDN Service with AWS Cloudfront
4. DNS with Cloudflare
6. CI/CD implementation with Github Action
6. Sample front-end pages/projects (as part of the monorepo setup): Next.js, React.js with Vite, React.js with CRA 

## Backend for Frontend (BFF) Demo with Next.js
[README](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/README.md)

## Links
1. [Prod site - hello-react-js](https://www.yudimankwanmas.com)
2. [Prod site - hello-next-js](https://www.yudimankwanmas.com/hello-next-js) 
3. [Development site - hello-react-js](https://dev.yudimankwanmas.com)
4. [Development site - hello-next-js](https://dev.yudimankwanmas.com/hello-next-js) 

## Availability
| Time (AEST)         | Time (UTC)         | Action     |
| :------------------ | :----------------: | ---------: |
| Mon–Fri 9 AM        | Sun–Thu 23:00 UTC  | Scale up   |
| Mon–Fri 9 PM        | Mon–Fri 11:00 UTC  | Scale down |
| Sat & Sun All Day   | Sat–Sun            | Scale down |

Scale Down effect: will be served with 503 page
Scale Up effect: the site is up and running