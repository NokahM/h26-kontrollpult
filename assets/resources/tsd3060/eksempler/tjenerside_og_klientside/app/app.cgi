#!/bin/sh
echo "Content-Type:application/json;charset=utf-8"
echo

# Avslutter om HTTP-forespørsel ikke er en POST
if [ "$REQUEST_METHOD" != "POST" ]; then exit; fi

# Omgår bug i httpd
CONTENT_LENGTH=$HTTP_CONTENT_LENGTH$CONTENT_LENGTH

# Henter data fra HTTP-kpppen
KROPP=$(head -c "$CONTENT_LENGTH")

# Fikser alfakrøll (intet annet)
KROPP=$(echo $KROPP|sed "s/%40/@/")

# Fordeler inngangs-dataene i variabler
for I in $(echo $KROPP|tr '&' ' '); do

    N=$(echo "$I"|cut -f1 -d=)
    V=$(echo "$I"|cut -f2 -d=)

    if [ "$N" = "epost"     ]; then  EP="$V"; fi
    if [ "$N" = "telefon"   ]; then  TE="$V"; fi
    if [ "$N" = "fornavn"   ]; then  FN="$V"; fi
    if [ "$N" = "etternavn" ]; then  EN="$V"; fi
    if [ "$N" = "handling"  ]; then  HA="$V"; fi
done

# Dataene skal sendes i JSON-format til databasen
JSON="{\"epost\":\"$EP\", \"telefon\":\"$TE\",\"fornavn\":\"$FN\", \"etternavn\":\"$EN\"}"
echo $JSON >&2

URL='db/person'  # URL til databasen

# Sender forespørsel til databasen, avhengig av forespurt handling

if [ "$HA" = "Oppdater" ]; then curl -X PUT    -d "$JSON" $URL/$EP; fi
if [ "$HA" = "Ny"       ]; then curl -X POST   -d "$JSON" $URL;     fi
if [ "$HA" = "Slett"    ]; then curl -X DELETE            $URL/$EP; fi
if [ "$HA" = "Liste"    ]; then curl -X GET               $URL/$EP; fi
