#!/bin/sh

# KROPP="Hallo :-)"
KROPP=$(echo "SELECT * FROM Person" | sqlite3 -json ./p.db)
# KROPP=$(env)


printf "HTTP/1.1 200 OK\r\n"
printf "Access-Control-Allow-Methods: GET\r\n"
# printf "Content-Type: text/plain;charset=utf-8\r\n"
printf "Content-Type: application/json;charset=utf-8\r\n"

TID=$(LC_ALL=C date -u '+%a, %d %b %Y %T GMT')
LEN=$(printf "$KROPP\r\n" | wc -c )

printf "Content-Length: $LEN\r\n";
printf "Date: $TID\r\n";
printf "\r\n" # avslutter hodet

printf "$KROPP\r\n"
exec ./steng_socket
