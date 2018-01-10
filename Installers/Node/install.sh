#!/bin/bash
# For macOS X and Linux (if using Linux, run this script with sudo).

command -v node > /dev/null || (echo 'Node not found, please download it!' && open 'https://nodejs.org/en/' && sleep 5 && exit)

node index.js
exit