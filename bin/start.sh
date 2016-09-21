#!/bin/bash

run -d feedsource -h 0 -i mongo -c '0 1 * * *' &
run -d project -h 0 -i mongo -c '0 2 * * *' &

run -d feedsource -h 0 -i es -c '0 3 * * *' &
run -d project -h 0 -i es -c '0 4 * * *' &
