FROM node:12.18-alpine AS build

WORKDIR /src/private_films_fe_user

# cache node_modules
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.17.1-alpine
COPY nginx-staging.conf /etc/nginx/nginx.conf
COPY --from=build /src/private_films_fe_user/dist/feuser /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
