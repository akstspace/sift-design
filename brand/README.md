# Sift Design mark

<img src="sift-design-mark-animated.svg" width="96" alt="The Sift Design mark: a sea-green S drawn in one stroke on a slate tile, ending in a coral dot">

One unbroken sea stroke for the S, ending in a coral dot, like a sentence that ends on its point. The S is the work. The dot is what is left after sifting.

## Files

| File | Use |
|---|---|
| [sift-design-mark.svg](sift-design-mark.svg) | Primary mark on its slate tile. Use this almost everywhere: favicons, app icons, headers. |
| [sift-design-mark-animated.svg](sift-design-mark-animated.svg) | The primary mark with its entrance built in. It plays once and honors reduced motion. |
| [sift-design-mark-on-dark.svg](sift-design-mark-on-dark.svg) | Without the tile, for backgrounds that are already slate or darker. |
| [sift-design-mark-mono.svg](sift-design-mark-mono.svg) | One color (slate), for light backgrounds where the tile does not fit. |

## Geometry

The viewBox is 64 by 64.

- **Tile:** a 64 by 64 rounded square, radius 15, in slate `#2b2539`.
- **S:** the single path `M45 16 H27.5 A8 8 0 0 0 27.5 32 H36.5 A8 8 0 0 1 36.5 48 H27`. It is drawn in sea `#bed3cc` with a 6.5 stroke and round caps and joins.
- **Dot:** a circle at (17.5, 48), radius 4.6, in coral `#efc8c8`.

Leave clear space of at least a quarter of the mark's width on every side. The smallest size is 16px; below 24px, use the tile version.

## Entrance

1. The S draws from its top end in one motion: `stroke-dashoffset` goes from 1 to 0 over 700ms, using `cubic-bezier(.16, 1, .3, 1)`.
2. At 560ms the dot pops in on `spring.lively`, the one sanctioned use of that spring, scaling from 0 to 1 about its centre.

Play the entrance once per page load, never on every route change. Under reduced motion, the mark fades in over 140ms.

## Do not

- Recolor the S or the dot outside the palette.
- Put the coral dot on oatmeal: it disappears. Use the tile or the mono version.
- Stretch, rotate or outline the mark, or set the S in a font.
- Animate it in a loop.
