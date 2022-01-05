#!/usr/bin/env bash
export REACT_APP_GIT_SHA=$(echo $(git rev-parse  HEAD) | cut -c1-9)
export SKIP_PREFLIGHT_CHECK=true

if [[ $* == *--no-browser* ]]; then
    echo "Setting BROWSER=none. No browser window will pop up"
    export BROWSER=none
fi

FORCE_COLOR=true npx react-app-rewired start | cat
