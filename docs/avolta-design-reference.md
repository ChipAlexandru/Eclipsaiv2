# Avolta demo design reference

- Reference repository: `ChipAlexandru/Eclipsaiv2`
- Reference commit: `8ae73af3fbe60fa142789d12bac1dfd4a359bc33`
- Reference pull request: `#30` (including the structural work in PRs `#21`–`#29`)
- Files inspected read-only: `src/juliette-demo/JulietteVoiceShop.jsx` and `src/juliette-demo/julietteVoiceShop.module.css`
- Live reference inspected: `https://www.eclipsai.com/juliette-demo`
- Inspection date: 2026-09-12

The Avolta implementation translates only the product-first hierarchy: compact identity/location header, immediate square product tiles, integrated product information, plus-only add control, five-column desktop and two-column mobile grids, and a floating bottom voice/bag control. It retains Avolta-specific colors, content, routes, data, assets, voice prompt, pickup flow and audio transport. It has no runtime or filesystem dependency on the Juliette feature.
