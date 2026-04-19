This project is a Smart Campus Operations Hub system for a campus environment.

Tech stack:
- Frontend: React + Tailwind CSS
- Backend: Spring Boot
- Database: MongoDB

Project-specific rules:
- Frontend incident ticketing work must stay inside:
  frontend/src/pages/Incident_tickting
- Do not move this feature to another frontend folder unless explicitly asked.
- Keep all incident ticketing related React files clearly grouped and easy to identify.

- Backend package root is:
  com.smartcampus.backend
- Backend files for incident ticketing must be clearly named so my contribution is easy to identify in GitHub and viva.
- Prefer file names such as:
  TicketController, TicketService, TicketServiceImpl, TicketRepository, Ticket, TicketComment, TicketDto, TicketStatus, TicketPriority, TicketCategory
- Follow the existing backend folder structure:
  controller, dto, exception, model, repository, service

Feature scope:
- Build only Member 3 core feature: incident ticketing
- Do not add novelty or innovation features unless explicitly requested
- Include create ticket, get ticket, list tickets, update status, assign, attachments, add/edit/delete comments

User roles:
- USER
- ADMIN

Comment features required:
- add comment
- edit comment
- delete comment

Validation rules:
- Always add strong frontend and backend validation
- Do not trust frontend validation only
- Add meaningful validation messages
- Use proper HTTP status codes and meaningful API error responses

Frontend coding rules:
- Use React + Tailwind CSS only
- Keep components reusable and modular
- Keep UI consistent with the existing green/white dashboard design
- Show file paths before code when generating files
- Do not rewrite unrelated pages

Backend coding rules:
- Use Spring Boot layered structure
- Use MongoDB models/documents
- Use DTOs for request/response where appropriate
- Use service layer business validation
- Use proper exception handling
- Keep code simple, readable, and easy to explain during viva

Ticket workflow:
- OPEN
- IN_PROGRESS
- RESOLVED
- CLOSED
- REJECTED

Attachment rules:
- maximum 3 images
- only jpg, jpeg, png
- validate file size
- safe file handling
- uploaded files/folders must be gitignored

When generating code:
1. First inspect and respect the existing project structure
2. Keep changes limited to incident ticketing
3. Show exact file paths
4. Give practical code, not theory
5. Make the implementation student-project friendly and viva-friendly