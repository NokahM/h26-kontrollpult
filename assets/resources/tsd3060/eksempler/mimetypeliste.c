#include <arpa/inet.h>
#include <sys/types.h>
#include <stdio.h>
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>

#define LOKAL_PORT 1110
#define BAK_LOGG   10

int main(){

  FILE  *fil=fopen("./liste","r");
  char  *buf;    // bufferpeker for getline
  size_t len=0;  // bufferlengde for getline
  int    ant=0;  // antall lest med getline

  struct sockaddr_in  lok_adr;
  int  sd, ny_sd;
  sd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
  setsockopt(sd, SOL_SOCKET, SO_REUSEADDR, &(int){ 1 }, sizeof(int));
  lok_adr.sin_family      = AF_INET;
  lok_adr.sin_port        = htons((u_short)LOKAL_PORT);
  lok_adr.sin_addr.s_addr = htonl(         INADDR_ANY);
  if  ( 0==bind(sd, (struct sockaddr *)&lok_adr, sizeof(lok_adr)) )
    printf( "%d lytter på  %d.\n", getpid(), LOKAL_PORT);
  else { perror(""); exit(1); }
  listen(sd, BAK_LOGG);

  while(1){

    ny_sd = accept(sd, NULL, NULL);
    if( !fork() ) {

      dup2(ny_sd,1);
      while ( 0<(ant=getline( &buf, &len, fil ))) {
   buf[ant-1]='\0';
   printf("%d\t'%s'\n",getpid(),buf);
      }

      fflush(stdout);
      shutdown(ny_sd, SHUT_RDWR);

      rewind(fil);  // vi "spoler" filatilbake til start
    }
  }

  return 0;
}
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int main() {

  char    *buf = NULL; // buffer for innlest linje
  char    *fel = NULL; // filendelser i linje
  char    *mtl = NULL; // mimetype i linje

  size_t   gln = 0;    // bufferlengde for getline
  int      ant = 0;    // antall lest med getline
  int      tln = 0;    // typelengde (antall tegn)

  // listeelement for filendelse og mimetype
  struct ende_og_type {
    char *ende;
    char *type;
    struct ende_og_type *neste;
  };

  // pekere for liste
  struct ende_og_type *l_hode = malloc(sizeof(struct ende_og_type));
  struct ende_og_type *l_pek  = l_hode;
  struct ende_og_type *l_end  = NULL; // siste element som har innhold

  // aapner mimetype-fila
  FILE *mimefil=fopen("/etc/mime.types", "r");


  while ( 0 < ( ant=getline( &buf, &gln, mimefil ) ) ) {

    if ( buf[0] == '#')  continue; // Hopper over kommentarer
    if ( ant < 2      )  continue; // Hopper over tomme linjer
    buf[ant-1]='\0';               // Fjerner linjeskift

    // Mimetypen (venstre kolonne)
    mtl = strtok(buf,  "\t ");
    tln = strlen(mtl);

    // Gjennomløper filendelsene
    while ( 0 != (fel = strtok(NULL, "\t ")) ) {

      // setter filendelse i liste-element
      l_pek->ende=malloc( strlen(fel) + sizeof('\0') );
      strcpy( l_pek->ende, fel );

      // setter mimetype i liste-element
      l_pek->type=malloc( tln + sizeof('\0') );
      strcpy( l_pek->type, mtl );

      // setter nytt tomt element i lista
      l_pek->neste=malloc(sizeof(struct ende_og_type));
      l_end=l_pek; // referanse til siste element med innhold
      l_pek=l_pek->neste;
    }
  }

  // Lukker fila
  fclose(mimefil);

  // Frigjør minne brukt av strtok
  free(buf);

  // Fjerner siste element (som er tomt)
  l_end->neste=NULL;
  free(l_pek);

  // Skriver ut lista
  l_pek=l_hode;
  while(l_pek) {
    printf("%s\t%s\n", l_pek->ende,l_pek->type);
    l_pek=l_pek->neste;
  }
}
