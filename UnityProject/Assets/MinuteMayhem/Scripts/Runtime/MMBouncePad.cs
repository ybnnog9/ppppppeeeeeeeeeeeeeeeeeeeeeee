using UnityEngine;

namespace MinuteMayhem
{
    [RequireComponent(typeof(Collider))]
    public class MMBouncePad : MonoBehaviour
    {
        [SerializeField] private float launchForce = 15f;
        [SerializeField] private bool enabledByModifier;

        public void SetEnabled(bool value) => enabledByModifier = value;

        private void OnTriggerEnter(Collider other)
        {
            if (!enabledByModifier) return;
            var cc = other.GetComponent<CharacterController>();
            if (cc == null) return;

            var root = cc.transform;
            root.position += (transform.up + transform.forward) * (launchForce * 0.15f);
        }
    }
}
