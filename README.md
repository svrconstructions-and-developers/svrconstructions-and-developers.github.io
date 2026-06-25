# SVR Construction & Developers Web Portal

A premium, modern, and completely custom Construction Company Web Application. Designed with dynamic transitions (Framer Motion), custom luxury charcoal/gold theme styling (Tailwind CSS), dynamic data fetching, a Client Progress Tracking Portal, and a secure Admin Control Panel.

## Features

* **Premium Front-end:** Fully responsive mobile-friendly layouts (Home, About, Projects, Services, Contact) using Outfit & Inter typography.
* **Client Progress Tracker:** Real-time completion percentage tracker, stage logs, before/ongoing/after image grids, and direct supervisor chat line.
* **Admin Management Suite:** 
  * Rich Analytics dashboard.
  * Clients Directory: Add, Edit, Delete (unwanted users), and Link Client accounts to active projects.
  * Projects Registry: Add, Edit, and Delete projects with ratings metrics.
  * Project Milestones Editor: Update completion percentage and record stage milestones.
  * Media Uploader: Multer-based filesystem storage for construction site photos.
  * Supervisor Chat Box: Read and send replies directly to client project logs.
  * Ratings & Testimonials Moderation: Approve or reject reviews (automatically recalculates overall project rating on approval).
  * Inquiries & Quotation Logs: View and manage customer submissions.
  * Custom Emailer: Compose and dispatch custom progress alerts to clients.
* **Email Automation:** Automatically records registrations, contact requests, and quotation requests to the database, and fires Nodemailer alerts to the designated Administrator.
* **Self-Contained SQLite Database:** Fully initialized DB schemas with mock credentials seeded on first launch.

---

## Default Seed Credentials

For immediate testing, the database initializes with the following default accounts:

### 1. Admin Portal Profile
* **Username:** `admin` (or email: `admin@svrconstruction.co.in`)
* **Password:** `admin123`
* **Access Link:** `/admin/login` or via header padlock icon (visible to logged-in admins).

### 2. Client Portal Profile
* **Email Address:** `client@gmail.com`
* **Password:** `client123`
* **Access Link:** `/login`

---

## Tech Stack

* **Frontend:** React.js (Vite), React Router DOM v6, Tailwind CSS, Framer Motion, Axios, Lucide Icons.
* **Backend:** Node.js (Express), SQLite3 (database file stored at `/server/database/database.sqlite`), Multer (file uploading), Nodemailer (Gmail SMTP).

---

## How to Install and Run Locally

Since this is a Windows environment, follow these steps to install the packages and run the portal. Open your terminal (e.g. VS Code terminal or PowerShell) and run:

### Step 1: Install and Launch Backend Server
1. Navigate into the server directory:
   ```bash
   cd server
   ```
2. Install the server dependencies:
   ```bash
   npm install
   ```
3. Start the Express server in development watch mode:
   ```bash
   npm run dev
   ```
   *The server will boot up on **http://localhost:5000**. It automatically creates the SQLite database file and seeds the mock project, default services, FAQs, and accounts.*

### Step 2: Install and Launch Frontend Client
1. Open a new terminal window or tab.
2. Navigate into the client directory:
   ```bash
   cd client
   ```
3. Install the client dependencies:
   ```bash
   npm install
   ```
4. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The client dev server will boot up on **http://localhost:5173**. Vite is configured to proxy all `/api` requests to the Node server on port 5000.*

---

## Email Configuration (Optional)
To send actual email alerts to the admin and clients, specify your credentials in `server/.env`:
```env
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
ADMIN_EMAIL=recipient_admin@email.com
```
*If left blank, the portal runs in **Simulator Mode** and writes email templates directly to the server terminal console for development visibility.*
