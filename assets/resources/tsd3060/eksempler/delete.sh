if [ "$RAD" = "" ]; then
    sqlite3 ./p.db "DELETE FROM $TABELL"
else
    sqlite3 ./p.db "DELETE FROM $TABELL WHERE nr=$RAD"
fi

TID=$(LC_ALL=C date -u '+%a, %d %b %Y %T GMT')

printf "HTTP/1.1 200 OK\r\n"
printf "Content-Type: application/json;charset=utf-8\r\n"
printf "Date: $TID\r\n";
printf "\r\n" # avslutter hodet
