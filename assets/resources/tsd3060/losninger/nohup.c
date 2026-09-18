#include <unistd.h>
#include <signal.h>
#include <fcntl.h>

int main(int argc, char **argv) {


  // Ignorerer inndata dersom STDIN er en terminal (NB: isatty() er ikke
  // pensum)

  if (isatty(0)) {
      close(0);
      open("/dev/null", O_WRONLY);
  }

  // Rediriger utdata dersom STDIN er en terminal (NB: isatty() er
  // ikke pensum)

  if (isatty(1)) {
      close(1);
      open("nohup.out", O_RDWR | O_CREAT | O_APPEND, S_IRUSR | S_IWUSR);
  }

  // Rediriger feilmeldinger dersom STDERR er en terminal (NB:
  // isatty() er ikke pensum)
  if (isatty(2)) {
      close(2);
      open("nohup.out", O_RDWR | O_CREAT | O_APPEND, S_IRUSR | S_IWUSR);
  }


  // Sørger for at signalet HUP blir ignorert
  (void)signal(SIGHUP, SIG_IGN);


  // Laster og kjører angitt progam med argumenter, i inneværende
  // prosess
  argv++;               // Hopper over nulte argument
  execvp(argv[0], argv);

}
