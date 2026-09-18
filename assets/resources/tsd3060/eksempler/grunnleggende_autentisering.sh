#!/bin/sh

# Finner hode-argumentet Autorization
while true
do read LINJE
   if [ $(echo $LINJE | wc -c) -le 2 ]; then
       break
   elif [ "$(echo $LINJE | cut -f1 -d:)" = "Authorization" ];then

       # Her antas at at typen er Basic -- det sjekkes ikke
	CRED=$(echo $LINJE | cut -f3 -d' ' | base64 -d -i)
	NAVN=$(echo $CRED  | cut -f1 -d:)
	PASS=$(echo $CRED  | cut -f2 -d:)
    fi
done

# For at eksemplet skal være enkelt, sjekkes hardkodet navn og
# klartekst passord. Dette er selvfølgelig uaktuelt i et system i
# drift. Normalt vil navn og passordhash være i db/fil

if [ "$NAVN" != tux -o "$PASS" != 1234 ]; then

    printf "HTTP/1.1 401 Unauthorized\r\n"
    printf "Date: $(LC_ALL=C date -u '+%a, %d %b %Y %T GMT')\r\n"
    printf "WWW-Authenticate: Basic realm=\"Innlogging:\"\r\n"
    printf "\r\n"
else
    KROPP="Gratulerer $NAVN. Du er autentisert."
    LEN=$(printf "$KROPP\r\n" | wc -c )
    TID=$(LC_ALL=C date -u '+%a, %d %b %Y %T GMT')

    printf "HTTP/1.1 200 OK\r\n"
    printf "Content-Type: text/plain;charset=utf-8\r\n"
    printf "Date: $TID\r\n"
    printf "Content-Length: $LEN\r\n"
    printf "\r\n" # avslutter hodet

    printf "$KROPP\r\n"
fi
