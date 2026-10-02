#!/bin/sh


# Skriver HTTP-hode:

KROPP=$(head -c $CONTENT_LENGTH)
if [ "$KROPP" = "orig" ]; then
    echo "Access-Control-Allow-Origin:      https://web01.usn.no"
fi

if [ "$KROPP" = "cred" ]; then
    echo "Access-Control-Allow-Credentials: true"
fi

if [ "$KROPP" = "orig+cred" ]; then
    echo "Access-Control-Allow-Origin:      https://web01.usn.no"
    echo "Access-Control-Allow-Credentials: true"
fi

if [ "$REQUEST_METHOD" = "PUT" ]; then
    echo "Access-Control-Allow-Methods: PUT"
fi

if [ "$REQUEST_METHOD" = "OPTIONS" ]; then
    echo "Access-Control-Allow-Origin:      https://web01.usn.no"
    echo "Access-Control-Allow-Credentials: true"
    echo "Access-Control-Allow-Methods: PUT"
fi

echo "Content-type:text/plain;charset=utf-8"
echo


# Skriver HTTP-kropp:

echo Forespørselens HTTP-metode: \"$REQUEST_METHOD\"
echo Forespørselens HTTP-kropp:  \"$KROPP\"
