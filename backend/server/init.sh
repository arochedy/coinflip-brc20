#!/bin/bash

#creating .env file
touch ./src/api/.env
echo > ./src/api/.env

#getting current path
CURRENT_PATH=$PWD
echo 'CURRENT_PATH='$CURRENT_PATH > ./src/api/.env
echo 'FLICK_PORT=3001' >> ./src/api/.env
echo 'NODE_ENV=test' >> ./src/api/.env
echo 'PRIVATE_KEY=L4xownfo6c7PPeGZ5UZhbo1d9ZX1j3yfpCdHADo9p93sXNmEaLgM' >> ./src/api/.env
