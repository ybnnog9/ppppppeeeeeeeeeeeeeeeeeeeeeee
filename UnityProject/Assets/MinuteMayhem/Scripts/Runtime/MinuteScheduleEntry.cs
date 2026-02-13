using UnityEngine;

namespace MinuteMayhem
{
    [System.Serializable]
    public struct MinuteScheduleEntry
    {
        public ModifierType modifier;
        public float duration;
        public string label;
        public string icon;
        public Color color;
    }
}
