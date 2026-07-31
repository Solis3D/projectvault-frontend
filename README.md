# ProjectVault — Frontend

ProjectVault is a full-stack portfolio platform designed for 3D artists. It lets artists publish projects, organize their creative process, and build portfolios that go beyond the final render.

This repository contains the React frontend. The application consumes a separate Spring Boot REST API for authentication, project management, media uploads, and administrative features.

## Live demo

[Open ProjectVault](https://projectvault-seven.vercel.app)

> The backend is hosted on a free-tier service, so the first request may take a short time while the server starts.

## Main features

- Public project gallery with search, category filters, and pagination
- Detailed project pages with image galleries, lightbox view, process images, timelapse sequences, and embedded videos
- Registration and login with JWT-based authentication
- Protected routes and role-based access for users and administrators
- Personal artist profile and portfolio management
- Project creation and editing, including media uploads, thumbnails, image ordering, and visibility settings
- Admin dashboard for featured projects, categories, software, users, and platform statistics
- Responsive interface for desktop and mobile devices

## Tech stack

- React 19
- JavaScript
- Vite
- React Router
- React Bootstrap and Bootstrap
- Lucide React
- REST API integration
- JWT authentication
- Vercel

## Related repository

The backend source code is available here:

[ProjectVault Backend](https://github.com/Solis3D/projectvault-backend)

## Getting started

### Prerequisites

- Node.js and npm
- A running instance of the [ProjectVault backend](https://github.com/Solis3D/projectvault-backend)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Solis3D/projectvault-frontend.git
   cd projectvault-frontend
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env.local` and set the backend URL:

   ```env
   VITE_API_URL=http://localhost:8080
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

## Available scripts

- `npm run dev` — start the local development server
- `npm run build` — create a production build
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint

## Project context

ProjectVault was developed as the final capstone project for the Full Stack Developer program at EPICODE. The concept combines my web development training with my background in 3D Environment Art, creating a platform around the way digital artists present both finished work and the process behind it.

## Author

Davide Aversano — [GitHub](https://github.com/Solis3D)
