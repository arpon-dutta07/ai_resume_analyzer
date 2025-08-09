---
description: Repository Information Overview
alwaysApply: true
---

# Resume Analyzer Information

## Summary
A modern, full-stack React application built with React Router for analyzing resumes. The application features server-side rendering, hot module replacement, and is built with TypeScript and TailwindCSS. It uses PDF.js for processing PDF documents.

## Structure
- **app/**: Main application code including components, routes, and styles
- **public/**: Static assets including images, icons, and PDF worker
- **.react-router/**: React Router configuration and type definitions
- **Dockerfile**: Multi-stage Docker configuration for production deployment

## Language & Runtime
**Language**: TypeScript
**Version**: ES2022 target
**Build System**: Vite
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- React v19.1.0
- React Router v7.7.1
- PDF.js v5.4.54
- Zustand v5.0.7
- TailwindCSS v4.1.4

**Development Dependencies**:
- TypeScript v5.8.3
- Vite v6.3.3
- React Router Dev Tools v7.7.1
- TailwindCSS Vite Plugin v4.1.4

## Build & Installation
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Type checking
npm run typecheck
```

## Docker
**Dockerfile**: Multi-stage build process
**Base Image**: node:20-alpine
**Build Process**:
1. Install development dependencies
2. Install production dependencies
3. Build the application
4. Create production image with minimal dependencies

**Run Command**:
```bash
docker build -t resume-analyzer .
docker run -p 3000:3000 resume-analyzer
```

## Application Structure
**Entry Point**: app/root.tsx
**Routing**: React Router v7 with file-based routing
**Main Components**:
- Root layout (app/root.tsx)
- Home route (app/routes/home.tsx)
- Navbar component (app/components/Navbar.tsx)

**Static Assets**:
- PDF worker for PDF processing
- Icons for UI elements
- Images for the application interface