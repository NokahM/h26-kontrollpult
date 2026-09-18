# Gjennomleser hodet og finner lengden av HTTP-kroppen
while true; do read LINJE
    if [ $(echo $LINJE | wc -c) -le 2 ]; then break
    elif [ "$(echo $LINJE | cut -f1 -d:)" = "Content-Length" ];then
	CONTENT_LENGTH=$(echo $LINJE | cut -f2 -d' '| tr -cd '[:digit:]')
    fi
done

# Leser HTTP-kroppen
INN_KROPP=$(dd bs=1 count=$CONTENT_LENGTH status=none)
NN=$( echo "$INN_KROPP" | jq -r '.navn'  )

if [ "$RAD" = "" ]; then
    printf "HTTP/1.1 501 Not Implemented\r\n";
    printf "\r\n"; # avslutter hodet
    printf "501 Mulighet for endring av hele tabellen er ikke implementert\r\n";
    exit
else
    sqlite3 ./p.db "UPDATE $TABELL set navn=\"$NN\" WHERE nr=$RAD"
fi

printf "HTTP/1.1 200 OK\r\n"
printf "Content-Type: application/json;charset=utf-8\r\n"
printf "Date: $TID\r\n";
printf "\r\n" # avslutter hodet
