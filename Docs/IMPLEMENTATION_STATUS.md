# Estado de implementación

## Hecho en repo
- Proyecto UE inicial (`MinuteMayhem.uproject`).
- Configuración de mapas/modo/input clásico en `Config`.
- Presets de calidad en `Config/DefaultScalability.ini` para entorno consistente.
- Generador automático de assets base (Blueprints y Widgets) en Python.
- Generador de environment blockout arcade (geometría + lighting + gameplay points) en Python.
- Script de validación local del scaffold (`Scripts/validate_environment.sh`).

## Pendiente dentro de Unreal Editor
- Grafo de lógica de Blueprints (replicación, RPC, scoring, schedule mods).
- Diseño final de UI y animaciones UMG.
- Colocación y ajuste de BPs gameplay (extractores, core, bouncepads, magnetpoints) sobre el blockout.

## Motivo técnico
Los Blueprints y Widgets son `.uasset` binarios y su edición completa requiere Unreal Editor.
