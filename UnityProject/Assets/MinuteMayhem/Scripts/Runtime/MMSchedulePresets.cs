using System.Collections.Generic;
using UnityEngine;

namespace MinuteMayhem
{
    public static class MMSchedulePresets
    {
        /// <summary>
        /// SCHEDULE 1 exacto (base): 5 bloques de 60s.
        /// Orden: LOW GRAVITY -> BOUNCY -> FOG -> MAGNET -> SWAP.
        /// </summary>
        public static List<MinuteScheduleEntry> Schedule1Base()
        {
            return new List<MinuteScheduleEntry>
            {
                new MinuteScheduleEntry
                {
                    modifier = ModifierType.LowGravity,
                    duration = 60f,
                    label = "LOW GRAVITY",
                    icon = "G",
                    color = new Color(0.55f, 0.75f, 1f)
                },
                new MinuteScheduleEntry
                {
                    modifier = ModifierType.Bouncy,
                    duration = 60f,
                    label = "BOUNCY",
                    icon = "B",
                    color = new Color(1f, 0.7f, 0.35f)
                },
                new MinuteScheduleEntry
                {
                    modifier = ModifierType.Fog,
                    duration = 60f,
                    label = "FOG",
                    icon = "F",
                    color = new Color(0.7f, 0.8f, 0.9f)
                },
                new MinuteScheduleEntry
                {
                    modifier = ModifierType.Magnet,
                    duration = 60f,
                    label = "MAGNET",
                    icon = "M",
                    color = new Color(0.75f, 1f, 0.75f)
                },
                new MinuteScheduleEntry
                {
                    modifier = ModifierType.Swap,
                    duration = 60f,
                    label = "SWAP",
                    icon = "S",
                    color = new Color(1f, 0.6f, 0.8f)
                }
            };
        }
    }
}
