{
  description = "Development environment for penger city (python)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];

      pkgsFor = system: nixpkgs.legacyPackages.${system};

      parseRequirements = requirementsFile: let
        requirements = builtins.readFile requirementsFile;
        lines = nixpkgs.lib.strings.splitString "\n" requirements;
        cleanLines = builtins.filter (l: l != "" && !nixpkgs.lib.strings.hasPrefix "#" l) lines;
        packageNames = builtins.map (l: builtins.head (nixpkgs.lib.strings.splitString "==" l)) cleanLines;
        normalizedNames = builtins.map (n: 
          nixpkgs.lib.strings.toLower (builtins.replaceStrings ["-"] ["_"] n)
        ) packageNames;
      in
        normalizedNames;

      packagesFromRequirements = pkgs: let
        reqs = parseRequirements ./requirements.txt;
      in
        map (name:
          if builtins.hasAttr name pkgs.python3Packages
          then pkgs.python3Packages.${name}
          else (throw (builtins.concatStringsSep " " [
            "Package not found in nixpkgs.python3Packages:"
            name
          ]))
        ) reqs;
    in
    {
      devShells = nixpkgs.lib.genAttrs systems (system: let
        pkgs = pkgsFor system;
        pythonEnv = pkgs.python3.withPackages (ps: packagesFromRequirements pkgs);
      in
        {
          default = pkgs.mkShell {
            buildInputs = [ pythonEnv ];
            shellHook = ''
              echo "Python environment loaded with packages from requirements.txt"
              python --version
            '';
          };
        });
    };
}
