#!/bin/bash

cd ~/app || exit

nohup ~/.bun/bin/bun run start:prod &
