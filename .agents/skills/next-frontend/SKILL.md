---
name: Next.js Frontend Design System
description: Guidelines, design tokens, component architecture, and Framer Motion animation patterns for the Zerify Next.js frontend application.
---

# Next.js Frontend Design System & UI Standards

Use these guidelines when creating or refactoring pages, layouts, and UI components in `apps/frontend`.

---

## 1. Design Aesthetics & Visual Tokens

Zerify follows a modern, dark-mode-first aesthetic with dynamic glow elements, glassmorphism, and accent gradients.

### Core Color Palette:
- **Background**: `#07090E` (Deep space dark)
- **Glass Cards**: `bg-slate-900/80 border border-white/10 backdrop-blur-xl`
- **Brand Accents**:
  - Purple/Indigo Gradient: `bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600`
  - Pink/Amber Gradient (Creator role): `bg-gradient-to-r from-pink-600 via-amber-500 to-pink-600`
- **Text**:
  - Primary: `text-white`
  - Secondary: `text-slate-300` / `text-slate-400`
  - Highlight Gradient: `text-gradient-accent`

---

## 2. Interactive Component Best Practices

1. **State Feedback**: Every button and form MUST have hover states, focus rings, disabled states (`disabled:opacity-50`), and loading indicators (`Loader2` spinner).
2. **Icons**: Use `lucide-react` icons. Maintain consistent sizes (`w-4 h-4` for button icons, `w-5 h-5` for cards, `w-6 h-6` for headers).
3. **Animations**: Use `framer-motion` for page transitions, entrance animations, and interactive cards.
4. **Form Submissions**: Always use standard client-side `fetch` with error boundaries and user-facing notifications.

---

## 3. Component Modularization & File Length Guidelines

Whenever creating or modifying frontend code, follow these strict modularization rules:

1. **Short File Limit**: Aim to keep component files short, clean, and under 150-200 lines.
2. **Sub-Component Extraction**: Instead of putting complex forms, headers, navigation bars, cards, or modal views in a single monolithic file:
   - Break down the UI into small, focused sub-components.
   - Place feature-specific sub-components in sub-folders (e.g. `components/auth/subcomponents/` or `components/landing/subcomponents/`).
   - Place generic components in `components/ui/`.
3. **Clean Composition**: The parent/main file should serve primarily as an orchestrator that imports and composes small sub-components.
4. **Export Cleanliness**: Use named exports or default exports consistently, keeping prop interfaces small and explicit.

---

## 4. Directory Layout in `apps/frontend`

```
src/
├── app/                  # Next.js 14 App Router (pages & layouts)
├── components/           # UI components grouped by feature domain
│   ├── auth/             # Login & Register modals + sub-components
│   ├── landing/          # Hero, Navbar, FaqSection, etc.
│   ├── dashboard/        # Creator & Brand dashboard UI components
│   └── ui/               # Generic reusable components (Button, Input, Modal)
├── hooks/                # Custom React hooks
└── services/             # API client functions & data fetchers
```
