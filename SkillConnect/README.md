# 🔧 SkillConnect - Skilled Worker Directory & Booking App

SkillConnect is a comprehensive mobile application that connects skilled workers with customers who need their services. The app allows customers to find, book, and rate verified skilled workers in their area, while workers can manage their availability, accept bookings, and grow their business.

## 📱 Features

### For Customers (Service Seekers)
- **Browse Workers**: Find skilled workers by category, location, and availability
- **Search & Filter**: Advanced search with ratings, price range, and location filters
- **Book Services**: Schedule appointments with detailed job descriptions
- **Real-time Chat**: Communicate with workers about job details
- **Track Bookings**: Monitor booking status from pending to completion
- **Rate & Review**: Leave feedback for completed services
- **Emergency Services**: Quick access for urgent service needs
- **Payment Integration**: Secure payment processing (optional)

### For Workers (Service Providers)
- **Profile Management**: Create detailed profiles with skills, portfolio, and certifications
- **Availability Control**: Set status as Available, Busy, or Not Taking Jobs
- **Booking Management**: Accept, reject, or reschedule job requests
- **Earnings Tracking**: Monitor income and job history
- **Offline Mode**: Continue working even without internet connection
- **ID Verification**: Upload credentials and ID for verification
- **Portfolio Showcase**: Display previous work and certifications

### Admin Features
- **User Management**: Verify and manage user accounts
- **Dispute Resolution**: Handle conflicts between customers and workers
- **Analytics Dashboard**: Monitor app usage and performance metrics
- **Content Moderation**: Review and approve worker profiles

## 🛠 Tech Stack

### Frontend (Mobile App)
- **React Native** - Cross-platform mobile development
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation and routing
- **React Native Paper** - Material Design components
- **Zustand** - State management
- **React Native Maps** - Location and mapping features
- **React Native Firebase** - Authentication and push notifications

### Backend (API)
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Firebase Admin SDK** - Database and authentication
- **Firestore** - NoSQL database
- **Firebase Storage** - File storage for images
- **JWT** - Authentication tokens
- **Twilio** - SMS OTP verification

### Additional Services
- **Firebase Cloud Messaging** - Push notifications
- **Google Maps API** - Location services
- **Paystack/Flutterwave** - Payment processing (optional)

## 📁 Project Structure

```
SkillConnect/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # App screens
│   │   ├── auth/          # Authentication screens
│   │   ├── customer/      # Customer-specific screens
│   │   └── worker/        # Worker-specific screens
│   ├── navigation/         # Navigation configuration
│   ├── store/             # State management
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions and theme
│   └── services/          # API services
├── backend/               # Express.js API server
│   ├── routes/           # API route handlers
│   ├── middleware/       # Custom middleware
│   └── utils/           # Backend utilities
├── android/              # Android-specific code
├── ios/                  # iOS-specific code
└── assets/              # Images, fonts, etc.
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Firebase project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/skillconnect.git
   cd skillconnect
   ```

2. **Install dependencies**
   ```bash
   # Install mobile app dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication, Firestore, and Storage
   - Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
   - Place configuration files in respective platform folders

4. **Set up environment variables**
   ```bash
   # Create .env file in backend directory
   cd backend
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_CLIENT_EMAIL=your-client-email
   JWT_SECRET=your-jwt-secret
   TWILIO_ACCOUNT_SID=your-twilio-sid
   TWILIO_AUTH_TOKEN=your-twilio-token
   TWILIO_PHONE_NUMBER=your-twilio-phone
   ```

5. **Run the backend server**
   ```bash
   cd backend
   npm run dev
   ```

6. **Run the mobile app**
   ```bash
   # For Android
   npx react-native run-android

   # For iOS
   npx react-native run-ios
   ```

## 📱 Supported Categories

- ⚡ Electrician
- 🔧 Plumber
- 🔨 Carpenter
- ❄️ AC Technician
- ✂️ Tailor
- 🔩 Mechanic
- 🎨 Painter
- 🧹 Cleaner
- 🌱 Gardener
- 🛡️ Security
- 🔧 Other Services

## 🔐 Security Features

- **OTP Verification**: Phone number verification using SMS
- **JWT Authentication**: Secure token-based authentication
- **ID Verification**: Worker identity verification system
- **Data Encryption**: All sensitive data is encrypted
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive input sanitization

## 🌍 Localization

The app supports multiple Nigerian languages:
- English (Default)
- Yoruba
- Hausa
- Igbo
- Nigerian Pidgin

## 📊 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints
- `POST /auth/send-otp` - Send OTP to phone number
- `POST /auth/verify-otp` - Verify OTP and login
- `POST /auth/register` - Register/update user profile

### Worker Endpoints
- `GET /workers` - Get workers with filters
- `GET /workers/:id` - Get worker details
- `GET /workers/featured/list` - Get featured workers

### Booking Endpoints
- `POST /bookings` - Create new booking
- `GET /bookings/user/:userId` - Get user bookings
- `PATCH /bookings/:id/status` - Update booking status

For complete API documentation, visit `/health` endpoint when the server is running.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Frontend Developer** - Mobile app development
- **Backend Developer** - API and database management
- **UI/UX Designer** - User interface and experience design
- **Product Manager** - Feature planning and coordination

## 📞 Support

For support and questions:
- Email: support@skillconnect.app
- Phone: +234 800 123 4567
- Website: https://skillconnect.app

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Basic user authentication
- ✅ Worker profiles and categories
- ✅ Booking system
- ✅ Real-time chat
- ✅ Rating and reviews

### Phase 2 (Next)
- 🔄 Payment integration
- 🔄 Advanced search filters
- 🔄 Push notifications
- 🔄 Offline mode
- 🔄 Admin dashboard

### Phase 3 (Future)
- 📋 Multi-language support
- 📋 AI-powered worker recommendations
- 📋 Video calling integration
- 📋 Advanced analytics
- 📋 White-label solutions

---

Made with ❤️ for the Nigerian skilled worker community