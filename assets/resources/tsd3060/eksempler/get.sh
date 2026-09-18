if [ "$RAD" = "" ]; then
    KROPP=$(echo "SELECT * FROM $TABELL" | sqlite3 -json ./p.db)

else
    KROPP=$(echo "SELECT * FROM $TABELL WHERE nr=$RAD" | sqlite3 -json ./p.db)
fi

LEN=$(printf "$KROPP\r\n" | wc -c )
TID=$(LC_ALL=C date -u '+%a, %d %b %Y %T GMT')

printf "HTTP/1.1 200 OK\r\n"
printf "Content-Type: application/json;charset=utf-8\r\n"
printf "Date: $TID\r\n";
printf "Content-Length: $LEN\r\n";
printf "\r\n" # avslutter hodet

printf "$KROPP\r\n"
