#!/usr/bin/env sh

set -xe

xxd -i header.html > header_data.c

case $1 in
    "debug")
        cc -o generate generate.c -Wall -Wextra -Werror -std=c11 -ggdb -O0 ;;
    *)
        cc -o generate generate.c -w -O3 -march=native -flto ;;
esac
