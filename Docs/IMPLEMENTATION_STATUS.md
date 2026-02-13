# Estado de implementación

## Hecho en repo
- Proyecto UE inicial (`MinuteMayhem.uproject`).
- Configuración de mapas/modo/input clásico en `Config`.
- Generador automático de assets base (Blueprints y Widgets) en Python para UE Editor.

## Pendiente dentro de Unreal Editor
- Grafo de lógica de Blueprints (replicación, RPC, scoring, schedule mods).
- Diseño final de UI y animaciones UMG.
- Construcción del mapa `L_MM_Arena` y colocación de actores.

## Motivo técnico
Los Blueprints y Widgets son `.uasset` binarios y su edición completa requiere el Unreal Editor.
