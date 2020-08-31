#!/usr/bin/env bash

# Inspired by the lnd example:
# https://github.com/lightningnetwork/lnd/blob/master/docker/btcd/start-btcd.sh

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

assert "$RPCUSER" "RPCUSER must be specified"
assert "$RPCPASS" "RPCPASS must be specified"
assert "$NETWORK" "NETWORK must be specified"
assert "$DEBUG_LEVEL" "DEBUG_LEVEL must be specified"

BTCD_PARAMS=(
  "--$NETWORK"
  "--rpcuser=$RPCUSER"
  "--rpcpass=$RPCPASS"
  "--datadir=/data"
  "--logdir=/data"
  "--rpccert=/rpc/rpc.cert"
  "--rpckey=/rpc/rpc.key"
  "--rpclisten=0.0.0.0"
  "--txindex"
  "--debuglevel=$DEBUG_LEVEL"
)

echo "Starting btcd (dev)"
exec btcd ${BTCD_PARAMS[*]}