#!/bin/sh
read LINJE
REQUEST_METHOD=$( echo $LINJE    | cut -f1 -d' ')
REQUEST_URI=$(    echo $LINJE    | cut -f2 -d' ')
SCRIPT_NAME=$( echo $REQUEST_URI | cut -f1 -d? | cut -f1 -d'#')

printf "HTTP/1.1 200 OK\r\n"
printf "Content-Type: application/json;charset=utf-8\r\n"

printf "Access-Control-Allow-Origin: http://localhost:8080\r\n"
printf "Access-Control-Allow-Methods: GET,PUT,POST,DELETE\r\n"
printf "Access-Control-Allow-Headers: Content-Type\r\n"
# printf "Access-Control-Allow-Credentials: true\r\n"

while true; do
    read LINJE
    if [ $(echo $LINJE | wc -c) -le 2 ]; then
	break
    elif [ "$(echo $LINJE | cut -f1 -d:)" = "Content-Length" ];then
	 CONTENT_LENGTH=$(echo $LINJE | cut -f2 -d' '| tr -cd '[:digit:]')
    fi
done

TAB=$(echo $SCRIPT_NAME | cut -f2 -d/)
RAD=$(echo $SCRIPT_NAME | cut -f3 -d/)

if [ "$REQUEST_METHOD" = "POST" ] || [ "$REQUEST_METHOD" = "PUT" ];
then
    KR=$(dd bs=1 count=$CONTENT_LENGTH status=none)
    EP=$( echo "$KR" | jq -r '.epost'  )
    TF=$( echo "$KR" | jq -r '.telefon'   )
    FN=$( echo "$KR" | jq -r '.fornavn'   )
    EN=$( echo "$KR" | jq -r '.etternavn' )
fi

if [ "$TAB" != "person"  ]; then
    printf "\r\n"
    echo '[{"feilmelding":"Resurssen' $TAB 'finnes ikke"}]'
    exit
fi

 if [ "$REQUEST_METHOD" = "GET" ]; then
    printf "\r\n"
    if [ "$RAD" = "" ]; then
	echo SELECT '*' FROM $TAB | sqlite3 -json ./personer.db
    else
	echo SELECT '*' FROM $TAB WHERE epost=\'$RAD\' \
	    | sqlite3 -json ./personer.db
    fi

elif [ "$REQUEST_METHOD" = "POST" ]; then
	echo "INSERT INTO $TAB                                \
	     (epost,fornavn,etternavn,telefon) VALUES  \
	     ('$EP','$TF','$FN','$EN')" | sqlite3 /personer.db
	printf "\r\n"
	echo '[{"melding":"Opprettelse av '$EP' forsøkt"}]'

elif [ "$REQUEST_METHOD" = "PUT" ]; then
    echo "UPDATE $TAB SET fornavn='$FN', \
	etternavn='$EN', telefon='$TF' WHERE epost='$RAD'" | sqlite3 /personer.db
	printf "\r\n"
	echo '[{"melding":"Endring av '$EP' forsøkt"}]'

elif [ "$REQUEST_METHOD" = "DELETE" ]; then
    echo DELETE FROM $TAB WHERE epost=\'$RAD\' \
	| sqlite3 ./personer.db
	printf "\r\n"
	echo '[{"melding":"Sletting av '$EP' forsøkt"}]'
fi
