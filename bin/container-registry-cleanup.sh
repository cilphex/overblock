#!/bin/bash
# Inspired by:
# https://gist.github.com/ahmetb/7ce6d741bd5baa194a3fac6b1fec8bb7

# https://vaneyckt.io/posts/safer_bash_scripts_with_set_euxo_pipefail/
set -euo pipefail

# USAGE:
#   container-registry-cleanup.sh \
#     gcr.io/basic-site-271517/basic-site-frontend \
#     10

#if [[ "$#" -ne 2 ]]
#then
#  echo "Wrong number of arguments"
#  exit 1
#fi

main() {
  local COUNT=0
  #local IMAGE="${1}"
  #local KEEP="${2}"
  local IMAGE="gcr.io/basic-site-271517/basic-site-frontend"
  local KEEP="10"
  local DELETED=0

  for digest in $(\
      gcloud container images list-tags ${IMAGE} \
      --limit=999999 \
      --sort-by=~timestamp \
      --format='get(digest)' \
    );
  do
    if [[ COUNT -lt KEEP ]]
    then
      echo "${COUNT}: Keeping build ${digest}"
    else
      (
        set -x
        gcloud container images delete -q --force-delete-tags "${IMAGE}@${digest}"
      )
      let DELETED=DELETED+1
    fi

    let COUNT=COUNT+1
  done

  echo "Deleted ${DELETED} images in ${IMAGE}"
}

#main "${1}" "${2}"
main