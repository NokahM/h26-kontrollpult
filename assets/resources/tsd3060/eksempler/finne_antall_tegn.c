#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/stat.h>

int main() {


  const  char *pathname = "./ant_tegn.c";
  struct stat statbuf;

  stat(pathname, &statbuf);
  fprintf(stderr, "antall tegn: %ld\n", statbuf.st_size);

}
