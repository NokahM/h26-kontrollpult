#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>

int main() {

  int ant=0;
  int l;         // Linjenummer (fra klient)
  char    *txt = NULL;
  size_t   len = 0;

  while(2 < (ant=getline( &txt, &len, stdin )) ) {
  	fprintf(stderr,
		"\t  %3d. linje (ant=%3d): %s\n",
		++l, ant, txt);
  }
}
