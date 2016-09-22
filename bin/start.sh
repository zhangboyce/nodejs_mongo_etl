#!/bin/bash

run -d feedsource -h 48 -i mongo -c '0 1 * * *' > ~/log/momgo_feedsource.txt &
run -d project -h 48 -i mongo -c '0 2 * * *' > ~/log/momgo_project.txt &

run -d feedsource -h 48 -i es -c '0 3 * * *' > ~/log/es_feedsource.txt &
run -d project -h 48 -i es -c '0 4 * * *' > ~/log/es_project.txt &
