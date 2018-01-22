docker stop gateway 1>/dev/null 2>&1
docker stop backend 1>/dev/null 2>&1
docker stop kong12 1>/dev/null 2>&1
docker stop kong-12-db 1>/dev/null 2>&1
docker rm gateway 1>/dev/null 2>&1
docker rm backend 1>/dev/null 2>&1
docker rm kong12 1>/dev/null 2>&1
docker rm kong-12-db 1>/dev/null 2>&1
