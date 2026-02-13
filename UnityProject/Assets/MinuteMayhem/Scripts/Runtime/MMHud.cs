using UnityEngine;
using UnityEngine.UI;

namespace MinuteMayhem
{
    public class MMHud : MonoBehaviour
    {
        [SerializeField] private Text timerText;
        [SerializeField] private Text scoreText;
        [SerializeField] private Text scheduleText;
        [SerializeField] private Text bannerText;

        private float _bannerTimer;

        private void Start()
        {
            var gm = MMGameManager.Instance;
            if (gm == null) return;

            gm.OnTimeChanged += HandleTime;
            gm.OnScoreChanged += HandleScore;
            gm.OnScheduleChanged += HandleSchedule;
            gm.OnBanner += ShowBanner;
        }

        private void Update()
        {
            if (_bannerTimer <= 0f) return;
            _bannerTimer -= Time.deltaTime;
            if (_bannerTimer <= 0f && bannerText != null)
                bannerText.text = string.Empty;
        }

        private void HandleTime(float value)
        {
            if (timerText == null) return;
            int mins = Mathf.FloorToInt(value / 60f);
            int secs = Mathf.FloorToInt(value % 60f);
            timerText.text = $"{mins:00}:{secs:00}";
        }

        private void HandleScore(int red, int blue)
        {
            if (scoreText != null)
                scoreText.text = $"RED {red}  -  {blue} BLUE";
        }

        private void HandleSchedule(MinuteScheduleEntry current, MinuteScheduleEntry next, float remaining)
        {
            if (scheduleText != null)
                scheduleText.text = $"{current.icon} {current.label}  | NEXT: {next.icon} {next.label} in {Mathf.CeilToInt(remaining)}";
        }

        private void ShowBanner(string msg)
        {
            if (bannerText == null) return;
            bannerText.text = msg;
            _bannerTimer = 2f;
        }
    }
}
