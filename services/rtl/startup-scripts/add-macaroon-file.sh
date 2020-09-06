#!/usr/bin/env bash

MACAROON_FILE_PATH="$MACAROON_PATH/admin.macaroon"

# If the admin.macaroon file doesn't exist
if [[ -f "$MACAROON_FILE_PATH" ]]; then
  echo "admin.macaroon already exists."
else
  echo "admin.macaroon does not exist."

  # And if we have it in the env var as base64
  if [[ -z "$ADMIN_MACAROON_BASE64" ]]; then
    echo "base64 admin macaroon is missing in env vars."
  else
    echo "base64 admin macaroon is present in env vars."

    # Make the admin macaroon path if it doesn't exist
    if [[ -d "$MACAROON_PATH" ]]; then
      echo "macaroon path directory exists: $MACAROON_PATH"
    else
      echo "macaroon path directory does not exist. making it: $MACAROON_PATH"
      mkdir "$MACAROON_PATH"
    fi

    # Then decode it and write it to the admin.macaroon file
    echo "$ADMIN_MACAROON_BASE64" | base64 -d > admin.macaroon

    echo "created admin.macaroon at $MACAROON_FILE_PATH"
  fi
fi