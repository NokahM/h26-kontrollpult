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
NR=$( echo "$INN_KROPP" | jq -r '.nr'   )

sqlite3 ./p.db \
	"INSERT INTO $TABELL (navn,nr) VALUES ('$NN',$NR)"

UT_KROPP="[{\"status\":\"$(echo $?)\"}]"

LEN=$(printf "$UT_KROPP\r\n" | wc -c )
TID=$(LC_ALL=C date -u '+%a, %d %b %Y %T GMT')

printf "HTTP/1.1 200 OK\r\n"
printf "Content-Type: application/json;charset=utf-8\r\n"
printf "Date: $TID\r\n";
printf "Content-Length: $LEN\r\n";
printf "Connection: close\r\n";
printf "\r\n" # avslutter hodet

printf "$UT_KROPP\r\n"
exec ./steng_socket
