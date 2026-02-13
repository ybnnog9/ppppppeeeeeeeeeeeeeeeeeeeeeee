"""
Build a consistent arcade environment blockout for MINUTE MAYHEM.
Run in Unreal Editor Python console after opening /Game/MinuteMayhem/Maps/L_MM_Arena.

exec(open(r"<PROJECT>/Scripts/ue_python/build_mm_environment.py").read())
"""

import unreal

LEVEL_NAME = "L_MM_Arena"

FLOOR_SIZE = unreal.Vector(120.0, 120.0, 1.0)   # 120m x 120m
WALL_HEIGHT = 15.0
WALL_THICKNESS = 1.0
ARENA_HALF = 6000.0


def log(msg):
    unreal.log(f"[MM_ENV] {msg}")


def ensure_level_opened():
    world = unreal.EditorLevelLibrary.get_editor_world()
    if not world:
        raise RuntimeError("No editor world available.")


def load_mesh(path):
    mesh = unreal.EditorAssetLibrary.load_asset(path)
    if not mesh:
        raise RuntimeError(f"Cannot load mesh: {path}")
    return mesh


def spawn_static(mesh, location, scale, rotation=unreal.Rotator(0, 0, 0), label="MM_SM"):
    actor = unreal.EditorLevelLibrary.spawn_actor_from_class(unreal.StaticMeshActor, location, rotation)
    smc = actor.static_mesh_component
    smc.set_static_mesh(mesh)
    actor.set_actor_scale3d(scale)
    actor.set_actor_label(label)
    return actor


def spawn_target_point(location, label, tag):
    actor = unreal.EditorLevelLibrary.spawn_actor_from_class(unreal.TargetPoint, location, unreal.Rotator(0, 0, 0))
    actor.set_actor_label(label)
    actor.tags = [tag]
    return actor


def spawn_player_start(location, rotation, label, team_tag):
    ps = unreal.EditorLevelLibrary.spawn_actor_from_class(unreal.PlayerStart, location, rotation)
    ps.set_actor_label(label)
    ps.tags = [team_tag]
    return ps


def spawn_volume(actor_class, location, scale, label):
    actor = unreal.EditorLevelLibrary.spawn_actor_from_class(actor_class, location, unreal.Rotator(0, 0, 0))
    actor.set_actor_scale3d(scale)
    actor.set_actor_label(label)
    return actor


def apply_basic_lighting():
    sun = unreal.EditorLevelLibrary.spawn_actor_from_class(unreal.DirectionalLight, unreal.Vector(-1000, 2000, 3000), unreal.Rotator(-35, -40, 0))
    sun.set_actor_label("MM_DirectionalLight")

    sky = unreal.EditorLevelLibrary.spawn_actor_from_class(unreal.SkyLight, unreal.Vector(0, 0, 1000), unreal.Rotator(0, 0, 0))
    sky.set_actor_label("MM_SkyLight")

    fog = unreal.EditorLevelLibrary.spawn_actor_from_class(unreal.ExponentialHeightFog, unreal.Vector(0, 0, 0), unreal.Rotator(0, 0, 0))
    fog.set_actor_label("MM_ExponentialHeightFog")

    ppv = spawn_volume(unreal.PostProcessVolume, unreal.Vector(0, 0, 0), unreal.Vector(100, 100, 20), "MM_PostProcessVolume")
    ppv.set_editor_property("b_unbound", True)

    log("Lighting actors created (DirectionalLight, SkyLight, Fog, PostProcessVolume).")


def build_arena_geometry():
    cube = load_mesh("/Engine/BasicShapes/Cube.Cube")

    # Floor
    spawn_static(cube, unreal.Vector(0, 0, -100), FLOOR_SIZE, label="MM_Floor_Main")

    # Arena walls
    wall_scale_x = unreal.Vector(WALL_THICKNESS, 120.0, WALL_HEIGHT)
    wall_scale_y = unreal.Vector(120.0, WALL_THICKNESS, WALL_HEIGHT)
    spawn_static(cube, unreal.Vector(ARENA_HALF, 0, WALL_HEIGHT * 50), wall_scale_x, label="MM_Wall_East")
    spawn_static(cube, unreal.Vector(-ARENA_HALF, 0, WALL_HEIGHT * 50), wall_scale_x, label="MM_Wall_West")
    spawn_static(cube, unreal.Vector(0, ARENA_HALF, WALL_HEIGHT * 50), wall_scale_y, label="MM_Wall_North")
    spawn_static(cube, unreal.Vector(0, -ARENA_HALF, WALL_HEIGHT * 50), wall_scale_y, label="MM_Wall_South")

    # Central platform + side verticality
    spawn_static(cube, unreal.Vector(0, 0, 100), unreal.Vector(8.0, 8.0, 0.8), label="MM_Platform_Center")
    spawn_static(cube, unreal.Vector(2200, 0, 450), unreal.Vector(6.0, 6.0, 0.8), label="MM_Platform_East_Upper")
    spawn_static(cube, unreal.Vector(-2200, 0, 450), unreal.Vector(6.0, 6.0, 0.8), label="MM_Platform_West_Upper")
    spawn_static(cube, unreal.Vector(0, 2200, 300), unreal.Vector(5.0, 5.0, 0.8), label="MM_Platform_North")
    spawn_static(cube, unreal.Vector(0, -2200, 300), unreal.Vector(5.0, 5.0, 0.8), label="MM_Platform_South")

    # Simple cover blocks
    cover_positions = [
        (1300, 1300, 120), (-1300, 1300, 120),
        (1300, -1300, 120), (-1300, -1300, 120),
        (2800, 700, 120), (-2800, -700, 120),
    ]
    for i, (x, y, z) in enumerate(cover_positions):
        spawn_static(cube, unreal.Vector(x, y, z), unreal.Vector(1.2, 2.4, 2.4), label=f"MM_Cover_{i+1}")

    log("Arena geometry blockout created.")


def place_gameplay_points():
    # Team spawn regions
    spawn_player_start(unreal.Vector(-4500, -500, 140), unreal.Rotator(0, 0, 0), "MM_PS_Red_01", "TeamRed")
    spawn_player_start(unreal.Vector(-4500, 500, 140), unreal.Rotator(0, 0, 0), "MM_PS_Red_02", "TeamRed")
    spawn_player_start(unreal.Vector(4500, -500, 140), unreal.Rotator(0, 180, 0), "MM_PS_Blue_01", "TeamBlue")
    spawn_player_start(unreal.Vector(4500, 500, 140), unreal.Rotator(0, 180, 0), "MM_PS_Blue_02", "TeamBlue")

    # Core spawn point
    spawn_target_point(unreal.Vector(0, 0, 320), "MM_Target_CoreSpawn", "CoreSpawn")

    # Safe swap points (8)
    swap_points = [
        (-3000, -2200, 220), (-3000, 2200, 220),
        (3000, -2200, 220), (3000, 2200, 220),
        (-1200, 0, 220), (1200, 0, 220),
        (0, -1200, 220), (0, 1200, 220),
    ]
    for i, (x, y, z) in enumerate(swap_points):
        spawn_target_point(unreal.Vector(x, y, z), f"MM_Target_SafeSwap_{i+1}", "SafeSwap")

    log("Gameplay points placed (PlayerStarts + CoreSpawn + SafeSwap points).")


def main():
    ensure_level_opened()
    apply_basic_lighting()
    build_arena_geometry()
    place_gameplay_points()

    unreal.EditorLevelLibrary.save_current_level()
    log("Environment generation completed and level saved.")


if __name__ == "__main__":
    main()
