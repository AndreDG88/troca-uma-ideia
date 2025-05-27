#!/usr/bin/env bash

host="$1"
shift
port="$1"
shift

until nc -z "$host" "$port"; do
  >&2 echo "Esperando por $host:$port..."
  sleep 1
done

>&2 echo "$host:$port está disponível!"
exec "$@"
