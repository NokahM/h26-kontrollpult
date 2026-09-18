#include <sys/socket.h>
#include <stdio.h>
#include <unistd.h>

int main () {
  fflush(stdout);
  fsync(1);
  shutdown(1, SHUT_WR);
  return 0;
}
