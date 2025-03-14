# Step 1: Set the base image
FROM node:18-alpine as build

# Step 2: Set working directory
WORKDIR /myapps

# Step 3: Install dependencies only for the workspace
COPY package.json yarn.lock ./

# Step 4: Copy the monorepo (except the ignored files)
COPY . .

# Step 5: Install dependencies using Yarn
RUN yarn install --frozen-lockfile

# Step 6: Build the React app (from the root folder)
WORKDIR /
RUN yarn helloreactjs-build

### PRODUCTION STAGE ###

# Step 7: Prepare the image for production
FROM nginx:alpine as production

# Step 8: Copy the build files from the build stage to NGINX
COPY --from=build /myapps/helloreactjswithvite/dist /usr/share/nginx/html

# Step 9: Expose the port for the NGINX server
EXPOSE 80

# Step 10: Run NGINX server to serve the React app
CMD ["nginx", "-g", "daemon off;"]



