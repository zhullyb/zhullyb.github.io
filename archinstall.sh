#!/bin/bash

timedatectl set-ntp true
mkfs.ext4 /dev/sda1
mount /dev/sda1 /mnt
echo 'Server = https://opentuna.cn/archlinux/$repo/os/$arch' > /etc/pacman.d/mirrorlist
yes '' | pacstrap -i /mnt base base-devel linux linux-firmware grub nano networkmanager dialog wpa_supplicant ntfs-3g htop bash-completion
genfstab -U /mnt >> /mnt/etc/fstab
mv after.sh /mnt
arch-chroot /mnt
