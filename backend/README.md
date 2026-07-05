# LifeLink Backend API

Blood Donation and Healthcare Management System Backend

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Installation

1. Clone the repository and navigate to the backend folder:
```bash
cd lifelink/backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up MySQL database:
```bash
# Log in to MySQL
mysql -u root -p

# Create database (optional, schema.sql will do this)
CREATE DATABASE lifelink;

# Exit MySQL
exit
```

4. Run the database schema:
```bash
mysql -u root -p < src/config/schema.sql
```

5. Configure environment variables:
Copy the `.env` file and update the values:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=lifelink
JWT_SECRET=your_jwt_secret_key_here_change_in_production
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE=+1234567890
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Environment Variables

- `PORT`: Server port (default: 5000)
- `DB_HOST`: MySQL host
- `DB_USER`: MySQL username
- `DB_PASSWORD`: MySQL password
- `DB_NAME`: Database name
- `JWT_SECRET`: Secret key for JWT token generation
- `EMAIL_USER`: Gmail address for email notifications
- `EMAIL_PASS`: Gmail app password
- `TWILIO_ACCOUNT_SID`: Twilio account SID for SMS
- `TWILIO_AUTH_TOKEN`: Twilio auth token
- `TWILIO_PHONE`: Twilio phone number
- `GOOGLE_MAPS_API_KEY`: Google Maps API key

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Donors
- `GET /api/donors/search` - Search donors
- `GET /api/donors/dashboard` - Get donor dashboard
- `PUT /api/donors/availability` - Update availability
- `GET /api/donors/history` - Get donation history

### Blood Requests
- `POST /api/requests` - Create blood request
- `GET /api/requests` - Get all requests
- `GET /api/requests/my-requests` - Get my requests
- `POST /api/requests/respond` - Respond to request
- `GET /api/requests/tracking/:request_id` - Get tracking data
- `PUT /api/requests/:request_id/status` - Update request status

### Hospitals
- `GET /api/hospitals` - Get all hospitals
- `GET /api/hospitals/dashboard` - Get hospital dashboard
- `PUT /api/hospitals/inventory` - Update inventory
- `GET /api/hospitals/requests` - Get hospital requests

### Blood Banks
- `GET /api/blood-banks` - Get all blood banks
- `GET /api/blood-banks/inventory` - Get inventory
- `PUT /api/blood-banks/inventory` - Update inventory
- `GET /api/blood-banks/dashboard` - Get blood bank dashboard

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/profile` - Get doctor profile
- `PUT /api/doctors/schedule` - Update schedule
- `GET /api/doctors/dashboard` - Get doctor dashboard

### Appointments
- `POST /api/appointments` - Book appointment
- `POST /api/appointments/respond` - Respond to appointment
- `DELETE /api/appointments/:appointment_id` - Cancel appointment
- `GET /api/appointments/my-appointments` - Get my appointments
- `GET /api/appointments/doctor-appointments` - Get doctor appointments

### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:notification_id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Articles
- `GET /api/articles` - Get all articles
- `GET /api/articles/:article_id` - Get article
- `POST /api/articles` - Create article
- `PUT /api/articles/:article_id` - Update article
- `DELETE /api/articles/:article_id` - Delete article

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:user_id/verify` - Verify user
- `PUT /api/admin/users/:user_id/block` - Block/unblock user
- `DELETE /api/admin/users/:user_id` - Delete user
- `GET /api/admin/requests` - Get all requests
- `GET /api/admin/logs` - Get system logs
- `GET /api/admin/analytics` - Get analytics

### AI
- `POST /api/ai/match/:request_id` - Match donors using AI
- `GET /api/ai/recommendations/:request_id` - Get recommendations

### Chatbot
- `POST /api/chatbot` - Chatbot response

## Database Schema

The database includes the following tables:
- users
- donors
- blood_requests
- donor_responses
- hospitals
- blood_banks
- blood_inventory
- doctors
- appointments
- notifications
- sms_logs
- health_articles
- feedback
- ai_recommendations
- admin_logs

## Security

- All passwords are hashed using bcryptjs
- JWT tokens are used for authentication
- Role-based access control is implemented
- SQL injection prevention using parameterized queries

## License

ISC
