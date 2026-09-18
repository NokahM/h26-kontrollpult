#!/bin/sh

# Finner hode-argumentet Cookie
while true
do read LINJE
   if [ $(echo $LINJE | wc -c) -le 2 ]; then
     break
   elif [ "$(echo $LINJE | cut -f1 -d:)" = "Cookie" ];then
    COOKIE=$(echo $LINJE | cut -f2 -d:)
  fi
done

if [ -z "$COOKIE" ]; then # setter info-kapsel

  # Secure:   Kun med HTTPS (untatt til localhost)
  # HttpOnly: Ikke tilgjengelig via Javascript
  # SameSite: strict/lax -- motvirker (sammen med andre tilak) CSRF-angrep

  # Max-Age:  Persistent/permanent (ellers sesjons-)kapsel

  HDARG="Set-cookie:kake1=xyz; Secure; HttpOnly; Max-Age=600; SameSite=lax\r\n"

  KROPP="Hei klient, du sendte ingen kake.\nNå fikk du en."
else
  HDARG=""
  KROPP="Du sendte kaken: $COOKIE"
fi

LEN=$(printf "$KROPP\r\n" | wc -c )
TID=$(LC_ALL=C date -u '+%a, %d %b %Y %T GMT')

printf "HTTP/1.1 200 OK\r\n"
printf "Content-Type: text/plain;charset=utf-8\r\n"
printf "Date: $TID\r\n"
printf "Content-Length: $LEN\r\n"
printf "$HDARG"
printf "\r\n" # avslutter hodet

printf "$KROPP\r\n"
