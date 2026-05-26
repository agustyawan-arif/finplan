# Zenith Finance — Design System & Brand Identity

This document defines the official design system, typography scale, color palette, and layout principles for **Zenith Finance** (FinTrack Mobile). Rooted in the **"Modern Fintech"** aesthetic, it prioritizes absolute clarity, data density without cognitive overload, and financial trust.

---

## 💎 Brand & Style Identity

### High-Utility Minimalism
The Zenith Finance style is defined by a strict adherence to whitespace, a highly refined and functional color palette, and a focus on structural integrity over decorative flair. 

The interface is designed to evoke the feeling of a **high-end physical ledger**: precise, reliable, and premium. Every pixel serves a functional purpose, guiding the user through their financial journey with quiet confidence and clarity.

---

## 🎨 Color Palette & Tokens

The color system is engineered specifically for financial utility, directing the user's attention to status indicators, movements, and actions.

### 1. Brand & Core Action Colors

| Role | Color Value | Preview | Description / Usage |
| :--- | :--- | :---: | :--- |
| **Primary** | `#000000` | 🖤 | Used for deep accents and primary interaction boundaries. Override primary: `#0f172a`. |
| **Secondary** | `#006c49` | 💚 | Reserved exclusively for positive movements (income, growth, and surplus). Override: `#10b981`. |
| **Tertiary** | `#000000` | 🖤 | Supporting role for tertiary actions. Override: `#f43f5e`. |
| **Error** | `#ba1a1a` | ❤️ | Dedicated to critical warnings, outflows, expenses, and system errors. |

### 2. Surface & Background Tokens

Zenith Finance uses a tiered **Tonal Layering System** to group data card-by-card with ambient depth.

| Token | Hex Value | Preview | Description |
| :--- | :--- | :---: | :--- |
| `background` | `#f8f9ff` | 🤍 | Cool-tinted off-white background to reduce eye strain. |
| `surface` | `#f8f9ff` | 🤍 | Standard resting container color. |
| `surface-dim` | `#cbdbf5` | 💙 | Dimmed surface variant for secondary layers. |
| `surface-bright` | `#f8f9ff` | 🤍 | Bright resting surface layer. |
| `surface-container-lowest` | `#ffffff` | 🤍 | Absolute lowest layer container (e.g. pure white cards). |
| `surface-container-low` | `#eff4ff` | 🩵 | Subtle low-elevation surfaces. |
| `surface-container` | `#e5eeff` | 🩵 | Default container surface for data grouping. |
| `surface-container-high` | `#dce9ff` | 🩵 | Higher elevation background for highlighted cards. |
| `surface-container-highest`| `#d3e4fe` | 🩵 | Topmost background container level. |
| `inverse-surface` | `#213145` | 💙 | Dark surface background for high-contrast alerts or tooltips. |

### 3. Content & Typography Roles

| Token | Hex Value | Preview | Description |
| :--- | :--- | :---: | :--- |
| `on-surface` | `#0b1c30` | 💙 | Deep navy content color for premium typography and high readability. |
| `on-surface-variant` | `#45464d` | 🩶 | Neutral dark grey for secondary labels and descriptive body text. |
| `inverse-on-surface` | `#eaf1ff` | 🩵 | High-contrast light text for dark inverse surfaces. |
| `outline` | `#76777d` | 🩶 | Standard border color for forms, cards, and input fields. |
| `outline-variant` | `#c6c6cd` | 🩶 | Subtle border separator or inactive states. |

### 4. Interactive & Fixed State Colors

| Role | Color Value | Description / Interaction |
| :--- | :--- | :--- |
| **Primary Container** | `#131b2e` | Base background block for primary interactive containers. |
| **On-Primary Container** | `#7c839b` | Foreground text or active state on primary container. |
| **Secondary Container** | `#6cf8bb` | Base background block for secondary positive containers. |
| **On-Secondary Container** | `#00714d` | Foreground text or status content on positive secondary background. |
| **Tertiary Container** | `#40000d` | Dark red background container for warning badges. |
| **On-Tertiary Container** | `#f23d5c` | Highlighted warning/expense text overlay. |
| **Error Container** | `#ffdad6` | Soft red container background for active error cards. |
| **On-Error Container** | `#93000a` | Deep warning red text color. |

---

## ✍️ Typography & Text System

The typeface of choice is **Inter** due to its systematic, utilitarian precision and high legibility at small sizes.

### Typographic Categories
1. **Financial Data:** Currencies and balances should use `fontWeight: 600` or `700` with tighter letter spacing (`-0.02em`) to render as distinct visual units.
2. **Labels:** Small caps or all-caps with generous letter spacing (`0.05em`) are used for category headers and metadata.
3. **Mobile Scale:** Typographic sizes are optimized to auto-scale on small screens (e.g. `display-xl` down to `headline-lg` to prevent currency text wrapping).

### Typography Scale Spec

| Token | Font Family | Font Size | Font Weight | Line Height | Letter Spacing | Ideal Use Case |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `display-xl` | Inter | `40px` | `700` | `48px` | `-0.02em` | Main account headers (Desktop/Tablet) |
| `headline-lg` | Inter | `32px` | `600` | `40px` | `-0.02em` | Mobile dashboard main balance / Page title |
| `headline-md` | Inter | `24px` | `600` | `32px` | `-0.01em` | Section headers and main cards |
| `headline-sm` | Inter | `20px` | `600` | `28px` | `0` | Subsection headings / Modal headers |
| `body-lg` | Inter | `18px` | `400` | `28px` | `0` | Intro text / Transaction descriptions |
| `body-md` | Inter | `16px` | `400` | `24px` | `0` | Standard body content & list metadata |
| `body-sm` | Inter | `14px` | `400` | `20px` | `0` | Secondary metadata / Support text |
| `label-md` | Inter | `12px` | `600` | `16px` | `0.05em` | Small category badges, section labels (uppercase) |
| `data-lg-mobile` | Inter | `32px` | `700` | `40px` | `-0.02em` | Dynamic financial numbers on mobile layouts |
| `data-md` | Inter | `16px` | `600` | `24px` | `0` | Transaction list amounts, currency strings |

---

## 📏 Layout & Spacing System

The layout follows a **Fixed-Width Mobile Grid** logic, optimized specifically for the modern iOS form factor.

- **Mobile Grid:** A 4-column layout with `20px` outer margins and `16px` gutters.
- **Base Scale:** Zenith uses an 8pt linear scaling system (`unit: 4px`) for padding and margins.
- **Section Rhythm:** A consistent `24px` or `32px` vertical gap is applied between major layout blocks to preserve the "Zenith" sense of breathing room.
- **Alignment Rules:** Descriptive text labels are left-aligned; all financial numbers and currencies are right-aligned to allow for fast vertical decimal comparison.

### Spacing Tokens

| Token | Size | Description |
| :--- | :---: | :--- |
| `unit` | `4px` | Small micro-spacing (base grid step) |
| `stack-sm` | `8px` | Space between related text elements (title and subtitle) |
| `stack-md` | `16px` | Padding inside standard card components |
| `stack-lg` | `24px` | Standard vertical rhythm between card elements |
| `margin-mobile`| `20px` | Outer screen padding margin for content grids |
| `gutter` | `16px` | Standard space between grid columns |
| `section-gap` | `32px` | Large spacing between logical feature areas |

---

## 📐 Shape & Elevation Language

### 1. Border Radius Spec

Approachability meets modern architecture. A rounded shape system provides hierarchy.

| Radius Token | Value | Description |
| :--- | :---: | :--- |
| `rounded-sm` | `0.25rem` (`4px`) | Small badge wrappers, toggle components |
| `rounded-default` | `0.5rem` (`8px`) | Standard elements, form fields, inputs |
| `rounded-md` | `0.75rem` (`12px`) | Focus input containers, card buttons |
| `rounded-lg` | `1.0rem` (`16px`) | Dashboard cards, bottom sheets, CTA buttons |
| `rounded-xl` | `1.5rem` (`24px`) | Transaction chips and pill-shaped filters |
| `rounded-full` | `9999px` | User avatars, circular category icon backgrounds |

### 2. Depth & Shadows
To maintain the feeling of crisp paper-like layers, heavy shadows are prohibited. Instead, Zenith relies on **tonal variations** and **ambient depth**.

- **Surface 0 (Screen BG):** `#F8FAFC`
- **Surface 1 (Card BG):** `#FFFFFF`
- **Ambient Soft Shadow:** `0px 4px 20px rgba(15, 23, 42, 0.04)`
  *Subtle ambient lift that suggests physical card presence without introducing visual clutter.*
- **Interactive Active State:** Upon pressing button or cards, the element transitions to "sink"—reducing shadow spread and slightly darkening background tones, simulating a natural physical press.

---

## 🧱 Component Blueprint & Specs

### 💳 Standard Cards
- **Structure:** Pure white background (`#FFFFFF`), `rounded-lg` (16px) corner radius, and `Ambient Soft Shadow`.
- **Rhythm:** Internal padding is a strict `20px` globally.

### 🔘 Interactive Buttons
- **Primary CTAs:** Background Deep Navy (`#0F172A`), text White (`#FFFFFF`). Corner radius is `rounded-lg` (16px) to match primary cards.
- **Secondary Actions:** Ghost style with `1px` border in Slate (`#64748B`), matching color text.

### 📝 Input Fields
- **Styling:** Minimalist design with a `1px` outline border in `#E2E8F0`. Corner radius is `rounded-default` (8px).
- **Focus State:** Transitions smoothly to a Deep Navy outline border. Standard labels sit directly above input boxes in the `label-md` uppercase style.

### 📊 Progress Indicators
- **Budget Tracking:** Thick `8px` rounded tracks in cool grey (`#F1F5F9`). Foreground progress bar fills are color-coded based on financial status:
  - **On-track / Influx:** Emerald Green (`#10B981`)
  - **Limit Approaching:** Amber Alert (`#F59E0B`)
  - **Limit Exceeded:** Rose Red (`#F43F5E`)

### 📋 List Items & Table Rows
- **Sizing:** Fixed `56px` minimum tap height with a subtle bottom separator border in `#F1F5F9`.
- **Category Icons:** Housed in `40px` circular wrappers using a `10%` opacity tint of their category’s respective color.

### 🏷️ Status Chips & Tags
- **Aesthetic:** `24px` height pill components (`rounded-xl` / pill-shaped) with a light gray background tint (`#F1F5F9`) and `body-sm` text.
