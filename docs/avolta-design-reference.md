# Avolta demo design reference

- Reference repository: `ChipAlexandru/Eclipsaiv2`
- Reference commit: `8ae73af3fbe60fa142789d12bac1dfd4a359bc33`
- Reference pull request: `#30` (including the structural work in PRs `#21`–`#29`)
- Files inspected read-only: `src/juliette-demo/JulietteVoiceShop.jsx` and `src/juliette-demo/julietteVoiceShop.module.css`
- Live reference inspected: `https://www.eclipsai.com/juliette-demo`
- Inspection date: 2026-09-12

The Avolta implementation translates only the product-first hierarchy: compact identity/location header, immediate square product tiles, integrated product information, plus-only add control, five-column desktop and two-column mobile grids, and a floating bottom voice/bag control. It retains Avolta-specific colors, content, routes, data, assets, voice prompt, pickup flow and audio transport. It has no runtime or filesystem dependency on the Juliette feature.

## Public brand assets

- Avolta wordmark source: `https://www.avoltaworld.com/themes/wndrs/images/logo.svg`, the SVG referenced by the header of `https://www.avoltaworld.com/en` on 2026-09-13.
- Local Avolta-specific snapshot: `public/avolta-demo/brand/avolta-logo.svg`.
- Source SHA-256 at capture: `22debcbbe0e6924277ca279ef7ecd9bb30310807c85fd14349d871dbf202db00`.
- Local normalized SVG SHA-256: `46b8c0b925b7934e4f8f28712d4a6620d967fc20132c495e068b01cc753220cc`; path geometry and official `#8F53F0` fills are unchanged, while whitespace was normalized for the repository copy.
- Store-name source: Zürich Airport's official Duty Free page, `https://www.flughafen-zuerich.ch/en/passengers/shopping-and-enjoy/shops/duty-free`, inspected 2026-09-13. The interface uses the name “Zürich Duty Free” as readable text; it does not assert a separate store-logo asset.
