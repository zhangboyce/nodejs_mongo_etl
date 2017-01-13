#!/bin/bash

run -d feedsource -h 48 -i mongo -r 100 -c '0 1 * * *' > ~/log/momgo_feedsource.txt &
run -d project -h 48 -i mongo -r 10 -c '0 2 * * *' > ~/log/momgo_project.txt &

run -d feedsource -h 48 -i es -r 100 -c '0 6 * * *' > ~/log/es_feedsource.txt &
run -d project -h 48 -i es -r 10 -c '0 7 * * *' > ~/log/es_project.txt &

run -d project -h 48 -i ral -t wechat -r 1000 -c '0 9 * * *' > ~/log/redis_wechat_project.txt &
