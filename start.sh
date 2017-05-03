#!/bin/bash

yyyy=$(date +%Y)
mm=$(date +%m)
dd=$(date +%d)

path="log/$yyyy-$mm-$dd"
mkdir -p $path

run -d feedsource -h 24 -i mongo -r 100 -c '0 1 * * *' > "$path/mongo_feedsource.txt" &
run -d project -h 24 -i mongo -r 100 -c '0 5,11,17,23 * * *' > "$path/mongo_project.txt" &

run -d feedsource -h 24 -i es -r 100 -c '0 6 * * *' > "$path/es_feedsource.txt" &
run -d project -h 24 -i es -r 100 -c '0 8,14,20,2 * * *' > "$path/es_project.txt" &

# run -d project -h 24 -i ral -t wechat -r 1000 -c '0 9 * * *' > "$path/redis_read_like.txt" &


# --max-old-space-size=400