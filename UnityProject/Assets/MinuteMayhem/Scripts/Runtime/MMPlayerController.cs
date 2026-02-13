using UnityEngine;

namespace MinuteMayhem
{
    [RequireComponent(typeof(CharacterController))]
    public class MMPlayerController : MonoBehaviour
    {
        [SerializeField] private Team team;
        [SerializeField] private float moveSpeed = 7f;
        [SerializeField] private float jumpForce = 7f;
        [SerializeField] private float gravity = -20f;
        [SerializeField] private float carrySpeedMultiplier = 0.85f;
        [SerializeField] private float carryJumpMultiplier = 0.90f;
        [SerializeField] private Camera playerCamera;
        [SerializeField] private Transform coreHoldPoint;

        private CharacterController _controller;
        private Vector3 _velocity;
        private MMCore _carriedCore;

        public Transform CoreHoldPoint => coreHoldPoint;
        public Team Team => team;

        private void Awake()
        {
            _controller = GetComponent<CharacterController>();
            if (playerCamera == null)
                playerCamera = Camera.main;
        }

        private void Start()
        {
            MMGameManager.Instance?.RegisterPlayer(this);
        }

        private void Update()
        {
            HandleMove();
            HandleActions();
        }

        private void HandleMove()
        {
            var h = Input.GetAxis("Horizontal");
            var v = Input.GetAxis("Vertical");
            var move = (transform.right * h + transform.forward * v);

            var speed = moveSpeed * (_carriedCore != null ? carrySpeedMultiplier : 1f);
            _controller.Move(move * speed * Time.deltaTime);

            if (_controller.isGrounded && _velocity.y < 0f)
                _velocity.y = -2f;

            if (Input.GetButtonDown("Jump") && _controller.isGrounded)
            {
                var jumpMul = _carriedCore != null ? carryJumpMultiplier : 1f;
                _velocity.y = jumpForce * jumpMul;
            }

            _velocity.y += gravity * Time.deltaTime;
            _controller.Move(_velocity * Time.deltaTime);

            var mx = Input.GetAxis("Mouse X");
            transform.Rotate(Vector3.up * mx * 3f);
        }

        private void HandleActions()
        {
            if (Input.GetKeyDown(KeyCode.E))
            {
                if (_carriedCore != null) return;
                var hit = Physics.OverlapSphere(transform.position + transform.forward, 2f);
                foreach (var c in hit)
                {
                    var core = c.GetComponent<MMCore>();
                    if (core != null && core.TryPickup(this))
                        break;
                }
            }

            if (Input.GetMouseButtonDown(1) && _carriedCore != null)
            {
                var dir = playerCamera != null ? playerCamera.transform.forward : transform.forward;
                _carriedCore.Throw(dir + Vector3.up * 0.2f);
            }
        }

        public void SetCarrying(MMCore core, bool value)
        {
            _carriedCore = value ? core : null;
        }

        public void TeleportTo(Vector3 worldPos)
        {
            _controller.enabled = false;
            transform.position = worldPos;
            _controller.enabled = true;
        }

        private void OnControllerColliderHit(ControllerColliderHit hit)
        {
            if (_carriedCore != null && hit.collider.CompareTag("DamageZone"))
            {
                _carriedCore.Drop(transform.forward * 3f + Vector3.up * 2f);
            }
        }
    }
}
