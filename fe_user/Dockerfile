FROM node:12.18-alpine AS build

WORKDIR /src/private_films_fe_user

# cache node_modules
RUN mkdir -p /tmp/private_films_fe_user
ADD package.json /tmp/private_films_fe_user/package.json
RUN cd /tmp/private_films_fe_user && npm install
RUN mkdir -p /src/private_films_fe_user && cp -a /tmp/private_films_fe_user/node_modules /src/private_films_fe_user/
COPY . .
RUN npm run build

FROM nginx:1.17.1-alpine
COPY nginx-staging.conf /etc/nginx/nginx.conf
COPY --from=build /src/private_films_fe_user/dist/feuser /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
