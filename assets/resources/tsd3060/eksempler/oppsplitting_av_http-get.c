#include <string.h>
#include <stdlib.h>
#include <stdio.h>

// Eksempel på uthenting av 'metode', 'filstil' og 'filetternavn' fra
// en HTTP-GET-forespørsel.

// Skrevet av Thomas Nordli februar 2022

int main(){

  // Eksempel på HTTP-GET-forespørsel fra curl():
  char txt[]="GET h/allo.txt HTTP/1.1\nHost: localhost:8080\nUser-Agent: curl/7.64.0\nAccept:\n\n";

  char *peker = txt; // en peker som starter med å peke på HTTP-forespørselen

  char *foresp; // peker til HTTP-forespørsel
  char *metode; // peker til HTTP-metode
  char *filsti; // peker til filsti
  char *ettern; // peker til fil-etternavn


  // HTTP-forespørsel
  foresp=malloc(strlen(txt)+sizeof('\0'));
  strcpy(foresp, txt);
  printf("Forespørsel:\n\n%s\n",foresp);

  peker = strtok(txt,  " ");

  // HTTP-metode
  metode=malloc(strlen(peker)+sizeof('\0'));
  strcpy(metode, peker);
  printf("%s\n",metode);

  peker=strtok(NULL, " ");

  // filsti
  filsti=malloc(strlen(peker)+sizeof('\0'));
  strcpy(filsti, peker);
  printf("%s\n",filsti);

  strtok(filsti, "."); // ignorerer "filfornavn"
  peker=strtok(NULL, ".");

  // filetternavn
  ettern=malloc(strlen(peker)+sizeof('\0'));
  strcpy(ettern, peker);
  printf("%s\n",ettern);

  return 0;
}
