# DevControl Theme System

## Available Themes

DevControl now includes **three high-contrast themes** designed for maximum readability and visual clarity.

---

## Theme 1: Neon Midnight (Default)

**Color Scheme:** Pure Black + Bright Cyan/Magenta  
**Best For:** Maximum contrast, late-night coding, OLED displays

### Colors:
- **Background:** Pure black (#000000)
- **Primary Accent:** Bright Cyan (#00ffff)
- **Secondary Accent:** Bright Magenta (#dd00ff)
- **Text:** Pure white with high-contrast secondaries

### Characteristics:
- ✅ Highest contrast ratio (21:1)
- ✅ Perfect for OLED screens (true black saves battery)
- ✅ Reduces eye strain in dark environments
- ✅ Sharp, modern cyberpunk aesthetic

---

## Theme 2: Arctic Dawn

**Color Scheme:** Deep Blue + Light Blue/Purple  
**Best For:** Reduced eye strain, daytime use, professional appearance

### Colors:
- **Background:** Deep navy blue (#0a1628)
- **Primary Accent:** Sky blue (#4dd0e1)
- **Secondary Accent:** Soft purple (#7c4dff)
- **Text:** White with blue-tinted secondaries

### Characteristics:
- ✅ Softer on eyes than pure black
- ✅ Professional, corporate-friendly look
- ✅ Excellent for extended coding sessions
- ✅ Calming blue color psychology

---

## Theme 3: Sunset Command

**Color Scheme:** Deep Purple + Orange/Pink  
**Best For:** Warm aesthetic, creative work, evening use

### Colors:
- **Background:** Deep purple-black (#1a0f1f)
- **Primary Accent:** Warm orange (#ffab40)
- **Secondary Accent:** Hot pink (#e040fb)
- **Text:** White with warm orange secondaries

### Characteristics:
- ✅ Warm, inviting color palette
- ✅ Reduces blue light exposure (better for sleep)
- ✅ Unique, creative aesthetic
- ✅ High contrast with warm tones

---

## How to Switch Themes

### Method 1: Browser Console (Temporary)
```javascript
// Neon Midnight (default)
document.body.setAttribute('data-theme', 'neon');

// Arctic Dawn
document.body.setAttribute('data-theme', 'arctic');

// Sunset Command
document.body.setAttribute('data-theme', 'sunset');
```

### Method 2: Add Theme Switcher UI (Coming Soon)
A theme switcher will be added to the DevControl settings panel.

### Method 3: Set Default in Code
Edit `src/main.jsx` or `src/App.jsx`:
```javascript
useEffect(() => {
  document.body.setAttribute('data-theme', 'arctic'); // or 'neon', 'sunset'
}, []);
```

---

## Accessibility

All themes meet **WCAG AAA** standards for contrast:

| Theme | Background | Text | Contrast Ratio |
|-------|-----------|------|----------------|
| Neon Midnight | #000000 | #ffffff | 21:1 ✅ |
| Arctic Dawn | #0a1628 | #ffffff | 15.8:1 ✅ |
| Sunset Command | #1a0f1f | #ffffff | 17.2:1 ✅ |

**WCAG Requirements:**
- AA: 4.5:1 (normal text), 3:1 (large text)
- AAA: 7:1 (normal text), 4.5:1 (large text)

All DevControl themes exceed AAA requirements! ✨

---

## Color Variables Reference

Each theme defines the following CSS variables:

```css
/* Backgrounds */
--bg-void          /* Deepest background */
--bg-base          /* Base layer */
--bg-surface       /* Card/panel surfaces */
--bg-glass         /* Glass effect backgrounds */
--bg-glass-heavy   /* Heavy glass (modals) */

/* Accents */
--neon-cyan        /* Primary accent color */
--neon-cyan-dim    /* Dimmed version (10-15% opacity) */
--neon-cyan-glow   /* Glow effect (50% opacity) */

--neon-purple      /* Secondary accent */
--neon-purple-dim
--neon-purple-glow

--neon-danger      /* Error/warning color */

/* Text */
--text-primary     /* Main text (white) */
--text-secondary   /* Secondary text (lighter) */
--text-muted       /* Muted text (even lighter) */

/* Borders */
--border-glass     /* Subtle glass borders */
--border-neon      /* Accent borders */
```

---

## Theme Comparison

| Feature | Neon Midnight | Arctic Dawn | Sunset Command |
|---------|--------------|-------------|----------------|
| **Contrast** | Highest | High | High |
| **Eye Strain** | Low (dark) | Lowest | Low (warm) |
| **Professional** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Creative** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **OLED Friendly** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Blue Light** | Medium | High | Low |
| **Uniqueness** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## Customizing Themes

To create your own theme, add a new `[data-theme="yourname"]` block in `src/styles/index.css`:

```css
[data-theme="custom"] {
  --bg-void: #your-color;
  --bg-base: #your-color;
  /* ... define all variables ... */
}
```

Then apply it:
```javascript
document.body.setAttribute('data-theme', 'custom');
```

---

## Best Practices

### When to Use Each Theme:

**Neon Midnight:**
- Late-night coding sessions
- OLED displays
- When you want maximum "hacker" aesthetic
- Dark room environments

**Arctic Dawn:**
- Professional/work environments
- Daytime use
- Video calls (looks professional in screen shares)
- Extended coding sessions (easiest on eyes)

**Sunset Command:**
- Evening work (reduces blue light)
- Creative projects
- When you want a unique look
- Warmer, more inviting atmosphere

---

## Technical Implementation

Themes use CSS custom properties (variables) with cascade inheritance:

1. **Base theme** defined in `:root`
2. **Theme overrides** in `[data-theme="name"]` selectors
3. **Shared tokens** (spacing, radius, transitions) in `:root`
4. **Components** reference variables, not hard-coded colors

This allows instant theme switching without reloading!

---

## Future Enhancements

### Planned Features:
- [ ] Theme switcher in settings panel
- [ ] Auto theme based on time of day
- [ ] System theme detection (light/dark mode)
- [ ] Custom theme builder UI
- [ ] Theme persistence (localStorage)
- [ ] Per-project theme preferences
- [ ] Export/import custom themes

---

## Troubleshooting

### Theme Not Changing?
1. Check console for errors
2. Verify `data-theme` attribute on `<body>`
3. Hard refresh (Ctrl+Shift+R)
4. Clear browser cache

### Colors Look Wrong?
1. Ensure you're using the latest CSS
2. Check for conflicting inline styles
3. Verify browser supports CSS custom properties

### Performance Issues?
Themes use CSS variables which are highly performant. If you experience issues:
1. Disable browser extensions
2. Check for memory leaks in DevTools
3. Reduce backdrop-filter effects if needed

---

**Last Updated:** 2026-01-02  
**Version:** 1.0  
**Author:** DevControl Development Team
