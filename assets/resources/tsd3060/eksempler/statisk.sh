#!/bin/sh
read LINJE # Leser først linje
FILSTI=.$(echo $LINJE|cut -f2 -d' '|cut -f1 -d?|cut -f1 -d'#')
FILTYPE=$(file --mime-type --brief --dereference $FILSTI)
printf "HTTP/1.1 200 OK\r\n"
printf "Content-Type: $FILTYPE\r\n"

TID=$(LC_ALL=C date -u '+%a, %d %b %Y %T GMT')
LEN=$(cat $FILSTI | wc -c )

printf "Content-Length: $LEN\r\n";
printf "Date: $TID\r\n";
printf "\r\n" # avslutter hodet

cat $FILSTI
exec ./steng_socket // hjelper på kjøring direkte i WSL2 på min maskin
