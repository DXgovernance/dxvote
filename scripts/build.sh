#!/usr/bin/env bash
REACT_APP_GIT_SHA=$(echo $(git rev-parse  HEAD) | cut -c1-9) SKIP_PREFLIGHT_CHECK=true yarn react-scripts build
