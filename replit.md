# BigBrotherNaija Live - Reality Show Streaming Platform

## Overview

BigBrotherNaija Live is a comprehensive reality show streaming platform built with TikTok-style interactions. It features live streaming of the BigBrother house, audience voting systems, task suggestions, real-time comments, floating likes animations, and a dedicated feed for 30-second user videos. The platform provides an immersive experience for reality show fans with mobile-first design and modern UI components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built with React and TypeScript, utilizing modern development practices:
- **React with TypeScript**: Component-based architecture for type-safe development
- **Vite**: Fast development server and build tool for optimal performance
- **Wouter**: Lightweight client-side routing for navigation
- **TanStack Query**: Server state management and caching for API interactions
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **shadcn/ui**: Pre-built component library based on Radix UI primitives
- **Next Themes**: Theme management system supporting dark mode

The frontend follows a modular structure with components organized by functionality, custom hooks for reusable logic, and pages for route-specific content.

### Backend Architecture
The server-side implements a RESTful API with real-time capabilities:
- **Express.js**: Node.js web framework for HTTP API endpoints
- **WebSocket Server**: Real-time bidirectional communication for chat and live updates
- **In-Memory Storage**: Current implementation uses memory-based data storage with interface for future database integration
- **ESM Modules**: Modern JavaScript module system throughout the application

The backend architecture separates concerns with dedicated routing, storage abstraction, and WebSocket handling for real-time features.

### Database Schema
The application defines a comprehensive PostgreSQL schema using Drizzle ORM for BigBrotherNaija reality show features:
- **Users**: User profiles with authentication and interaction data
- **Housemates**: Reality show contestants with profiles, voting statistics, and eviction status
- **Live Stream**: Single live stream management with current tasks and viewer counts
- **Live Comments**: Real-time audience comments with moderation capabilities
- **Votes**: Audience voting system for favorites, nominations, and evictions
- **Task Suggestions**: Community-driven task suggestions with voting and approval workflow
- **User Videos**: 30-second video submissions with likes, comments, and approval system
- **Video Comments/Likes**: Social interactions for user-generated content
- **Polls**: Admin-created polling system for audience engagement
- **Moderator Actions**: Comprehensive moderation logging and management

The schema supports comprehensive reality show management, audience engagement, and social features.

### Real-Time Communication
WebSocket integration enables live features:
- **Stream Rooms**: Users join specific stream channels for isolated chat
- **Real-Time Chat**: Instant message delivery within stream contexts
- **Live Updates**: Stream status and viewer count updates
- **Connection Management**: Automatic reconnection and room management

### Authentication & State Management
- **Demo User System**: Current implementation uses a demo user for development
- **Session Management**: Prepared for full authentication integration
- **Client State**: React Query handles server state with optimistic updates
- **Local State**: React hooks manage component-level state

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection (configured but not currently used)
- **drizzle-orm**: Type-safe database ORM for PostgreSQL integration
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI and Styling
- **@radix-ui/react-***: Comprehensive set of accessible UI primitives
- **@livekit/components-react**: Video streaming components for live broadcast functionality
- **@livekit/components-styles**: Styling for LiveKit video components
- **tailwindcss**: Utility-first CSS framework
- **next-themes**: Theme switching and dark mode support

### Real-Time and Communication
- **ws**: WebSocket implementation for real-time chat and updates
- **livekit-client**: Client SDK for video streaming (prepared for integration)
- **livekit-server-sdk**: Server SDK for managing live video sessions

### Development and Build Tools
- **vite**: Fast build tool and development server
- **typescript**: Type safety and enhanced developer experience
- **@replit/vite-plugin-***: Replit-specific development enhancements
- **esbuild**: Fast JavaScript bundler for production builds

### Data Management
- **@tanstack/react-query**: Server state management and caching
- **date-fns**: Date manipulation and formatting utilities
- **zod**: Runtime type validation and schema definition

The application is architected for scalability with clear separation between frontend and backend concerns, prepared for integration with live video streaming services, and designed with modern web development best practices.