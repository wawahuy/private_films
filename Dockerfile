FROM node:12.18-alpine

ENV PORT=8100

WORKDIR /src/private_films_fe_user

# cache node_modules
RUN mkdir -p /tmp/private_films_fe_user
ADD package.json /tmp/private_films_fe_user/package.json
RUN cd /tmp/private_films_fe_user && npm install
RUN mkdir -p /src/private_films_fe_user && cp -a /tmp/private_films_fe_user/node_modules /src/private_films_fe_user/

COPY . .

RUN npm run build

EXPOSE 8100

CMD "npm" "run" "dev:ssr"
