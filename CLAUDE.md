# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start Vite dev server with hot reload (localhost:5173)
- `npm run build` - Create production build (TypeScript compilation + Vite build)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint with TypeScript rules and Prettier
- `npm run optimize` - Size optimization script (js13k-specific)

## Architecture Overview

This is a js13kgames template project built with TypeScript and Vite, designed for creating games under 13KB. The architecture follows a component-based approach with custom systems for state management, animations, and game logic.

### Core Systems

- **State Management** (`src/systems/state.ts`): Custom signal-based reactive state with localStorage persistence. State is automatically saved every 15 seconds and encoded in base64.

- **Animation System** (`src/systems/animation.ts`): Custom tween engine with 30+ easing functions. Manages transforms (translate, scale, rotate) and opacity without CSS transitions.

- **Signal System** (`src/systems/signals.ts`): Lightweight reactive primitives for state management with subscriber notifications.

### Application Structure

- **Entry Point** (`src/index.ts`): Initializes all systems, creates scaleable game container (360x780), and sets up the main game flow from title screen to game loop.

- **Game Logic** (`src/game/game.ts`): Core game loop with `requestAnimationFrame`, spawning mechanics with collision detection, and cleanup on game over.

- **Components** (`src/components/`): Self-contained UI modules (title-screen, game-over, lives, etc.) each with their own CSS and TypeScript files.

### Key Patterns

- CSS-in-TS approach using `el()` and `mount()` helpers from `src/helpers/dom.ts`
- Component lifecycle management with proper cleanup and event handling
- Custom scaleable container system for responsive design
- Position clamping and collision detection for game entities

### Build Configuration

Uses `js13k-vite-plugins` with Roadroller compression for production builds. ESLint configured with TypeScript strict rules, Prettier formatting (120 char width, double quotes).