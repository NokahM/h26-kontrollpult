#!/bin/bash

# Unshare-konteiner som kjøres som en upriviligert bruker

ROTFS=$PWD/unshare-container
INIT=init.sh

if [ ! -d $ROTFS ];then

    mkdir -p $ROTFS/{bin,proc}

    cd       $ROTFS/bin/
    cp       /bin/busybox .

    for P in $(./busybox --list); do
	ln -s busybox $P
    done

        cat <<EOF > $INIT
#!/bin/sh
mount -t proc none /proc
exec /bin/sh
EOF

    chmod +x $INIT
fi

# Debian har deaktivert muligheten for upriviligerte brukere å
# "unshare" bruker-navnerommet. Det kan aktiveres med følgende
# kodelinje:
#
# sudo su -c "echo 1 > /proc/sys/kernel/unprivileged_userns_clone"

PATH=/bin           \
    unshare         \
    --user          \
    --map-root-user \
    --fork          \
    --pid           \
    --mount         \
    --cgroup        \
    --ipc           \
    --uts           \
    --net           \
    /usr/sbin/chroot $ROTFS /bin/init.sh


# Manuell inspeksjon i konteineren:
# ----------------------------------
# ps


# Manuell inspeksjon på vertsystemet:
# ----------------------------------
# ps aux | grep /bin/sh       # finner PID
# cat /proc/$PID/{u,g}id_map  # ser kobling mellom bruker-navnerommene
