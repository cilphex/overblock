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

# --lnddir is an option, but it will override
# --adminmacaroonpath and --tlscertpath.
#
# Optional:
# --autopilot.active
# --noseedbackup
LND_PARAMS=(
  "--alias=$ALIAS"
  "--bitcoin.active"
  "--adminmacaroonpath=/shared/admin.macaroon"
  "--tlscertpath=/shared/tls.cert"
  "--tlskeypath=/lnd/tls.key"
  "--tlsextraip=0.0.0.0"
  "--tlsextradomain=lnd"
  "--datadir=/lnd/data"
  "--logdir=/lnd/logs"
  "--bitcoin.$NETWORK"
  "--bitcoin.node=$BACKEND"
  "--$BACKEND.rpccert=/rpc/rpc.cert"
  "--$BACKEND.rpchost=$RPCHOST"
  "--$BACKEND.rpcuser=$RPCUSER"
  "--$BACKEND.rpcpass=$RPCPASS"
  "--rpclisten=0.0.0.0:10009"
  "--debuglevel=$DEBUG_LEVEL"
)

echo "Starting lnd (dev)"
exec lnd ${LND_PARAMS[*]}
