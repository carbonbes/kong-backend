#!/bin/sh
yarn prisma migrate deploy

exec "$@"
