#!/usr/bin/env bash

python -m http.server &

google-chrome-stable --incognito http://localhost:8000/ &

