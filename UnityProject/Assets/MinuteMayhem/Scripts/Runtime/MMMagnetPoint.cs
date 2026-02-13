using UnityEngine;

namespace MinuteMayhem
{
    public class MMMagnetPoint : MonoBehaviour
    {
        [SerializeField] private float radius = 8f;
        [SerializeField] private float pullForce = 10f;
        [SerializeField] private bool active;

        public void SetActive(bool value) => active = value;

        private void Update()
        {
            if (!active) return;

            var colliders = Physics.OverlapSphere(transform.position, radius);
            foreach (var c in colliders)
            {
                var player = c.GetComponent<MMPlayerController>();
                if (player == null) continue;

                var dir = (transform.position - player.transform.position).normalized;
                player.TeleportTo(player.transform.position + dir * (pullForce * Time.deltaTime));
            }
        }
    }
}
