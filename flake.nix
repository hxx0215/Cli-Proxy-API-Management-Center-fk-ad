{
  description = "CLI Proxy API Management Center Web UI";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { nixpkgs, ... }:
    let
      systems = [
        "x86_64-linux"
      ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in
    {
      packages = forAllSystems (
        system:
        let
          pkgs = import nixpkgs { inherit system; };
          inherit (pkgs) lib;
          pname = "cli-proxy-api-management-center-webui";
          version = "0.0.0";
          src = lib.cleanSourceWith {
            src = ./.;
            filter =
              path: type:
              let
                name = baseNameOf path;
              in
              !(name == ".git" || name == "dist" || name == "node_modules" || name == "result");
          };
          bunDeps = pkgs.stdenvNoCC.mkDerivation {
            pname = "${pname}-bun-deps";
            inherit version src;

            nativeBuildInputs = [ pkgs.bun ];

            outputHashAlgo = "sha256";
            outputHashMode = "recursive";
            outputHash = "sha256-8xaWqELUQ53JGdT3M03o0AaSy2NJxsCZsApcSUJyGiI=";
            dontFixup = true;

            configurePhase = ''
              runHook preConfigure

              export HOME="$TMPDIR/home"
              export XDG_CACHE_HOME="$TMPDIR/xdg-cache"
              export BUN_INSTALL_CACHE_DIR="$TMPDIR/bun-cache"
              mkdir -p "$HOME" "$XDG_CACHE_HOME" "$BUN_INSTALL_CACHE_DIR"

              runHook postConfigure
            '';

            buildPhase = ''
              runHook preBuild
              bun install --frozen-lockfile --no-progress
              runHook postBuild
            '';

            installPhase = ''
              runHook preInstall
              cp -R node_modules "$out"
              runHook postInstall
            '';
          };
        in
        {
          default = pkgs.stdenvNoCC.mkDerivation {
            inherit pname version src;

            nativeBuildInputs = [
              pkgs.bun
              pkgs.git
              pkgs.nodejs_22
            ];

            configurePhase = ''
              runHook preConfigure

              export HOME="$TMPDIR/home"
              export XDG_CACHE_HOME="$TMPDIR/xdg-cache"
              export BUN_INSTALL_CACHE_DIR="$TMPDIR/bun-cache"
              mkdir -p "$HOME" "$XDG_CACHE_HOME" "$BUN_INSTALL_CACHE_DIR"

              cp -R ${bunDeps} node_modules
              chmod -R u+w node_modules
              patchShebangs node_modules

              runHook postConfigure
            '';

            buildPhase = ''
              runHook preBuild
              node node_modules/typescript/bin/tsc
              node node_modules/vite/bin/vite.js build
              runHook postBuild
            '';

            installPhase = ''
              runHook preInstall

              mkdir -p "$out/share/cli-proxy-api-management-center"
              cp -R dist/. "$out/share/cli-proxy-api-management-center/"

              runHook postInstall
            '';

            meta = {
              description = "Single-file static Web UI for CLI Proxy API Management Center";
              homepage = "https://github.com/hxx0215/Cli-Proxy-API-Management-Center-fk-ad";
              license = lib.licenses.mit;
              platforms = systems;
            };
          };
        }
      );

      devShells = forAllSystems (
        system:
        let
          pkgs = import nixpkgs { inherit system; };
        in
        {
          default = pkgs.mkShell {
            packages = [
              pkgs.bun
              pkgs.git
            ];

            shellHook = ''
              export BUN_INSTALL_CACHE_DIR="$PWD/.bun-cache"
              echo "Bun: $(bun --version)"
              echo "Use: bun install --frozen-lockfile"
              echo "Run: bun run dev"
              echo "Build: bun run build"
            '';
          };
        }
      );

      formatter = forAllSystems (
        system:
        let
          pkgs = import nixpkgs { inherit system; };
        in
        pkgs.nixfmt
      );
    };
}
