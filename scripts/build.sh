#!/usr/bin/env bash

export REACT_APP_GIT_SHA=`git rev-parse --short HEAD`
SKIP_PREFLIGHT_CHECK=true npx react-scripts build
