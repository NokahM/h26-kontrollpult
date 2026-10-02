#!/bin/sh
echo Content-type: text/html\; charset=utf-8
echo

echo "<table>"
echo -n "$QUERY_STRING" | \
    sed "s/%20/ /g"| \
    sed "s/%21/=/g"| \
    sed "s/%27/'/g"| \
    sqlite3 --html bokbase.db
echo "</table>"
