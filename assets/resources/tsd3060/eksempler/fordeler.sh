#!/bin/sh
export LINJE;
read LINJE # Leser først linje

export SCRIPT_NAME=$(echo $LINJE|cut -f2 -d' '|cut -f1 -d?|cut -f1 -d'#')
export TABELL=$(echo $SCRIPT_NAME | cut -f2 -d/)
export RAD=$(echo $SCRIPT_NAME | cut -f3 -d/)
export MET=$( echo $LINJE | cut -f1 -d' ')

# "Logger" den til stderr
printf "LINJE:\t$LINJE\n" >&2
printf "$SCRIPT_NAME\n$TABELL\n$RAD\n$INN_KROPP\n$UT_KROPP " >&2

if [ "$TABELL" != "person" ]; then
    printf "HTTP/1.1 404 Not Found\r\n";
    printf "\r\n";
    printf "404 Det forespurte er ikke funnet\r\n";

elif [ "$MET" = "GET"    ]; then  ./get.sh
elif [ "$MET" = "POST"   ]; then  ./post.sh
elif [ "$MET" = "DELETE" ]; then  ./delete.sh
elif [ "$MET" = "PUT"    ]; then exec ./put.sh
else
    printf "HTTP/1.1 405 Method not allowed\r\n";
    printf "\r\n"; # avslutter hodet
    printf "405 HTTP-metdode ikke tillatt\r\n";
fi
exec ./steng_socket # nødvendig på min USN-maskin
