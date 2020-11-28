#!/usr/bin/env bash

node scripts/loadDeployments.js
SKIP_PREFLIGHT_CHECK=true FORCE_COLOR=true  npx react-app-rewired start | cat
