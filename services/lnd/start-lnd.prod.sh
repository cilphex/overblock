#!/usr/bin/env bash

# Inspired by the lnd example:
# https://github.com/lightningnetwork/lnd/blob/master/docker/lnd/start-lnd.sh

# exit from script if error was raised.
set -e

error() {
  echo "$1" > /dev/stderr
  exit 0
}

assert() {
  BLANK_STRING='""'
  VARIABLE="$1"
  MSG="$2"

  if [[ -z "$VARIABLE" || "$VARIABLE" == "$BLANK_STRING" ]]; then
    error "$MSG"
  fi
}

assert "$NETWORK" "NETWORK must be specified"
assert "$BACKEND" "BACKEND must be specified"
assert "$RPCHOST" "RPCHOST must be specified"
assert "$RPCUSER" "RPCUSER must be specified"
assert "$RPCPASS" "RPCPASS must be specified"
assert "$DEBUG_LEVEL" "DEBUG_LEVEL must be specified"

# Optional:
# --autopilot.active
PARAMS=(
  "--alias=$ALIAS"
  "--bitcoin.active"
  "--lnddir=/lnd"
  "--tlsextraip=0.0.0.0"
  "--tlsextradomain=lnd"
  "--bitcoin.$NETWORK"
  "--bitcoin.node=$BACKEND"
  "--$BACKEND.rpccert=/lnd/rpc.cert"
  "--$BACKEND.rpchost=$RPCHOST"
  "--$BACKEND.rpcuser=$RPCUSER"
  "--$BACKEND.rpcpass=$RPCPASS"
  "--rpclisten=0.0.0.0:10009"
  "--debuglevel=$DEBUG_LEVEL"
)

echo "Starting lnd (prod 8/30 1:34am)"
lnd ${PARAMS[*]}
