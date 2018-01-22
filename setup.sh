export KONG_NGINX_DAEMON="off"
export KONG_PREFIX="/usr/local/kong"
export POSTGRES_PASSWORD="kong"
export POSTGRES_USER="kong"
export POSTGRES_DB="kong"
export KONG_PG_HOST="kongdb"
export DEMO_HOME=$(pwd)
echo stop and remove services
docker stop kong12 1>/dev/null 2>&1
docker stop kong-12-db 1>/dev/null 2>&1
docker stop backend 1>/dev/null 2>&1
docker stop gateway 1>/dev/null 2>&1
docker rm kong12 1>/dev/null 2>&1
docker rm kong-12-db 1>/dev/null 2>&1
docker rm backend 1>/dev/null 2>&1
docker rm gateway 1>/dev/null 2>&1
echo build backend server
docker run -it --rm \
	--name backend \
	-v $DEMO_HOME:/source \
	--workdir /source \
	-p 3000:3000 \
	crystallang/crystal:0.24.1 \
	crystal build --no-debug --release backend.cr
echo start backend server
docker run -d \
	--name backend \
	-v $DEMO_HOME:/source \
	--workdir /source \
	-p 3000:3000 \
	crystallang/crystal:0.24.1 \
	./backend
echo start gateway
docker run -d \
	--name gateway \
	-v $DEMO_HOME:/source \
	--workdir /source \
	-p 8200:8200 \
	node:8-slim \
	node gateway
echo build docker kong image
docker build -t kong12 .
echo start postgres database
docker run -d \
	--name kong-12-db \
	-p 5432:5432 \
	-e "POSTGRES_PASSWORD=$POSTGRES_PASSWORD" \
	-e "POSTGRES_USER=$POSTGRES_USER" \
	-e "POSTGRES_DB=$POSTGRES_DB" \
	postgres:9.4
echo sleep for 5 seconds...
sleep 5
echo setup kong database
docker run --rm --link kong-12-db:$KONG_PG_HOST \
	-e "KONG_NGINX_DAEMON=$KONG_NGINX_DAEMON" \
	-e "KONG_PREFIX=$KONG_PREFIX" \
	-e "KONG_PG_HOST=$KONG_PG_HOST" \
	-e "KONG_PG_USER=$POSTGRES_USER" \
	-e "KONG_PG_PASSWORD=$POSTGRES_PASSWORD" \
	-e "KONG_PG_DATABASE=$POSTGRES_DB" \
	kong12 \
	kong migrations up
echo sleep for 5 seconds...
sleep 5
echo start kong
docker run -d \
	--name kong12 \
	--link kong-12-db:$KONG_PG_HOST \
	-e "KONG_NGINX_DAEMON=$KONG_NGINX_DAEMON" \
	-e "KONG_PREFIX=$KONG_PREFIX" \
	-e "KONG_PG_HOST=$KONG_PG_HOST" \
	-e "KONG_PG_USER=$POSTGRES_USER" \
	-e "KONG_PG_PASSWORD=$POSTGRES_PASSWORD" \
	-e "KONG_PG_DATABASE=$POSTGRES_DB" \
	-e "KONG_NGINX_WORKER_PROCESSES=1" \
	-e "KONG_CUSTOM_PLUGINS=" \
	-e "KONG_ADMIN_LISTEN=0.0.0.0:8001" \
	-e "KONG_WORKER_CONNECTIONS=1000000" \
	-e "KONG_CLIENT_MAX_BODY_SIZE=1m" \
	-e "KONG_NGINX_OPTIMIZATIONS=on" \
	-e "KONG_CLIENT_BODY_BUFFER_SIZE=1m" \
	-e "KONG_UPSTREAM_KEEPALIVE=1024" \
	-e "KONG_DATABASE=postgres" \
	-e "KONG_PG_SSL=off" \
	-e "KONG_DB_UPDATE_FREQUENCY=5" \
	-e "KONG_DB_UPDATE_PROPAGATION=5" \
	-e "KONG_DB_CACHE_TTL=3600" \
	-e "KONG_MEM_CACHE_SIZE=512m" \
	-e "KONG_SSL=off" \
	-e "KONG_SERVER_TOKENS=off" \
	-e "KONG_LATENCY_TOKENS=off" \
	-e "KONG_REAL_IP_HEADER=X-Real-IP" \
	-e "KONG_ERROR_DEFAULT_TYPE=application/json" \
	-e "KONG_PROXY_ERROR_LOG=/dev/null" \
	-e "KONG_ADMIN_ACCESS_LOG=off" \
	-e "KONG_ADMIN_ERROR_LOG=/dev/null" \
	-e "KONG_PROXY_ACCESS_LOG=off" \
	-e "KONG_LOG_LEVEL=error" \
	-p 8000:8000 \
	-p 8001:8001 \
	kong12 \
	kong start
echo sleep for 5 seconds...
sleep 5
echo create secure api
curl -X POST \
  http://127.0.0.1:8001/apis \
  -H 'content-type: application/json' \
  -d '{
	"name":"ftl-admin",
	"hosts":"ftl.admin",
	"preserve_host": true,
	"upstream_url": "http://172.17.0.1:3000",
	"strip_uri": false
}'
echo create consumer
curl -X POST \
  http://127.0.0.1:8001/consumers \
  -H 'content-type: application/json' \
  -d '{
	"username": "ftl.admin",
	"custom_id": "56a24845b3efb9110046115b"
}'
echo create jwt credentials
curl -X POST \
  http://127.0.0.1:8001/consumers/ftl.admin/jwt \
  -H 'content-type: application/json' \
  -d '{
	"secret":"c61f373bd7f74230d4d00e2a093b4282",
	"key":"33a9ec8bfe2b5134e245c65b327b5b90",
	"algorithm":"HS256"
}'
create jwt plugin
curl -X POST \
  http://127.0.0.1:8001/apis/ftl-admin/plugins \
  -H 'content-type: application/json' \
  -d '{
	"name": "jwt",
	"config": {
			"key_claim_name": "iss",
			"secret_is_base64": false,
			"uri_param_names": ["jwt"],
			"claims_to_verify": ["exp"]
	}
}'
echo create open api
curl -X POST \
  http://127.0.0.1:8001/apis \
  -H 'content-type: application/json' \
  -d '{
	"name":"ftl-open",
	"hosts":"ftl.open",
	"preserve_host": true,
	"upstream_url": "http://172.17.0.1:3000",
	"strip_uri": false
}'
