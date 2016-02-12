#!/bin/bash
# As there is no Linux support, this script assumes OS X as the host system.

command -v node > /dev/null || (echo 'Node not found, please download it!' && open 'https://nodejs.org/en/' && sleep 5 && exit)

node index.js
exit