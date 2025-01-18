#!/bin/bash

cd ~/workspace/ || exit

~/.bun/bin/bun install --production

~/.bun/bin/bun run build

killall bun

killall node

nohup ~/.bun/bin/bun run start:prod &
