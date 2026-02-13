using System;
using System.Collections.Generic;
using UnityEngine;

namespace MinuteMayhem
{
    public class MMGameManager : MonoBehaviour
    {
        public static MMGameManager Instance { get; private set; }

        [Header("Match")]
        [SerializeField] private float matchDuration = 420f;
        [SerializeField] private Transform coreSpawn;
        [SerializeField] private MMCore corePrefab;

        [Header("Schedule")]
        [SerializeField] private List<MinuteScheduleEntry> schedule = new();
        [SerializeField] private float warningTime = 5f;

        [Header("Modifier Targets")]
        [SerializeField] private List<MMBouncePad> bouncePads = new();
        [SerializeField] private List<MMMagnetPoint> magnetPoints = new();
        [SerializeField] private List<Transform> swapPoints = new();
        [SerializeField] private ParticleSystem fogVfx;

        public event Action<float> OnTimeChanged;
        public event Action<int, int> OnScoreChanged;
        public event Action<MinuteScheduleEntry, MinuteScheduleEntry, float> OnScheduleChanged;
        public event Action<string> OnBanner;

        private float _timeRemaining;
        private int _scoreRed;
        private int _scoreBlue;
        private int _index;
        private float _blockRemaining;
        private float _swapTick;

        private readonly List<MMPlayerController> _players = new();
        private MMCore _core;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
        }

        private void Start()
        {
            if (schedule.Count == 0)
            {
                schedule = DefaultSchedule();
            }

            _timeRemaining = matchDuration;
            _index = 0;
            _blockRemaining = Mathf.Max(1f, schedule[_index].duration);
            SpawnCore();
            ApplyModifier(schedule[_index].modifier);
            PushHudUpdates();
        }

        private void Update()
        {
            if (_timeRemaining <= 0f)
                return;

            _timeRemaining -= Time.deltaTime;
            _blockRemaining -= Time.deltaTime;
            OnTimeChanged?.Invoke(Mathf.Max(0f, _timeRemaining));

            if (schedule[_index].modifier == ModifierType.Swap)
            {
                _swapTick -= Time.deltaTime;
                if (_swapTick <= 0f)
                {
                    _swapTick = UnityEngine.Random.Range(12f, 15f);
                    SwapTwoRandomPlayers();
                }
            }

            if (_blockRemaining <= 0f)
            {
                RevertModifier(schedule[_index].modifier);
                _index = (_index + 1) % schedule.Count;
                _blockRemaining = Mathf.Max(1f, schedule[_index].duration);
                ApplyModifier(schedule[_index].modifier);
                OnBanner?.Invoke($"MINUTE {_index + 1}: {schedule[_index].label} ACTIVATED!");
            }

            var next = schedule[(_index + 1) % schedule.Count];
            OnScheduleChanged?.Invoke(schedule[_index], next, _blockRemaining);
            if (Mathf.Abs(_blockRemaining - warningTime) < Time.deltaTime)
                OnBanner?.Invoke($"NEXT: {next.label} IN 5s");
        }

        public void RegisterPlayer(MMPlayerController player)
        {
            if (!_players.Contains(player))
                _players.Add(player);
        }

        public void AddScore(Team team)
        {
            if (team == Team.Red) _scoreRed++;
            else _scoreBlue++;
            OnScoreChanged?.Invoke(_scoreRed, _scoreBlue);
            RespawnCore();
        }

        public void RespawnCore()
        {
            if (_core == null) return;
            _core.transform.SetPositionAndRotation(coreSpawn.position, Quaternion.identity);
            _core.ResetCore();
        }

        private void SpawnCore()
        {
            if (corePrefab == null || coreSpawn == null) return;
            _core = Instantiate(corePrefab, coreSpawn.position, Quaternion.identity);
        }

        private void PushHudUpdates()
        {
            OnTimeChanged?.Invoke(_timeRemaining);
            OnScoreChanged?.Invoke(_scoreRed, _scoreBlue);
            OnScheduleChanged?.Invoke(schedule[_index], schedule[(_index + 1) % schedule.Count], _blockRemaining);
            OnBanner?.Invoke($"MINUTE 1: {schedule[_index].label} ACTIVATED!");
        }

        private void ApplyModifier(ModifierType type)
        {
            switch (type)
            {
                case ModifierType.LowGravity:
                    Physics.gravity = new Vector3(0f, -5f, 0f);
                    break;
                case ModifierType.Bouncy:
                    bouncePads.ForEach(x => x.SetEnabled(true));
                    break;
                case ModifierType.Fog:
                    if (fogVfx != null) fogVfx.Play();
                    break;
                case ModifierType.Magnet:
                    magnetPoints.ForEach(x => x.SetActive(true));
                    break;
                case ModifierType.Swap:
                    _swapTick = UnityEngine.Random.Range(4f, 6f);
                    break;
            }
        }

        private void RevertModifier(ModifierType type)
        {
            switch (type)
            {
                case ModifierType.LowGravity:
                    Physics.gravity = new Vector3(0f, -9.81f, 0f);
                    break;
                case ModifierType.Bouncy:
                    bouncePads.ForEach(x => x.SetEnabled(false));
                    break;
                case ModifierType.Fog:
                    if (fogVfx != null) fogVfx.Stop();
                    break;
                case ModifierType.Magnet:
                    magnetPoints.ForEach(x => x.SetActive(false));
                    break;
            }
        }

        private void SwapTwoRandomPlayers()
        {
            if (_players.Count < 2) return;
            var a = _players[UnityEngine.Random.Range(0, _players.Count)];
            var b = _players[UnityEngine.Random.Range(0, _players.Count)];
            if (a == b) return;

            var posA = a.transform.position;
            var posB = b.transform.position;

            if (swapPoints.Count >= 2)
            {
                var p1 = swapPoints[UnityEngine.Random.Range(0, swapPoints.Count)].position;
                var p2 = swapPoints[UnityEngine.Random.Range(0, swapPoints.Count)].position;
                a.TeleportTo(p1);
                b.TeleportTo(p2);
            }
            else
            {
                a.TeleportTo(posB);
                b.TeleportTo(posA);
            }
        }

        private static List<MinuteScheduleEntry> DefaultSchedule() => new()
        {
            new MinuteScheduleEntry{modifier=ModifierType.LowGravity,duration=60f,label="LOW GRAVITY",icon="G",color=new Color(0.55f,0.75f,1f)},
            new MinuteScheduleEntry{modifier=ModifierType.Bouncy,duration=60f,label="BOUNCY",icon="B",color=new Color(1f,0.7f,0.35f)},
            new MinuteScheduleEntry{modifier=ModifierType.Fog,duration=60f,label="FOG",icon="F",color=new Color(0.7f,0.8f,0.9f)},
            new MinuteScheduleEntry{modifier=ModifierType.Magnet,duration=60f,label="MAGNET",icon="M",color=new Color(0.75f,1f,0.75f)},
            new MinuteScheduleEntry{modifier=ModifierType.Swap,duration=60f,label="SWAP",icon="S",color=new Color(1f,0.6f,0.8f)}
        };
    }
}
