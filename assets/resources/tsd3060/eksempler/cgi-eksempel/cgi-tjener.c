#include <arpa/inet.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <stdio.h>

#define LOKAL_PORT 55556
#define BAK_LOGG 10

int main ()
{

  struct sockaddr_in  lok_adr;

  int  sd, ny_sd; // Fildeskriptorer for sockets
  char tegn    = '\0';
  char forrige = '\0';
  int  pid;


  sd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
  setsockopt(sd, SOL_SOCKET, SO_REUSEADDR, &(int){ 1 }, sizeof(int));

  lok_adr.sin_family      = AF_INET;
  lok_adr.sin_port        = htons((u_short)LOKAL_PORT);
  lok_adr.sin_addr.s_addr = htonl(         INADDR_ANY);
  if  ( 0==bind(sd, (struct sockaddr *)&lok_adr, sizeof(lok_adr)) )
    fprintf(stderr,
	    "Prosess %d er knyttet til port %d.\n",
	    getpid(),
	    LOKAL_PORT);

  else { perror(""); exit(1); }
  listen(sd, BAK_LOGG);

  while(1){
    ny_sd = accept(sd, NULL, NULL);
    if( 0 == (pid=fork()) ) {

      fprintf(stderr, "Mottatt forespørsen behandles av %d.\n", getpid());

      // Sørger for at fd 0 og 1, er koblet til klienten
      dup2(ny_sd, 0);
      dup2(ny_sd, 1);

      // Stenger unødvednige fildeskriptorer
      close(ny_sd);
      close(sd);

      // Kroppslengden settes hardt til tallet 10
      setenv("CONTENT_LENGTH", "10", 1);

      while (0<read(0, &tegn, 1)){      // NB! Ett tegn leses om gangen

	if (tegn=='\r')                  continue; // Hopper over '\r'
	if (tegn=='\n' && forrige=='\n') break;    // Tom linje er lest
	forrige=tegn;
	write(2, &tegn, 1);                        // Logger til STDERR
      }


      // Skriver begynnelsen av HTTP-hodet til og laster CGI-skript.
      printf("HTTP/1.1 200 OK\n"); fflush(stdout);
      execl("www/cgi-bin/index.cgi","index.cgi",NULL);

      perror("Dette skal ikke skje");
      exit(1);
    }

    else {
      close(ny_sd);
    }
  }
  return 0;
}
