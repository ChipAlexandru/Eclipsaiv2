"use client";
import { useEffect, useRef } from "react";

// ─── MOVIE HOME (root /) ─────────────────────────────────
// Byte-faithful port of the approved prototype
// (4. Workflow harness/4. Website/eclipsai-movie-website-prototype-updated-copy-2026-06-15.html).
// CSS, scene markup, and script are reproduced verbatim — copy, numbers, artifact
// data, colours, and scene order are unchanged. The ONLY edits:
//   - hero <img> src -> /assets/cinematic-prototype/hero-watchtable.jpg (compressed
//     from the 1.5 MB source PNG) with explicit width/height + eager/lazy + async
//   - --sans leads with var(--font-inter) to use the app's self-hosted Inter
// <head> essentials (title, description, canonical, OG/Twitter, favicon, theme-color)
// come from Next metadata in app/page.jsx + app/layout.jsx.
// This file is GENERATED from the prototype (scripts/gen-moviehome). Do not hand-edit.

const CSS = `
    :root {
      --cream: #f4efe7;
      --paper: #fffdf8;
      --ink: #2f2327;
      --wine: #4a1c2a;
      --muted: #6f6063;
      --soft: rgba(74, 28, 42, .12);
      --line: rgba(74, 28, 42, .16);
      --orange: #9b6042;
      --teal: #3f706a;
      --sage: var(--cream);
      --blue: var(--cream);
      --control-wash: rgba(63, 112, 106, .08);
      --shadow: 0 28px 70px rgba(47, 35, 39, .16);
      --serif: Georgia, "Times New Roman", serif;
      --sans: var(--font-inter), Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    * { box-sizing: border-box; }
    html {
      background: var(--cream);
      color: var(--ink);
      font-family: var(--sans);
      scroll-behavior: smooth;
      scroll-snap-type: y proximity;
    }
    body { margin: 0; overflow-x: hidden; }
    a { color: inherit; }

    .movie-nav {
      position: fixed;
      inset: 0 0 auto;
      z-index: 20;
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 24px;
      padding: 14px 24px;
      color: var(--paper);
      mix-blend-mode: difference;
      pointer-events: none;
    }
    .brand,
    .scene-index a,
    .quick-links a,
    .quick-links button {
      pointer-events: auto;
      border: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      text-decoration: none;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .08em;
      cursor: pointer;
    }
    .brand { font-family: var(--serif); font-size: 17px; text-transform: none; letter-spacing: 0; }
    .scene-index {
      display: flex;
      justify-content: center;
      gap: 7px;
      min-width: 0;
    }
    .scene-index a {
      width: 30px;
      height: 30px;
      display: grid;
      place-items: center;
      border: 1px solid rgba(255,255,255,.28);
      border-radius: 50%;
      opacity: .62;
      transition: opacity .2s ease, background .2s ease;
    }
    .scene-index a.active {
      opacity: 1;
      background: rgba(255,255,255,.2);
    }
    .quick-links { display: flex; gap: 14px; }

    .scene {
      position: relative;
      min-height: 100svh;
      scroll-snap-align: start;
      display: grid;
      align-items: center;
      padding: 96px 6vw 72px;
      overflow: hidden;
    }
    .scene:not(.title-scene) {
      grid-template-columns: minmax(280px, .86fr) minmax(340px, 1.14fr);
      gap: 56px;
    }
    .scene-copy {
      position: relative;
      z-index: 2;
      max-width: 640px;
    }
    .scene-label {
      margin: 0 0 18px;
      color: var(--orange);
      font-size: 12px;
      font-weight: 900;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    h1, h2, h3, p { margin-top: 0; }
    h1 {
      max-width: 900px;
      color: var(--paper);
      font-family: var(--serif);
      font-size: 64px;
      line-height: 1.02;
      font-weight: 700;
      letter-spacing: 0;
      margin-bottom: 0;
    }
    h2 {
      color: var(--wine);
      font-family: var(--serif);
      font-size: 48px;
      line-height: 1.06;
      font-weight: 700;
      letter-spacing: 0;
      margin-bottom: 24px;
    }
    .lead {
      color: var(--muted);
      font-size: 18px;
      line-height: 1.68;
      max-width: 620px;
    }
    .lead strong { color: var(--wine); }
    .small-note {
      color: var(--muted);
      font-size: 13px;
      line-height: 1.55;
    }

    .title-scene {
      min-height: 100svh;
      padding: 0;
      isolation: isolate;
      background: #161011;
    }
    .title-scene::after {
      content: "";
      position: absolute;
      inset: 0;
      background: rgba(18, 11, 13, .38);
      z-index: 1;
    }
    .title-scene img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: saturate(.95) contrast(1.04);
      transform: scale(1.02);
    }
    .title-card {
      position: relative;
      z-index: 2;
      align-self: end;
      padding: 0 7vw 13vh;
    }
    .title-card .scene-label { color: #f1b58e; }
    .title-subline {
      max-width: 620px;
      margin: 32px 0 0;
      color: rgba(255, 253, 248, .82);
      font-size: 19px;
      line-height: 1.55;
    }

    .paradox {
      background: var(--cream);
      grid-template-columns: minmax(300px, .92fr) minmax(360px, 1.08fr);
      gap: clamp(48px, 7vw, 104px);
    }
    .promise { background: var(--cream); }
    .challenge { background: var(--cream); }
    .false-path {
      background: var(--cream);
      grid-template-columns: minmax(300px, .82fr) minmax(430px, 1.18fr);
      gap: clamp(48px, 5.5vw, 72px);
    }
    .insight { background: var(--cream); }
    .turn { background: var(--cream); }
    .resolution { background: var(--cream); }
    .start {
      background: #161011;
      color: var(--paper);
      isolation: isolate;
    }
    .start::after {
      content: "";
      position: absolute;
      inset: 0;
      background: rgba(18, 11, 13, .48);
      z-index: 1;
    }
    .start-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: saturate(.95) contrast(1.04);
      transform: scale(1.02);
      z-index: 0;
    }
    .scene.start {
      grid-template-columns: minmax(280px, 980px);
      justify-content: start;
      align-items: start;
      padding: 132px 7vw 72px;
    }
    .start .scene-copy {
      position: relative;
      z-index: 2;
      max-width: 980px;
    }
    .start h2,
    .start .lead,
    .start .scene-label,
    .start .small-note { color: var(--paper); }
    .start .scene-label { color: #f1b58e; }
    .start h2 {
      font-size: 64px;
      line-height: 1.02;
      max-width: 980px;
      margin-bottom: 132px;
    }
    .start .lead {
      max-width: 800px;
      font-size: 22px;
      line-height: 1.52;
      margin-bottom: 0;
    }
    .start .lead + .lead {
      margin-top: 15px;
    }
    .start .lead.start-gap {
      margin-top: 28px;
    }
    .start .lead.start-large-gap {
      margin-top: 44px;
    }
    .start .lead.start-audience {
      max-width: 640px;
      margin-bottom: 48px;
    }
    .start .lead.start-tight {
      margin-top: 15px;
    }
    .start .chooser {
      gap: 8px;
      margin: 18px 0 16px;
    }
    .start .choice {
      padding: 8px 12px;
    }
    .start .cta-line {
      min-height: 0;
      margin: 12px 0 16px;
      font-size: 28px;
    }
    .start .cta-button {
      margin-top: 22px;
      padding: 12px 0 8px;
      border-radius: 0;
      border-bottom: 2px solid #f1b58e;
      background: transparent;
      color: #f1b58e;
      align-self: start;
      white-space: nowrap;
      font-size: 16px;
      letter-spacing: 0;
      text-transform: none;
    }
    .start-about {
      max-width: 620px;
      margin-top: 72px;
      padding-top: 0;
      border-top: 0;
      color: rgba(255, 253, 248, .72);
      font-size: 14px;
      line-height: 1.48;
      font-weight: 650;
    }
    .start-action-row {
      max-width: 800px;
    }
    .start-body {
      min-width: 0;
    }

    .stage {
      position: relative;
      z-index: 2;
      min-height: 520px;
      display: grid;
      place-items: center;
    }
    .artifact {
      background: var(--paper);
      border: 1px solid rgba(74, 28, 42, .13);
      border-radius: 8px;
      box-shadow: var(--shadow);
      color: var(--wine);
    }
    .artifact .bar {
      height: 9px;
      border-radius: 99px;
      background: rgba(74, 28, 42, .14);
      margin-bottom: 10px;
    }
    .artifact .bar.short { width: 58%; }
    .artifact .bar.med { width: 76%; }
    .artifact .bar.orange { background: rgba(214, 83, 47, .34); }
    .artifact .bar.teal { background: rgba(38, 111, 115, .32); }

    .paradox-stage {
      --compare-gap: clamp(10px, 2cqw, 15px);
      width: min(100%, 720px);
      min-height: 520px;
      align-items: center;
      justify-items: center;
      padding-top: 0;
      container-type: inline-size;
    }
    .paradox .scene-copy h2 {
      margin-bottom: 34px;
    }
    .paradox .lead {
      max-width: 620px;
      color: #5f5452;
      font-size: 19px;
      line-height: 1.55;
      margin-bottom: 18px;
    }
    .paradox .lead:last-child { margin-bottom: 0; }
    .email-draft,
    .recurring-folder {
      width: 100%;
      color: #161616;
    }
    .email-draft {
      background: #fffdf8;
      border: 1px solid rgba(28, 28, 28, .14);
      border-radius: 3px;
      box-shadow: 0 22px 52px rgba(47,35,39,.11);
    }
    .email-title {
      color: rgba(28, 28, 28, .54);
      font-size: 2.7cqw;
      font-weight: 900;
      letter-spacing: .08em;
      text-transform: uppercase;
      margin-bottom: .7cqw;
    }
    .email-heading {
      color: #242220;
      font-family: var(--serif);
      font-size: 6.5cqw;
      line-height: 1.08;
      font-weight: 700;
      margin: 0;
    }
    .email-head {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 2cqw;
      align-items: start;
      border-bottom: 1px solid rgba(28, 28, 28, .14);
      padding-bottom: 3cqw;
    }
    .email-time {
      color: rgba(28, 28, 28, .58);
      border: 1px solid rgba(28, 28, 28, .16);
      border-radius: .8cqw;
      padding: .8cqw 1.1cqw;
      font-size: 2.45cqw;
      font-weight: 850;
      white-space: nowrap;
    }
    .email-row {
      display: grid;
      grid-template-columns: 18cqw minmax(0, 1fr);
      gap: 2cqw;
      border-bottom: 1px solid rgba(28, 28, 28, .1);
      padding: 1.8cqw 0;
      color: #242220;
      font-size: 3.1cqw;
      line-height: 1.35;
    }
    .email-row span {
      color: rgba(28, 28, 28, .48);
      font-weight: 850;
      letter-spacing: .04em;
      text-transform: uppercase;
    }
    .email-row strong {
      color: #242220;
      font-weight: 720;
    }
    .email-body {
      color: #242220;
      font-size: 3.45cqw;
      line-height: 1.55;
      padding-top: 2.2cqw;
    }
    .email-body p {
      margin: 0 0 2cqw;
    }
    .autocomplete-email {
      max-width: none;
      aspect-ratio: 210 / 297;
      padding: 5.2cqw;
      display: grid;
      align-content: start;
      gap: 3cqw;
      overflow: hidden;
    }
    .email-stack {
      width: calc((100% - var(--compare-gap)) / 2);
      container-type: inline-size;
    }
    .email-caption {
      max-width: 360px;
      color: #5b5050;
      font-size: 14px;
      line-height: 1.45;
      font-weight: 720;
      margin: 13px 0 0;
    }
    .autocomplete-line {
      margin-top: 1.8cqw;
      color: #242220;
      font-size: 3.35cqw;
      line-height: 1.45;
    }
    .ghost-text {
      color: rgba(28, 28, 28, .34);
    }
    .tab-hint {
      display: inline-flex;
      align-items: center;
      gap: 1.7cqw;
      margin-top: 2.1cqw;
      color: rgba(28, 28, 28, .52);
      font-size: 2.7cqw;
      font-weight: 650;
    }
    .tab-key {
      border: 1px solid rgba(28, 28, 28, .24);
      border-radius: .7cqw;
      background: #fff;
      color: #242220;
      padding: .6cqw 1.6cqw;
      font-size: 2.45cqw;
      font-weight: 750;
      letter-spacing: .04em;
      text-transform: uppercase;
      box-shadow: 0 1px 0 rgba(0, 0, 0, .12);
    }
    /* Scene 01 (paradox): GDPval benchmark extract card — full-stage-width, clamp-sized like the non-A4 artifacts */
    .gd-stack {
      width: 100%;
      container-type: inline-size;
    }
    .gd4-card {
      background: #fffdf8;
      border: 1px solid rgba(28, 28, 28, .14);
      border-radius: 3px;
      box-shadow: 0 22px 52px rgba(47,35,39,.11);
      padding: clamp(22px, 5.4cqw, 34px);
      display: grid;
      align-content: start;
      gap: clamp(12px, 2.6cqw, 18px);
      overflow: hidden;
      color: #242220;
      font-family: var(--sans);
    }
    .gd4-proof {
      display: grid;
      gap: clamp(8px, 1.8cqw, 13px);
    }
    .gd4-proof p {
      margin: 0;
      font-size: clamp(13px, 2.9cqw, 16px);
      line-height: 1.25;
      font-weight: 500;
      color: #242220;
    }
    .gd4-proof strong {
      font-size: clamp(20px, 4.8cqw, 28px);
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      margin-right: clamp(5px, 1.1cqw, 9px);
    }
    .gd4-rule {
      height: 1px;
      width: 100%;
      background: rgba(28, 28, 28, .14);
    }
    .gd4-ex {
      display: grid;
      gap: clamp(5px, 1.1cqw, 8px);
    }
    .gd4-exh {
      font-size: clamp(10px, 2.2cqw, 12px);
      line-height: 1.4;
      font-weight: 700;
      color: #242220;
    }
    .gd4-ex ul {
      margin: 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: clamp(5px, 1.1cqw, 8px);
    }
    .gd4-ex li {
      font-size: clamp(10px, 2.2cqw, 12px);
      line-height: 1.4;
      font-weight: 500;
      font-style: italic;
      color: #33302e;
    }
    .gd4-note {
      font-size: clamp(10px, 2.2cqw, 12px);
      line-height: 1.45;
      font-weight: 600;
      color: rgba(28, 28, 28, .5);
    }
    .artifact-caption {
      width: min(100%, 740px);
      margin: 14px 0 0;
      color: rgba(47, 35, 39, .68);
      font-size: 14px;
      line-height: 1.45;
      font-weight: 650;
    }
    .artifact-caption strong {
      color: #292421;
      font-weight: 850;
    }
    .recurring-folder {
      position: relative;
      background: #ded3c0;
      border: 1px solid rgba(47, 35, 39, .18);
      border-radius: 4px 4px 2px 2px;
      padding: 44px 18px 18px;
      min-height: 420px;
    }
    .recurring-folder::before {
      content: "";
      position: absolute;
      left: -1px;
      top: -18px;
      width: 150px;
      height: 25px;
      background: #ded3c0;
      border: 1px solid rgba(47, 35, 39, .18);
      border-bottom: 0;
      border-radius: 4px 4px 0 0;
    }
    .folder-title {
      position: absolute;
      left: 18px;
      top: 10px;
      color: rgba(47, 35, 39, .72);
      font-size: 10px;
      font-weight: 850;
      letter-spacing: .04em;
      text-transform: uppercase;
    }
    .unfinished-report {
      background: #fffefa;
      border: 1px solid rgba(47, 35, 39, .16);
      border-radius: 3px;
      padding: 20px;
      min-height: 330px;
    }
    .unfinished-kicker {
      color: rgba(47, 35, 39, .58);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .04em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .unfinished-title {
      color: #292421;
      font-family: var(--sans);
      font-size: 22px;
      line-height: 1.15;
      font-weight: 850;
      margin: 0 0 14px;
      padding-bottom: 12px;
      border-bottom: 2px solid rgba(47, 35, 39, .18);
    }
    .unfinished-row {
      display: grid;
      grid-template-columns: .62fr 1.38fr;
      gap: 12px;
      border-bottom: 1px solid rgba(47, 35, 39, .1);
      padding: 10px 0;
      font-size: 12px;
      line-height: 1.35;
    }
    .unfinished-row span {
      color: rgba(47, 35, 39, .56);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .04em;
      text-transform: uppercase;
    }
    .unfinished-row strong {
      color: #292421;
      font-weight: 750;
    }
    .blank-field {
      display: block;
      width: 100%;
      height: 14px;
      border-bottom: 1px solid rgba(47, 35, 39, .28);
      margin-top: 2px;
    }
    .missing-value {
      color: #6f3b36;
      font-weight: 850;
    }
    .unfinished-note {
      margin-top: 14px;
      border: 1px solid rgba(47, 35, 39, .16);
      background: #f4f3ef;
      color: rgba(47, 35, 39, .68);
      padding: 10px 12px;
      font-size: 12px;
      line-height: 1.35;
      font-weight: 650;
    }
    .unfinished-note strong {
      display: block;
      color: #292421;
      font-weight: 800;
      margin-top: 3px;
    }
    .copy-marker {
      color: #35292d;
      font-weight: 850;
      border-bottom: 2px solid rgba(47, 35, 39, .22);
    }
    .paradox-variant {
      background: #f4efe7;
    }
    .paradox-linked {
      grid-template-columns: minmax(340px, .9fr) minmax(430px, 1.1fr);
      gap: 56px;
      align-items: center;
    }
    .linked-left {
      max-width: 560px;
    }
    .linked-left h2 {
      margin-bottom: 26px;
    }
    .linked-copy {
      color: #5f5452;
      font-size: 18px;
      line-height: 1.58;
      margin-bottom: 18px;
      max-width: 540px;
    }
    .linked-left .email-draft {
      max-width: 410px;
      margin-top: 18px;
    }
    .linked-right {
      display: grid;
      grid-template-columns: 1fr;
      gap: 18px;
      align-items: start;
      max-width: 520px;
    }
    .linked-right .linked-copy {
      margin: 0;
      max-width: 500px;
    }
    .linked-right .recurring-folder {
      min-height: 455px;
    }
    .recurring-folder.deliverable-only {
      background: transparent;
      border: 0;
      border-radius: 0;
      box-shadow: none;
      min-height: auto;
      padding: 0;
    }
    .recurring-folder.deliverable-only::before,
    .recurring-folder.deliverable-only .folder-title {
      display: none;
    }
    .recurring-folder.deliverable-only .unfinished-report {
      min-height: 360px;
      box-shadow: 0 18px 38px rgba(47,35,39,.1);
    }
    .trail-board {
      position: relative;
      width: min(100%, 760px);
      display: grid;
      grid-template-columns: minmax(0, .82fr) 52px minmax(0, 1.18fr);
      gap: 14px;
      align-items: center;
    }
    .trail-board::before {
      content: "";
      position: absolute;
      left: 29%;
      right: 44%;
      top: 50%;
      height: 1px;
      background: rgba(47, 35, 39, .28);
      transform: translateY(-50%);
    }
    .trail-but {
      position: relative;
      z-index: 2;
      width: 42px;
      height: 42px;
      display: grid;
      place-items: center;
      border: 1px solid rgba(47, 35, 39, .22);
      border-radius: 50%;
      background: #f4efe7;
      color: rgba(47, 35, 39, .72);
      font-family: var(--serif);
      font-size: 18px;
      font-style: italic;
    }
    .email-draft.mini {
      align-self: center;
      padding: 16px;
      box-shadow: 0 12px 26px rgba(47,35,39,.08);
    }
    .email-draft.mini .email-body {
      font-size: 12px;
    }
    .email-status {
      margin-top: 10px;
      border-top: 1px solid rgba(47, 35, 39, .14);
      padding-top: 8px;
      color: rgba(47, 35, 39, .62);
      font-size: 11px;
      font-weight: 750;
    }
    .recurring-folder.focus {
      min-height: 455px;
      box-shadow: 0 18px 38px rgba(47,35,39,.12);
    }
    .open-items {
      margin-top: 14px;
      border: 1px solid rgba(47, 35, 39, .2);
      background: #ece9e2;
      color: #292421;
      padding: 10px 12px;
      font-size: 12px;
      line-height: 1.35;
      font-weight: 800;
    }
    .reading-board {
      width: min(100%, 760px);
      display: grid;
      gap: 14px;
    }
    .reading-row {
      display: grid;
      grid-template-columns: minmax(0, .86fr) minmax(0, 1.14fr);
      gap: 18px;
      align-items: center;
    }
    .reading-row.copy-first {
      align-items: start;
    }
    .reading-line {
      color: #35292d;
      font-size: 18px;
      line-height: 1.48;
      font-weight: 700;
      margin: 0;
    }
    .reading-line span {
      display: block;
      color: rgba(47, 35, 39, .62);
      font-size: 12px;
      font-weight: 850;
      letter-spacing: .04em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .reading-hinge {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 12px;
      align-items: center;
      color: rgba(47, 35, 39, .64);
      font-family: var(--serif);
      font-style: italic;
      font-size: 19px;
    }
    .reading-hinge::before,
    .reading-hinge::after {
      content: "";
      height: 1px;
      background: rgba(47, 35, 39, .18);
    }
    .window-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
      color: var(--muted);
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .08em;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--line);
      border-radius: 99px;
      padding: 5px 9px;
      color: var(--wine);
      background: rgba(255,255,255,.6);
      font-size: 11px;
      font-weight: 800;
    }
    .pack-stack { position: relative; width: min(100%, 430px); height: 420px; }
    .pack {
      position: absolute;
      width: 78%;
      min-height: 300px;
      padding: 24px;
    }
    .pack.one { left: 4%; top: 44px; transform: rotate(-4deg); }
    .pack.two { right: 4%; top: 82px; transform: rotate(3deg); }
    .pack.three { left: 15%; top: 12px; transform: rotate(.6deg); }
    .ready-chip {
      position: absolute;
      right: 22px;
      top: 22px;
      background: var(--teal);
      color: white;
      border-radius: 99px;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 900;
    }
    .signal-list {
      position: absolute;
      left: 0;
      bottom: 0;
      display: grid;
      gap: 8px;
    }
    .signal {
      background: rgba(255,255,255,.84);
      border: 1px solid rgba(38,111,115,.2);
      border-radius: 99px;
      padding: 8px 12px;
      color: var(--teal);
      font-size: 12px;
      font-weight: 800;
      box-shadow: 0 12px 30px rgba(47,35,39,.08);
      animation: slideSignal 6s ease-in-out infinite;
    }
    .signal:nth-child(2) { animation-delay: .6s; }
    .signal:nth-child(3) { animation-delay: 1.2s; }
    .brief-board {
      position: relative;
      width: min(100%, 720px);
      min-height: 500px;
      display: grid;
      grid-template-columns: 190px minmax(0, 510px);
      gap: 14px;
      align-items: center;
      justify-content: end;
    }
    .promise-stage {
      --compare-gap: clamp(10px, 2cqw, 15px);
      width: min(100%, 720px);
      min-height: 520px;
      display: grid;
      place-items: center;
      container-type: inline-size;
    }
    /* Page 2 (promise): full A4 page — same card size as the scene 01 email,
       document fills the sheet (the placeholder lines flex to fill). */
    .promise-report-shell {
      width: calc((100% - var(--compare-gap)) / 2);
      aspect-ratio: 210 / 297;
      position: relative;
      overflow: hidden;
      margin: 0 auto;
      background: var(--paper);
      border: 1px solid rgba(35, 35, 35, .15);
      border-radius: 3px;
      box-shadow: 0 22px 52px rgba(47,35,39,.11);
      container-type: inline-size;
    }
    .promise-report {
      position: absolute;
      inset: 0;
      width: 100%;
      padding: 2.45cqw;
      display: flex;
      flex-direction: column;
      gap: 1.08cqw;
      overflow: hidden;
      border-radius: 3px;
      border: 0;
      box-shadow: none;
      color: #242220;
    }
    .promise-report .forecast-lines {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .ready-strip {
      border: 1px solid rgba(63,112,106,.35);
      background: rgba(63,112,106,.08);
      color: #2e5d57;
      border-radius: .9cqw;
      padding: .86cqw 1cqw;
      font-size: 1.16cqw;
      line-height: 1.25;
      font-weight: 900;
      letter-spacing: .06em;
      text-transform: uppercase;
    }
    .promise-report .forecast-table {
      margin-top: .15cqw;
    }
    .promise-report .report-doc-head,
    .promise-report .forecast-meta,
    .promise-report .custom-summary,
    .promise-report .forecast-kpis,
    .promise-report .forecast-table,
    .promise-report .promise-check-grid,
    .promise-report .forecast-lines,
    .promise-report .ready-strip,
    .promise-report .report-note {
      width: 59%;
    }
    .promise-report .forecast-lines {
      gap: .52cqw;
      padding-top: .75cqw;
    }
    .promise-report .forecast-line {
      height: .48cqw;
    }
    .promise-check-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      border: 1px solid rgba(28, 28, 28, .11);
      border-radius: .9cqw;
      overflow: hidden;
    }
    .promise-check {
      min-width: 0;
      border-left: 1px solid rgba(28, 28, 28, .1);
      border-top: 1px solid rgba(28, 28, 28, .1);
      padding: .72cqw .8cqw;
      color: #3e3c39;
      font-size: .98cqw;
      line-height: 1.25;
      font-weight: 720;
    }
    .promise-check:nth-child(odd) {
      border-left: 0;
    }
    .promise-check:nth-child(-n + 2) {
      border-top: 0;
    }
    .promise-check em {
      display: block;
      color: rgba(28, 28, 28, .48);
      font-size: .82cqw;
      font-style: normal;
      font-weight: 900;
      letter-spacing: .08em;
      text-transform: uppercase;
      margin-bottom: .24cqw;
    }
    .report-note {
      border-top: 1px solid rgba(28, 28, 28, .1);
      color: rgba(28, 28, 28, .68);
      padding-top: .9cqw;
      font-size: 1.02cqw;
      line-height: 1.35;
      font-weight: 720;
    }
    .challenge-stage {
      --compare-gap: clamp(10px, 2cqw, 15px);
      width: min(100%, 720px);
      min-height: 520px;
      display: grid;
      place-items: center;
      container-type: inline-size;
    }
    /* Page 3 (challenge): same card size as page 2, but a zoomed-in close-up
       (like the initial demo) — scaled and cropped to the A4 frame. */
    .challenge-report-shell {
      width: calc((100% - var(--compare-gap)) / 2);
      aspect-ratio: 210 / 297;
      position: relative;
      overflow: hidden;
      margin: 0 auto;
      background: var(--paper);
      border: 1px solid rgba(35, 35, 35, .15);
      border-radius: 3px;
      box-shadow: 0 22px 52px rgba(47,35,39,.11);
      container-type: inline-size;
    }
    .challenge-report {
      position: absolute;
      inset: 0;
      width: 100%;
      padding: 2.45cqw;
      display: grid;
      align-content: start;
      gap: 1.08cqw;
      overflow: hidden;
      border-radius: 3px;
      border: 0;
      box-shadow: none;
      color: #242220;
      transform: scale(1.85);
      transform-origin: top left;
    }
    .challenge-report .report-doc-head,
    .challenge-report .forecast-meta,
    .challenge-report .generic-summary,
    .challenge-report .forecast-kpis,
    .challenge-report .review-note-box,
    .challenge-report .forecast-table,
    .challenge-report .forecast-lines,
    .challenge-report .review-strip,
    .challenge-report .report-note {
      width: 59%;
    }
    .challenge-report .report-doc-head,
    .challenge-report .forecast-meta {
      opacity: .38;
    }
    .challenge-report .generic-summary,
    .challenge-report .forecast-kpis,
    .challenge-report .review-note-box,
    .challenge-report .forecast-table,
    .challenge-report .forecast-lines,
    .challenge-report .review-strip,
    .challenge-report .report-note {
      width: 50.5%;
    }
    .challenge-report .generic-summary,
    .challenge-report .forecast-kpis span,
    .challenge-report .forecast-table,
    .challenge-report .review-note-box {
      font-size: 1.18cqw;
    }
    .review-strip {
      border: 1px solid rgba(142, 48, 42, .28);
      background: rgba(142, 48, 42, .06);
      color: #7d2d28;
      border-radius: .9cqw;
      padding: .86cqw 1cqw;
      font-size: 1.16cqw;
      line-height: 1.25;
      font-weight: 900;
      letter-spacing: .06em;
      text-transform: uppercase;
    }
    .review-note-box {
      border: 1px solid rgba(142, 48, 42, .22);
      border-left: .38cqw solid rgba(142, 48, 42, .62);
      background: rgba(255,255,255,.54);
      color: #6f302c;
      border-radius: .75cqw;
      padding: .82cqw .95cqw;
      font-size: 1.04cqw;
      line-height: 1.34;
      font-weight: 760;
    }
    .review-note-box strong {
      display: block;
      color: #242220;
      font-size: .9cqw;
      font-weight: 900;
      letter-spacing: .08em;
      text-transform: uppercase;
      margin-bottom: .25cqw;
    }
    .challenge-report .wrong-number {
      color: #7d2d28;
      text-decoration: line-through;
      text-decoration-thickness: .18cqw;
      text-decoration-color: #a2453d;
    }
    .challenge-report .correct-number {
      display: inline;
      color: #242220;
      margin-left: .42cqw;
      font-weight: 900;
    }
    .challenge-report .wrong-cell {
      color: #7d2d28 !important;
      background: rgba(142, 48, 42, .055);
      text-decoration: line-through;
      text-decoration-thickness: .12cqw;
      text-decoration-color: rgba(142, 48, 42, .7);
    }
    .repo-stage {
      width: min(100%, 720px);
      min-height: 520px;
      display: grid;
      place-items: center;
      container-type: inline-size;
    }
    .repo-sheet-shell {
      width: min(100%, 430px);
      container-type: inline-size;
    }
    .repo-sheet {
      aspect-ratio: 210 / 297;
      width: 100%;
      padding: 3.2cqw;
      display: grid;
      align-content: start;
      gap: 1.35cqw;
      overflow: hidden;
      border-radius: 3px;
      border-color: rgba(35, 35, 35, .15);
      box-shadow: 0 22px 52px rgba(47,35,39,.11);
      color: #242220;
    }
    .repo-doc-head {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 1.2cqw;
      align-items: start;
      border-bottom: 1px solid rgba(28, 28, 28, .14);
      padding-bottom: 1.25cqw;
    }
    .repo-path {
      color: rgba(28, 28, 28, .52);
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: clamp(7px, 1.2cqw, 10px);
      font-weight: 760;
      margin-bottom: .55cqw;
    }
    .repo-title {
      color: #242220;
      font-family: var(--serif);
      font-size: clamp(18px, 4.4cqw, 27px);
      line-height: 1.06;
      margin: 0;
    }
    .repo-badge {
      border: 1px solid rgba(63,112,106,.38);
      background: rgba(63,112,106,.08);
      color: #2e5d57;
      border-radius: .75cqw;
      padding: .58cqw .78cqw;
      font-size: clamp(7px, 1.15cqw, 10px);
      font-weight: 900;
      letter-spacing: .08em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .repo-meta {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      border: 1px solid rgba(28, 28, 28, .11);
      border-radius: .8cqw;
      overflow: hidden;
    }
    .repo-meta span {
      min-width: 0;
      border-left: 1px solid rgba(28, 28, 28, .1);
      padding: .72cqw .78cqw;
      color: rgba(28, 28, 28, .72);
      font-size: clamp(7px, 1.34cqw, 10px);
      line-height: 1.25;
      font-weight: 740;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .repo-meta span:first-child { border-left: 0; }
    .repo-meta em {
      display: block;
      color: rgba(28, 28, 28, .48);
      font-size: clamp(6px, 1cqw, 8px);
      font-style: normal;
      font-weight: 900;
      letter-spacing: .08em;
      text-transform: uppercase;
      margin-bottom: .25cqw;
    }
    .repo-section {
      border: 1px solid rgba(28, 28, 28, .1);
      border-radius: .8cqw;
      background: rgba(255,255,255,.38);
      padding: .86cqw 1cqw;
      color: #3e3c39;
      font-size: clamp(7.5px, 1.38cqw, 11px);
      line-height: 1.34;
      font-weight: 720;
    }
    .repo-section strong,
    .repo-table-label {
      display: block;
      color: rgba(28, 28, 28, .58);
      font-size: clamp(6px, 1cqw, 8px);
      font-weight: 900;
      letter-spacing: .08em;
      text-transform: uppercase;
      margin-bottom: .35cqw;
    }
    .repo-list {
      display: grid;
      gap: .38cqw;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .repo-list li {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: .55cqw;
      align-items: start;
    }
    .repo-list li::before {
      content: "";
      width: .72cqw;
      height: .72cqw;
      border-radius: 50%;
      background: rgba(63,112,106,.78);
      margin-top: .45cqw;
    }
    .repo-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      color: #3e3c39;
      font-size: clamp(7px, 1.24cqw, 10px);
      line-height: 1.25;
    }
    .repo-table th {
      color: rgba(28, 28, 28, .52);
      font-size: clamp(6px, .98cqw, 8px);
      font-weight: 900;
      letter-spacing: .07em;
      text-align: left;
      text-transform: uppercase;
      padding: .56cqw .48cqw;
      border-bottom: 1px solid rgba(28, 28, 28, .15);
    }
    .repo-table td {
      padding: .58cqw .48cqw;
      border-bottom: 1px solid rgba(28, 28, 28, .08);
      vertical-align: top;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .repo-table td:last-child {
      color: #242220;
      font-weight: 820;
    }
    .repo-pass {
      color: #2e5d57;
      font-weight: 900;
    }
    .repo-watch {
      color: #7d4a28;
      font-weight: 900;
    }
    .repo-strip {
      border: 1px solid rgba(63,112,106,.35);
      background: rgba(63,112,106,.08);
      color: #2e5d57;
      border-radius: .8cqw;
      padding: .78cqw .92cqw;
      font-size: clamp(7px, 1.2cqw, 10px);
      line-height: 1.28;
      font-weight: 860;
    }
    .eval-sheet .repo-table {
      font-size: clamp(7px, 1.34cqw, 10.5px);
    }
    .eval-sheet .repo-table td:nth-child(2),
    .eval-sheet .repo-table td:nth-child(3) {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      color: #242220;
      font-weight: 760;
    }
    .eval-source {
      color: rgba(28, 28, 28, .58);
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: clamp(6px, .95cqw, 8px);
      line-height: 1.35;
      border-top: 1px solid rgba(28, 28, 28, .1);
      padding-top: .75cqw;
    }
    .portfolio-shell {
      width: min(100%, 680px);
      container-type: inline-size;
    }
    .portfolio-sheet {
      aspect-ratio: 297 / 210;
      width: 100%;
      padding: 2.2cqw;
      display: grid;
      align-content: start;
      gap: 1.05cqw;
      overflow: hidden;
      border-radius: 3px;
      border-color: rgba(35, 35, 35, .15);
      box-shadow: 0 22px 52px rgba(47,35,39,.11);
      color: #242220;
    }
    .portfolio-sheet .repo-title {
      font-size: clamp(18px, 3.3cqw, 26px);
    }
    .portfolio-totals {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: .8cqw;
    }
    .portfolio-total {
      border: 1px solid rgba(28, 28, 28, .11);
      border-radius: .7cqw;
      padding: .72cqw .82cqw;
      background: rgba(255,255,255,.4);
      color: #242220;
      font-size: clamp(8px, 1.35cqw, 12px);
      font-weight: 860;
    }
    .portfolio-total em {
      display: block;
      color: rgba(28, 28, 28, .48);
      font-size: clamp(6px, .9cqw, 8px);
      font-style: normal;
      font-weight: 900;
      letter-spacing: .08em;
      text-transform: uppercase;
      margin-bottom: .25cqw;
    }
    .portfolio-sheet .repo-table {
      font-size: clamp(7px, 1.12cqw, 10px);
    }
    .portfolio-sheet .repo-table th,
    .portfolio-sheet .repo-table td {
      padding: .48cqw .38cqw;
    }
    .source-folder {
      align-self: start;
      position: relative;
      width: 100%;
      margin-top: 78px;
      padding: 38px 14px 14px;
      background: #e2d7c4;
      border: 1px solid rgba(47, 35, 39, .18);
      border-radius: 4px 4px 2px 2px;
      box-shadow: 0 16px 34px rgba(47,35,39,.08);
      color: #342d2b;
    }
    .source-folder::before {
      content: "";
      position: absolute;
      left: -1px;
      top: -18px;
      width: 112px;
      height: 24px;
      background: #e2d7c4;
      border: 1px solid rgba(47, 35, 39, .18);
      border-bottom: 0;
      border-radius: 4px 4px 0 0;
    }
    .folder-label {
      position: absolute;
      left: 14px;
      top: 9px;
      color: rgba(47, 35, 39, .72);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .04em;
      text-transform: uppercase;
    }
    .source-file {
      border-top: 1px solid rgba(47, 35, 39, .14);
      padding: 10px 0;
      font-size: 12px;
      line-height: 1.35;
      font-weight: 650;
    }
    .source-file:first-of-type {
      border-top: 0;
      padding-top: 0;
    }
    .source-file span {
      display: block;
      color: rgba(47, 35, 39, .58);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .04em;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .source-file strong {
      display: block;
      color: #332c2a;
      font-size: 12px;
      font-weight: 750;
    }
    .commercial-brief {
      position: relative;
      z-index: 2;
      width: 100%;
      padding: 26px 28px;
      background: #fffefa;
      border-color: rgba(47, 35, 39, .16);
      border-radius: 3px;
      box-shadow: 0 18px 38px rgba(47,35,39,.1);
      color: #2f2b29;
      font-family: var(--sans);
    }
    .brief-head {
      border-bottom: 2px solid rgba(47, 35, 39, .18);
      padding-bottom: 12px;
      margin-bottom: 12px;
    }
    .brief-kicker {
      color: rgba(47, 35, 39, .62);
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .04em;
      margin-bottom: 6px;
    }
    .brief-title {
      color: #292421;
      font-family: var(--sans);
      font-size: 24px;
      line-height: 1.15;
      font-weight: 850;
      margin: 0;
    }
    .brief-summary {
      border: 1px solid rgba(47, 35, 39, .14);
      background: #f4f3ef;
      color: #292421;
      padding: 10px 12px;
      margin-bottom: 12px;
      font-size: 13px;
      line-height: 1.4;
      font-weight: 650;
    }
    .brief-summary span,
    .brief-action span {
      display: block;
      color: rgba(47, 35, 39, .58);
      font-size: 10px;
      font-weight: 850;
      letter-spacing: .04em;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .brief-meta {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0;
      border: 1px solid rgba(47, 35, 39, .14);
      border-bottom: 0;
      margin-bottom: 12px;
    }
    .brief-meta span {
      border-bottom: 1px solid rgba(47, 35, 39, .14);
      background: transparent;
      color: rgba(47, 35, 39, .62);
      padding: 8px 10px;
      font-size: 12px;
      line-height: 1.35;
      font-weight: 650;
    }
    .brief-meta span:nth-child(odd) {
      border-right: 1px solid rgba(47, 35, 39, .14);
    }
    .brief-meta em {
      display: block;
      color: rgba(47, 35, 39, .54);
      font-style: normal;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .04em;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .brief-meta strong {
      display: block;
      color: #292421;
      font-size: 13px;
      font-weight: 750;
    }
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0;
      border: 1px solid rgba(47, 35, 39, .14);
      margin-bottom: 12px;
    }
    .metric {
      border-left: 1px solid rgba(47, 35, 39, .14);
      background: transparent;
      padding: 8px 10px;
    }
    .metric:first-child { border-left: 0; }
    .metric span {
      display: block;
      color: rgba(47, 35, 39, .54);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .04em;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .metric strong {
      color: #292421;
      font-size: 15px;
      font-weight: 800;
    }
    .brief-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      margin-bottom: 12px;
      color: #3f3936;
      font-size: 12px;
      line-height: 1.35;
      border-top: 1px solid rgba(47, 35, 39, .18);
    }
    .brief-table th {
      color: rgba(47, 35, 39, .64);
      font-size: 10px;
      letter-spacing: .04em;
      text-align: left;
      text-transform: uppercase;
      padding: 7px 6px;
      border-bottom: 1px solid rgba(47, 35, 39, .14);
    }
    .brief-table td {
      padding: 8px 6px;
      border-bottom: 1px solid rgba(47, 35, 39, .1);
      vertical-align: top;
      overflow-wrap: anywhere;
    }
    .brief-table td:last-child {
      color: #292421;
      font-weight: 750;
    }
    .brief-action {
      border: 1px solid rgba(47, 35, 39, .18);
      background: #ece9e2;
      color: rgba(47, 35, 39, .68);
      padding: 10px 12px;
      font-size: 12px;
      line-height: 1.35;
      font-weight: 650;
    }
    .brief-action strong {
      display: block;
      color: #292421;
      font-size: 14px;
      font-weight: 800;
    }
    .promise-shift {
      color: var(--wine);
      font-weight: 800;
    }

    .run-stack { position: relative; width: min(100%, 560px); height: 450px; }
    .run-card {
      position: absolute;
      width: 72%;
      min-height: 300px;
      padding: 24px;
    }
    .run-card:nth-child(1) { left: 3%; top: 36px; transform: rotate(-5deg); }
    .run-card:nth-child(2) { left: 16%; top: 72px; transform: rotate(2deg); }
    .run-card:nth-child(3) { right: 2%; top: 8px; transform: rotate(5deg); }
    .red-mark {
      border-left: 3px solid #bb3f37;
      color: #8e302a;
      padding: 8px 0 8px 10px;
      margin-top: 14px;
      font-size: 13px;
      line-height: 1.35;
      background: rgba(187,63,55,.06);
    }
    .review-stage {
      width: min(100%, 720px);
      display: grid;
      grid-template-columns: minmax(0, 500px) 190px;
      gap: 16px;
      align-items: center;
    }
    .review-report {
      width: 100%;
      padding: 24px;
      transform: rotate(.4deg);
    }
    .report-head {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-start;
      border-bottom: 1px solid rgba(74,28,42,.12);
      padding-bottom: 14px;
      margin-bottom: 14px;
    }
    .report-kicker {
      color: var(--muted);
      font-size: 11px;
      font-weight: 900;
      letter-spacing: .08em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .report-title {
      color: var(--wine);
      font-family: var(--serif);
      font-size: 30px;
      line-height: 1.05;
      margin: 0;
    }
    .draft-chip {
      border-radius: 99px;
      border: 1px solid rgba(187,63,55,.24);
      background: rgba(187,63,55,.08);
      color: #8e302a;
      padding: 8px 11px;
      font-size: 12px;
      font-weight: 900;
      white-space: nowrap;
    }
    .report-summary {
      border-left: 3px solid var(--teal);
      background: rgba(38,111,115,.07);
      color: var(--wine);
      padding: 10px 12px;
      margin-bottom: 12px;
      font-size: 13px;
      line-height: 1.4;
      font-weight: 780;
    }
    .report-kpis {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
      margin-bottom: 12px;
    }
    .report-kpi {
      border: 1px solid rgba(74,28,42,.12);
      border-radius: 7px;
      background: rgba(255,255,255,.58);
      padding: 10px;
      min-height: 72px;
    }
    .report-kpi span {
      display: block;
      color: var(--muted);
      font-size: 10px;
      font-weight: 900;
      letter-spacing: .08em;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .report-kpi strong {
      display: block;
      color: var(--wine);
      font-size: 17px;
      line-height: 1.2;
    }
    .wrong-number {
      color: #8e302a;
      text-decoration: line-through;
      text-decoration-thickness: 2px;
      text-decoration-color: #bb3f37;
    }
    .correct-number {
      display: block;
      color: var(--wine);
      margin-top: 3px;
    }
    .report-table {
      width: 100%;
      table-layout: fixed;
      border-collapse: collapse;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.35;
      margin-bottom: 12px;
    }
    .report-table th {
      color: var(--wine);
      font-size: 10px;
      letter-spacing: .08em;
      text-align: left;
      text-transform: uppercase;
      padding: 7px 6px;
      border-bottom: 1px solid rgba(74,28,42,.14);
    }
    .report-table td {
      padding: 8px 6px;
      border-bottom: 1px solid rgba(74,28,42,.08);
      vertical-align: top;
      overflow-wrap: anywhere;
    }
    .report-table td:last-child {
      color: var(--wine);
      font-weight: 800;
    }
    .wrong-cell {
      color: #8e302a !important;
      background: rgba(187,63,55,.06);
      text-decoration: line-through;
      text-decoration-thickness: 2px;
      text-decoration-color: #bb3f37;
    }
    .review-comments {
      display: grid;
      gap: 10px;
      align-self: center;
    }
    .review-comment {
      background: #fff6f0;
      border: 1px solid rgba(187,63,55,.25);
      border-radius: 7px;
      box-shadow: 0 14px 34px rgba(47,35,39,.08);
      color: #8e302a;
      padding: 10px 11px;
      font-size: 12px;
      line-height: 1.35;
      font-weight: 850;
    }
    .review-comment small {
      display: block;
      color: var(--muted);
      font-size: 10px;
      font-weight: 900;
      letter-spacing: .08em;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .false-stage .run-card { width: 82%; left: 8%; top: 28px; transform: rotate(-1deg); }
    .stamp {
      display: inline-block;
      color: var(--teal);
      border: 2px solid rgba(38,111,115,.38);
      border-radius: 4px;
      padding: 7px 10px;
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: .1em;
      transform: rotate(-4deg);
      margin-bottom: 18px;
    }
    .compare-stage {
      --compare-gap: clamp(10px, 2cqw, 15px);
      width: min(100%, 720px);
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--compare-gap);
      align-items: stretch;
      container-type: inline-size;
    }
    .compare-report {
      aspect-ratio: 210 / 297;
      min-height: 0;
      padding: 2.45cqw;
      display: grid;
      align-content: start;
      gap: 1.15cqw;
      overflow: hidden;
    }
    .report-doc-head {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 1.2cqw;
      align-items: start;
      border-bottom: 1px solid rgba(35, 35, 35, .14);
      padding-bottom: 1.15cqw;
      margin-bottom: .15cqw;
    }
    .report-period {
      color: rgba(28, 28, 28, .58);
      border: 1px solid rgba(28, 28, 28, .16);
      border-radius: .7cqw;
      padding: .55cqw .78cqw;
      font-size: 1.16cqw;
      font-weight: 850;
      letter-spacing: .04em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .generic-report {
      opacity: .86;
      transform: rotate(-1.2deg);
    }
    .custom-report {
      transform: rotate(.7deg);
      border-color: rgba(35, 35, 35, .15);
    }
    /* Page 2: render the same custom deliverable card as page 4's right side,
       but as a single centered, upright card (same size as the scene 01 email). */
    .compare-stage.promise-single {
      grid-template-columns: 1fr;
      justify-items: center;
    }
    .compare-stage.promise-single .compare-report {
      width: calc((100% - var(--compare-gap)) / 2);
      transform: none;
    }
    .compare-kicker {
      color: rgba(28, 28, 28, .58);
      font-size: 1.35cqw;
      font-weight: 900;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    .compare-title {
      color: #242220;
      font-family: var(--serif);
      font-size: 3.35cqw;
      line-height: 1.06;
      margin: 0;
    }
    .generic-summary,
    .custom-summary {
      border-left: 3px solid rgba(28,28,28,.16);
      background: rgba(255,255,255,.48);
      color: #4a4744;
      padding: 1cqw 1.2cqw;
      font-size: 1.5cqw;
      line-height: 1.4;
      font-weight: 760;
    }
    .generic-summary strong,
    .custom-summary strong {
      display: block;
      color: #242220;
      font-size: 1.18cqw;
      letter-spacing: .08em;
      text-transform: uppercase;
      margin-bottom: .35cqw;
    }
    .custom-summary {
      border-color: rgba(63,112,106,.78);
      background: rgba(245,246,243,.72);
      color: #242220;
      font-weight: 800;
    }
    .generic-lines,
    .custom-lines {
      display: grid;
      gap: 8px;
      padding: 0;
      margin: 0;
      list-style: none;
    }
    .generic-lines li,
    .custom-lines li {
      border: 1px solid rgba(74,28,42,.1);
      border-radius: .98cqw;
      background: rgba(255,255,255,.54);
      color: var(--muted);
      padding: 1cqw 1.1cqw;
      font-size: 1.38cqw;
      line-height: 1.35;
      font-weight: 760;
    }
    .custom-lines li {
      border-color: rgba(63,112,106,.18);
      background: var(--control-wash);
      color: var(--wine);
    }
    .custom-lines strong {
      color: var(--teal);
      display: block;
      font-size: 1.2cqw;
      letter-spacing: .08em;
      text-transform: uppercase;
      margin-bottom: .42cqw;
    }
    .portable-strip {
      border: 1px solid rgba(28,28,28,.13);
      border-radius: .98cqw;
      background: rgba(255,255,255,.42);
      color: #242220;
      padding: 1cqw 1.2cqw;
      font-size: 1.36cqw;
      line-height: 1.35;
      font-weight: 850;
    }
    .forecast-meta,
    .forecast-kpis {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      border: 1px solid rgba(28, 28, 28, .11);
      border-radius: .9cqw;
      overflow: hidden;
    }
    .forecast-meta span,
    .forecast-kpis span {
      min-width: 0;
      border-left: 1px solid rgba(28, 28, 28, .1);
      background: rgba(255,255,255,.34);
      color: rgba(28, 28, 28, .72);
      padding: .78cqw .85cqw;
      font-size: 1.12cqw;
      line-height: 1.25;
      font-weight: 760;
    }
    .forecast-meta span:first-child,
    .forecast-kpis span:first-child {
      border-left: 0;
    }
    .forecast-meta em,
    .forecast-kpis em {
      display: block;
      color: rgba(28, 28, 28, .48);
      font-size: .92cqw;
      font-style: normal;
      font-weight: 900;
      letter-spacing: .08em;
      text-transform: uppercase;
      margin-bottom: .25cqw;
    }
    .forecast-table {
      width: 100%;
      table-layout: fixed;
      border-collapse: collapse;
      color: #3e3c39;
      font-size: 1.04cqw;
      line-height: 1.25;
    }
    .forecast-table th {
      color: rgba(28, 28, 28, .52);
      font-size: .9cqw;
      font-weight: 900;
      letter-spacing: .07em;
      text-align: left;
      text-transform: uppercase;
      padding: .62cqw .5cqw;
      border-bottom: 1px solid rgba(28, 28, 28, .15);
    }
    .forecast-table td {
      padding: .62cqw .5cqw;
      border-bottom: 1px solid rgba(28, 28, 28, .08);
      vertical-align: top;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .forecast-table td:last-child {
      color: #242220;
      font-weight: 800;
    }
    .forecast-lines {
      display: grid;
      gap: .8cqw;
      border-top: 1px solid rgba(28, 28, 28, .1);
      padding-top: 1cqw;
    }
    .forecast-line {
      height: .68cqw;
      border-radius: 99px;
      background: rgba(28, 28, 28, .1);
    }
    .forecast-line:nth-child(2) { width: 86%; }
    .forecast-line:nth-child(3) { width: 74%; }
    .forecast-line:nth-child(4) { width: 92%; }
    .forecast-line:nth-child(5) { width: 61%; }

    .calibration-graphic {
      width: min(100%, 640px);
    }
    .setup-sheet {
      width: 100%;
      padding: 24px;
      transform: rotate(.25deg);
    }
    .setup-head {
      border-bottom: 1px solid rgba(74,28,42,.12);
      padding-bottom: 14px;
      margin-bottom: 14px;
    }
    .setup-kicker {
      color: var(--muted);
      font-size: 10px;
      font-weight: 900;
      letter-spacing: .08em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .setup-title {
      margin: 0;
      color: var(--wine);
      font-family: var(--serif);
      font-size: 30px;
      line-height: 1.05;
    }
    .setup-table {
      display: grid;
      border: 1px solid rgba(74,28,42,.12);
      border-radius: 8px;
      overflow: hidden;
    }
    .setup-row {
      display: grid;
      grid-template-columns: .72fr 1.28fr;
      gap: 14px;
      border-top: 1px solid rgba(74,28,42,.09);
      background: rgba(255,255,255,.58);
      padding: 13px 14px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.38;
      font-weight: 760;
    }
    .setup-row:first-child { border-top: 0; }
    .setup-row span {
      color: var(--muted);
      font-size: 10px;
      font-weight: 900;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    .setup-row strong {
      color: var(--wine);
      font-weight: 850;
    }
    .setup-row.highlight {
      background: var(--control-wash);
    }
    .setup-row.action {
      background: rgba(63,112,106,.06);
    }
    .proof-board {
      width: min(100%, 620px);
      display: grid;
      gap: 18px;
    }
    .proof-statement {
      padding: 26px;
      background: var(--wine);
      color: white;
      border-radius: 8px;
      box-shadow: var(--shadow);
    }
    .proof-statement h3 {
      font-family: var(--serif);
      font-size: 32px;
      line-height: 1.12;
      margin-bottom: 12px;
    }
    .proof-card {
      padding: 20px;
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: var(--shadow);
    }
    .proof-row {
      display: grid;
      grid-template-columns: 1.2fr .7fr 1fr .8fr;
      gap: 12px;
      padding: 12px 0;
      border-top: 1px solid rgba(74,28,42,.1);
      align-items: center;
      color: var(--muted);
      font-size: 14px;
    }
    .proof-row:first-child { border-top: 0; }
    .proof-row strong { color: var(--wine); }
    .proof-row.head {
      color: var(--muted);
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: .08em;
    }

    .artifact-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
      width: min(100%, 560px);
    }
    .asset-card {
      min-height: 150px;
      padding: 20px;
    }
    .asset-card b {
      display: block;
      color: var(--teal);
      font-family: var(--serif);
      font-size: 34px;
      margin-bottom: 12px;
    }
    .dashboard-row {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      min-height: auto;
    }
    .dashboard-row span {
      border-radius: 6px;
      background: var(--control-wash);
      color: var(--teal);
      padding: 12px 8px;
      font-size: 12px;
      font-weight: 800;
      text-align: center;
    }

    .chooser {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 26px 0;
    }
    .choice {
      border: 1px solid rgba(255,255,255,.22);
      background: rgba(255,255,255,.08);
      color: white;
      border-radius: 999px;
      padding: 10px 14px;
      font: inherit;
      font-size: 14px;
      font-weight: 800;
      cursor: pointer;
    }
    .choice.active,
    .choice:hover {
      background: #f1b58e;
      color: #251b20;
    }
    .cta-line {
      min-height: 54px;
      color: #f1b58e;
      font-family: var(--serif);
      font-size: 30px;
      line-height: 1.15;
    }
    .cta-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-top: 20px;
      border-radius: 999px;
      padding: 13px 18px;
      background: var(--orange);
      color: white;
      text-decoration: none;
      font-weight: 900;
    }

    .scene.is-visible .pack.three,
    .scene.is-visible .proof-statement,
    .scene.is-visible .tool-shell {
      animation: settleIn .75s ease both;
    }
    @keyframes settleIn {
      from { opacity: .35; transform: translateY(18px) rotate(var(--r, 0deg)); }
      to { opacity: 1; }
    }
    @keyframes slideSignal {
      0%, 100% { transform: translateX(0); opacity: .72; }
      50% { transform: translateX(18px); opacity: 1; }
    }
    @media (max-width: 980px) {
      .movie-nav {
        grid-template-columns: 1fr auto;
        gap: 12px;
        padding: 12px 14px;
      }
      .scene-index {
        order: 3;
        grid-column: 1 / -1;
        overflow-x: auto;
        justify-content: flex-start;
        padding-bottom: 2px;
      }
      .quick-links { justify-self: end; }
      .scene:not(.title-scene) {
        grid-template-columns: 1fr;
        gap: 28px;
        padding: 104px 22px 58px;
      }
      .false-path {
        align-content: start;
        gap: 28px !important;
      }
      h1 { font-size: 42px; }
      .title-subline { font-size: 16px; }
      h2 { font-size: 34px; }
      .lead { font-size: 16px; }
      .stage { min-height: 390px; }
      .scene.start {
        grid-template-columns: 1fr;
        padding: 112px 22px 58px;
      }
      .start h2 {
        font-size: 42px;
        margin-bottom: 38px;
      }
      .start-action-row {
        max-width: none;
      }
      .start .cta-button {
        justify-self: start;
        white-space: normal;
      }
      .start-about {
        margin-top: 46px;
      }
      .paradox .stage {
        min-height: auto;
      }
      .paradox .scene-copy h2 {
        margin-bottom: 26px;
      }
      .paradox .lead {
        font-size: 17px;
        line-height: 1.56;
        margin-bottom: 13px;
      }
      .autocomplete-email {
        padding: 5.2cqw;
      }
      .autocomplete-line {
        padding: 0;
      }
      .email-caption {
        margin-top: 13px;
        font-size: 15px;
        line-height: 1.42;
      }
      .paradox-linked {
        grid-template-columns: 1fr;
        gap: 26px;
      }
      .linked-left,
      .linked-copy,
      .linked-right .linked-copy {
        max-width: none;
      }
      .linked-copy {
        font-size: 16px;
      }
      .linked-left .email-draft {
        max-width: none;
      }
      .linked-right {
        grid-template-columns: 1fr;
        gap: 14px;
      }
      .linked-right .recurring-folder {
        min-height: auto;
      }
      .recurring-folder.deliverable-only .unfinished-report {
        min-height: auto;
      }
      .paradox-stage {
        grid-template-columns: 1fr;
        width: 100%;
        gap: 14px;
        justify-items: center;
        padding-top: 0;
        min-height: auto;
      }
      .email-stack {
        transform: none;
        justify-self: center;
        width: calc((100% - var(--compare-gap)) / 2);
      }
      .email-draft,
      .recurring-folder {
        width: 100%;
      }
      .recurring-folder {
        min-height: auto;
        padding: 40px 14px 14px;
      }
      .unfinished-report {
        min-height: auto;
        padding: 18px;
      }
      .unfinished-title {
        font-size: 20px;
      }
      .unfinished-row {
        grid-template-columns: 1fr;
        gap: 5px;
      }
      .trail-board {
        grid-template-columns: 1fr;
        gap: 12px;
        width: 100%;
      }
      .trail-board::before {
        display: none;
      }
      .trail-but {
        justify-self: center;
        width: auto;
        height: auto;
        border: 0;
        border-radius: 0;
        background: transparent;
      }
      .reading-board {
        width: 100%;
      }
      .reading-row {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      .reading-line {
        font-size: 16px;
      }
      .pack-stack,
      .run-stack { height: 360px; }
      .brief-board {
        grid-template-columns: 1fr;
        min-height: auto;
        justify-items: stretch;
        gap: 12px;
      }
      .source-folder {
        width: 100%;
        margin-top: 0;
      }
      .commercial-brief {
        width: 100%;
        transform: none;
        padding: 22px;
      }
      .brief-meta {
        grid-template-columns: 1fr;
      }
      .brief-meta span:nth-child(odd) {
        border-right: 0;
      }
      .brief-title {
        font-size: 22px;
      }
      .metric-grid {
        grid-template-columns: 1fr;
      }
      .metric {
        border-left: 0;
        border-top: 1px solid rgba(47, 35, 39, .14);
      }
      .metric:first-child { border-top: 0; }
      .brief-table {
        font-size: 11px;
      }
      .promise .stage {
        width: 100%;
        min-height: auto;
      }
      .promise-stage {
        width: 100%;
        min-height: auto;
      }
      .challenge .stage {
        width: 100%;
        min-height: auto;
      }
      .challenge-stage {
        width: 100%;
        min-height: auto;
      }
      .insight .stage,
      .turn .stage,
      .resolution .stage {
        width: 100%;
        min-height: auto;
      }
      .repo-stage {
        width: 100%;
        min-height: auto;
      }
      .repo-sheet-shell {
        width: min(100%, 320px);
      }
      .portfolio-shell {
        width: 100%;
      }
      .review-stage {
        grid-template-columns: 1fr;
        width: 100%;
        gap: 12px;
      }
      .review-report {
        transform: none;
        padding: 20px;
      }
      .report-head {
        display: grid;
      }
      .report-title {
        font-size: 25px;
      }
      .report-kpis {
        grid-template-columns: 1fr;
      }
      .report-table {
        font-size: 11px;
      }
      .compare-stage {
        width: 100%;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .false-path .stage {
        width: 100%;
        max-width: 100%;
        min-height: auto;
        align-items: start;
        justify-items: center;
      }
      .compare-report {
        min-height: 0;
      }
      .generic-report {
        transform: rotate(-1.2deg);
      }
      .custom-report {
        transform: rotate(.7deg);
      }
      .calibration-graphic {
        width: 100%;
      }
      .setup-sheet {
        transform: none;
        padding: 20px;
      }
      .setup-title {
        font-size: 26px;
      }
      .setup-row {
        grid-template-columns: 1fr;
        gap: 5px;
      }
      .proof-row {
        grid-template-columns: 1fr;
        gap: 5px;
      }
      .proof-row.head { display: none; }
      .artifact-grid { grid-template-columns: 1fr; }
      .dashboard-row { grid-template-columns: 1fr 1fr; }
      .title-card { padding: 0 24px 16vh; }
    }

    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; scroll-snap-type: none; }
      *, *::before, *::after {
        animation-duration: .001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: .001ms !important;
      }
    }
  
  /* ===== computer-UI artifacts (scenes 05-07), scoped under .cu ===== */
  .cu{
    --cu-brd:#e0e0e5; --cu-hair:#ededf0; --cu-txt:#2a2a30; --cu-txt2:#71717b;
    --cu-green:#2f7d5b; --cu-amber:#9a6a22; --cu-grey:#a6a6ae; --cu-teal:#2e5d57;
    --cu-paper:#fffdf8; --cu-wine:#4a1c2a; --cu-muted:#6f6063;
    --cu-mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
    --cu-sans:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
    --cu-serif:Georgia,"Times New Roman",serif;
    font-family:var(--cu-sans); width:100%; display:grid; place-items:center;
  }
  @media (min-width:981px){ #insight, #turn, #resolution{ grid-template-columns:minmax(240px,.6fr) minmax(440px,1.4fr); } }
  .cu .ws-shell{container-type:inline-size}
  .cu .ws{width:100%;background:#fff;border:1px solid var(--cu-brd);border-radius:.7cqw;
    box-shadow:0 22px 52px rgba(40,40,55,.16);overflow:hidden;color:var(--cu-txt)}
  .cu .ws-bar{display:flex;align-items:center;gap:.9cqw;padding:1.15cqw 1.6cqw;background:#fbfbfd;
    border-bottom:1px solid var(--cu-brd);font:700 1.32cqw/1 var(--cu-mono);color:var(--cu-txt2)}
  .cu .ws-bar b{color:var(--cu-txt);font-weight:800}
  .cu .ws-bar .sep{opacity:.5}
  .cu .ws-bar .ind{margin-left:auto;font:700 1.14cqw/1 var(--cu-mono);color:var(--cu-txt2)}
  .cu .ws-bar .aitabs{margin-left:auto;display:flex;gap:.6cqw}
  .cu .ws-bar .ai{border:1px solid var(--cu-brd);background:#fff;border-radius:.3cqw;padding:.4cqw .75cqw;font:700 1.02cqw/1 var(--cu-mono);color:var(--cu-txt2)}

  /* 05 workspace */
  .cu .ws-grid{display:grid;grid-template-columns:21% minmax(0,1fr) 35%}
  .cu .col{min-width:0;overflow:hidden}
  .cu .side{background:#fff;border-right:1px solid var(--cu-brd)}
  .cu .editor{background:#fff}
  .cu .right{background:#fff;border-left:1px solid var(--cu-brd)}
  .cu .col-h{font:800 1.0cqw/1 var(--cu-sans);letter-spacing:.1em;text-transform:uppercase;color:var(--cu-txt2);padding:1.2cqw 1.4cqw .9cqw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .cu .tree{font:600 1.36cqw/2.15 var(--cu-mono);color:#43434c;padding-bottom:1cqw}
  .cu .tree div{padding:.18cqw 1.4cqw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .cu .tree .d{color:var(--cu-txt);font-weight:800}
  .cu .tree .s2{padding-left:2.7cqw}
  .cu .tree .s3{padding-left:4cqw}
  .cu .tree .ct{color:var(--cu-txt2);font-weight:600}
  .cu .tree .open{background:#e9eef7;color:#22364f;font-weight:800;border-left:.24cqw solid #5d7bb0;padding-left:1.16cqw}
  .cu .tree .out-open{background:#e9eef7;color:#22364f;font-weight:800;border-left:.24cqw solid #5d7bb0;padding-left:3.76cqw}
  .cu .tree .n{color:#3f6fb4;font-weight:800}
  .cu .file{padding:.4cqw 1.6cqw 1.4cqw;color:#3a3a42}
  .cu .file h4{margin:.3cqw 0 1cqw;font-family:var(--cu-serif);font-size:2.15cqw;line-height:1.05;color:var(--cu-txt);font-weight:700}
  .cu .file .k{font:800 1.0cqw/1 var(--cu-sans);letter-spacing:.08em;text-transform:uppercase;color:var(--cu-txt2);margin:1.5cqw 0 .55cqw}
  .cu .file .m{font-family:var(--cu-mono);font-size:1.34cqw;line-height:1.8;color:#3a3a42}
  .cu .file .m .num{color:#3f6fb4}
  .cu .file .m .crit{color:#b03a2e;font-weight:800}
  .cu .file p{margin:0;font-size:1.42cqw;line-height:1.5;color:#4a4a52}
  .cu .out-path{font:700 1.05cqw/1 var(--cu-mono);color:var(--cu-txt2);padding:0 1.4cqw 1cqw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .cu .deliv{margin:0 1.4cqw;background:var(--cu-paper);border:1px solid rgba(35,35,35,.15);border-radius:.4cqw;box-shadow:0 1cqw 2.6cqw rgba(40,40,55,.14);padding:1.35cqw 1.45cqw;color:#242220;font-family:var(--cu-sans)}
  .cu .deliv-head{display:flex;justify-content:space-between;align-items:start;gap:1cqw;border-bottom:1px solid rgba(28,28,28,.09);padding-bottom:1cqw;margin-bottom:1cqw}
  .cu .deliv-kick{font:900 .94cqw/1 var(--cu-sans);letter-spacing:.08em;text-transform:uppercase;color:var(--cu-muted);margin-bottom:.45cqw}
  .cu .deliv-title{margin:0;font-family:var(--cu-serif);font-size:1.9cqw;line-height:1.08;color:var(--cu-wine);font-weight:700}
  .cu .deliv-per{font:850 1.04cqw/1 var(--cu-mono);color:var(--cu-muted);border:1px solid rgba(35,35,35,.15);border-radius:.35cqw;padding:.42cqw .72cqw;white-space:nowrap}
  .cu .deliv-take{background:rgba(46,93,87,.06);border-left:.26cqw solid var(--cu-teal);border-radius:.25cqw;padding:.9cqw 1cqw;font:740 1.3cqw/1.42 var(--cu-sans);color:#3a3633;margin-bottom:1cqw}
  .cu .deliv-kpis{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid rgba(28,28,28,.09);border-radius:.35cqw;overflow:hidden;margin-bottom:1cqw}
  .cu .deliv-kpis span{min-width:0;border-left:1px solid rgba(28,28,28,.09);padding:.72cqw .78cqw;font:800 1.45cqw/1.1 var(--cu-sans);color:var(--cu-wine);overflow:hidden;text-overflow:ellipsis}
  .cu .deliv-kpis span:first-child{border-left:0}
  .cu .deliv-kpis em{display:block;font:900 .86cqw/1 var(--cu-sans);letter-spacing:.05em;text-transform:uppercase;color:var(--cu-muted);margin-bottom:.5cqw;font-style:normal}
  .cu .deliv table{width:100%;border-collapse:collapse;table-layout:fixed}
  .cu .deliv th{font:900 .86cqw/1 var(--cu-sans);letter-spacing:.05em;text-transform:uppercase;text-align:left;color:var(--cu-muted);padding:0 .5cqw .7cqw;border-bottom:1px solid rgba(28,28,28,.09)}
  .cu .deliv td{padding:.72cqw .5cqw;border-bottom:1px solid rgba(28,28,28,.06);font:680 1.3cqw/1.25 var(--cu-sans);color:#3e3c39;overflow:hidden;text-overflow:ellipsis}
  .cu .deliv td:last-child{color:var(--cu-wine);font-weight:800;text-align:right}
  .cu .deliv-foot{margin-top:1cqw;border-top:1px solid rgba(28,28,28,.09);padding-top:.8cqw;font:700 1.1cqw/1.5 var(--cu-mono);color:var(--cu-muted)}
  .cu .deliv-foot .ok{color:var(--cu-teal)}

  /* 06 + 07 dashboards */
  .cu .dash{padding:1.6cqw}
  .cu .kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:.8cqw;margin-bottom:1.6cqw}
  .cu .kpi{border:1px solid var(--cu-brd);border-radius:.5cqw;padding:.95cqw 1cqw;min-width:0}
  .cu .kpi em{display:block;font:800 .96cqw/1.15 var(--cu-sans);letter-spacing:.04em;text-transform:uppercase;color:var(--cu-txt2);margin-bottom:.7cqw;font-style:normal}
  .cu .kpi b{display:block;font:800 1.95cqw/1 var(--cu-sans);color:var(--cu-txt);white-space:nowrap}
  .cu .kpi b small{font-size:1.2cqw;font-weight:800;color:var(--cu-txt2)}
  .cu .kpi .sub{display:block;font:700 .88cqw/1.25 var(--cu-sans);color:var(--cu-txt2);margin-top:.6cqw}
  .cu .slab{font:800 1.06cqw/1 var(--cu-sans);letter-spacing:.07em;text-transform:uppercase;color:var(--cu-txt2);margin-bottom:1.3cqw}
  .cu .plot{border:1px solid var(--cu-brd);border-radius:.5cqw;padding:1.4cqw 1.5cqw 1.1cqw;margin-bottom:1.4cqw}
  .cu .rgroup{margin-bottom:1.1cqw}
  .cu .rgroup:last-child{margin-bottom:0}
  .cu .rghead{display:flex;justify-content:space-between;align-items:baseline;gap:1cqw;padding:.2cqw 0 .7cqw;border-bottom:1px solid var(--cu-brd);margin-bottom:.3cqw}
  .cu .rghead .nm{font:800 1.26cqw/1 var(--cu-sans);color:var(--cu-txt)}
  .cu .rghead .st{font:800 1.14cqw/1 var(--cu-mono);color:var(--cu-txt2)}
  .cu .rrow{display:grid;grid-template-columns:5.5cqw 1fr 5cqw;gap:1.2cqw;align-items:center;padding:.62cqw 0;border-bottom:1px solid var(--cu-hair)}
  .cu .rrow:last-child{border-bottom:0}
  .cu .rrow .rid{font:700 1.14cqw/1 var(--cu-mono);color:var(--cu-txt2)}
  .cu .rrow .bar{height:1.05cqw;border-radius:99px;background:#ececf0;position:relative;overflow:hidden}
  .cu .rrow .bar i{position:absolute;left:0;top:0;bottom:0;border-radius:99px}
  .cu .rrow.flow .bar i{background:var(--cu-green)}
  .cu .rrow.alone .bar i{background:var(--cu-grey)}
  .cu .rrow .sc{font:800 1.24cqw/1 var(--cu-mono);color:var(--cu-txt);text-align:right}
  .cu .checks{display:flex;align-items:center;gap:1.4cqw;border:1px solid var(--cu-brd);border-radius:.5cqw;padding:1cqw 1.3cqw;font:700 1.2cqw/1.4 var(--cu-mono);color:var(--cu-txt2);flex-wrap:wrap}
  .cu .checks .ok{color:var(--cu-green);font-weight:850}
  .cu .checks b{color:var(--cu-txt);font-weight:800}
  .cu .checks .d{opacity:.45}
  .cu .totals{display:grid;grid-template-columns:repeat(5,1fr);gap:.75cqw;margin-bottom:1.5cqw}
  .cu .tot{border:1px solid var(--cu-brd);border-radius:.5cqw;padding:.9cqw .95cqw;min-width:0}
  .cu .tot.value{border-color:rgba(154,106,34,.4);background:rgba(154,106,34,.045)}
  .cu .tot em{display:block;font:800 .92cqw/1.15 var(--cu-sans);letter-spacing:.03em;text-transform:uppercase;color:var(--cu-txt2);margin-bottom:.65cqw;font-style:normal}
  .cu .tot b{display:block;font:800 1.85cqw/1 var(--cu-sans);color:var(--cu-txt);white-space:nowrap}
  .cu .tot b small{font-size:1.1cqw;font-weight:800;color:var(--cu-txt2)}
  .cu .tot .sub{display:block;font:800 .82cqw/1.25 var(--cu-sans);color:var(--cu-txt2);margin-top:.6cqw}
  .cu .tot .sub.proj{color:var(--cu-amber)}
  .cu .ptable{width:100%;border-collapse:collapse;table-layout:fixed}
  .cu .ptable th{font:900 .88cqw/1.2 var(--cu-sans);letter-spacing:.04em;text-transform:uppercase;text-align:left;color:var(--cu-txt2);padding:0 .55cqw 1cqw;border-bottom:1px solid var(--cu-brd)}
  .cu .ptable th .star{color:var(--cu-amber)}
  .cu .ptable td{padding:.95cqw .55cqw;border-bottom:1px solid var(--cu-hair);font:700 1.28cqw/1.25 var(--cu-txt);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:middle}
  .cu .ptable tr:last-child td{border-bottom:0}
  .cu .ptable .wf{font-family:var(--cu-mono);font-weight:700;color:var(--cu-txt)}
  .cu .ptable .num{font-family:var(--cu-mono);color:var(--cu-txt2);font-weight:700}
  .cu .ptable .q{font-family:var(--cu-mono);color:var(--cu-txt);font-weight:850}
  .cu .ptable .hrs{font-family:var(--cu-mono);color:var(--cu-amber);font-weight:850}
  .cu .ptable th.r,.cu .ptable td.r{text-align:right}
  .cu .st{font:900 1.02cqw/1 var(--cu-sans);letter-spacing:.04em;text-transform:uppercase}
  .cu .st.ok{color:var(--cu-green)}
  .cu .st.watch{color:var(--cu-amber)}
  .cu .value-line{display:flex;align-items:baseline;gap:.8cqw;flex-wrap:wrap;margin-top:1.3cqw;border:1px solid rgba(154,106,34,.4);border-left:.3cqw solid var(--cu-amber);border-radius:.45cqw;background:rgba(154,106,34,.05);padding:.95cqw 1.1cqw}
  .cu .value-line .tg{font:900 .86cqw/1 var(--cu-sans);letter-spacing:.06em;text-transform:uppercase;color:var(--cu-amber)}
  .cu .value-line .v{font:800 1.32cqw/1.35 var(--cu-sans);color:var(--cu-txt)}
  .cu .value-line .v b{color:var(--cu-wine);font-weight:850}
  .cu .value-line .note{font:700 1.04cqw/1.3 var(--cu-mono);color:var(--cu-txt2)}
  .cu .basis{margin-top:1cqw;font:700 1.0cqw/1.5 var(--cu-mono);color:var(--cu-txt2)}
  .cu .basis b{color:var(--cu-txt);font-weight:800}

  `;

const BODY = `
  <header class="movie-nav" aria-label="Movie website navigation">
    <a class="brand" href="#title">Eclipsai</a>
    <nav class="scene-index" aria-label="Scene index">
      <a href="#title" data-scene-link>00</a>
      <a href="#paradox" data-scene-link>01</a>
      <a href="#promise" data-scene-link>02</a>
      <a href="#challenge" data-scene-link>03</a>
      <a href="#false-path" data-scene-link>04</a>
      <a href="#insight" data-scene-link>05</a>
      <a href="#turn" data-scene-link>06</a>
      <a href="#resolution" data-scene-link>07</a>
      <a href="#start" data-scene-link>08</a>
    </nav>
    <div class="quick-links" aria-label="Quick links">
      <a href="#turn">Proof</a>
      <a href="#start">Start</a>
      <a href="#faq">FAQ</a>
    </div>
  </header>

  <main>
    <section class="scene title-scene" id="title" data-scene="00" aria-label="Title">
      <img src="/assets/cinematic-prototype/hero-watchtable.jpg" alt="Decision brief waiting on an executive table before the workday starts." width="1672" height="941" loading="eager" decoding="async" fetchpriority="high">
      <div class="title-card">
        <h1>Some work should <span class="hero-strike">be done by hand</span> <span class="hero-add">simply be ready.</span></h1>
        <p class="title-subline">The work behind recurring decisions, ready before you ask<br>Inside the AI tools you already use</p>
      </div>
    </section>

    <section class="scene paradox" id="paradox" data-scene="01">
      <div class="scene-copy">
        <h2>If AI can do it, why are you still working on it?</h2>
        <p class="lead">AI helps with drafts, summaries, and research.</p>
        <p class="lead">But the work behind recurring decisions is <strong>not done for you</strong>.</p>
        <p class="lead">You still have to reconcile the numbers, find the exceptions, and prepare the review.</p>
      </div>
      <div class="stage paradox-stage" aria-hidden="true">
        <div class="gd-stack">
          <article class="gd4-card" aria-label="GDPval benchmark extract">
            <div class="gd4-proof">
              <p><strong>80%+</strong> wins or ties human experts</p>
              <p><strong>~100x</strong> faster and cheaper</p>
            </div>
            <div class="gd4-rule"></div>
            <div class="gd4-ex">
              <div class="gd4-exh">Example tasks.</div>
              <ul>
                <li>Summarize revenue and expense movements from operating files, then produce a finance lead's review note.</li>
                <li>Analyze full-year retail sales, identify performance drivers, and prepare a regional account recap.</li>
              </ul>
            </div>
            <div class="gd4-note">GDPval tests models on well-defined workplace deliverables: OpenAI GPT-5.5 - 84.9%; Claude Opus 4.7 - 80.3%.</div>
          </article>
        </div>
      </div>
    </section>

    <section class="scene promise" id="promise" data-scene="02">
      <div class="scene-copy">
        <h2>What if Monday’s work was already waiting for review?</h2>
        <p class="lead">Not a blank page. Not a prompt to start from.</p>
        <p class="lead">The facts changed overnight: cash moved, the forecast shifted, a bank file arrived.</p>
        <p class="lead">By the time the day starts, the analysis is refreshed, checked, and ready for the decision.</p>
      </div>
      <div class="stage" aria-hidden="true">
        <div class="compare-stage promise-single">
          <div class="artifact compare-report custom-report">
            <div class="report-doc-head">
              <div>
                <h3 class="compare-title">W24 treasury actions</h3>
              </div>
              <div class="report-period">09:00</div>
            </div>
            <div class="forecast-meta">
              <span><em>Review</em>Committee</span>
              <span><em>Owner</em>Treasury</span>
              <span><em>Cutoff</em>08:30</span>
            </div>
            <div class="custom-summary"><strong>Takeaway</strong>Receivable delay creates downside gap under stress case. Committee decision needed before 09:00.</div>
            <div class="forecast-kpis">
              <span><em>Risk</em>Funding gap</span>
              <span><em>Stress</em>CHF -6.4m</span>
              <span><em>Decision</em>09:00</span>
            </div>
            <table class="forecast-table">
              <thead>
                <tr><th>Item</th><th>Signal</th><th>Trigger</th><th>Action</th></tr>
              </thead>
              <tbody>
                <tr><td>Bank variance</td><td>CHF -1.2m</td><td>Late sweep</td><td>Confirm file</td></tr>
                <tr><td>Receivable</td><td>+3 days</td><td>Friday slip</td><td>Escalate owner</td></tr>
                <tr><td>Downside case</td><td>CHF -6.4m</td><td>Gap appears</td><td>Prepare bridge</td></tr>
                <tr><td>Committee note</td><td>Open decision</td><td>09:00 review</td><td>Update memo</td></tr>
                <tr><td>Run log</td><td>W24 complete</td><td>Checks passed</td><td>Record run</td></tr>
              </tbody>
            </table>
            <div class="portable-strip">Before 09:00: confirm bridge facility trigger and update committee note.</div>
          </div>
        </div>
      </div>
    </section>

    <section class="scene challenge" id="challenge" data-scene="03">
      <div class="scene-copy">
        <h2>Plausible is not enough.</h2>
        <p class="lead">The review has to be right: the movement explained, the exception clear, the recommendation defensible.</p>
        <p class="lead">Producing it once is hard enough. Next cycle, the inputs change, the template shifts, or a reviewer asks a new question.</p>
        <p class="lead"><strong>One stale number or missed exception is enough to break trust.</strong></p>
      </div>
      <div class="stage" aria-hidden="true">
        <div class="challenge-stage">
          <div class="challenge-report-shell">
            <div class="artifact challenge-report">
              <div class="report-doc-head">
                <div>
                  <h3 class="compare-title">Treasury weekly review</h3>
                </div>
                <div class="report-period">Needs review</div>
              </div>
              <div class="forecast-meta">
                <span><em>Prepared</em>08:12</span>
                <span><em>Review</em>09:00</span>
                <span><em>Source</em>W24 draft</span>
              </div>
              <div class="generic-summary"><strong>Takeaway</strong>Cash position appears stable. No funding action required before the committee review.</div>
              <div class="forecast-kpis">
                <span><em>Cash</em>CHF 42.6m</span>
                <span><em>Cash variance</em><span class="wrong-number">CHF 0.2m</span><span class="correct-number">CHF 1.2m</span></span>
                <span><em>Status</em>Needs review</span>
              </div>
              <div class="review-note-box"><strong>Reviewer note</strong>Latest bank file not used. Rebuild conclusion before 09:00.</div>
              <table class="forecast-table">
                <thead>
                  <tr><th>Item</th><th>Draft read</th><th>Issue</th><th>Reviewer action</th></tr>
                </thead>
                <tbody>
                  <tr><td>Opening cash</td><td>CHF 42.6m</td><td>Within policy</td><td>Keep</td></tr>
                  <tr><td>Bank variance</td><td class="wrong-cell">CHF 0.2m</td><td>Latest file missing</td><td>Correct to CHF 1.2m</td></tr>
                  <tr><td>Receivables delay</td><td>+1 day</td><td>Actual slip is +3 days</td><td>Update stress case</td></tr>
                  <tr><td>Downside stress</td><td class="wrong-cell">No gap</td><td>Funding gap missed</td><td>Rebuild conclusion</td></tr>
                  <tr><td>Committee action</td><td>No decision</td><td>Trigger unclear</td><td>Prepare bridge option</td></tr>
                </tbody>
              </table>
              <div class="forecast-lines">
                <span class="forecast-line"></span>
                <span class="forecast-line"></span>
                <span class="forecast-line"></span>
                <span class="forecast-line"></span>
                <span class="forecast-line"></span>
                <span class="forecast-line"></span>
              </div>
              <div class="review-strip">Conclusion cannot be used</div>
              <div class="report-note">Draft looks complete, but one stale file changes the recommendation.</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="scene false-path" id="false-path" data-scene="04">
      <div class="scene-copy">
        <h2>Don't wait for better AI.</h2>
        <p class="lead">Better models can challenge assumptions, surface options, and work harder.</p>
        <p class="lead">They still do not arrive knowing what “right” means here: what matters, what to trust, and how the work is done.</p>
        <p class="lead"><strong>So we build around your own work instead. Portable across tools. Owned by you.</strong></p>
      </div>
      <div class="stage" aria-hidden="true">
        <div class="gd-stack">
          <article class="gd4-card" aria-label="OfficeQA Pro benchmark extract">
            <div class="gd4-proof">
              <p><strong>54%</strong> accuracy on real enterprise work, with standard agent setup</p>
              <p><strong>+0.9 pts</strong> improvement from GPT-5.4 to GPT-5.5</p>
            </div>
            <div class="gd4-rule"></div>
            <div class="gd4-ex">
              <div class="gd4-exh">Example tasks.</div>
              <ul>
                <li>Find the latest revised Treasury value, not the earlier preliminary value.</li>
                <li>Extract the required value from a chart or figure, then calculate the final answer.</li>
              </ul>
            </div>
            <div class="gd4-note">OfficeQA Pro tests exact answers across enterprise-style documents: OpenAI GPT-5.5 - 54.1%; Claude Opus 4.7 - 43.6%</div>
          </article>
        </div>
      </div>
    </section>

    <section class="scene insight" id="insight" data-scene="05">
      <div class="scene-copy">
        <h2>Build the system around the work.</h2>
        <p class="lead">We start with the decision: its inputs, outputs, quality bar, and expectations.</p>
        <p class="lead">The work behind it becomes a workflow standard: required files, gates, critical checks, and a run ledger.</p>
        <p class="lead">The system is built while it runs and leaves evidence behind.</p>
      </div>
      <div class="stage" aria-hidden="true">
        <div class="cu">
          <div class="ws-shell" style="width:min(100%,800px)">
            <div class="ws">
              <div class="ws-bar">treasury-weekly-review <span class="sep">/</span> <b>SKILL.md</b>
                <span class="aitabs"><span class="ai">claude</span><span class="ai">codex</span><span class="ai">copilot</span><span class="ai">gemini</span></span>
              </div>
              <div class="ws-grid">
                <div class="col side">
                  <div class="col-h">The system</div>
                  <div class="tree">
                    <div class="d">treasury-weekly-review/</div>
                    <div class="s2 open">SKILL.md</div>
                    <div class="s2 d">inputs/ <span class="ct">3 files</span></div>
                    <div class="s2 d">checks/ <span class="ct">2 critical</span></div>
                    <div class="s2 d">outputs/</div>
                    <div class="out-open">committee-memo.md</div>
                    <div class="s2">runs.jsonl <span class="n">14</span></div>
                  </div>
                </div>
                <div class="col editor">
                  <div class="col-h">The standard</div>
                  <div class="file">
                    <h4>Treasury weekly review</h4>
                    <p>Turn the weekly treasury pack into a reconciled position, a downside stress, and a committee-ready memo.</p>
                    <div class="k">Inputs</div>
                    <div class="m">bank file · cash forecast · receivables</div>
                    <div class="k">Run sequence</div>
                    <div class="m">
                      <span class="num">1</span>&nbsp; reconcile cash against latest bank file<br>
                      <span class="num">2</span>&nbsp; flag exceptions and receivables movement<br>
                      <span class="num">3</span>&nbsp; stress the downside funding case<br>
                      <span class="num">4</span>&nbsp; draft committee memo and actions<br>
                      <span class="num">5</span>&nbsp; validate traceability · log run
                    </div>
                    <div class="k">Critical checks</div>
                    <div class="m">reconciliation&nbsp;&nbsp;<span class="crit">must pass</span><br>numeric traceability&nbsp;&nbsp;<span class="crit">must pass</span></div>
                    <div class="k">Quality bar</div>
                    <p>Every number traces to a source cell. Every exception named.</p>
                    <div class="k">Reviewer · cadence</div>
                    <div class="m">Group Treasury · Monday before 09:00</div>
                  </div>
                </div>
                <div class="col right">
                  <div class="col-h">The deliverable it produces</div>
                  <div class="out-path">outputs / committee-memo.md</div>
                  <div class="deliv">
                    <div class="deliv-head">
                      <div><div class="deliv-kick">Committee memo</div><h5 class="deliv-title">Treasury weekly review</h5></div>
                      <div class="deliv-per">W24</div>
                    </div>
                    <div class="deliv-take">Cash is within policy, but the delayed receivable opens a CHF 6.4m funding gap under the downside case. Confirm the bridge facility before the 09:00 committee.</div>
                    <div class="deliv-kpis">
                      <span><em>Cash</em>CHF 42.6m</span>
                      <span><em>Variance</em>CHF 1.2m</span>
                      <span><em>Downside</em>−6.4m</span>
                    </div>
                    <table>
                      <thead><tr><th>Item</th><th>Action</th></tr></thead>
                      <tbody>
                        <tr><td>Bank variance</td><td>Corrected 1.2m</td></tr>
                        <tr><td>Receivables</td><td>+3 day slip</td></tr>
                        <tr><td>Downside case</td><td>Bridge trigger</td></tr>
                      </tbody>
                    </table>
                    <div class="deliv-foot">reconciliation <span class="ok">pass</span> · traceability <span class="ok">pass</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p class="artifact-caption"><strong>What the decision needs:</strong> the files to use, facts to check, exceptions to catch, and finished work to review.</p>
      </div>
    </section>

    <section class="scene turn" id="turn" data-scene="06">
      <div class="scene-copy">
        <h2>Then prove it’s right.</h2>
        <p class="lead">A good-looking review is not enough.</p>
        <p class="lead">We run it again and again, with and without the workflow layer. It holds where AI alone drifts.</p>
        <p class="lead"><strong>The proof is repeated runs, critical checks, measured consistency, and the time saved.</strong></p>
      </div>
      <div class="stage" aria-hidden="true">
        <div class="cu">
          <div class="ws-shell" style="width:min(100%,740px)">
            <div class="ws">
              <div class="ws-bar">treasury-weekly-review <span class="sep">/</span> <b>performance</b>
                <span class="ind">14 runs</span>
              </div>
              <div class="dash">
                <div class="kpis">
                  <div class="kpi"><em>Runs</em><b>14</b><span class="sub">logged runs</span></div>
                  <div class="kpi"><em>Quality</em><b>87.78</b><span class="sub">mean score</span></div>
                  <div class="kpi"><em>Consistency</em><b>0.00</b><span class="sub">score spread</span></div>
                  <div class="kpi"><em>AI-alone gap</em><b>+6.78</b><span class="sub">vs naked baseline</span></div>
                  <div class="kpi"><em>Run time</em><b>~6<small>min</small></b><span class="sub">per logged run</span></div>
                </div>
                <div class="plot">
                  <div class="slab">Proof runs · ES-treasury-weekly-review-001 · score 0–100</div>
                  <div class="rgroup">
                    <div class="rghead"><span class="nm">Workflow layer</span><span class="st">mean 87.78 · spread 0.00</span></div>
                    <div class="rrow flow"><span class="rid">R-002</span><span class="bar"><i style="width:87.78%"></i></span><span class="sc">87.78</span></div>
                    <div class="rrow flow"><span class="rid">R-003</span><span class="bar"><i style="width:87.78%"></i></span><span class="sc">87.78</span></div>
                    <div class="rrow flow"><span class="rid">R-004</span><span class="bar"><i style="width:87.78%"></i></span><span class="sc">87.78</span></div>
                  </div>
                  <div class="rgroup">
                    <div class="rghead"><span class="nm">AI alone</span><span class="st">mean 81.00 · spread 8.33</span></div>
                    <div class="rrow alone"><span class="rid">R-008</span><span class="bar"><i style="width:80.44%"></i></span><span class="sc">80.44</span></div>
                    <div class="rrow alone"><span class="rid">R-009</span><span class="bar"><i style="width:85.44%"></i></span><span class="sc">85.44</span></div>
                    <div class="rrow alone"><span class="rid">R-010</span><span class="bar"><i style="width:77.11%"></i></span><span class="sc">77.11</span></div>
                  </div>
                </div>
                <div class="checks">
                  <span>reconciliation <span class="ok">3/3 pass</span></span><span class="d">·</span>
                  <span>numeric traceability <span class="ok">67/67 claims pass</span></span><span class="d">·</span>
                  <span>cost <b>CHF 0.086</b> / run</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p class="artifact-caption"><strong>Proof the decision is supported:</strong> checked, scored, compared, and traceable back to the facts.</p>
      </div>
    </section>

    <section class="scene resolution" id="resolution" data-scene="07">
      <div class="scene-copy">
        <h2>One workflow. Then another.</h2>
        <p class="lead">After the first job, you keep more than the output.</p>
        <p class="lead">The workflow runs again, records cost and time saved, checks quality, and shows whether the standard is holding.</p>
        <p class="lead">As more workflows are added, management gets one view of the work AI is actually doing.</p>
      </div>
      <div class="stage" aria-hidden="true">
        <div class="cu">
          <div class="ws-shell" style="width:min(100%,760px)">
            <div class="ws">
              <div class="ws-bar">portfolio <span class="sep">/</span> <b>2026-06</b>
                <span class="ind">generated from run ledgers</span>
              </div>
              <div class="dash">
                <div class="totals">
                  <div class="tot value"><em>Hours saved / wk</em><b>~7<small>h</small></b><span class="sub proj">projected</span></div>
                  <div class="tot"><em>Workflows</em><b>3</b><span class="sub">reported</span></div>
                  <div class="tot"><em>Total runs</em><b>78</b><span class="sub">logged</span></div>
                  <div class="tot"><em>Run cost</em><b>CHF 5.02</b><span class="sub">estimated</span></div>
                  <div class="tot"><em>Proven</em><b>2<small>/3</small></b><span class="sub">1 in review</span></div>
                </div>
                <table class="ptable">
                  <thead>
                    <tr>
                      <th style="width:30%">Workflow</th>
                      <th class="r" style="width:10%">Runs</th>
                      <th class="r" style="width:16%">Cost CHF</th>
                      <th class="r" style="width:13%">Quality</th>
                      <th class="r" style="width:15%">Hrs/wk<span class="star">*</span></th>
                      <th class="r" style="width:16%">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="wf">treasury-weekly-review</td>
                      <td class="num r">14</td><td class="num r">1.1456</td><td class="q r">87.78</td>
                      <td class="hrs r">~4h</td><td class="r"><span class="st ok">Proven</span></td>
                    </tr>
                    <tr>
                      <td class="wf">weekly-status-summarizer</td>
                      <td class="num r">54</td><td class="num r">3.3697</td><td class="q r">95.68</td>
                      <td class="hrs r">~2h</td><td class="r"><span class="st ok">Proven</span></td>
                    </tr>
                    <tr>
                      <td class="wf">statusbot-adopted</td>
                      <td class="num r">10</td><td class="num r">0.5040</td><td class="q r">—</td>
                      <td class="hrs r">~1h</td><td class="r"><span class="st watch">Watch</span></td>
                    </tr>
                  </tbody>
                </table>
                <div class="value-line">
                  <span class="tg">Projected value</span>
                  <span class="v">≈ <b>7 analyst-hours / week</b> given back &nbsp;·&nbsp; ≈ <b>CHF 26k / year</b></span>
                  <span class="note">* hours &amp; value projected, to validate · CHF 70/hr fully loaded</span>
                </div>              </div>
            </div>
          </div>
        </div>
        <p class="artifact-caption"><strong>Whether it is worth scaling:</strong> time and cost saved versus doing the work manually.</p>
      </div>
    </section>

    <section class="scene start" id="start" data-scene="08">
      <img class="start-bg" src="/assets/cinematic-prototype/hero-watchtable.jpg" alt="" width="1672" height="941" loading="lazy" decoding="async">
      <div class="scene-copy">
        <h2>For teams using AI but still doing the work.</h2>
        <div class="start-action-row">
          <div class="start-body">
            <p class="lead">Pick one recurring business decision you need to prepare for.</p>
            <p class="lead">In two to three weeks, we prove the work behind it can be ready before you ask.</p>
            <p class="lead start-tight">Fixed first scope. Continue only where value is proven. You keep what we build.</p>
            <a class="cta-button" href="#contact">Start with one decision</a>
            <p class="start-fineprint">Fixed first scope. One recurring decision. Priced after we understand the decision, data, and delivery environment.</p>
          </div>
        </div>
        <div class="start-about">
          <p>Eclipsai builds managed AI workflows for recurring business work. Led by Chip Alexandru, 20+ years in strategy consulting at BCG, PwC, and Accenture.</p>
        </div>
      </div>
    </section>

    <section id="faq" class="faq-section" aria-label="Frequently asked questions">
      <div class="faq-inner">
        <h2 class="faq-title">Questions before you bring one decision</h2>
        <p class="faq-intro">Practical answers for teams considering a fixed first scope.</p>
        <div class="faq-list">
          <details class="faq-item">
            <summary>What do we get after the first proof?</summary>
            <div class="faq-a"><p>You get the work behind one recurring business decision: the recommendation, supporting analysis, source evidence, and backup material. You also get the workflow folder that can recreate the work for future cycles in your own AI environment.</p></div>
          </details>
          <details class="faq-item">
            <summary>What kind of work is this for?</summary>
            <div class="faq-a"><p>Recurring internal business work where a team prepares facts, exceptions, analysis, and a recommendation before a decision. Good examples include commercial reviews, finance reviews, management notes, QBR packs, category reviews, account briefs, and market scans.</p></div>
          </details>
          <details class="faq-item">
            <summary>What is not a good fit?</summary>
            <div class="faq-a"><p>Work that is not based on facts, sources, or analysis is not a good first fit. We also do not start with external reporting, audit, legal, HR, customer-facing decisions, regulatory filings, or workflows where an unchecked error would create unacceptable risk.</p></div>
          </details>
          <details class="faq-item">
            <summary>How does Eclipsai build the workflow?</summary>
            <div class="faq-a"><p>We start with the decision: its inputs, outputs, quality bar, and expectations. The work behind it becomes a workflow standard: required files, source maps, gates, critical checks, evaluation criteria, and a run ledger.</p></div>
          </details>
          <details class="faq-item">
            <summary>Does the workflow make the decision?</summary>
            <div class="faq-a"><p>No. The workflow prepares the work behind the decision. The decision owner remains responsible for reviewing the output, checking the evidence, and approving the final decision.</p></div>
          </details>
          <details class="faq-item">
            <summary>How do we know the output is right?</summary>
            <div class="faq-a"><p>Before the proof starts, we agree what “good enough to support the decision” means. Typical checks include correct facts, source traceability, missing-data flags, exception handling, defensible recommendation, and reviewer confidence. The workflow can also be compared against direct AI use without the workflow layer.</p></div>
          </details>
          <details class="faq-item">
            <summary>What do you need from us?</summary>
            <div class="faq-a"><p>One named recurring decision, the source files normally used, and ideally four to five prior examples of the report, review, pack, or memo. We also need the people closest to the decision quality for one scoping meeting and two joint review sessions.</p></div>
          </details>
          <details class="faq-item">
            <summary>Where does the workflow run?</summary>
            <div class="faq-a"><p>The first workflow is built for Codex or Claude Desktop. The preferred setup is to run in your own approved environment. Broader Microsoft, AWS, or other platform implementation can be assessed later.</p></div>
          </details>
          <details class="faq-item">
            <summary>What does the first proof cost?</summary>
            <div class="faq-a"><p>The first proof is fixed-scope and priced after we understand the decision, data, and delivery environment. It covers one recurring decision workflow. Multiple workflows, system integration, broad platform rollout, stakeholder training, and ongoing maintenance are separate.</p></div>
          </details>
          <details class="faq-item">
            <summary>What happens if the proof does not work?</summary>
            <div class="faq-a"><p>If the workflow does not meet the agreed quality standard for the agreed one-decision scope, we keep improving within that scope or refund the proof fee. If refunded, the workflow is not used.</p></div>
          </details>
          <details class="faq-item">
            <summary>What happens after the first proof?</summary>
            <div class="faq-a"><p>If the workflow proves value, you can maintain it internally, ask Eclipsai to maintain and improve it, or expand into a portfolio of managed workflows across more recurring decisions. As more workflows are added, management gets one view of the work AI is actually doing.</p></div>
          </details>
        </div>
      </div>
    </section>

    <section id="contact" class="contact-section" aria-label="Contact">
      <h2>Start with one decision</h2>
      <p>Send a short note with the recurring decision or review you want to test.</p>
      <p class="contact-email"><a href="mailto:chip.alexandru@eclipsai.com">chip.alexandru@eclipsai.com</a></p>
      <p class="contact-note">Include the next cycle date if you already know it.</p>
    </section>
  </main>

  
  <style id="page-lighting">
    /* each page its own FLAT color. 01 dark, progressively lighter to 04; 05-07 light; 00 & 08 photo. */
    #paradox{ background:#443a34 !important; }
    #promise{ background:#524740 !important; }
    #challenge{ background:#5f5249 !important; }
    #false-path{ background:#837567 !important; }
    #insight,#turn,#resolution{ background:var(--cream) !important; }
    #paradox .scene-label,#promise .scene-label,#challenge .scene-label,#false-path .scene-label{color:#f1b58e !important}
    #paradox h2,#promise h2,#challenge h2,#false-path h2{color:#fffdf8 !important}
    #paradox .lead,#promise .lead,#challenge .lead,#false-path .lead{color:rgba(255,253,248,.88) !important}
    #paradox .lead strong,#promise .lead strong,#challenge .lead strong,#false-path .lead strong{color:#fff !important}
    .movie-nav{ mix-blend-mode:normal !important; color:#fffdf8 !important;
      background:linear-gradient(180deg, rgba(20,14,13,.60), rgba(20,14,13,0)) !important;
      padding-bottom:28px !important; }
    .movie-nav .brand,.movie-nav .scene-index a,.movie-nav .quick-links a,.movie-nav .quick-links button{ color:#fffdf8 !important; }
    .movie-nav .scene-index a{ border-color:rgba(255,255,255,.5) !important; }
    .movie-nav .scene-index a.active{ background:rgba(255,255,255,.30) !important; }
    /* Hero headline animation: show "be done by hand", strike it, then reveal "simply be ready." */
    #title .hero-strike{ background-image:linear-gradient(currentColor,currentColor); background-repeat:no-repeat; background-position:0 .56em; background-size:0% .055em; animation:heroStrike .8s cubic-bezier(.4,0,.2,1) 1.6s forwards; }
    @keyframes heroStrike{ to{ background-size:100% .055em; } }
    #title .hero-add{ opacity:0; animation:heroAdd .8s ease 2.9s forwards; }
    @keyframes heroAdd{ from{ opacity:0; } to{ opacity:1; } }
    @media (prefers-reduced-motion: reduce){ #title .hero-strike{ background-size:100% .055em; animation:none; } #title .hero-add{ opacity:1; animation:none; } }
    /* FAQ appendix — unnumbered practical section after Scene 08 (not a movie scene) */
    .faq-section{ background:var(--cream); color:#2a211d; padding:clamp(64px,9vh,120px) 6vw; scroll-margin-top:84px; }
    .faq-inner{ max-width:900px; margin:0 auto; }
    .faq-title{ font-family:var(--serif); font-size:clamp(28px,4vw,40px); line-height:1.1; font-weight:700; color:#241f1b; margin:0 0 12px; }
    .faq-intro{ font-size:clamp(15px,2vw,18px); line-height:1.5; color:#6b5f57; margin:0 0 clamp(28px,4vh,44px); }
    .faq-list{ border-top:1px solid rgba(41,36,33,.14); }
    .faq-item{ border-bottom:1px solid rgba(41,36,33,.14); }
    .faq-item>summary{ list-style:none; cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:16px; padding:20px 4px; font-family:var(--sans); font-size:clamp(16px,1.6vw,19px); font-weight:700; color:#241f1b; }
    .faq-item>summary::-webkit-details-marker{ display:none; }
    .faq-item>summary::after{ content:"+"; font-size:1.5em; font-weight:400; line-height:1; color:#9a6a22; transition:transform .25s ease; flex:none; }
    .faq-item[open]>summary::after{ transform:rotate(45deg); }
    .faq-a{ padding:0 4px 22px; }
    .faq-a p{ margin:0; max-width:72ch; font-size:clamp(15px,1.5vw,17px); line-height:1.62; color:#4f463f; font-weight:400; }
    .faq-cta{ margin-top:clamp(40px,6vh,64px); padding-top:clamp(28px,4vh,40px); border-top:1px solid rgba(41,36,33,.14); }
    .faq-cta-h{ font-family:var(--serif); font-size:clamp(22px,3vw,30px); line-height:1.12; font-weight:700; color:#241f1b; margin:0 0 10px; }
    .faq-cta-sub{ font-size:clamp(15px,1.6vw,18px); line-height:1.5; color:#6b5f57; margin:0 0 4px; max-width:60ch; }
    .start-fineprint{ margin:14px 0 0; font-size:13px; line-height:1.5; color:rgba(255,253,248,.66); font-weight:600; max-width:540px; }
    /* Contact appendix — final section after FAQ (not a scene, not in menu) */
    .contact-section{ background:var(--cream); color:#2a211d; padding:clamp(96px,14vh,176px) 6vw clamp(72px,11vh,128px); scroll-margin-top:84px; border-top:1px solid rgba(41,36,33,.14); }
    .contact-section>*{ max-width:900px; margin-left:auto; margin-right:auto; }
    .contact-section h2{ font-family:var(--serif); font-size:clamp(26px,3.4vw,36px); line-height:1.12; font-weight:700; color:#241f1b; margin:0 auto 12px; }
    .contact-section p{ font-size:clamp(15px,1.7vw,18px); line-height:1.55; color:#4f463f; margin:0 auto; }
    .contact-section .contact-email{ margin:18px auto 0; font-size:clamp(19px,2.4vw,25px); font-weight:700; }
    .contact-section .contact-email a{ color:#9a6a22; text-decoration:none; border-bottom:1px solid rgba(154,106,34,.45); }
    .contact-section .contact-email a:hover{ border-bottom-color:#9a6a22; }
    .contact-section .contact-note{ margin:14px auto 0; font-size:14px; color:#6b5f57; }
  </style>
`;

const SCRIPT = `
    const sections = [...document.querySelectorAll("[data-scene]")];
    const links = [...document.querySelectorAll("[data-scene-link]")];
    const sceneObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        const id = entry.target.id;
        links.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === \`#\${id}\`);
        });
      });
    }, { threshold: .52 });
    sections.forEach((section) => sceneObserver.observe(section));

  `;

export function MovieHome() {
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return undefined;
    ran.current = true;
    const s = document.createElement("script");
    s.textContent = SCRIPT;
    document.body.appendChild(s);
    return () => { s.remove(); };
  }, []);
  return (
    <div className="movie-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div dangerouslySetInnerHTML={{ __html: BODY }} />
    </div>
  );
}
