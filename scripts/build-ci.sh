#!/usr/bin/env bash
echo $(git rev-parse  HEAD) | cut -c1-9
REACT_APP_GIT_SHA=$(echo $GITHUB_SHA | cut -c1-9) SKIP_PREFLIGHT_CHECK=true npx react-app-rewired build
