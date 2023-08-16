docker build -f "Dockerfile.prod" --tag evilhero/autonsi_hanlim_fe .
docker push evilhero/autonsi_hanlim_fe
docker image prune -f