# The home of Penger - Penger City

## Development

### step 1: get the dependencies
#### If you are using nix:
```bash
nix develop
```
#### Otherwise:
```bash
pip3 install -r requirements.txt
```

### step 2: bootstrap the build system
```bash
cc -o scm build_tools/scheme.c -lm
```
SHOULD theoretically maybe work on windows??? (i tried)

pip3 install -r requirements.txt

### step 3: run the build system
#### On a real OS:

```bash
./build.scm help
./build.scm gallery
./build.scm all
./build.scm serve
```

#### On Windows:
```cmd
scm -1 build.scm help
```

## Pushing

Uploads site files to Neocities. May ask for login that is then remembered.
