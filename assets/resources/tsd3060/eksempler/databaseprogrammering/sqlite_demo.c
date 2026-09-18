#include <sqlite3.h>
#include <stdlib.h>
#include <stdio.h>

/*
   Leser SQL fra STDIN.
   Introduserer følgende:
   - sqlite3_exec() med tilbakekallsfunksjon

   Kompiler med: gcc sqlite_demo_2.c -lsqlite3
*/

int skriv_rad(void *, int, char **, char **);

int main() {

  char    *err = NULL;
  char    *txt = NULL;
  size_t   len = 0;
  sqlite3 *db;

  if ( SQLITE_OK != sqlite3_open("p.db", &db) )
    exit(1);

  while ( -1 != (len = getline( &txt, &len, stdin ) ) ) {

    sqlite3_exec(db, txt, skriv_rad, 0, &err);

    if (err != NULL)
      printf("%s\n", err);
  }

  sqlite3_close(db);
  return 0;
}

int skriv_rad(void *ubrukt,
              int ant_kol,
              char **kolonne,
              char **kol_navn) {

  int i;

  for(i=0; i<ant_kol; i++)
    printf("%s:\t%s\n", kol_navn[i], kolonne[i] );

  return 0;
}
