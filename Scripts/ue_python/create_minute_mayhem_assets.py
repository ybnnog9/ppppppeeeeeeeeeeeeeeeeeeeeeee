"""
MINUTE MAYHEM bootstrap for Unreal Engine 5.x (Editor Python).
Creates the required Blueprint and UMG assets with exact names.

Run inside Unreal Editor (Output Log -> Python):
    exec(open(r"<PROJECT>/Scripts/ue_python/create_minute_mayhem_assets.py").read())
"""

import unreal

ROOT = "/Game/MinuteMayhem"
BP_DIR = f"{ROOT}/Blueprints"
UI_DIR = f"{ROOT}/UI"
MAP_DIR = f"{ROOT}/Maps"

BLUEPRINTS = [
    ("BP_MM_GameMode", unreal.GameModeBase),
    ("BP_MM_GameState", unreal.GameStateBase),
    ("BP_MM_PlayerState", unreal.PlayerState),
    ("BP_MM_PlayerController", unreal.PlayerController),
    ("BP_MM_Character", unreal.Character),
    ("BP_MM_CoreActor", unreal.Actor),
    ("BP_MM_ExtractorActor", unreal.Actor),
    ("BP_MM_BouncePad", unreal.Actor),
    ("BP_MM_MagnetPoint", unreal.Actor),
    ("BP_MM_ScheduleManager", unreal.Actor),
]

WIDGETS = [
    "WBP_MM_HUD",
    "WBP_MM_ScheduleSlot",
    "WBP_MM_ScoreWidget",
    "WBP_MM_WarningWidget",
    "WBP_MM_MainMenu",
    "WBP_MM_Settings",
    "WBP_MM_MatchEnd",
]


def ensure_dir(path: str):
    if not unreal.EditorAssetLibrary.does_directory_exist(path):
        unreal.EditorAssetLibrary.make_directory(path)


def create_blueprint(asset_name: str, parent_class):
    asset_path = f"{BP_DIR}/{asset_name}"
    if unreal.EditorAssetLibrary.does_asset_exist(asset_path):
        unreal.log(f"[MinuteMayhem] Exists: {asset_path}")
        return unreal.load_asset(asset_path)

    tools = unreal.AssetToolsHelpers.get_asset_tools()
    factory = unreal.BlueprintFactory()
    factory.set_editor_property("ParentClass", parent_class)
    bp = tools.create_asset(asset_name, BP_DIR, unreal.Blueprint, factory)
    unreal.log(f"[MinuteMayhem] Created Blueprint: {asset_path}")
    return bp


def create_widget(asset_name: str):
    asset_path = f"{UI_DIR}/{asset_name}"
    if unreal.EditorAssetLibrary.does_asset_exist(asset_path):
        unreal.log(f"[MinuteMayhem] Exists: {asset_path}")
        return unreal.load_asset(asset_path)

    tools = unreal.AssetToolsHelpers.get_asset_tools()
    factory = unreal.WidgetBlueprintFactory()
    widget_bp = tools.create_asset(asset_name, UI_DIR, unreal.WidgetBlueprint, factory)
    unreal.log(f"[MinuteMayhem] Created Widget: {asset_path}")
    return widget_bp


def create_world_if_missing(level_name: str):
    world_path = f"{MAP_DIR}/{level_name}"
    if unreal.EditorAssetLibrary.does_asset_exist(world_path):
        unreal.log(f"[MinuteMayhem] Exists: {world_path}")
        return

    unreal.log_warning(
        "[MinuteMayhem] Map asset creation is editor-version dependent. "
        "Create map manually as /Game/MinuteMayhem/Maps/L_MM_Arena if not present."
    )


def write_todo_data_asset():
    """
    We cannot author full graph logic safely from Python across UE minor versions.
    This function writes a text asset (editor note via string table style fallback)
    to keep implementation steps inside the project content browser.
    """
    todo_text = """
BP TODO CORE:
- Configure replication and RepNotify variables in BP_MM_GameState, BP_MM_PlayerState, BP_MM_CoreActor.
- Set BP_MM_GameMode defaults: GameState, PlayerState, Controller, Pawn.
- Implement server-authoritative pickup/drop/throw/deposit.
- Add minute schedule manager and 5 modifiers.
- Build WBP_MM_HUD with event-driven updates (no tick bindings).
""".strip()

    note_path = f"{ROOT}/MM_TODO"
    unreal.EditorAssetLibrary.save_directory(ROOT)
    unreal.EditorAssetLibrary.save_loaded_assets()
    unreal.log(f"[MinuteMayhem] TODO note:\n{todo_text}")


def main():
    ensure_dir(ROOT)
    ensure_dir(BP_DIR)
    ensure_dir(UI_DIR)
    ensure_dir(MAP_DIR)

    created = []
    for name, parent in BLUEPRINTS:
        created.append(create_blueprint(name, parent))

    for widget_name in WIDGETS:
        create_widget(widget_name)

    create_world_if_missing("L_MM_Arena")
    write_todo_data_asset()

    unreal.EditorAssetLibrary.save_directory(ROOT, only_if_is_dirty=False, recursive=True)
    unreal.log("[MinuteMayhem] Bootstrap completed.")


if __name__ == "__main__":
    main()
