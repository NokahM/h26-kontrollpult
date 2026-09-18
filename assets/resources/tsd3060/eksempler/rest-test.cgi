#!/bin/sh

# Skriver ut 'http-header' for 'plain-text'
echo "Content-type:text/plain;charset=utf-8"
echo

echo REQUEST_URI:    $REQUEST_URI
echo REQUEST_METHOD: $REQUEST_METHOD
echo


TAB=$(echo $REQUEST_URI | cut -f2 -d/)
RAD=$(echo $REQUEST_URI | cut -f3 -d/)

if [ "$TAB" != "bok"  ]
then
   echo Resurssen finnes ikke.
   exit
fi

if [ "$REQUEST_METHOD" = "GET" ]
then
    if [ "$RAD" = "" ]
    then

	# Henter alle
	echo SELECT '*' FROM $TAB                  | sqlite3 ../bokbase.db
    else

	# Henter rad
	echo SELECT '*' FROM $TAB WHERE bokId=$RAD | sqlite3 ../bokbase.db
    fi
fi

if [ "$REQUEST_METHOD" = "POST" ]; then
    echo Ugjort: Følgende skal settes inn i $REQUEST_URI:
    echo

    # skriver HTTP-kropp (hodet er allerede lest av web-tjeneren)
    head -c $CONTENT_LENGTH
    echo
fi

if [ "$REQUEST_METHOD" = "PUT" ]; then
    echo Ugjort: $REQUEST_URI skal endres slik:
    echo

    # skriver http-kroppen fra foreslpørselen
    head -c $CONTENT_LENGTH
    echo
fi

if [ "$REQUEST_METHOD" = "DELETE" ]; then
    echo Ugjort: $REQUEST_URI skal slettes
fi
