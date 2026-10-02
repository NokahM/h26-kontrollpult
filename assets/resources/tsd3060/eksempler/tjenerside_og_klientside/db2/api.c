// Husk å kompilere statisk (eller legge til nødvendige biblioteker)
// om den skal brukes i en konteiner

#include <arpa/inet.h>
#include <unistd.h>
#include <stdlib.h>
#include <signal.h>
#include <stdio.h>

#define BAK_LOGG 10 // Størrelse på for kø ventende forespørsler

int main (int argc, char *argv[]) {

  struct sockaddr_in  lok_adr;
  int sd, ny_sd;
  sd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
  setsockopt(sd, SOL_SOCKET, SO_REUSEADDR, &(int){ 1 }, sizeof(int));
  lok_adr.sin_family      = AF_INET;
  lok_adr.sin_addr.s_addr = htonl(         INADDR_ANY);

  // Portnummer må angis på kommandolinjen
  if (argc != 2) exit(1);
  lok_adr.sin_port = htons( (u_short) atoi(argv[1]) );

  if ( 0==bind(sd, (struct sockaddr *)&lok_adr, sizeof(lok_adr)) )
    fprintf(stderr, "Prosess %d er knyttet til port %s.\n", getpid(), argv[1]);
  else
    exit(2);

  listen(sd, BAK_LOGG);
  while(1){
    ny_sd = accept(sd, NULL, NULL);
    if(0==fork()) {

      dup2(ny_sd, 1);
      dup2(ny_sd, 0);

      //execl("./cgi.sh","cgi.sh",NULL);
      execlp("env", "env", "-i", "./rest.sh",NULL);
      perror("Dette skal ikke skje");
      fflush(stderr);
      exit(3);

    }
    else {
      close(ny_sd);
    }
  }
  return 0;
}
