#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int main() {

  char    *buf = NULL; // buffer for innlest linje
  char    *p   = NULL; //

  size_t   len = 0; // bufferlengde
  int      ant = 0; // antall lest

  FILE *   mimefil;

  mimefil=fopen("/etc/mime.types", "r");


  while ( 0 < ( ant=getline( &buf, &len, mimefil ) ) ) {

    if ( buf[0] == '#')  continue; // Hopper over kommentarer
    if ( ant < 2      )  continue; // Hopper over tomme linjer
    buf[ant-1]='\0';               // Fjerner linjeskift


    // Mimetypen (venstre kolonne)

    p = strtok(buf,  "\t ");
    printf("Mimetype: '%s'\n", p );


    // Filendelsene

    while ( 0 != (p = strtok(NULL, "\t ")) )
      printf("\tFilendelse: \t'%s'\n", p);
  }

  free(buf);
}
