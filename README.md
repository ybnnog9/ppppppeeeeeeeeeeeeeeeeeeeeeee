# MINUTE MAYHEM — Unity (completo, preparado y visible)

He migrado la base para que sea **Unity** y te quede lista para abrir y modificar a tu gusto.

## Qué incluye (todo preparado)

- Proyecto Unity en `UnityProject/`
- `Packages/manifest.json` con paquetes clave (URP, Input System, Netcode GO, UI)
- Scripts runtime de gameplay arcade:
  - `MMGameManager` (timer, score, schedule por minuto, modifiers)
  - `MMCore` (pickup/drop/throw/reset)
  - `MMPlayerController` (movimiento + interacción)
  - `MMExtractor`, `MMBouncePad`, `MMMagnetPoint`, `MMHud`
- Script **Editor** que genera todo visible automáticamente:
  - `Assets/MinuteMayhem/Scripts/Editor/MMCompleteBuilder.cs`
  - Crea escena, environment, lighting, spawns, core prefab, extractores, bounce pads, magnet points y HUD.

## Cómo usarlo (2 minutos)

1. Abre `UnityProject/` con Unity Hub (Unity 2022.3 LTS).
2. Espera a que compile scripts.
3. En menú superior, ejecuta:
   - `MinuteMayhem > Build COMPLETE Unity Setup`
4. Se creará automáticamente:
   - `Assets/MinuteMayhem/Scenes/L_MM_Arena.unity`
5. Abre esa escena y pulsa Play.

## Resultado

Tendrás un entorno arcade completo y visible con gameplay base funcionando para iterar rápido (colores, layout, reglas, UI y scripts listos para que los ajustes “a tu gusto”).

## Schedule 1 (exacto)

- LOW GRAVITY (60s)
- BOUNCY (60s)
- FOG (60s)
- MAGNET (60s)
- SWAP (60s)

Detalle: `Docs/SCHEDULE_1_BASE.md`.
