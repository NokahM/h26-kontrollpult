#!/usr/bin/sh
./insert_into_person $1 $2 sqlite3 p.db "SELECT navn, nr FROM Person;"
