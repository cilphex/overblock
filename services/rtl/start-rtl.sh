#!/usr/bin/env bash

# The purpose of this script is to do some setup before
# running `node rtl`. Specifically, RTL only accepts an
# admin macaroon file path. When we rebuild the image and
# redeploy, we'll always have to add our admin.macaroon
# file back into the containers. We don't want to do that.
# Instead, we'll store a base64 version of the admin.macaroon
# file in an env var (in production anyway). Then in this
# startup script, if that env var exists, we'll decode it
# and write it to a local admin.macaroon file that RTL can
# use. While we're at it, we'll do some sanity checking of
# the env vars we expect to be present.

# exit from script if error was raised.
set -e

error() {
  echo "$1" > /dev/stderr
  exit 0
}

BLANK_STRING='""'

assert() {
  VARIABLE="$1"
  MSG="$2"

  if [[ -z "$VARIABLE" || "$VARIABLE" == "$BLANK_STRING" ]]; then
    error "$MSG"
  fi
}

assert "$PORT" "PORT must be specified"
assert "$LN_SERVER_URL" "LN_SERVER_URL must be specified"
assert "$MACAROON_PATH" "MACAROON_PATH must be specified"

# If the admin.macaroon file doesn't exist
if [[ -f "admin.macaroon" ]]; then
  echo "admin.macaroon already exists."
else
  echo "admin.macaroon does not exist."

  # And if we have it in the env var as base64
  if [[ -z "$ADMIN_MACAROON_BASE64" ]]; then
    echo "base64 admin macaroon is missing in env vars."
  else
    echo "base64 admin macaroon is present in env vars."

    # Then decode it and write it to the admin.macaroon file
    echo "$ADMIN_MACAROON_BASE64" | base64 -d > /app/admin.macaroon
  fi
fi

# Start rtl
node rtl