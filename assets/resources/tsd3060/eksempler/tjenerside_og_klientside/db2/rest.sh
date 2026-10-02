#!/bin/sh

# Leser først linje
read LINJE
printf "$LINJE\r\n" >&2

export REQUEST_METHOD=$( echo $LINJE | cut -f1 -d' ')
export REQUEST_URI=$(    echo $LINJE | cut -f2 -d' ')
export QUERY_STRING=$(   echo "$REQUEST_URI?" | cut -f2 -d?)
export SCRIPT_NAME=$(    echo $REQUEST_URI | cut -f1 -d? | cut -f1 -d'#')

# Leser resten av hodet. Avbryter ved tom linje
while true; do

    read LINJE
    if [ $(echo $LINJE | wc -c) -le 2 ]; then
	break # Bryter ut ved tom linje

    elif [ "$(echo $LINJE | cut -f1 -d:)" = "Content-Length" ];then
	export CONTENT_LENGTH=$(echo $LINJE | cut -f2 -d' '| tr -cd '[:digit:]')

    elif [ "$(echo $LINJE | cut -f1 -d:)" = "Content-Type" ];then
	export CONTENT_TYPE=$(echo $LINJE | cut -f2 -d' ')

    else
	NVN=$(echo HTTP_$LINJE | tr '-' '_'  | cut -f1 -d':'|  tr '[:lower:]' '[:upper:]')
	VRD=$(echo HTTP_$LINJE | cut -f2 -d' ')
	export $NVN=$VRD
    fi
    echo $LINJE >&2
done


printf "HTTP/1.1 200 OK\r\n"
printf "Content-Type: application/json;charset=utf-8\r\n"
printf "Access-Control-Allow-Origin: http://localhost:8080\r\n"
printf "Access-Control-Allow-Methods: GET,PUT,POST,DELETE\r\n"
printf "Access-Control-Allow-Headers: Content-Type\r\n"
printf "Access-Control-Allow-Credentials: true\r\n"

# Henter ut tabellnavn og rad-ID
TAB=$(echo $SCRIPT_NAME | cut -f2 -d/)
RAD=$(echo $SCRIPT_NAME | cut -f3 -d/)

# Skriver til STDERR
echo SCRIPT_NAME:    $SCRIPT_NAME    >&2
echo REQUEST_METHOD: $REQUEST_METHOD >&2
echo TABELL:         $TAB	       >&2
echo RAD:            $RAD            >&2

# Hvis det er noe i kroppen, så håndteres dette her
if [ "$REQUEST_METHOD" = "POST" ] || [ "$REQUEST_METHOD" = "PUT" ];
then
    KR=$(dd bs=1 count=$CONTENT_LENGTH status=none)
    ID=$( echo "$KR" | jq -r '.brukerid'  )
    PW=$( echo "$KR" | jq -r '.passord'   )
    FN=$( echo "$KR" | jq -r '.fornavn'   )
    EN=$( echo "$KR" | jq -r '.etternavn' )

    if [ ! -z "$PW" ]; then
	# hasher det innsendte passordet saltet burde egentlig vært
	# unik for hver bruker, men i eksemplet her er det likt for
	# alle forhånds-innlagte personer. For dem er saltet er satt
	# satt til 1234567812345678

	SALT=$(echo "SELECT passordhash FROM person WHERE brukerid='$RAD'" \
		 | sqlite3 /person.db | cut -f3 -d'$')

	echo Salt: $SALT >&2

	PW_HASHET=$( mkpasswd -S $SALT $PW )
    fi
fi


if [ "$TAB" = "login"  ] && [ "$REQUEST_METHOD" = PUT ]; then

    LAGRET_HASH=$(echo "SELECT passordhash FROM person WHERE brukerid='$RAD'" \
		 | sqlite3 /person.db)

    if [ "$PW_HASHET" = "$LAGRET_HASH" ]; then

	SESJONSID=$(uuidgen)
	echo "UPDATE person SET sesjonsid='$SESJONSID' WHERE brukerid='$RAD'"\
	    | sqlite3 /person.db
	printf "Set-cookie: SESJONSID=$SESJONSID; SameSite=Strict; Path=/person/\r\n"
	printf "\r\n" # avslutter hodet
	echo '[{"melding":"Autentisering av '$RAD' lyktes"}]'
	exit
    else
	printf "\r\n" # avslutter hodet
	echo '[{"feilmelding":"Autentisering av '$RAD' feilet"}]'
	printf "$ID LAGRET_HASH:\t'$LAGRET_HASH'\n" >&2
	printf "$ID PW_HASHET:\t'$PW_HASHET'\n"     >&2
	exit
    fi

elif [ "$TAB" != "person"  ]; then
    printf "\r\n" # avslutter hodet
    echo '[{"feilmelding":"Resurssen' $TAB 'finnes ikke"}]'
    exit
fi

HTTP_COOKIE=$( echo $HTTP_COOKIE | cut -f2 -d= | dd bs=1 count=36 status=none )

BRUKERID=""
BRUKERID=$( echo "SELECT brukerid FROM person            \
		  WHERE sesjonsid = '"$HTTP_COOKIE"'"  \
		 | sqlite3 /person.db )

echo "Innlogget bruker:        '"$BRUKERID"'"    >&2
echo "SesjonsID fra HTTP-hode: '"$HTTP_COOKIE"'" >&2

if [ -z "$BRUKERID" ]; then
    printf "\r\n" # avslutter hodet
    echo '[{"feilmelding":"Ikke innlogget"}]'
    exit
fi

if [ "$REQUEST_METHOD" = "GET" ]; then

    printf "\r\n" # avslutter hodet

    if [ "$RAD" = "" ]; then # alle rader
	echo SELECT '*' FROM $TAB | sqlite3 -json ./person.db
    else # en bestemt rad
	echo SELECT '*' FROM $TAB WHERE brukerid=\'$RAD\' \
	    | sqlite3 -json ./person.db
    fi

elif [ "$REQUEST_METHOD" = "POST" ]; then

	echo "INSERT INTO $TAB                                \
	     (brukerid,passordhash,fornavn, etternavn) VALUES  \
	     ('$ID','$PW','$FN','$EN')" | sqlite3 /person.db

	printf "\r\n" # avslutter hodet
	echo '[{"melding":"Opprettelse av '$ID' forsøkt"}]'


elif [ "$REQUEST_METHOD" = "PUT" ]; then
    echo "UPDATE $TAB SET passordhash='$PW',fornavn='$FN', \
	etternavn='$EN' WHERE brukerid='$RAD'" | sqlite3 /person.db
	printf "\r\n" # avslutter hodet
	echo '[{"melding":"Endring av '$ID' forsøkt"}]'


elif [ "$REQUEST_METHOD" = "DELETE" ]; then
    echo DELETE FROM $TAB WHERE brukerid=\'$RAD\' \
	| sqlite3 ./person.db
	printf "\r\n" # avslutter hodet
	echo '[{"melding":"Sletting av '$ID' forsøkt"}]'
fi
