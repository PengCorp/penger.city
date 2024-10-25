# The home of Penger - Penger City

## Development

### Step 1: Install dependencies

#### If you are using nix:
```bash
nix develop
```
#### Otherwise:
```bash
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
```

### Step 2: Bootstrap the build system
```bash
cc -o scm build_tools/scheme.c -lm
```

SHOULD theoretically maybe work on windows??? (i tried)

### Step 3: Run the build system

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

### Step 4: Set up ignores

Run `fossil ui`. Navigate to Admin > Settings (`http://localhost:8080/setup_settings`). In `ignore-glob` add

```
venv
scm
```

and all other file globs that you want to exclude from version control. Click **Apply Changes** to save.

## Pushing

Uploads site files to Neocities. May ask for login that is then remembered.
