#include <arpa/inet.h>
#include <unistd.h>
#include <stdlib.h>
#include <signal.h>
#include <stdio.h>

int main () {

  struct sockaddr_in  lok_adr; int sd, ny_sd;

  sd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
  setsockopt(sd, SOL_SOCKET, SO_REUSEADDR, &(int){ 1 }, sizeof(int));
  lok_adr.sin_family      = AF_INET;
  lok_adr.sin_addr.s_addr = htonl(  INADDR_ANY);
  lok_adr.sin_port        = htons( (u_short) 80);

  bind(sd, (struct sockaddr *)&lok_adr, sizeof(lok_adr) );
  listen(sd, 10);
  while(1){
	ny_sd = accept(sd, NULL, NULL);
	if(0==fork()) {
	  dup2(ny_sd, 1);  dup2(ny_sd, 0);
	  execlp("env", "env", "-i", "./db.sh",NULL);
	}
	else { close(ny_sd); }
  }
  return 0;
}
