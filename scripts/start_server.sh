#!/bin/bash
cd /home/ec2-user/be
mkdir -p /home/ec2-user/be/log/pm2/
pm2 start ecosystem.config.js --env production --update-env
