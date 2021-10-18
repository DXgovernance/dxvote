#!/usr/bin/env bash

# Pick git commit
COMMIT=$(git rev-parse --short HEAD)

SKIP_PREFLIGHT_CHECK=true REACT_APP_DXVOTE_COMMIT="$COMMIT" npx react-app-rewired build