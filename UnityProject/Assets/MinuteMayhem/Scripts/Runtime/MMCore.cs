using UnityEngine;

namespace MinuteMayhem
{
    [RequireComponent(typeof(Rigidbody), typeof(SphereCollider))]
    public class MMCore : MonoBehaviour
    {
        [SerializeField] private float noPickupTime = 0.5f;
        [SerializeField] private float resetNoOwnerTime = 15f;
        [SerializeField] private float throwForce = 14f;

        private Rigidbody _rb;
        private MMPlayerController _carrier;
        private float _pickupLock;
        private float _ownerless;
        private Vector3 _home;

        private void Awake()
        {
            _rb = GetComponent<Rigidbody>();
            _home = transform.position;
        }

        private void Update()
        {
            if (_carrier == null)
            {
                _ownerless += Time.deltaTime;
                if (_ownerless >= resetNoOwnerTime || transform.position.y < -20f)
                    ResetCore();
            }
            else
            {
                _ownerless = 0f;
            }

            if (_pickupLock > 0f)
                _pickupLock -= Time.deltaTime;
        }

        public bool TryPickup(MMPlayerController player)
        {
            if (_pickupLock > 0f || _carrier != null) return false;
            _carrier = player;
            _rb.isKinematic = true;
            _rb.velocity = Vector3.zero;
            _rb.angularVelocity = Vector3.zero;
            transform.SetParent(player.CoreHoldPoint, false);
            transform.localPosition = Vector3.zero;
            player.SetCarrying(this, true);
            return true;
        }

        public void Drop(Vector3 impulse)
        {
            if (_carrier == null) return;
            _carrier.SetCarrying(this, false);
            transform.SetParent(null, true);
            _carrier = null;
            _rb.isKinematic = false;
            _rb.AddForce(impulse, ForceMode.VelocityChange);
            _pickupLock = noPickupTime;
            _ownerless = 0f;
        }

        public void Throw(Vector3 direction)
        {
            Drop(direction.normalized * throwForce);
        }

        public void ResetCore()
        {
            if (_carrier != null)
            {
                _carrier.SetCarrying(this, false);
                _carrier = null;
            }

            transform.SetParent(null, true);
            transform.position = _home;
            _rb.isKinematic = false;
            _rb.velocity = Vector3.zero;
            _rb.angularVelocity = Vector3.zero;
            _pickupLock = 0f;
            _ownerless = 0f;
        }

        public MMPlayerController Carrier => _carrier;
    }
}
