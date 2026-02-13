using System.IO;
using MinuteMayhem;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.UI;

public static class MMCompleteBuilder
{
    private const string Root = "Assets/MinuteMayhem";

    [MenuItem("MinuteMayhem/Build COMPLETE Unity Setup")]
    public static void BuildComplete()
    {
        EnsureFolders();
        var red = CreateMaterial("MM_Red", new Color(0.85f, 0.35f, 0.35f));
        var blue = CreateMaterial("MM_Blue", new Color(0.35f, 0.52f, 0.85f));
        var dark = CreateMaterial("MM_Dark", new Color(0.08f, 0.1f, 0.15f));
        var accent = CreateMaterial("MM_Accent", new Color(1f, 0.8f, 0.2f));

        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        scene.name = "L_MM_Arena";

        BuildLighting();
        BuildArenaGeometry(dark);
        var coreSpawn = CreateCoreSpawn();
        BuildGameplayObjects(red, blue, accent);
        BuildPlayers(red, blue);
        BuildHud();
        BuildGameManager(coreSpawn);

        EditorSceneManager.SaveScene(scene, $"{Root}/Scenes/L_MM_Arena.unity");
        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();

        Debug.Log("[MinuteMayhem] Complete Unity environment generated. Open Assets/MinuteMayhem/Scenes/L_MM_Arena.unity");
    }

    private static void EnsureFolders()
    {
        if (!AssetDatabase.IsValidFolder(Root)) AssetDatabase.CreateFolder("Assets", "MinuteMayhem");
        if (!AssetDatabase.IsValidFolder($"{Root}/Scenes")) AssetDatabase.CreateFolder(Root, "Scenes");
        if (!AssetDatabase.IsValidFolder($"{Root}/Materials")) AssetDatabase.CreateFolder(Root, "Materials");
        if (!AssetDatabase.IsValidFolder($"{Root}/Prefabs")) AssetDatabase.CreateFolder(Root, "Prefabs");
    }

    private static Material CreateMaterial(string name, Color color)
    {
        var path = $"{Root}/Materials/{name}.mat";
        var mat = AssetDatabase.LoadAssetAtPath<Material>(path);
        if (mat != null) return mat;

        var shader = Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");
        mat = new Material(shader) { color = color };
        AssetDatabase.CreateAsset(mat, path);
        return mat;
    }

    private static void BuildLighting()
    {
        var sun = new GameObject("MM_DirectionalLight");
        var sunLight = sun.AddComponent<Light>();
        sunLight.type = LightType.Directional;
        sun.transform.rotation = Quaternion.Euler(50f, -30f, 0f);

        var cam = new GameObject("Main Camera");
        cam.tag = "MainCamera";
        cam.AddComponent<Camera>();
        cam.transform.position = new Vector3(0f, 12f, -18f);
        cam.transform.rotation = Quaternion.Euler(18f, 0f, 0f);

        RenderSettings.ambientLight = new Color(0.45f, 0.45f, 0.5f);
    }

    private static void BuildArenaGeometry(Material mat)
    {
        var floor = GameObject.CreatePrimitive(PrimitiveType.Cube);
        floor.name = "MM_Floor";
        floor.transform.position = new Vector3(0f, -0.5f, 0f);
        floor.transform.localScale = new Vector3(120f, 1f, 120f);
        floor.GetComponent<Renderer>().sharedMaterial = mat;

        CreateWall(new Vector3(0, 5, 60), new Vector3(120, 10, 1), mat, "MM_Wall_N");
        CreateWall(new Vector3(0, 5, -60), new Vector3(120, 10, 1), mat, "MM_Wall_S");
        CreateWall(new Vector3(60, 5, 0), new Vector3(1, 10, 120), mat, "MM_Wall_E");
        CreateWall(new Vector3(-60, 5, 0), new Vector3(1, 10, 120), mat, "MM_Wall_W");

        CreatePlatform(new Vector3(0, 2, 0), new Vector3(12, 1, 12), mat, "MM_Platform_Center");
        CreatePlatform(new Vector3(20, 4, 0), new Vector3(10, 1, 10), mat, "MM_Platform_East");
        CreatePlatform(new Vector3(-20, 4, 0), new Vector3(10, 1, 10), mat, "MM_Platform_West");
    }

    private static void CreateWall(Vector3 pos, Vector3 scale, Material mat, string name)
    {
        var go = GameObject.CreatePrimitive(PrimitiveType.Cube);
        go.name = name;
        go.transform.position = pos;
        go.transform.localScale = scale;
        go.GetComponent<Renderer>().sharedMaterial = mat;
    }

    private static void CreatePlatform(Vector3 pos, Vector3 scale, Material mat, string name)
    {
        var go = GameObject.CreatePrimitive(PrimitiveType.Cube);
        go.name = name;
        go.transform.position = pos;
        go.transform.localScale = scale;
        go.GetComponent<Renderer>().sharedMaterial = mat;
    }

    private static Transform CreateCoreSpawn()
    {
        var spawn = new GameObject("MM_CoreSpawn").transform;
        spawn.position = new Vector3(0f, 3f, 0f);
        return spawn;
    }

    private static void BuildGameplayObjects(Material red, Material blue, Material accent)
    {
        CreateExtractor(new Vector3(-45f, 1f, 0f), Team.Red, red, "MM_Extractor_Red");
        CreateExtractor(new Vector3(45f, 1f, 0f), Team.Blue, blue, "MM_Extractor_Blue");

        CreateBouncePad(new Vector3(-10f, 1f, 18f), accent, "MM_BouncePad_1");
        CreateBouncePad(new Vector3(10f, 1f, -18f), accent, "MM_BouncePad_2");

        for (int i = 0; i < 6; i++)
        {
            var angle = i * Mathf.PI * 2f / 6f;
            CreateMagnetPoint(new Vector3(Mathf.Cos(angle) * 28f, 1f, Mathf.Sin(angle) * 28f), "MM_Magnet_" + (i + 1));
        }
    }

    private static void CreateExtractor(Vector3 pos, Team team, Material mat, string name)
    {
        var go = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        go.name = name;
        go.transform.position = pos;
        go.transform.localScale = new Vector3(3f, 1f, 3f);
        go.GetComponent<Renderer>().sharedMaterial = mat;

        var col = go.GetComponent<Collider>();
        col.isTrigger = true;

        var ex = go.AddComponent<MMExtractor>();
        var so = new SerializedObject(ex);
        so.FindProperty("team").enumValueIndex = (int)team;
        so.ApplyModifiedPropertiesWithoutUndo();
    }

    private static void CreateBouncePad(Vector3 pos, Material mat, string name)
    {
        var go = GameObject.CreatePrimitive(PrimitiveType.Cube);
        go.name = name;
        go.transform.position = pos;
        go.transform.localScale = new Vector3(4f, 0.5f, 4f);
        go.GetComponent<Renderer>().sharedMaterial = mat;
        go.GetComponent<Collider>().isTrigger = true;
        go.AddComponent<MMBouncePad>();
    }

    private static void CreateMagnetPoint(Vector3 pos, string name)
    {
        var go = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        go.name = name;
        go.transform.position = pos;
        go.transform.localScale = Vector3.one * 2f;
        Object.DestroyImmediate(go.GetComponent<Collider>());
        go.AddComponent<MMMagnetPoint>();
    }

    private static void BuildPlayers(Material red, Material blue)
    {
        CreatePlayer(new Vector3(-48f, 1f, -5f), Team.Red, red, "MM_Player_Red");
        CreatePlayer(new Vector3(48f, 1f, 5f), Team.Blue, blue, "MM_Player_Blue");
    }

    private static void CreatePlayer(Vector3 pos, Team team, Material mat, string name)
    {
        var root = GameObject.CreatePrimitive(PrimitiveType.Capsule);
        root.name = name;
        root.transform.position = pos;
        root.GetComponent<Renderer>().sharedMaterial = mat;

        var cc = root.AddComponent<CharacterController>();
        cc.height = 2f;
        cc.radius = 0.4f;

        var hold = new GameObject("CoreHoldPoint").transform;
        hold.SetParent(root.transform);
        hold.localPosition = new Vector3(0f, 1.3f, 0.6f);

        var controller = root.AddComponent<MMPlayerController>();
        var so = new SerializedObject(controller);
        so.FindProperty("team").enumValueIndex = (int)team;
        so.FindProperty("coreHoldPoint").objectReferenceValue = hold;
        so.ApplyModifiedPropertiesWithoutUndo();
    }

    private static void BuildHud()
    {
        var canvasGo = new GameObject("MM_HUD", typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
        var canvas = canvasGo.GetComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;

        var hud = canvasGo.AddComponent<MMHud>();
        var timer = CreateText(canvasGo.transform, "Timer", new Vector2(0.5f, 0.95f), 42, TextAnchor.MiddleCenter);
        var score = CreateText(canvasGo.transform, "Score", new Vector2(0.5f, 0.88f), 28, TextAnchor.MiddleCenter);
        var schedule = CreateText(canvasGo.transform, "Schedule", new Vector2(0.5f, 0.82f), 22, TextAnchor.MiddleCenter);
        var banner = CreateText(canvasGo.transform, "Banner", new Vector2(0.5f, 0.75f), 30, TextAnchor.MiddleCenter);

        var so = new SerializedObject(hud);
        so.FindProperty("timerText").objectReferenceValue = timer;
        so.FindProperty("scoreText").objectReferenceValue = score;
        so.FindProperty("scheduleText").objectReferenceValue = schedule;
        so.FindProperty("bannerText").objectReferenceValue = banner;
        so.ApplyModifiedPropertiesWithoutUndo();
    }

    private static Text CreateText(Transform parent, string name, Vector2 anchor, int size, TextAnchor align)
    {
        var go = new GameObject(name, typeof(RectTransform), typeof(Text));
        go.transform.SetParent(parent, false);
        var rt = go.GetComponent<RectTransform>();
        rt.anchorMin = anchor;
        rt.anchorMax = anchor;
        rt.anchoredPosition = Vector2.zero;
        rt.sizeDelta = new Vector2(1200, 80);

        var txt = go.GetComponent<Text>();
        txt.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
        txt.fontSize = size;
        txt.alignment = align;
        txt.color = Color.white;
        txt.text = name;
        return txt;
    }

    private static void BuildGameManager(Transform coreSpawn)
    {
        var gmGo = new GameObject("MM_GameManager");
        var gm = gmGo.AddComponent<MMGameManager>();

        var core = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        core.name = "MM_CorePrefab_Runtime";
        core.transform.position = new Vector3(0f, -1000f, 0f);
        core.transform.localScale = Vector3.one * 1.2f;
        core.AddComponent<Rigidbody>();
        var coreScript = core.AddComponent<MMCore>();

        var prefabPath = $"{Root}/Prefabs/MM_Core.prefab";
        var prefab = PrefabUtility.SaveAsPrefabAsset(core, prefabPath);
        Object.DestroyImmediate(core);

        var so = new SerializedObject(gm);
        so.FindProperty("coreSpawn").objectReferenceValue = coreSpawn;
        so.FindProperty("corePrefab").objectReferenceValue = prefab.GetComponent<MMCore>();

        var pads = Object.FindObjectsOfType<MMBouncePad>();
        var magnets = Object.FindObjectsOfType<MMMagnetPoint>();

        var padsProp = so.FindProperty("bouncePads");
        padsProp.arraySize = pads.Length;
        for (int i = 0; i < pads.Length; i++) padsProp.GetArrayElementAtIndex(i).objectReferenceValue = pads[i];

        var magsProp = so.FindProperty("magnetPoints");
        magsProp.arraySize = magnets.Length;
        for (int i = 0; i < magnets.Length; i++) magsProp.GetArrayElementAtIndex(i).objectReferenceValue = magnets[i];

        so.ApplyModifiedPropertiesWithoutUndo();
    }
}
