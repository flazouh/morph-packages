# npm packages required by this package

These are the npm packages the copied GitQuiet source imports.
Add them to the Morph repo's `package.json` as needed.

## Runtime

| Package | Version (from source) | Used for |
|---|---|---|
| `effect` | `^4.0.0-rc.111` | Effect TS core + reactivity atoms |
| `react` | `^19.2.8` | UI components |
| `react-dom` | `^19.2.8` | DOM rendering |
| `sonner` | `^2.0.7` | Toast notifications (`Toasts.tsx`) |
| `@radix-ui/react-dropdown-menu` | `^2.1.24` | Dropdown menus |
| `@radix-ui/react-hover-card` | `^1.1.23` | Hover cards |
| `@radix-ui/react-popover` | `^1.1.23` | Popovers (check if used) |
| `@radix-ui/react-slot` | `^1.3.3` | Slot primitive |
| `@hugeicons/react` | `^1.1.10` | Huge icon components |
| `@hugeicons/core-free-icons` | `^4.3.0` | Huge icon definitions |
| `@primer/octicons-react` | `^19.33.0` | GitHub Octicons |

## Fonts (CSS)

| Package | Version (from source) | Used in |
|---|---|---|
| `@fontsource-variable/inter` | `^5.3.0` | `ui/primer.css` (`@import "@fontsource-variable/inter"`) |

## Dev / Test only

| Package | Used for |
|---|---|
| `@testing-library/react` | Component tests |
| `@testing-library/user-event` | User event simulation in tests |

## Effect sub-paths imported

```
effect/unstable/reactivity/AsyncResult
effect/unstable/reactivity/Atom
effect/unstable/reactivity/AtomRegistry
```

These are unstable Effect APIs. Pin the `effect` version tightly.
