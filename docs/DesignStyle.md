# Design Style Guide — Zerify

## 1. Design System Overview

| Property | Value |
|----------|-------|
| **Framework** | Tailwind CSS (utility-first) |
| **Animation** | Framer Motion 11 |
| **Icons** | Lucide React |
| **Fonts** | Plus Jakarta Sans (body), Playfair Display (headlines), Syne (display) |
| **Theme** | Dark-first with light mode override |
| **Component library** | None (custom components) |

---

## 2. Color System

### Primary Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#07090E` | Page background (deep space dark) |
| `surface` | `#0F172A` | Card/panel backgrounds (Slate 900) |
| `surfaceBorder` | `rgba(255,255,255,0.08)` | Subtle borders |

### Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `brand.50` | `#EEF2FF` | Light indigo tint |
| `brand.100` | `#E0E7FF` | Light indigo |
| `brand.500` | `#6366F1` | Primary brand (Indigo 500) |
| `brand.600` | `#4F46E5` | Primary brand dark (Indigo 600) |
| `brand.700` | `#4338CA` | Primary brand darker (Indigo 700) |

### Accent Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `accent.pink` | `#EC4899` | Highlights, CTA accents |
| `accent.purple` | `#8B5CF6` | Secondary brand, glows |
| `accent.cyan` | `#06B6D4` | Info states, links |
| `accent.emerald` | `#10B981` | Success states |
| `accent.amber` | `#F59E0B` | Warning states |

### Status Colors (Tailwind Classes)

| Status | Classes |
|--------|---------|
| **Success** | `border-emerald-500/30 bg-emerald-500/10 text-emerald-300` |
| **Warning** | `border-amber-500/30 bg-amber-500/10 text-amber-300` |
| **Error** | `border-rose-500/30 bg-rose-500/10 text-rose-300` |
| **Info** | `border-purple-500/30 bg-purple-500/10 text-purple-200` |
| **Active** | `border-emerald-500/30 bg-emerald-500/10 text-emerald-400` |
| **Pending** | `border-amber-500/30 bg-amber-500/10 text-amber-400` |
| **Completed** | `border-blue-500/30 bg-blue-500/10 text-blue-400` |

---

## 3. Typography

### Font Weights

| Weight | CSS | Usage |
|--------|-----|-------|
| Light | `font-light` (300) | Subtle text |
| Regular | `font-normal` (400) | Body text |
| Medium | `font-medium` (500) | Labels, buttons |
| Semibold | `font-semibold` (600) | Headings, emphasis |
| Bold | `font-bold` (700) | Section headers |
| Extrabold | `font-extrabold` (800) | Display text |
| Black | `font-black` (900) | Hero metrics, KPIs |

### Text Scale

| Element | Classes | Example |
|---------|---------|---------|
| Hero heading | `text-3xl sm:text-4xl lg:text-5xl font-semibold` | Landing page title |
| Section heading | `text-2xl sm:text-3xl font-black tracking-tight` | Dashboard sections |
| Card title | `text-lg font-black` | Modal headers |
| Subtitle | `text-sm text-slate-300 leading-relaxed` | Descriptions |
| Body | `text-sm text-white/80` | Content text |
| Label | `text-xs font-bold uppercase tracking-wider text-purple-200` | Form labels |
| Badge | `text-[10px] font-black uppercase tracking-widest text-slate-400` | Status badges |
| Metric | `text-2xl sm:text-3xl font-black tracking-tight` | KPI numbers |
| Small | `text-xs text-slate-400` | Timestamps, hints |

### Font Families

```css
font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;  /* Body */
font-family: 'Playfair_Display', Georgia, serif;          /* Display headlines */
font-family: var(--font-syne);                             /* Syne display */
```

---

## 4. Spacing & Layout

### Container Patterns
```tsx
// Full-width page
<div className="min-h-screen">

// Centered content
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

// Dashboard content
<div className="space-y-6 max-w-7xl mx-auto">
```

### Padding Scale

| Context | Classes |
|---------|---------|
| Page section | `p-6 sm:p-10` |
| Card | `p-5` or `p-6` |
| Modal | `p-6 sm:p-8` |
| Compact card | `p-3` or `p-4` |
| Inline element | `p-2` or `px-3 py-1.5` |

### Gap Scale

| Context | Classes |
|---------|---------|
| Section spacing | `space-y-6` or `space-y-4` |
| Card grid | `gap-4` or `gap-6` |
| Inline elements | `gap-2` or `gap-3` |
| Tight grouping | `gap-1.5` |

### Border Radius Scale

| Element | Classes |
|---------|---------|
| Large card / modal | `rounded-3xl` |
| Card | `rounded-2xl` |
| Button / input | `rounded-xl` |
| Badge / tag | `rounded-lg` |
| Pill button | `rounded-full` |
| Avatar | `rounded-xl` or `rounded-2xl` |

---

## 5. Component Patterns

### Buttons

```tsx
// Primary gradient
<button className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50">

// Secondary glass
<button className="px-4 py-2 rounded-full bg-slate-900/80 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all backdrop-blur-md">

// Danger
<button className="px-4 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-medium transition-colors">

// Ghost
<button className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-xs font-bold transition-all">
```

### Inputs

```tsx
// Text input
<input className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500" />

// Textarea
<textarea className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 resize-none" />

// Select
<select className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
```

### Cards

```tsx
// Standard card
<div className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-xl shadow-xl hover:border-white/20 transition-all duration-300">

// Glass card
<div className="bg-[#090D16]/90 border border-white/10 backdrop-blur-xl rounded-3xl shadow-2xl">

// Interactive card
<div className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-xl shadow-xl hover:border-purple-500/30 hover:shadow-purple-950/20 transition-all cursor-pointer">
```

### Modals

```tsx
// Overlay
<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md">

// Modal card
<div className="w-full max-w-2xl bg-[#090D16] border border-purple-500/25 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-2xl p-6 sm:p-8 space-y-6 relative">
```

### Badges

```tsx
// Status badge (dynamic color)
const tone = /REVISION|REJECT|CANCEL|FAIL/.test(status)
  ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
  : /VERIFIED|COMPLETED|APPROVED/.test(status)
  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
  : 'border-purple-500/30 bg-purple-500/10 text-purple-200';

<span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border ${tone}`}>
```

### Labels

```tsx
<label className="block text-xs font-bold text-purple-200 uppercase tracking-wider">
  {label} {required && <span className="text-pink-400">*</span>}
</label>
```

---

## 6. Gradient System

### Text Gradients
```css
.text-gradient {
  background: linear-gradient(135deg, #FFFFFF 0%, #94A3B8 50%, #A78BFA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.text-gradient-accent {
  background: linear-gradient(135deg, #EC4899, #8B5CF6, #6366F1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Background Gradients
```css
.hero-gradient: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120,119,198,0.25), transparent)
.glow-gradient: radial-gradient(circle, rgba(139,92,246,0.15), rgba(236,72,153,0.05), transparent)
.card-gradient: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))
```

### Glass Effects
```css
.glass-card {
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

---

## 7. Animation Patterns

### Framer Motion Variants

**Page entrance**:
```tsx
initial={{ opacity: 0, y: 20, scale: 0.98 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
transition={{ duration: 0.4, ease: 'easeOut' }}
```

**Modal entrance**:
```tsx
initial={{ opacity: 0, scale: 0.96 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.96 }}
```

**Toast notification**:
```tsx
initial={{ opacity: 0, y: -20, scale: 0.9, x: 30 }}
animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
exit={{ opacity: 0, y: -15, scale: 0.9, x: 30 }}
```

**Spring success**:
```tsx
initial={{ scale: 0 }}
animate={{ scale: 1 }}
transition={{ type: 'spring', stiffness: 200, damping: 15 }}
```

**Accordion expand**:
```tsx
initial={{ height: 0, opacity: 0 }}
animate={{ height: 'auto', opacity: 1 }}
exit={{ height: 0, opacity: 0 }}
transition={{ duration: 0.35, ease: 'easeInOut' }}
```

**Message bubble**:
```tsx
initial={{ opacity: 0, y: 6 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.18 }}
```

### CSS Animations

```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

Available classes: `animate-pulse-slow`, `animate-float`, `animate-float-reverse`, `animate-shimmer`

---

## 8. Light Mode

Light mode is implemented via CSS class overrides in `globals.css`:

```css
html.light { color-scheme: light; }
html.light body { background-color: #F8FAFC; color: #0F172A; }

html.light .bg-slate-950 { background-color: #FFFFFF; }
html.light .bg-slate-900\/80 { background-color: #FFFFFF; }
html.light .bg-slate-800 { background-color: #F1F5F9; }
html.light .text-white { color: #0F172A; }
html.light .text-slate-300 { color: #475569; }
html.light .border-white\/10 { border-color: #E2E8F0; }
```

**Note**: Light mode uses `!important` overrides on specific Tailwind classes. New components must use compatible Tailwind classes to automatically support light mode.

---

## 9. Responsive Breakpoints

| Breakpoint | Prefix | Usage |
|------------|--------|-------|
| Mobile | (none) | Default, single column |
| Small | `sm:` | 640px+, stacked → side-by-side |
| Medium | `md:` | 768px+, responsive grids |
| Large | `lg:` | 1024px+, full dashboard layout |
| Extra large | `xl:` | 1280px+, wide screens |

### Common Responsive Patterns
```tsx
// Text scaling
text-2xl sm:text-3xl font-black

// Layout
flex flex-col md:flex-row md:items-center justify-between

// Grid
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6

// Padding
p-4 sm:p-6 lg:p-8

// Modal width
w-full max-w-lg sm:max-w-2xl
```

---

## 10. Scrollbar Styling

```css
::-webkit-scrollbar-track { background: #07090E; }
::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 4px; }
```

Utility classes: `.custom-sidebar-scrollbar`, `.custom-scrollbar`, `.no-scrollbar`

---

## 11. Design Principles

1. **Dark-first**: All components designed for dark theme first
2. **Glass morphism**: `backdrop-blur` + semi-transparent backgrounds for depth
3. **Gradient accents**: Purple-to-pink gradients for CTAs and highlights
4. **Micro-animations**: Subtle motion on every interaction (hover, entrance, exit)
5. **Layered shadows**: `shadow-xl` + `shadow-purple-950/20` for colored shadows
6. **Border glow**: `border-purple-500/25` for active/focused elements
7. **Spacing rhythm**: Consistent `space-y-6` between sections, `gap-3/4` between elements
8. **Typography hierarchy**: Black weight for metrics, bold for headers, regular for body
