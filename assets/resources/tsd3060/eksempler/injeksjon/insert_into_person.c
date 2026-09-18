#include <stdio.h>
#include <stdlib.h>
#include <sqlite3.h>

int main(int argc, char *argv[]) {

  const char *navn = argv[1];
  int nr =    atoi( argv[2] );

  const char *sql =
    "INSERT INTO Person(navn, nr) VALUES (?, ?);";

  sqlite3 *db; sqlite3_stmt *stmt;

  if (argc != 3)                    return 1;
  if ( sqlite3_open ("p.db", &db) ) return 2;
  if ( sqlite3_prepare_v2(db, sql, -1, &stmt, NULL) )
    return 3;

  sqlite3_bind_text (stmt, 1, navn, -1, SQLITE_TRANSIENT);
  sqlite3_bind_int  (stmt, 2, nr);

  return sqlite3_step(stmt);
}
