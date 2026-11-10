# PRODUCT.md

# Sift design

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

- React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui components on Radix (`radix-ui`), Motion (`motion`), Tabler icons.
- Tokens in `tokens/` are normative. The kit in `packages/ui` is a complete copy of shadcn/ui, restyled to the tokens, with motion on by default.
- Blocks in `blocks/*` are standalone Vite apps that use the kit; `specimen/` shows every component. Reference images live in `screenshots/`, captured with `scripts/capture.mjs`.

## Users

- Coding agents building the owner's personal projects. They read this repo to match the design language, copy kit components, and check their work against the screenshots.
- The owner, reviewing what agents build.

## Product Purpose

One source of truth for the design language first built for Sift, a personal, local-first task workspace where people and scheduled agents share one board. The repo turns that language into tokens, written guidelines (including animation), a reusable component kit, and worked examples.

Blocks use Larkspur, a made-up product for a small greenhouse (see `blocks/_shared/LARKSPUR.md`), so no reference image shows Sift itself.

## Operating Context

- Every example surface is Operate mode: app UI where the visitor completes a task. Precision and restraint carry the brand.
- Light and dark themes are both first-class; dark is its own set of steps, not an inversion.
- Desktop first, fully responsive down to 360px wide.
- Reduced motion keeps cross-fades and state feedback and removes travel, scale and blur.

## Brand Commitments

- Palette pinned by the owner: Slate #2B2539, Oatmeal #EBE9E4, Coral #EFC8C8, Sea #BED3CC, Umber #7B6767, Chartreuse #EEEFC8.
- Type: Albert Sans for interface text, IBM Plex Mono for code, counts, times and durations.
- Visual home: a precise studio workbench. Navigation rail, orderly work surfaces, pinned context, visible handoffs between people and helpers. Not an AI chat window, not a metrics dashboard, not stock shadcn.
- Motion is a core requirement, not decoration: short, interruptible, spatially consistent, never blocking.

## Product Principles

- Show real state. No fake progress, invented statistics or artificial waits.
- Every agent or helper action is attributed and explained in plain words.
- The shell stays still; only the work surface changes.
- Accessibility to WCAG 2.2 AA, keyboard-complete, visible focus.
