#!/usr/bin/env bash
set -euo pipefail

required=(
  "MinuteMayhem.uproject"
  "Config/DefaultGame.ini"
  "Config/DefaultEngine.ini"
  "Config/DefaultInput.ini"
  "Config/DefaultScalability.ini"
  "Scripts/ue_python/create_minute_mayhem_assets.py"
  "Scripts/ue_python/build_mm_environment.py"
  "README.md"
)

for f in "${required[@]}"; do
  [[ -f "$f" ]] || { echo "Missing $f"; exit 1; }
done

echo "All required environment scaffold files are present."
