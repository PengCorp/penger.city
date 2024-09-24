# The home of Penger - Penger City

## Development

### step 1: bootstrap the build system
```bash
cc -o scm build_tools/scheme.c -lm
```
SHOULD theoretically maybe work on windows??? (i tried)

### step 2: run the build system
on a real OS:
```bash
# exmpales
./build.scm help
./build.scm gallery
./build.scm all
./build.scm serve
```

on windows:
```cmd
scm -1 build.scm help
```

## Pushing

Uploads site files to Neocities. May ask for login that is then remembered.
