# Assetflow

Full fledged Asset management system built for IT Teams to perform CRUD operations and also Assign or Return assets manually or through a QR code scan check validation system. Users can also request for specific assets beforehand to save development time. As soon as an item is marked approved and available by the system the User can collect accordingly. This project mainly aims to rid of the several missing features in most lightweight local office Daily Asset Management Systems.

## Installation

```
#clone the repo
git clone https://github.com/JOEDUCERR/assetflow

cd assetflow

#Create a virtual environment and install requirements
python3.12 -m venv venv
source venv/bin/activate #Ubuntu

cd backend
pip install -r requirements.txt

#Run the backend
python3 -m uvicorn app.main:app --reload #Running on http://localhost:8000

#Open another terminal for frontend
cd frontend
npm install
npm run dev #Running on http://localhost:5173
```

## Tech Stack
* Frontend: React, HTML5-QRCode (QR code scanner camera), React Router DOM
* Backend: Python FastAPI, SQLAlchemy
* Auth: JWT (JSON Web Tokens), Role-Based Access Control (RBAC)
* Database: SQLite
* QR System: qrcode (python lib)

## Features
* Secure Role-Based Authentication: Separate login portals for IT Administrators and Employees with JWT-based authentication and profile management.
* QR-Based Asset Management: IT admins can create assets with unique QR codes, while employees can securely issue and return assets by scanning the corresponding QR code.
* Comprehensive Inventory Management: Maintain a centralized inventory with asset categories, manufacturer/model details, search & filtering, manual assignment/return, and duplicate serial number validation.
* Asset Tracking & Audit History: Every asset transaction (creation, assignment, return, manual actions) is recorded with timestamps, allowing IT to view detailed history and export logs as CSV.
* Modern Admin & Employee Dashboards: Dedicated dashboards for IT and employees featuring inventory views, asset details, "My Assets" tracking, QR printing, and a responsive dark-themed interface designed for daily enterprise use.


## Future additions
* PostgreSQL support
* Email/Telegram approval notifications
* NFC Integration
* Face recognition
* Dashboard Analytics