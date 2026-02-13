using UnityEngine;

namespace MinuteMayhem
{
    [RequireComponent(typeof(Collider))]
    public class MMExtractor : MonoBehaviour
    {
        [SerializeField] private Team team;

        private void OnTriggerEnter(Collider other)
        {
            var player = other.GetComponent<MMPlayerController>();
            if (player == null || player.Team != team) return;

            var core = FindObjectOfType<MMCore>();
            if (core != null && core.Carrier == player)
                MMGameManager.Instance?.AddScore(team);
        }
    }
}
