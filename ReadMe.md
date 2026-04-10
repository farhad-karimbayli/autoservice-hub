🚗 AutoService Hub

AutoService Hub is a full-stack web application for managing an auto service center.
It provides role-based access for clients, masters, directors, and administrators.

---

 Features

👤 Authentication & Roles

- JWT-based authentication
- Role system:
  - Client
  - Master
  - Director
  - Admin

---

📅 Appointment Management

- Clients can:
  
  - Book services
  - Choose date and master
  - Reschedule or cancel appointments

- Directors/Admins can:
  
  - View all appointments
  - Assign masters
  - Update appointment status

- Masters can:
  
  - View their assigned appointments

---

🧠 Smart Scheduling

- Prevents double booking of masters
- Considers:
  - Service duration
  - Master working hours
  - Existing appointments

---

🛠 Services Management

- Create, update, delete service types
- Set price and duration

---

📦 Parts & Inventory

- Manage parts (CRUD)
- Manage inventory
- Parts requests workflow

---

👨‍🔧 Masters Management

- Assign services to masters
- Define working hours
- Prevent scheduling conflicts

---

👤 User Profile

- Update:
  - Full name
  - Phone number
  - Email
- Change password:
  - Requires current password
  - Confirmation for new password

---

🏗 Architecture

Backend follows a layered architecture:

- Controllers
  
  - Handle HTTP requests

- Services
  
  - Business logic
  - Validation
  - Scheduling logic

- Infrastructure
  
  - Entity Framework Core
  - Database access

- Domain
  
  - Entities and enums

---

🧾 Tech Stack

Backend

- ASP.NET Core Web API
- Entity Framework Core
- JWT Authentication + Roles

Frontend

- React
- TypeScript

Database

- MS SQL

---

🚀 Getting Started

Backend

cd backend/AutoServiceHub.Api
dotnet restore
dotnet build
dotnet run

API will run at:

http://localhost:5126

Swagger:

http://localhost:5126/swagger

---

Frontend

cd frontend
npm install
npm run dev

Frontend will run at:

http://localhost:5173

---

🎯 Key Highlights

- Role-based access control
- Clean separation of layers
- DTO usage for API safety
- Smart scheduling algorithm
- Conflict prevention system

---

📌 Future Improvements

- Notifications system
- Calendar UI for scheduling
- Advanced reporting
- Real-time updates
