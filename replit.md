# MiniBlog - Clean Blog Application

## Overview

MiniBlog is a minimalistic blog application built with React, Express, and TypeScript. The application focuses on providing a clean, distraction-free interface for content creation and consumption. It features a modern UI built with shadcn/ui components, a rich text editor for post creation, reading mode for focused content consumption, and full CRUD operations for blog posts with search functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming support
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **API Design**: RESTful API with JSON responses
- **Data Storage**: In-memory storage with interface abstraction for future database integration
- **Validation**: Zod schemas for request/response validation
- **Development**: Hot reload with Vite dev server integration

### Key Features
- **Simple Owner Authentication**: Environment variable-based authentication (OWNER_KEY) for secure access control
- **Content Management**: Full CRUD operations for blog posts (create, read, update, delete)
- **Rich Text Editor**: Markdown-style editor with formatting toolbar and live preview
- **Markdown Rendering**: Full markdown support with proper styling for bold, headings, links, code, lists, and blockquotes
- **Reading Mode**: Distraction-free reading experience with clean typography
- **Search Functionality**: Real-time search across blog posts
- **Draft System**: Posts can be saved as drafts or published
- **View Tracking**: Post view counters with automatic increment
- **Responsive Design**: Mobile-first responsive layout
- **Theme Support**: Light/dark theme switching with persistence
- **Access Control**: Only the owner can create/edit/delete posts, visitors can read only

### Database Schema
The application uses a PostgreSQL-compatible schema via Drizzle ORM:
- **blog_posts** table with fields for id, title, content, excerpt, status, timestamps, reading time, and view count
- Type-safe schema definitions with Zod validation
- Prepared for database migration with Drizzle Kit

### Development Tools
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared types
- **Code Quality**: ESLint and TypeScript strict mode
- **Build Process**: Vite for frontend bundling, ESBuild for backend compilation
- **Hot Reload**: Development server with instant updates

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form
- **Backend**: Express.js, Node.js built-in modules
- **Database**: Drizzle ORM with PostgreSQL dialect, Neon Database serverless driver
- **Validation**: Zod for schema validation and type inference

### UI and Styling
- **UI Library**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with PostCSS processing
- **Icons**: Lucide React icon library
- **Fonts**: Inter font family via Google Fonts

### Development and Build Tools
- **Build**: Vite with React plugin, ESBuild for backend
- **TypeScript**: Full TypeScript setup with strict configuration
- **Development**: TSX for TypeScript execution, Replit-specific plugins

### Utility Libraries
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter for lightweight routing
- **Class Management**: clsx and tailwind-merge for conditional classes
- **Date Handling**: date-fns for date formatting
- **Unique IDs**: nanoid for ID generation

The architecture follows modern web development patterns with clear separation between frontend and backend, type safety throughout the stack, and a focus on developer experience and performance.