#include <arpa/inet.h>
#include <unistd.h>
#include <stdlib.h>
#include <signal.h>
#include <stdio.h>

int main (int argc, char *argv[]) {

  struct sockaddr_in  lok_adr;
  int sd, ny_sd;
  u_short port=8888;
  sd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
  setsockopt(sd, SOL_SOCKET, SO_REUSEADDR, &(int){ 1 }, sizeof(int));
  lok_adr.sin_family      = AF_INET;
  lok_adr.sin_addr.s_addr = htonl( INADDR_ANY );
  lok_adr.sin_port        = htons( port );
  signal(SIGCHLD, SIG_IGN);
  bind(sd, (struct sockaddr *)&lok_adr, sizeof(lok_adr) );
  listen(sd, 10);

  while(1){
    ny_sd = accept(sd, NULL, NULL);

    if(0==fork()) {
      dup2(ny_sd, 1); dup2(ny_sd, 0);
      close(ny_sd);
      //execlp(argv[1], argv[1], NULL);
      execlp("env", "env", "-i", argv[1], NULL);

      exit(1);
    }
    else { close(ny_sd); }
  }
  return 0;
}
