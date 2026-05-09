# DevHub Design System (Impeccable Edition)

## Core Philosophy
A minimalist, high-productivity interface that feels both powerful and refined. No fluff, only high-utility visual cues.

## Tokens

### Colors
- **Background**: `zinc-950`
- **Surface**: `zinc-900/50` with `backdrop-blur-md`
- **Border**: `zinc-800/50` (Standard) | `zinc-700/50` (Hover)
- **Primary**: `amber-500` (Main accent) | `orange-600` (Gradient)
- **Status**:
  - Success: `green-500`
  - Warning: `amber-500`
  - Error: `red-500`
  - Info: `blue-500`

### Typography
- **Headings**: Geist Sans (Bold/SemiBold), tight tracking.
- **Body**: Geist Sans (Regular), `zinc-400` for secondary text.
- **Code**: Geist Mono, `zinc-300` on `zinc-800/50` background.

### Layout
- **Gaps**: `gap-4` (Standard) | `gap-6` (Section)
- **Radius**: `rounded-lg` (8px) | `rounded-xl` (12px) for cards.

## Component Rules
- **Buttons**:
  - Scale down to `0.98` on click.
  - Use `amber-500` for primary, `zinc-800` for ghost/outline.
- **Cards**:
  - Subtle `border-zinc-800/50`.
  - Transparent background (`bg-zinc-900/30`) with blur.
- **Animations**:
  - Page transitions: `opacity` and `scale(0.98)` -> `scale(1)`.
  - Snappy easings: `cubic-bezier(0.16, 1, 0.3, 1)`.
