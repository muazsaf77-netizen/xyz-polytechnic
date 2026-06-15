# XYZ Polytechnic College — TVET Management System

**A complete, production-ready PHP 8.2 MVC application for Ethiopian TVET institutions**

## 🎓 Overview

XYZ Polytechnic Portal is an integrated management system for technical and vocational education and training (TVET) colleges in Ethiopia. It bridges the gap between college operations, Moodle LMS, and student engagement across Levels I–V with full bilingual (English/Amharic) support.

### Key Features

✅ **Admin Dashboard** — Programs, courses, trainers, student records, CoC exam results  
✅ **Student Portal** — Login via Moodle, view courses, competencies, industry attachments  
✅ **Public Website** — News, announcements, program information, admissions application  
✅ **Moodle Integration** — Web Services API for SSO, grade sync, completion tracking  
✅ **CoC Management** — Certificate of Competence exam results, awarding body tracking  
✅ **Industry Attachments** — Work-based learning (WBL) tracking and approval workflow  
✅ **Bilingual UI** — Amharic (አማርኛ) and English with seamless language toggle  
✅ **Security** — CSRF tokens, prepared statements, password hashing, session management  

## 🛠 Tech Stack

| Component | Version | Purpose |
|-----------|---------|----------|
| **PHP** | 8.2+ | Backend runtime |
| **MySQL** | 8.0+ | Database |
| **Moodle** | 4.1+ | LMS & Web Services |
| **Bootstrap** | 5.3+ | UI framework |
| **jQuery** | 3.7+ | Frontend interactions |
| **Docker** | 20.10+ | Containerization |

## 📋 Prerequisites

- **PHP 8.2+** with PDO, cURL, mbstring extensions
- **MySQL 8.0+** or MariaDB 10.5+
- **Apache 2.4+** with mod_rewrite
- **Moodle 4.1+** (for LMS integration)
- **Git** (for version control)

## 🚀 Quick Start

### Option A: Manual Installation

```bash
# 1. Clone repository
git clone https://github.com/muazsaf77-netizen/xyz-polytechnic.git
cd xyz-polytechnic

# 2. Copy configuration
cp config/database.php.example config/database.php
cp config/moodle.php.example config/moodle.php
cp .env.example .env

# 3. Update credentials
vim config/database.php
vim config/moodle.php

# 4. Create database
mysql -u root -p < install/schema.sql

# 5. Set permissions
chmod 755 public/assets/uploads/
chmod 640 config/database.php config/moodle.php

# 6. Point web root to /public
# In Apache: DocumentRoot /path/to/xyz-polytechnic/public
```

### Option B: Docker (Recommended)

```bash
# 1. Clone & build
git clone https://github.com/muazsaf77-netizen/xyz-polytechnic.git
cd xyz-polytechnic
docker-compose up -d

# 2. Access
# - Public: http://localhost
# - Admin: http://localhost/admin (superadmin/Admin@XYZ2024)
```

## 📁 Project Structure

```
xyz-polytechnic/
├── public/                    ← Web root
│   ├── index.php             ← Front controller
│   ├── .htaccess             ← URL rewriting
│   └── assets/
│       ├── css/style.css
│       ├── js/main.js
│       ├── images/
│       └── uploads/          ← User files
├── app/                       ← Application core
│   ├── Core/                 ← Framework
│   │   ├── Application.php
│   │   ├── Router.php
│   │   ├── Controller.php
│   │   ├── Model.php
│   │   ├── View.php
│   │   ├── Database.php
│   │   └── Session.php
│   ├── Controllers/
│   │   ├── HomeController.php
│   │   ├── AcademicsController.php
│   │   ├── NewsController.php
│   │   └── Admin/
│   ├── Models/
│   │   ├── Program.php
│   │   ├── Student.php
│   │   ├── News.php
│   │   └── ...
│   └── Views/
│       ├── layouts/
│       ├── home/
│       ├── academics/
│       └── admin/
├── config/
│   ├── config.php            ← App settings
│   ├── database.php.example  ← DB template
│   └── moodle.php.example    ← LMS template
├── services/
│   ├── MoodleAPI.php         ← Web Services
│   ├── AuthService.php       ← Login
│   └── LangService.php       ← i18n
├── lang/
│   ├── en.php               ← English
│   └── am.php               ← Amharic
├── install/
│   ├── schema.sql           ← Database DDL
│   ├── seed.sql             ← Sample data
│   └── README.md            ← Setup guide
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── README.md
```

## 🔐 Default Admin Access

**Username:** `superadmin`  
**Password:** `Admin@XYZ2024`  
**Email:** `admin@xyzpoly.edu.et`

⚠️ **Change on first login!**

## 📊 Database Schema

13 tables covering:
- Settings & configuration
- Admin users & roles
- Programs (TVET Levels I–V)
- Courses & trainers
- Students & enrollment
- News & announcements
- CoC exam results
- Industry attachments (WBL)
- Admissions applications
- CMS pages
- Media library

See `install/schema.sql` for complete DDL.

## 🔄 Moodle Integration

### Web Services API

The system connects to Moodle via REST API for:

| Function | Purpose |
|----------|----------|
| `core_webservice_get_site_info` | Verify token, get user ID |
| `core_user_get_users_by_field` | Student lookup |
| `core_enrol_get_users_courses` | Enrolled courses |
| `core_course_get_contents` | Course structure |
| `gradereport_user_get_grades_table` | Grade retrieval |
| `core_completion_get_activities_completion_status` | Completion tracking |

### Fallback Authentication

If REST API is unavailable, authenticate against Moodle's database directly.

## 🧪 Testing

```bash
# Unit tests
vendor/bin/phpunit tests/

# Integration tests
php tests/MoodleAPITest.php
```

## 📦 Deployment

### cPanel/Shared Hosting

1. Upload to `/public_html/`
2. Move `/app`, `/config` outside web root
3. Configure DNS & SSL

### Docker (Production)

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🛡 Security Features

✅ CSRF Protection  
✅ SQL Injection Prevention (Prepared Statements)  
✅ Password Hashing (bcrypt)  
✅ Session Security (HttpOnly + Secure cookies)  
✅ XSS Protection (Output escaping)  
✅ Role-based Access Control  
✅ File Upload Validation  
✅ HTTPS Enforcement  

## 📝 License

MIT License — See `LICENSE` file

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/xyz`
3. Commit: `git commit -am 'Add feature'`
4. Push: `git push origin feature/xyz`
5. Submit a Pull Request

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/muazsaf77-netizen/xyz-polytechnic/issues)
- **Email:** `support@xyzpoly.edu.et`

---

**XYZ Polytechnic Portal v1.0**  
*Empowering Ethiopia Through Skills* 🇪🇹
