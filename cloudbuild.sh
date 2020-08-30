services=(
  btcd
  lnd
  lnd-gateway
  web
)

git_diff=$(git diff --name-only HEAD HEAD~1)

echo "diff:"
echo "$git_diff"

for i in ${!services[@]}
do
  service_name=${services[i]}

  if [[ "$git_diff" == *"services/$service_name"* ]]
  then
    echo "diff contains $service_name"
  fi
done