#!/usr/bin/sh
sqlite3 p.db "INSERT INTO person(navn, nr) VALUES ('$1', '$2');"
sqlite3 p.db "SELECT navn, nr FROM Person;"
