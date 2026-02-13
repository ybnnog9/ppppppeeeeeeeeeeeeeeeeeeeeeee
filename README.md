# MINUTE MAYHEM (UE5 Blueprint-only multiplayer MVP)

Este repo ya está preparado como **base real de proyecto** y ahora incluye un **environment arcade coherente** para que todo cuadre visual y jugablemente desde el inicio.

## Qué trae

- `MinuteMayhem.uproject`
- `Config/` con:
  - `DefaultGame.ini` (modo de juego por defecto)
  - `DefaultEngine.ini` (mapa por defecto + net/render base)
  - `DefaultInput.ini` (input clásico)
  - `DefaultScalability.ini` (presets de calidad consistentes)
- Script UE Python para assets base:
  - `Scripts/ue_python/create_minute_mayhem_assets.py`
- Script UE Python para construir environment blockout:
  - `Scripts/ue_python/build_mm_environment.py`
- Script local de validación rápida del scaffold:
  - `Scripts/validate_environment.sh`

## Quick Start (entorno “que cuadre”)

1. Abre `MinuteMayhem.uproject` en UE5 (5.2+).
2. Si UE lo solicita, confirma plugins de editor:
   - Python Script Plugin
   - Editor Scripting Utilities
3. Crea o abre el mapa `/Game/MinuteMayhem/Maps/L_MM_Arena`.
4. En **Output Log > Python**, ejecuta primero:

```python
exec(open(r"<RUTA>/Scripts/ue_python/create_minute_mayhem_assets.py").read())
```

5. Luego ejecuta:

```python
exec(open(r"<RUTA>/Scripts/ue_python/build_mm_environment.py").read())
```

## Qué genera el script de environment

- Geometría blockout arcade:
  - suelo grande
  - muros perimetrales
  - plataformas con verticalidad
  - coberturas simples para rutas alternativas
- Setup visual base:
  - Directional Light
  - Sky Light
  - Exponential Height Fog
  - Post Process Volume unbound
- Puntos de gameplay:
  - 2 PlayerStarts por equipo (tagged TeamRed/TeamBlue)
  - 1 TargetPoint de Core (`CoreSpawn`)
  - 8 TargetPoints de swap seguro (`SafeSwap`)

## Verificación local rápida

```bash
./Scripts/validate_environment.sh
```

## Nota honesta (importante)

La lógica final de Blueprints/UMG y los `.uasset` completos se termina dentro de Unreal Editor (formato binario). Este repo deja el proyecto y el environment perfectamente encajados para arrancar implementación real sin fricción.
