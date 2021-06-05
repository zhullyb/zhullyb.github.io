#!/bin/bash

echo 'en_US.UTF-8 UTF-8
zh_CN.UTF-8 UTF-8' > /etc/locale.gen
locale-gen
echo 'LANG=en_US.UTF-8' > /etc/locale.conf
echo 'Archlinux' > /etc/hostname
echo '127.0.0.1	localhost
::1		localhost
127.0.1.1	Archlinux.localdomain Archlinux' > /etc/hosts
grub-install --target=i386-pc /dev/sda
grub-mkconfig -o /boot/grub/grub.cfg
echo root:' ' | chpasswd
useradd -m -G wheel zhullyb
echo zhullyb:' ' | chpasswd
sed -i "s|#\ %wheel\ ALL=(ALL)\ NOPASSWD:\ ALL|%wheel\ ALL=(ALL)\ NOPASSWD:\ ALL|" /etc/sudoers
