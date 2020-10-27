docker-compose stop
docker-compose rm -f

docker rmi private_films/server_manager:lasted || true
docker tag private_films/server_manager:build private_films/server_manager:lasted

docker-compose up -d
