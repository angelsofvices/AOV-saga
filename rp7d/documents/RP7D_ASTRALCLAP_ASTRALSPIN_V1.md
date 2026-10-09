# RP7D — Astralclap & Astralspin
**Two New Thunder-Based Astral Moves (and two new gold chests with lightbulbs for them) | Animation & Combat Wiring V1**

Both abilities belong to Rizer's existing Astral combat system. Their animations will be supplied as **two separate FBX files**, using the established Mixamo-compatible animation architecture.

## ⚡ 1. ASTRALCLAP

**Type:** Thunder / Crowd Control / Collision Attack
**Activation:** Grounded
**Targeting:** Lock-On + Area Effect

### Attack sequence

1. Rizer begins charging electrical Astral energy.
2. Electricity erupts upward from the ground beneath nearby enemies.
3. Lightning strikes affected enemies, briefly suspending or staggering them.
4. Rizer brings his hands together.
5. **At the exact moment of the clap**, the affected enemies are violently pulled toward a shared midline.
6. Their bodies collide, producing an electrical impact explosion.

**Critical mechanic:** The clap triggers the collision. Enemies must physically converge rather than simply receive damage from a visual effect.

### FBX wiring

Animation slot: `ASTRALCLAP`

| Event | Function |
|---|---|
| `CLAP_START` | Begin charge and electrical effects |
| `GROUND_STRIKE` | Lightning erupts beneath targets |
| `TARGET_SUSPEND` | Apply temporary crowd control |
| `CLAP_IMPACT` | Pull enemies together and resolve collision damage |
| `CLAP_END` | Restore normal combat control |

The animation determines the timing; the combat system controls enemy movement, collision, damage, and effects.

---

## 🌪️ 2. ASTRALSPIN

**Type:** Thunder / Storm / Area Control
**Activation:** Grounded or Airborne
**Targeting:** Area Effect

### Attack sequence

1. Rizer initiates a rapid spinning movement.
2. Electrical Astral energy gathers around his body.
3. A tornado forms beneath or around him.
4. The tornado spins along the ground surface.
5. A localized electrical storm develops around nearby enemies.
6. Enemies within the storm are affected by its wind and electrical attacks.
7. The tornado dissipates after its active duration.

**Critical mechanic:** Astralspin must work in midair. The tornado interacts with the ground surface even when Rizer activates the move above it.

### FBX wiring

Animation slot: `ASTRALSPIN`

| Event | Function |
|---|---|
| `SPIN_START` | Begin spinning animation |
| `TORNADO_SPAWN` | Create tornado at the appropriate surface position |
| `STORM_ACTIVE` | Enable storm effects and enemy interaction |
| `SPIN_RELEASE` | Transition Rizer out of the spinning motion |
| `STORM_END` | Remove tornado and restore affected enemies |

The tornado should be a separate gameplay effect, not permanently attached to Rizer's animation.

---

## 3. Shared animation architecture

```
RP7D ANIMATION LIBRARY
├── ASTRALCLAP  └── Astralclap.fbx
└── ASTRALSPIN  └── Astralspin.fbx
        ↓
EXISTING MIXAMO ANIMATION DRIVER
        ↓
ASTRAL COMBAT SYSTEM
        ↓
TARGETING / PHYSICS / DAMAGE / VFX
```

The filenames above are proposed conventions, not verified file paths.

### Development requirements

- Inspect both actual FBX files before assigning animation events.
- Preserve the existing Rizer skeleton and retargeting system.
- Reuse existing Astral energy, targeting, collision, and damage infrastructure.
- Use animation-event timing for the clap and tornado release.
- Support multiple enemies for Astralclap.
- Support airborne activation for Astralspin.
- Keep Astral costs, damage, ranges, and cooldowns configurable.
- Register both moves for future Focus Move loadout integration.
- Do not replace Astralthunder or modify unrelated Astral moves.

### Focus Move compatibility

**Lightbulb → Learn Move → Equip D-Pad Slot → Lock-On + D-Pad → Execute**

### Development sequence

**Patch 1 — Astralclap:** Import FBX, validate animation, implement ground lightning, enemy suspension, synchronized clap, and midline collision.
**Patch 2 — Astralspin:** Import FBX, validate ground/air animation, implement tornado spawning, surface movement, localized storm, and cleanup.
**Patch 3 — Focus Integration:** Register both abilities in the existing Focus Move system and verify equipped controls, Astral costs, and save persistence.

**STOP:** Do not invent additional attacks, transformations, or new combat systems.

---

## Implementation status (RP7D)

- FBX inspected and wired: `assets/anims/rizer/Astralclap.fbx` (2.667 s) and `Astralspin.fbx` (1.367 s), 30 fps, Rizer's
  33-bone mixamo skeleton (no retarget needed). Slots `astralclap` / `astralspin` (anim-assignments.js, anim-lib.js).
- Event frames, measured off the bones (`STORM_TIMING` in `developer/astral-storm.js`):

| Astralclap | t (s) | in the clip |
|---|---:|---|
| CLAP_START | 0.00 | arms rise, static jumps palm to palm |
| GROUND_STRIKE | 0.60 | crouched, hands at the ground: lightning from his palms into the ground and up under every target |
| TARGET_SUSPEND | 0.93 | rising, hands lifting: targets held ~1 u up, tethered to his hands |
| CLAP_IMPACT | 1.53 | hands swing in: the bodies are pulled to the midline |
| (contact) | 1.62 | the hands meet (93 → 14 cm): bodies collide, explosion, damage + blast-back |
| CLAP_END | 2.45 | back to rest: control restored |

| Astralspin | t (s) | in the clip |
|---|---:|---|
| SPIN_START | 0.00 | the spin starts; arcs fling off his hands |
| TORNADO_SPAWN | 0.42 | first full turn: the tornado forms on the ground below him (also when airborne) |
| STORM_ACTIVE | 0.60 | full speed (~840°/s): the storm grabs, lifts, swirls and shocks enemies |
| SPIN_RELEASE | 1.00 | slowing, arms opening: Rizer is out of the spin |
| STORM_END | 5.60 | the tornado dissipates (`STORM.spin.life` after STORM_ACTIVE) and lets everyone go |

- Enemy reactions: held / swirled bodies are electrocuted (Seers' `shocked` reaction), the clap collision and the storm's
  end throw them back (blast-back). Costs, damage, ranges, cooldowns: `STORM` in `astral-storm.js`.
- Focus: both learned from new gold-chest Lightbulbs (Astralclap · south Malezor, Astralspin · northwest), equipped on
  the D-pad; Astralspin needs no lock and casts in the air.
