# MINUTE MAYHEM — Base completa MVP (Unreal Engine 5.x, 100% Blueprints + UMG)

## 0) Supuestos y objetivos
- Proyecto template: **Third Person**.
- Multiplayer: **Listen Server** (PIE 2–4 jugadores).
- Solo Blueprints + UMG (sin C++, sin GAS, sin assets externos).
- Estilo visual: arcade, low-poly/stylized, materiales planos.

---

## 1) Blueprints a crear (nombres exactos)

1. `BP_MM_GameMode`
2. `BP_MM_GameState`
3. `BP_MM_PlayerState`
4. `BP_MM_PlayerController`
5. `BP_MM_Character`
6. `BP_MM_CoreActor`
7. `BP_MM_ExtractorActor`
8. `BP_MM_BouncePad`
9. `BP_MM_MagnetPoint`
10. `BP_MM_ScheduleManager`

### Widgets UMG
1. `WBP_MM_HUD`
2. `WBP_MM_ScheduleSlot`
3. `WBP_MM_ScoreWidget`
4. `WBP_MM_WarningWidget`
5. `WBP_MM_MainMenu`
6. `WBP_MM_Settings`
7. `WBP_MM_MatchEnd`

---

## 2) Estructuras y enums recomendados

### Enum: `E_MM_Modifier`
Valores:
- `None`
- `LowGravity`
- `Bouncy`
- `Fog`
- `Magnet`
- `Swap`

### Struct: `ST_MM_ModifierEntry`
- `Modifier` (`E_MM_Modifier`)
- `Duration` (`float`, default 60.0)
- `DisplayName` (`Text`)
- `IconText` (`Text`) // placeholder: G, B, F, M, S
- `Color` (`LinearColor`)

### Struct: `ST_MM_Notification`
- `Message` (`Text`)
- `Color` (`LinearColor`)
- `Lifetime` (`float`, default 2.0)

---

## 3) Replicación (qué y por qué)

## `BP_MM_GameState` (Replicated/RepNotify)
- `MatchTimeRemaining` (RepNotify): timer global HUD.
- `ScoreRed` (RepNotify): score equipo rojo.
- `ScoreBlue` (RepNotify): score equipo azul.
- `CurrentModifier` (RepNotify): estado de mapa activo.
- `NextModifier` (RepNotify): preview schedule.
- `TimeToNextModifier` (RepNotify): warning de 5s.
- `CurrentMinuteIndex` (RepNotify): texto banner “MINUTE X”.
- `bMatchEnded` (RepNotify): abrir MatchEnd.

**Razón:** estado de partida compartido por todos los clientes; actualización de UI por eventos OnRep (sin bindings en tick).

## `BP_MM_PlayerState`
- `Team` (RepNotify, enum `E_MM_Team` con `Red/Blue`).
- `PlayerScore` (RepNotify opcional MVP).
- `CoresDeposited` (RepNotify opcional MVP).

**Razón:** identidad por jugador y datos para MVP al final.

## `BP_MM_CoreActor`
- `CoreState` (RepNotify enum `Grounded/Carried/Thrown`).
- `Carrier` (RepNotify, ref a `BP_MM_Character`).
- `bCanBePicked` (RepNotify).
- `LastDropServerTime` (replicado opcional debug).

**Razón:** gameplay crítico del objetivo y feedback visual correcto en red.

---

## 4) Guía click-by-click por Blueprint

## 4.1 `BP_MM_PlayerState`
**Parent:** `PlayerState`.

Variables:
- `Team` (RepNotify)
- `PlayerScore` (RepNotify)
- `CoresDeposited` (RepNotify)

Eventos:
- `OnRep_Team` → Dispatcher `OnTeamChanged`.
- `OnRep_PlayerScore`/`OnRep_CoresDeposited` → Dispatcher `OnStatsChanged`.

---

## 4.2 `BP_MM_GameState`
**Parent:** `GameStateBase`.

Variables (RepNotify):
- `MatchTimeRemaining` (float)
- `ScoreRed` (int)
- `ScoreBlue` (int)
- `CurrentModifier` (`E_MM_Modifier`)
- `NextModifier` (`E_MM_Modifier`)
- `TimeToNextModifier` (float)
- `CurrentMinuteIndex` (int)
- `bMatchEnded` (bool)

Dispatchers:
- `OnHUDTimerUpdated`
- `OnHUDScoreUpdated`
- `OnHUDScheduleUpdated`
- `OnMinuteBanner`
- `OnMatchEnded`

OnRep:
- `OnRep_MatchTimeRemaining` -> `OnHUDTimerUpdated`
- `OnRep_ScoreRed/Blue` -> `OnHUDScoreUpdated`
- `OnRep_CurrentModifier/NextModifier/TimeToNextModifier` -> `OnHUDScheduleUpdated`
- `OnRep_CurrentMinuteIndex` -> `OnMinuteBanner`
- `OnRep_bMatchEnded` -> `OnMatchEnded`

---

## 4.3 `BP_MM_GameMode`
**Parent:** `GameModeBase`.

Defaults:
- `GameStateClass = BP_MM_GameState`
- `PlayerStateClass = BP_MM_PlayerState`
- `DefaultPawnClass = BP_MM_Character`
- `PlayerControllerClass = BP_MM_PlayerController`

Variables:
- `MatchDuration` (float, default 420)
- `CoreClass` (`BP_MM_CoreActor`)
- `CoreSpawnPoint` (Actor ref editable)
- `RedExtractor` / `BlueExtractor` refs
- `ScheduleManagerRef` (`BP_MM_ScheduleManager`)

Eventos:
1. `Event BeginPlay` (Authority only)
   - Set `MatchTimeRemaining = MatchDuration` en GameState.
   - Spawn `BP_MM_CoreActor` en `CoreSpawnPoint`.
   - Buscar/guardar extractores y schedule manager.
   - `SetTimer` 1s loop -> `Server_TickMatchTime`.

2. `Server_TickMatchTime`
   - Restar 1 a `MatchTimeRemaining`.
   - Si `<=0`: set `bMatchEnded=true`, `EndMatch`.

3. `PostLogin`
   - Asignar equipo balanceado:
     - contar PlayerStates Red/Blue.
     - Set `Team` nuevo jugador al equipo con menos miembros.
   - Respawn en spawn del equipo.

4. `Server_AddScore(Team)`
   - Incrementa `ScoreRed` o `ScoreBlue`.

---

## 4.4 `BP_MM_PlayerController`
**Parent:** `PlayerController`.

Variables:
- `HUDRef` (`WBP_MM_HUD`)
- `MainMenuRef` (`WBP_MM_MainMenu`)

Eventos:
- `BeginPlay`:
  - Si local controller:
    - Crear `WBP_MM_HUD`, `AddToViewport`.
    - Registrar a dispatchers de `BP_MM_GameState` para update de HUD.
- RPCs:
  - `Server_Interact` (pickup/deposit según overlap actual).
  - `Server_ThrowCore(ThrowVector)`.

Input clásico (fallback):
- Action `Interact` (E)
- Action `Throw` (Mouse Right)
- Axis Move/Look/Jump estándar third-person.

Migración a Enhanced Input:
- Crear `IA_Interact`, `IA_Throw`, `IMC_Default`.
- En `BeginPlay` local: `AddMappingContext`.
- Reenlazar eventos a mismas RPCs.

---

## 4.5 `BP_MM_Character`
**Parent:** `ThirdPersonCharacter`.

Componentes:
- `Sphere_CoreDetect` (overlap para core/extractor)
- `WidgetComponent` opcional (marcador equipo)

Variables:
- `bIsCarryingCore` (RepNotify)
- `CarriedCoreRef` (`BP_MM_CoreActor`, replicada)
- `BaseWalkSpeed` (float)
- `BaseJumpZ` (float)
- `MoveSpeedMultiplier` (float=0.85 editable)
- `JumpMultiplier` (float=0.90 editable)
- `TeamColor` (no replicada; derivada de Team)

Lógica:
1. `BeginPlay`:
   - Guardar base speed/jump.
2. `OnRep_bIsCarryingCore` y `SetCarryState(bool)`:
   - Si true: `MaxWalkSpeed = BaseWalkSpeed*MoveSpeedMultiplier`, `JumpZVelocity = BaseJumpZ*JumpMultiplier`.
   - Si false: restaurar base.
3. Daño/Knockback:
   - Evento `AnyDamage` o custom `OnKnockbackReceived` (server):
   - Si carrying: `CarriedCoreRef->Server_DropCore`.
4. Throw:
   - Input Throw -> `Server_ThrowCore` en controller.

---

## 4.6 `BP_MM_CoreActor`
**Parent:** `Actor`.

Componentes:
- `SphereCollision` (Root)
- `StaticMesh` (Sphere emissive)
- `ProjectileMovement` (opcional para throw) o física simulada
- `Niagara/PointLight` opcional glow

Variables (replicadas):
- `CoreState` (`Grounded/Carried/Thrown`, RepNotify)
- `Carrier` (`BP_MM_Character`, RepNotify)
- `bCanBePicked` (RepNotify)
- `NoPickupDuration` (float = 0.5)
- `ResetNoOwnerDuration` (float = 15)
- `HomeTransform` (Transform)

Eventos server:
1. `Server_PickupCore(Character)`
   - validar `bCanBePicked`, `Carrier == None`, distancia.
   - Set `Carrier`, `CoreState=Carried`, attach socket `spine_03` o `hand_r`.
   - desactivar física/collision con pawn.
2. `Server_DropCore(Impulse)`
   - detach, `Carrier=None`, `CoreState=Grounded`.
   - activar física, aplicar impulso.
   - `bCanBePicked=false`; timer 0.5s -> true.
   - iniciar/reset timer 15s -> `Server_ResetToHome` si sigue sin dueño.
3. `Server_ThrowCore(ThrowVector)`
   - requiere carrier válido.
   - internamente llama Drop con impulso alto, `CoreState=Thrown`.
4. `Server_ResetToHome`
   - teleport a `HomeTransform`, limpiar velocidad, `CoreState=Grounded`, `Carrier=None`, `bCanBePicked=true`.

Anti-caída fuera de mapa:
- En Tick server (ligero, 4Hz timer mejor): si Z < KillZ o fuera bounds -> `Server_ResetToHome`.

OnRep visual:
- `OnRep_CoreState` actualiza material/color (carried=team tint, grounded=neutral).

---

## 4.7 `BP_MM_ExtractorActor`
**Parent:** `Actor`.

Componentes:
- `BoxCollision` (zona depósito)
- `StaticMesh` placeholder
- `Decal` color equipo

Variables:
- `Team` (`E_MM_Team`, editable)

Evento overlap (server):
- Si entra `BP_MM_Character` carrying core y su `Team == Extractor.Team`:
  - `GameMode->Server_AddScore(Team)`
  - aumentar `PlayerState.CoresDeposited` y `PlayerScore += 100`
  - `Core->Server_ResetToHome()`
  - notificación HUD global “CORE DEPOSITED”.

---

## 4.8 `BP_MM_BouncePad`
**Parent:** `Actor`.

Componentes:
- `BoxCollision`
- `StaticMesh` pad

Variables:
- `LaunchStrength` (float=1400)
- `PitchOverride` (float=35)
- `bEnabledByBouncyMod` (bool)

Overlap:
- Si `bEnabledByBouncyMod` y actor = Character:
  - `LaunchCharacter(ForwardVector*LaunchStrength + UpVector*LaunchStrength*0.6, true, true)`

---

## 4.9 `BP_MM_MagnetPoint`
**Parent:** `Actor`.

Componentes:
- `SphereInfluence`
- `StaticMesh`/VFX placeholder

Variables:
- `PullStrength` (float=250000)
- `MaxDistance` (float)
- `bActive` (replicada)

Lógica (server timer 0.05s solo si activo):
- `GetOverlappingActors(Character)`.
- Para cada uno:
  - dirección = `(MagnetLoc - CharLoc).GetSafeNormal`
  - aplicar `AddForce` al capsule (si simula) o `LaunchCharacter(direction*ForceDelta, false, false)` suave.

---

## 4.10 `BP_MM_ScheduleManager`
**Parent:** `Actor` (spawn en mapa).

Variables:
- `Schedule` (Array `ST_MM_ModifierEntry`, editable)
- `CurrentIndex` (int)
- `BlockTimeRemaining` (float)
- `WarningThreshold` (float = 5)
- refs a `BouncePads`, `MagnetPoints`, `ExponentialHeightFog`, `PostProcessVolume`
- Swap:
  - `SwapIntervalMin=12`, `SwapIntervalMax=15`
  - `SwapTimerHandle`
  - `SafeSwapPoints` (Array TargetPoint editable)

BeginPlay (server):
- Si schedule vacío, llenar con 5 mods base.
- `CurrentIndex=0`, `ApplyModifier(Schedule[0])`.
- Set timers:
  - 1s loop `Server_TickSchedule`.

`Server_TickSchedule`:
- Restar 1 a `BlockTimeRemaining`.
- Actualizar GameState: `CurrentModifier`, `NextModifier`, `TimeToNextModifier`.
- Si `BlockTimeRemaining == WarningThreshold`: emitir warning HUD.
- Si `<=0`:
  - `RevertModifier(Current)`
  - `CurrentIndex = (CurrentIndex+1) % Schedule.Length`
  - `ApplyModifier(NewCurrent)`
  - reset `BlockTimeRemaining = Duration`
  - `GameState.CurrentMinuteIndex++` (banner 2s)

`ApplyModifier` / `RevertModifier`:
1. **LowGravity**
   - Apply: para todos Characters `GravityScale=0.45`.
   - Revert: `GravityScale=1.0`.
2. **Bouncy**
   - Apply: activar pads + restitution alta (physics material dinámica o ajustes de bounce en character movement).
   - Revert: desactivar pads + restitution normal.
3. **Fog**
   - Apply: habilitar fog/postprocess con alta densidad.
   - Revert: restaurar densidad default.
4. **Magnet**
   - Apply: `bActive=true` en todos magnet points.
   - Revert: `bActive=false`.
5. **Swap**
   - Apply: iniciar timer recurrente random 12–15s -> `Server_DoSwap`.
   - Revert: clear swap timer.

`Server_DoSwap`:
- elegir dos jugadores aleatorios distintos.
- encontrar `SafeSwapPoint` válido para cada destino:
  - line trace down para suelo.
  - capsule trace para evitar colisión bloqueante.
- teleport cruzado (o a safe points más cercanos si riesgo stuck).

---

## 5) UI/HUD comercial (UMG)

## 5.1 `WBP_MM_HUD` jerarquía
`CanvasPanel` root con 3 capas:
1. **Top HeaderBar** (anchor top stretch, margen 32):
   - Contenedor horizontal:
     - `WBP_MM_ScoreWidget` rojo (izquierda)
     - Timer central grande (font 56 bold-like, outline 1–2)
     - `WBP_MM_ScoreWidget` azul (derecha)
   - Debajo: ScheduleBar
     - Slot Current (`WBP_MM_ScheduleSlot`)
     - Flecha
     - Slot Next (`WBP_MM_ScheduleSlot`)
     - mini texto: `Next in 00:05`
2. **Banner centro superior**
   - Panel ancho con fondo semitransparente + borde suave.
   - Texto: `MINUTE X: <MOD> ACTIVATED!`
3. **SmallNotifications** (derecha media)
   - VerticalBox para eventos cortos.

### Estilo visual
- Colores:
  - Rojo #D95C5C
  - Azul #5C84D9
  - Fondo panel #10131A con alpha 0.65
  - Texto principal #F2F5FF
- Bordes redondeados simulados:
  - `Border` + brush material UI simple (esquinas redondeadas)
  - si no, imagen blanca 9-slice del engine content.
- Sombra/outline en textos para legibilidad.

### Animaciones UMG
1. `Anim_BannerIn` (2s total)
   - 0.0s: pos Y -40, opacity 0, scale 0.95
   - 0.2s: pos Y 0, opacity 1, scale 1.0
   - 1.6s: opacity 1
   - 2.0s: opacity 0
2. `Anim_ScorePop`
   - scale 1.0 -> 1.12 (0.08s) -> 1.0 (0.12s)
3. `Anim_WarningPulse` (en icono “Next”)
   - loop 0.6s: opacity 1->0.65->1 y scale 1->1.05->1

### Actualización por eventos (sin tick)
- En `Construct`, obtener `BP_MM_GameState` y bind a dispatchers.
- Funciones:
  - `RefreshTimer`
  - `RefreshScore` (y play `Anim_ScorePop` solo cuando aumenta)
  - `RefreshSchedule` (actualiza current/next + timer)
  - `ShowMinuteBanner`
  - `PushNotification`

## 5.2 `WBP_MM_ScheduleSlot`
- `Overlay` con:
  - icono placeholder (TextBlock grande: G/B/F/M/S)
  - nombre corto
  - color del modifier.
- Función `SetFromModifier(ModifierEnum, DisplayName, IconText, Color)`.

## 5.3 `WBP_MM_ScoreWidget`
- Panel color equipo + nombre equipo + score grande.
- Función `SetTeamData(Team, Score)`.

## 5.4 `WBP_MM_WarningWidget`
- Mensaje “NEXT MODIFIER IN 5” + icono del próximo mod.
- Reproduce `Anim_WarningPulse`.

---

## 6) Menús básicos

## `WBP_MM_MainMenu`
- Botones: Play, Settings, Quit.
- Play: `OpenLevel` con `?listen`.
- Settings: abrir `WBP_MM_Settings`.
- Quit: `QuitGame`.

## `WBP_MM_Settings`
- Sliders:
  - Sensibilidad (guardar en `SaveGame`)
  - Volumen master
  - FOV (80–110)
- Toggle cámara opcional (invert Y o shoulder swap).

## `WBP_MM_MatchEnd`
- Texto resultado: `RED WINS`, `BLUE WINS`, `DRAW`.
- MVP: jugador con `CoresDeposited` mayor.
- Botón `Play Again` -> return lobby / restart map listen.

---

## 7) Mapa arcade (layout mínimo)

En un mapa `L_MM_Arena`:
- Centro:
  - `TargetPoint_CoreSpawn`
- Equipos:
  - 2 `PlayerStart` rojos + 2 azules (o TargetPoints por team)
  - 1 `BP_MM_ExtractorActor` por equipo
- Modificadores:
  - 2 `BP_MM_BouncePad` visibles
  - 4–6 `BP_MM_MagnetPoint`
- Navegación:
  - plataformas, rampas y cubos para verticalidad/rutas.
- Volúmenes:
  - `ExponentialHeightFog`
  - `PostProcessVolume` (unbound) para el mod Fog.

Materiales:
- MI_RedFlat, MI_BlueFlat, MI_NeutralDark, MI_AccentYellow.

---

## 8) Flujo gameplay final
1. Match inicia, Core spawnea en centro.
2. Jugador interactúa para recoger si `bCanBePicked=true`.
3. Portador sufre penalización movimiento/salto.
4. Si recibe daño/knockback: suelta core (lock pickup 0.5s).
5. Puede lanzar/pasar con throw.
6. Si core sin dueño 15s o fuera del mapa: respawn centro.
7. Depositar en extractor propio: +1, respawn inmediato core.

---

## 9) Pruebas exactas (PIE listen server)

Configuración PIE:
- Number of Players: 2 (luego 4).
- Net Mode: Play As Listen Server.
- Run Dedicated Server: OFF.

Casos:
1. Pickup/Drop:
   - Jugador A recoge core, B golpea A (daño/knockback) => core cae y no puede recogerse 0.5s.
2. Throw:
   - A lanza core y otro jugador lo recoge tras ventana válida.
3. Deposit & score:
   - A deposita en extractor propio => score +1 en todos los clientes.
4. Schedule:
   - cada 60s cambia mod; warning visible 5s antes; banner 2s al activar.
5. Swap:
   - durante minuto swap, teleports cada 12–15s sin stuck.
6. Replicación HUD:
   - timer/scores/current-next/time-to-next sincronizados en cliente.
7. MatchEnd:
   - al acabar tiempo, aparece pantalla final con resultado + MVP.

---

## 10) Checklist final MVP correcto

- [ ] Core spawnea centro y se replica estado/carry correctamente.
- [ ] Pickup/Drop/Throw validados por servidor.
- [ ] Penalización portador aplicada y revertida correctamente.
- [ ] Depositar core suma punto al equipo correcto y respawnea core.
- [ ] Failsafes: lock 0.5s + reset 15s + reset out-of-bounds.
- [ ] Schedule editable por array en editor (orden + duración).
- [ ] 5 modificadores funcionan con apply/revert.
- [ ] HUD muestra timer, scores, current/next, countdown next mod.
- [ ] Banner de minuto y micro-animaciones (score/warning) funcionando.
- [ ] Menú principal/settings/match end funcionales.
- [ ] Prueba 2–4 jugadores en PIE listen server correcta.

---

## 11) Orden recomendado de implementación (rápido y seguro)
1. GameMode/GameState/PlayerState replicación base.
2. CoreActor + Character carry/drop/throw.
3. Extractor + scoring.
4. ScheduleManager + 2 modifiers (LowGravity/Fog), luego completar 5.
5. HUD por eventos OnRep/dispatchers.
6. Menús + pulido visual + pruebas PIE 2/4.

Con esto tienes una base jugable MVP de “MINUTE MAYHEM” lista para iterar sin tocar C++.
