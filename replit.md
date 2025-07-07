# Forex Trading Assistant Application

## Overview

A comprehensive web-based forex trading assistant that helps users track trades, manage account settings, generate trading plans, and analyze performance. The application provides a secure, user-friendly interface for forex traders to monitor their trading activity and make data-driven decisions.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Chart.js for interactive visualizations
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database serverless
- **Real-time Communication**: WebSocket server for live updates
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints with JSON responses

### Data Storage
- **Primary Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations
- **Session Storage**: PostgreSQL with connect-pg-simple
- **In-Memory Fallback**: MemStorage class for development

## Key Components

### User Management
- User registration and authentication
- Session-based authentication with secure cookies
- User-specific data isolation

### Account Tracking System
- Multiple account trackers per user
- Configurable risk parameters (daily loss, overall loss, profit targets)
- Real-time balance tracking
- Conservative risk management calculations

### Trade Management
- Manual trade entry with comprehensive details
- Support for major currency pairs (EUR/USD, GBP/USD, USD/JPY, etc.)
- Automated P&L calculations using predefined pip values
- Trade history with filtering and analysis

### Trading Plan Generation
- Automated plan creation based on account parameters
- Conservative risk management (2% risk per trade)
- Recommended lot sizes and position limits
- Risk-reward ratio calculations (1:2 default)

### Performance Analytics
- Real-time performance metrics
- Win rate calculations
- P&L tracking and visualization
- Currency pair performance analysis
- Interactive charts and dashboards

## Data Flow

1. **User Authentication**: Session-based authentication stores user context
2. **Account Creation**: Users create account trackers with risk parameters
3. **Trade Entry**: Manual trade input triggers P&L calculations and database updates
4. **Real-time Updates**: WebSocket broadcasts notify all connected clients
5. **Plan Generation**: Automated trading plans created based on account settings
6. **Performance Analysis**: Aggregated data powers analytics dashboard

## External Dependencies

### Core Dependencies
- `@neondatabase/serverless`: PostgreSQL database connection
- `drizzle-orm`: Database ORM and query builder
- `react` & `react-dom`: Frontend framework
- `@tanstack/react-query`: Server state management
- `chart.js`: Data visualization
- `zod`: Runtime type validation
- `wouter`: Client-side routing

### UI Dependencies
- `@radix-ui/*`: Accessible UI primitives
- `tailwindcss`: Utility-first CSS framework
- `class-variance-authority`: Component variant handling
- `lucide-react`: Icon library

### Development Dependencies
- `vite`: Build tool and dev server
- `typescript`: Type safety
- `tsx`: TypeScript execution
- `esbuild`: Fast bundling for production

## Deployment Strategy

### Development Environment
- Vite dev server with HMR for frontend
- tsx for TypeScript execution without compilation
- Environment-specific configurations
- Replit-specific integrations for cloud development

### Production Build
- Vite builds optimized frontend bundle
- esbuild bundles server code for Node.js
- Static asset serving through Express
- Environment variable configuration for database

### Database Management
- Drizzle migrations for schema changes
- `db:push` command for development schema updates
- Environment-based database URL configuration
- Neon serverless for production PostgreSQL

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 07, 2025. Initial setup