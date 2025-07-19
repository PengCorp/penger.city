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

# Credits

This couldn't have happened without contributions from:

- Boons
- Cephon Altera
- Dimitri Eugensson
- Jack
- Laur
- Strawberry
- Tymscar
- ... and all other contributors of original Pengers!

Thank you 🍓
