# MINUTE MAYHEM (UE5 Blueprint-only multiplayer MVP)

Este repositorio ahora es una **base de proyecto real** (no solo guía):

- `MinuteMayhem.uproject`
- `Config/` con mapas, modo de juego e input clásico.
- `Scripts/ue_python/create_minute_mayhem_assets.py` para crear automáticamente los Blueprints/Widgets requeridos con nombres exactos.

## Estructura

- `MinuteMayhem.uproject`
- `Config/DefaultGame.ini`
- `Config/DefaultEngine.ini`
- `Config/DefaultInput.ini`
- `Scripts/ue_python/create_minute_mayhem_assets.py`
- `MINUTE_MAYHEM_BLUEPRINT_MVP.md` (documentación funcional detallada)

## Arranque rápido (UE 5.2/5.3/5.4)

1. Abre `MinuteMayhem.uproject` con UE5.
2. Activa plugins (si UE lo pide reinicio):
   - Python Script Plugin
   - Editor Scripting Utilities
3. Abre **Output Log** y en la consola Python ejecuta:

```python
exec(open(r"<RUTA_PROYECTO>/Scripts/ue_python/create_minute_mayhem_assets.py").read())
```

4. Verifica que se crearon en `/Game/MinuteMayhem/Blueprints`:
   - `BP_MM_GameMode`
   - `BP_MM_GameState`
   - `BP_MM_PlayerState`
   - `BP_MM_PlayerController`
   - `BP_MM_Character`
   - `BP_MM_CoreActor`
   - `BP_MM_ExtractorActor`
   - `BP_MM_BouncePad`
   - `BP_MM_MagnetPoint`
   - `BP_MM_ScheduleManager`

5. Verifica widgets en `/Game/MinuteMayhem/UI`:
   - `WBP_MM_HUD`
   - `WBP_MM_ScheduleSlot`
   - `WBP_MM_ScoreWidget`
   - `WBP_MM_WarningWidget`
   - `WBP_MM_MainMenu`
   - `WBP_MM_Settings`
   - `WBP_MM_MatchEnd`

6. Implementa/pega la lógica Blueprint siguiendo `MINUTE_MAYHEM_BLUEPRINT_MVP.md`.

## Importante

No es posible serializar `.uasset` completos desde este entorno sin abrir Unreal Editor, pero se deja el proyecto preparado y scriptado para generar rápidamente toda la base de assets con nombres y estructura correcta.
