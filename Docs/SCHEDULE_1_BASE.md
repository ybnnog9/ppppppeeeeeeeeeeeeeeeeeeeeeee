# SCHEDULE 1 (BASE EXACTA)

Este es el **Schedule 1 exacto** para Minute Mayhem.

## Orden y duración
1. `LOW GRAVITY` (`G`) — **60s**
2. `BOUNCY` (`B`) — **60s**
3. `FOG` (`F`) — **60s**
4. `MAGNET` (`M`) — **60s**
5. `SWAP` (`S`) — **60s**

## Total ciclo
- 300s por vuelta completa (5 minutos).
- Luego repite desde `LOW GRAVITY`.

## Configuración de warning
- `warningTime = 5s` antes del siguiente bloque.

## Dónde está implementado
- Código fuente del preset: `UnityProject/Assets/MinuteMayhem/Scripts/Runtime/MMSchedulePresets.cs`
- Carga automática en runtime cuando no hay schedule manual: `MMGameManager.Start()`
