
# Smart Campus Operations Hub

Smart Campus Operations Hub is a full-stack campus management platform designed to handle resource bookings, incident ticketing, technician and admin workflows, notifications, and campus alerts.

## Project Overview

This system supports role-based campus operations.

### User Roles

- USER
- ADMIN
- TECHNICIAN

### Core Features

- Resource booking system with approval workflow
- Incident ticketing with assignment and comments
- Real-time style notifications with unread count
- Campus alerts system
- Study area management and map view
- Role-based dashboards and protected routes

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router
- Framer Motion

### Backend

- Java 17
- Spring Boot
- Spring Security
- Spring Validation
- Spring OAuth2
- MongoDB
- Maven Wrapper

## Project Structure

```text
paf/
	frontend/   React client
	backend/    Spring Boot API
README.md     Documentation
```

### Backend Structure

- controller
- dto
- model
- repository
- service
- filter
- exception

### Frontend Structure

- src/pages
- src/components
- src/services
- src/context
- src/facilities
- src/pages/Incident_tickting

## Key Functional Modules

### Authentication and Authorization

- JWT-based authentication
- Role-based access control
- Google OAuth2 login support

### Booking Management

- Create booking requests
- Resource availability validation
- Admin approve and reject flow
- User booking tracking

### Incident Ticketing

- Create tickets
- Assign technicians
- Update status
- Add, edit, and delete comments

### Notifications

- User-specific notifications
- Mark as read and mark all as read
- Unread count
- Triggered by booking and ticket events

### Campus Alerts

- Admin create, update, and delete alerts
- Users view active alerts

## Notification Trigger Service

### File

- paf/backend/src/main/java/com/smartcampus/backend/service/NotificationTriggerService.java

### Purpose

Handles automatic notification generation when booking or ticket events occur.

### Handles

- Booking created, notify admins
- Booking approved, notify user
- Booking rejected, notify user
- Ticket created, notify admins and users
- Ticket assignment notifications
- Ticket status updates
- Ticket comment notifications

### Dependencies

- NotificationService
- UserRepository
- NotificationType
- User and Role models

### Related Files

- paf/backend/src/main/java/com/smartcampus/backend/service/NotificationService.java
- paf/backend/src/main/java/com/smartcampus/backend/model/NotificationType.java
- paf/backend/src/main/java/com/smartcampus/backend/model/Notification.java
- paf/backend/src/main/java/com/smartcampus/backend/repository/NotificationRepository.java

## Frontend Routes

### Public

- /login
- /register
- /auth/callback

### User

- /dashboard
- /bookings
- /study-areas

### Admin

- /admin/dashboard
- /admin/resources
- /admin/bookings
- /admin/tickets
- /admin/alerts

### Technician

- /technician/dashboard
- /technician/tickets

## Backend API Endpoints

Main APIs:

- /api/bookings
- /api/resources
- /api/v1/tickets
- /api/notifications
- /api/admin/campus-alerts

## Default Ports

- Backend: http://localhost:8081
- Frontend: http://localhost:5173

## Environment Configuration

Backend config files:

- paf/backend/src/main/resources/application.properties
- paf/backend/src/main/resources/application-local.properties

Important variables:

- MONGODB_URI
- JWT_SECRET
- jwt.expiration-ms
- GOOGLE_OAUTH_CLIENT_ID
- GOOGLE_OAUTH_CLIENT_SECRET

Do not commit real credentials.

## Installation and Run Guide

### Backend

```bash
cd paf/backend
.\mvnw.cmd clean install
.\mvnw.cmd spring-boot:run
```

### Frontend

```bash
cd paf/frontend
npm install
npm run dev
```

## Useful Commands

### Backend

```bash
cd paf/backend
.\mvnw.cmd clean install
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
```

### Frontend

```bash
cd paf/frontend
npm run dev
npm run build
npm run preview
```

## Troubleshooting

### Backend not running

- Check port 8081
- Check Java version, must be 17

### Frontend API errors

- Check backend is running
- Check token exists
- Check CORS config

### MongoDB errors

- Check MONGODB_URI
- Check Atlas IP whitelist

### OAuth errors

- Verify client ID and client secret
- Verify redirect URL

## Development Notes

- Follow layered backend structure
- Keep features modular
- Validate inputs in frontend and backend
- Use proper HTTP status codes
- Keep role-based security intact

## Current Status

Project includes:

- Booking system
- Ticketing system
- Notifications
- Campus alerts
- Role-based dashboards
/api/v1/tickets
/api/notifications
/api/admin/campus-alerts
Default Ports
Backend: http://localhost:8081
Frontend: http://localhost:5173
⚙️ Environment Configuration

Backend config files:

application.properties
application-local.properties
Important Variables
MONGODB_URI
JWT_SECRET
jwt.expiration-ms
GOOGLE_OAUTH_CLIENT_ID
GOOGLE_OAUTH_CLIENT_SECRET

⚠️ Do not commit real credentials.

▶️ Installation & Run Guide
Backend
cd paf/backend
.\mvnw.cmd clean install
.\mvnw.cmd spring-boot:run
Frontend
cd paf/frontend
npm install
npm run dev
🧪 Useful Commands
Backend
mvnw.cmd clean install
mvnw.cmd test
mvnw.cmd spring-boot:run
Frontend
npm run dev
npm run build
npm run preview
🐞 Troubleshooting
Backend not running
Check port 8081
Check Java version (must be 17)
Frontend API errors
Check backend running
Check token exists
Check CORS config
MongoDB errors
Check MONGODB_URI
Check Atlas IP whitelist
OAuth errors
Verify client ID and secret
Verify redirect URL
👨‍💻 Development Notes
Follow layered backend structure
Keep features modular
Validate inputs (frontend + backend)
Use proper HTTP status codes
Keep role-based security intact
📊 Current Status

Project includes:

Booking system ✔
Ticketing system ✔
Notifications ✔
Campus alerts ✔
Role-based dashboards ✔