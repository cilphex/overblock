#!/bin/bash

TIME_GAP=$((60 * 60 * 24 * 30 * 2)) # 2 months

NOW=$(date +%s)
CONSIDERED_OLD=$((NOW - TIME_GAP))

PUBKEY_OF_THIS_NODE=$(lncli getinfo | jq -r '.identity_pubkey')

TABLE_HAS_ENTRIES=false

for CHAN_BASE64 in $(lncli listchannels | jq -r '.[][] | @base64')
do
  CHAN=$(echo $CHAN_BASE64 | base64 --decode)
  CHAN_ID=$(echo $CHAN | jq -r '.chan_id')
  CHAN_INFO=$(lncli getchaninfo $CHAN_ID)
  LAST_UPDATE=$(($(echo $CHAN_INFO | jq -r '.last_update')))

  if [ $LAST_UPDATE -lt $CONSIDERED_OLD ]; then

    if [ $TABLE_HAS_ENTRIES = false ]; then
      TABLE_HAS_ENTRIES=true

      echo "------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------"
      echo -e "Channel ID\t\tActive\tDisabled by You\t Disabled by Remote\tLast Update\tLocal Balance\tPrivate\t\tFunding Transaction UTXO"
      echo "------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------"
    fi

    ACTIVE=$(echo $CHAN | jq -r '.active')
    LOCAL_BALANCE=$(echo $CHAN | jq -r '.local_balance')
    PRIVATE_CHANNEL=$(echo $CHAN | jq -r '.private')
    NODE1_POLICY_DISABLED=$(echo $CHAN_INFO | jq -r '.node1_policy.disabled')
    NODE2_POLICY_DISABLED=$(echo $CHAN_INFO | jq -r '.node2_policy.disabled')

    if [[ $(echo $CHAN_INFO | jq -r '.node1_pub')  == $PUBKEY_OF_THIS_NODE ]]; then
      CHANNEL_DISABLED_BY_YOUR_NODE=$NODE1_POLICY_DISABLED
      CHANNEL_DISABLED_BY_REMOTE_NODE=$NODE2_POLICY_DISABLED
    else
      CHANNEL_DISABLED_BY_YOUR_NODE=$NODE2_POLICY_DISABLED
      CHANNEL_DISABLED_BY_REMOTE_NODE=$NODE1_POLICY_DISABLED
    fi

    CHAN_POINT=$(echo $CHAN_INFO | jq -r '.chan_point')
    FUNDING_TX=$(echo $CHAN_POINT | cut -d: -f1)
    FUNDING_OUTPUT=$(echo $CHAN_POINT | cut -d: -f2)
    FUNDING_UTXO=$(echo "${FUNDING_TX} ${FUNDING_OUTPUT}")

    LAST_UPDATE_FORMATTED=$(date -d @$LAST_UPDATE +"%Y-%m-%d")
    echo -e "$CHAN_ID\t$ACTIVE\t$CHANNEL_DISABLED_BY_YOUR_NODE\t\t $CHANNEL_DISABLED_BY_REMOTE_NODE\t\t\t$LAST_UPDATE_FORMATTED\t$LOCAL_BALANCE\t\t$PRIVATE_CHANNEL\t\t$FUNDING_UTXO"
  fi
done

if  [ $TABLE_HAS_ENTRIES = true ]; then
  echo -e "\nYou may want to close these channels using the following command:"
  echo -e "lncli closechannel --force [FUNDING TRANSACTION UTXO] \n"
else
  echo -e "\nYour node is free of zombie channels!\n"
fi