#!/bin/sh

# Skriver ut 'http-header' for 'plain-text'
echo "Content-type:text/plain;charset=utf-8"
echo


# Skriver kropp
if [ "$REQUEST_METHOD" = "POST" ]; then
    echo Følgende skal lagres:
    echo
    head -c $CONTENT_LENGTH
    echo
else
    echo "?"
fi
