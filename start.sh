#!/bin/bash

yyyy=$(date +%Y)
mm=$(date +%m)
dd=$(date +%d)

path="log/$yyyy-$mm-$dd"
sudo mkdir -p $path

run -d feedsource -h 48 -i mongo -r 1000 -c '0 1 * * *' > "$path/mongo_feedsource.txt" &
run -d project -h 48 -i mongo -r 1000 -c '0 2 * * *' > "$path/mongo_project.txt" &

run -d feedsource -h 48 -i es -r 1000 -c '0 6 * * *' > "$path/es_feedsource.txt" &
run -d project -h 48 -i es -r 1000 -c '0 7 * * *' > "$path/es_project.txt" &

run -d project -h 48 -i ral -t wechat -r 1000 -c '0 9 * * *' > "$path/redis_read_like.txt" &
