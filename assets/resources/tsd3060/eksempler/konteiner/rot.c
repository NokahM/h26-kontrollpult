#include <signal.h>
#include <stdlib.h>
#include <unistd.h>

int main ()
{
  if (-1 == chroot("/tmp") ) exit(1);
  raise(SIGSTOP);
  return 0;
}
