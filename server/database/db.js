import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'database.sqlite');

// Ensure database directory exists
if (!fs.existsSync(__dirname)) {
  fs.mkdirSync(__dirname, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    console.log('Connected to the SQLite database at:', DB_PATH);
    initializeDatabase();
  }
});

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function initializeDatabase() {
  try {
    // 1. Admins Table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT CHECK(role IN ('super_admin', 'admin')) DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Projects Table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        client_name TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        completion_date TEXT,
        rating REAL DEFAULT 0.0,
        is_featured INTEGER DEFAULT 0,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Users Table (Clients)
    await runQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone TEXT,
        company TEXT,
        project_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
      )
    `);

    // 4. Project Progress Table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS project_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        stage TEXT NOT NULL,
        percentage INTEGER NOT NULL DEFAULT 0,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);

    // 5. Project Images Table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS project_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        image_type TEXT CHECK(image_type IN ('before', 'ongoing', 'completed')) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);

    // 6. Project Messages Table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS project_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        sender_role TEXT CHECK(sender_role IN ('admin', 'client')) NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);

    // 7. Services Table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        icon_name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 8. Contact Requests Table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS contact_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        company TEXT,
        service TEXT,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 9. Quotation Requests Table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS quotation_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        company TEXT,
        details TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 10. Reviews Table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        client_name TEXT NOT NULL,
        rating INTEGER CHECK(rating BETWEEN 1 AND 5) NOT NULL,
        comment TEXT,
        is_approved INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);

    // 11. Testimonials Table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        designation TEXT,
        message TEXT NOT NULL,
        rating INTEGER CHECK(rating BETWEEN 1 AND 5) NOT NULL,
        is_approved INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 12. FAQ Table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS faq (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 13. Activity Logs Table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER,
        action TEXT NOT NULL,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables verified/created successfully.');

    // Seed default Super Admin if not exists
    const adminCheck = await getQuery('SELECT * FROM admins WHERE username = ?', ['admin']);
    if (!adminCheck) {
      const adminPassHash = await bcrypt.hash('admin123', 10);
      await runQuery(
        'INSERT INTO admins (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['admin', 'admin@svrconstruction.co.in', adminPassHash, 'super_admin']
      );
      console.log('Default super admin created (username: admin, password: admin123)');
    }

    // Seed default Services if table empty
    const servicesCheck = await getQuery('SELECT COUNT(*) as count FROM services');
    if (servicesCheck.count === 0) {
      const defaultServices = [
        {
          title: 'Residential Construction',
          description: 'SVR specializes in building exquisite residential spaces, custom villas, and modern apartment buildings with absolute structural integrity.',
          icon_name: 'Home'
        },
        {
          title: 'Commercial Construction',
          description: 'We deliver state-of-the-art office buildings, commercial parks, malls, and retail complexes optimized for functionality and visual appeal.',
          icon_name: 'Building2'
        },
        {
          title: 'Industrial Construction',
          description: 'Creating robust warehouses, production units, and specialized manufacturing plants conforming to international industrial standards.',
          icon_name: 'Factory'
        },
        {
          title: 'Interior & Renovation',
          description: 'Top-tier luxury interior designing and full-scale refurbishment services that breathe new life into existing spaces.',
          icon_name: 'Paintbrush'
        },
        {
          title: 'Infrastructure & Civil Works',
          description: 'Executing critical civil works including roads, public utility projects, and site development with precision engineering.',
          icon_name: 'HardHat'
        }
      ];

      for (const service of defaultServices) {
        await runQuery(
          'INSERT INTO services (title, description, icon_name) VALUES (?, ?, ?)',
          [service.title, service.description, service.icon_name]
        );
      }
      console.log('Default services seeded.');
    }

    // Seed default FAQs if table empty
    const faqCheck = await getQuery('SELECT COUNT(*) as count FROM faq');
    if (faqCheck.count === 0) {
      const defaultFaqs = [
        {
          question: 'What construction services do you provide?',
          answer: 'SVR provides a full suite of services including Residential, Commercial, and Industrial Construction, Luxury Interiors, Renovation, and Infrastructure development.'
        },
        {
          question: 'How long does a project take?',
          answer: 'Project durations depend on scope, complexity, and scale. A typical residential villa takes 10 to 14 months, while commercial complexes can take 18 to 24 months.'
        },
        {
          question: 'Do you provide project quotations?',
          answer: 'Yes, we provide detailed, itemized, and transparent structural quotations after reviewing your architectural plans and site specifications.'
        },
        {
          question: 'How is project progress tracked?',
          answer: 'Clients receive credentials to our online Client Portal, where they can track completion percentage stage-by-stage, view progress photos, and chat directly with their project supervisor.'
        },
        {
          question: 'Do you handle commercial projects?',
          answer: 'Yes, we build retail complexes, corporate offices, institutional buildings, and industrial facilities with custom structural plans.'
        }
      ];

      for (const f of defaultFaqs) {
        await runQuery('INSERT INTO faq (question, answer) VALUES (?, ?)', [f.question, f.answer]);
      }
      console.log('Default FAQs seeded.');
    }

    // Seed a mock project and a mock client linked to it if table empty
    const projectCheck = await getQuery('SELECT COUNT(*) as count FROM projects');
    if (projectCheck.count === 0) {
      // Create Project
      await runQuery(`
        INSERT INTO projects (name, client_name, type, description, completion_date, rating, is_featured, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'SVR Horizon Heights',
        'John Doe Corp',
        'Commercial Construction',
        'A premium 12-story commercial tower featuring high-tech glass facades, eco-friendly energy systems, and high-end office suites.',
        '2026-12-15',
        0.0,
        1,
        'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80'
      ]);
      const proj = await getQuery('SELECT id FROM projects ORDER BY id DESC LIMIT 1');

      // Create progress entries
      await runQuery(`
        INSERT INTO project_progress (project_id, stage, percentage, description)
        VALUES (?, ?, ?, ?)
      `, [proj.id, 'Foundation & Excavation', 100, 'Completed structural excavation and laid down reinforced concrete columns.']);

      await runQuery(`
        INSERT INTO project_progress (project_id, stage, percentage, description)
        VALUES (?, ?, ?, ?)
      `, [proj.id, 'Superstructure Framing', 60, 'Concrete slab casting for floors 1 to 6 complete. Framing currently underway for floor 7.']);

      // Add a progress image
      await runQuery(`
        INSERT INTO project_images (project_id, image_url, image_type)
        VALUES (?, ?, ?)
      `, [proj.id, 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80', 'ongoing']);

      // Create a Client User linked to this project
      const clientPassHash = await bcrypt.hash('client123', 10);
      await runQuery(`
        INSERT INTO users (name, email, password_hash, phone, company, project_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `, ['John Doe', 'client@gmail.com', clientPassHash, '+1234567890', 'John Doe Corp', proj.id]);

      console.log('Default mock project and client (email: client@gmail.com, password: client123) seeded.');
    }

  } catch (err) {
    console.error('Initialization error:', err.message);
  }
}

export {
  db,
  runQuery,
  getQuery,
  allQuery
};
