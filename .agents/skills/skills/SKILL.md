---
name: skills
description: Describe what this skill does and when to use it. Include keywords that help agents identify relevant tasks.
---

<!-- Tip: Use /create-skill in chat to generate content with agent assistance -->

Define the functionality provided by this skill, including detailed instructions and examplesSkill name: Incident Ticketing Builder

Purpose:
Build or update the Member 3 incident ticketing feature in this Smart Campus Operations Hub project.

Rules:
- Frontend files must stay inside frontend/src/pages/Incident_tickting
- Backend package root is com.smartcampus.backend
- Follow existing backend folders: controller, dto, exception, model, repository, service
- Use React + Tailwind CSS on frontend
- Use Spring Boot + MongoDB on backend
- Use only USER and ADMIN roles
- Support comments: add, edit, delete
- Do not add novelty features
- Do not refactor unrelated modules

Required feature coverage:
- Create ticket
- View ticket by id
- List tickets
- Update ticket status
- Assign admin/staff if needed
- Upload up to 3 image attachments
- Add comment
- Edit comment
- Delete comment

Output format:
1. File paths
2. Full code
3. Validation rules
4. API integration notes
5. Testing notes