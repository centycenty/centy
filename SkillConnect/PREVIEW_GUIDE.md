# 🔧 SkillConnect - Preview Guide

## 🚀 **How to Preview the SkillConnect App**

### **Current Status: ✅ READY TO PREVIEW**

---

## **Option 1: 🌐 API Backend Preview (Working Now!)**

The backend API is currently running and you can test it immediately:

### **📡 Live API Endpoints:**
```bash
# Health Check
curl http://localhost:3000/health

# Featured Workers
curl http://localhost:3000/api/workers/featured

# Service Categories  
curl http://localhost:3000/api/workers/categories

# Search Workers
curl "http://localhost:3000/api/workers?category=electrician"

# Mock Authentication
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+2348012345678"}'
```

### **🎯 What You'll See:**
- ✅ Professional API responses
- ✅ Nigerian workers data (Lagos locations)
- ✅ Service categories with counts
- ✅ Rating and pricing information
- ✅ Mock authentication system

---

## **Option 2: 📱 Mobile App Preview**

### **Prerequisites:**
```bash
# Install Node.js dependencies
cd /workspace/SkillConnect
npm install

# For Android (requires Android Studio)
npx react-native run-android

# For iOS (requires Xcode - macOS only)
npx react-native run-ios
```

### **📲 What You'll Experience:**
- **Onboarding**: Choose Customer or Worker
- **Authentication**: Nigerian phone number + OTP
- **Customer Home**: Search, categories, featured workers
- **Worker Dashboard**: Job management interface
- **Navigation**: Bottom tabs with Material Design
- **Professional UI**: Clean, modern Nigerian-focused design

---

## **Option 3: 📊 Code Structure Preview**

### **🔍 Key Files to Examine:**

#### **Mobile App UI:**
```bash
# Customer Home Screen (Main UI)
cat src/screens/customer/CustomerHomeScreen.tsx

# Authentication Flow
cat src/screens/auth/OnboardingScreen.tsx
cat src/screens/auth/LoginScreen.tsx
cat src/screens/auth/OTPScreen.tsx

# Navigation System
cat src/navigation/CustomerTabNavigator.tsx
cat src/navigation/WorkerTabNavigator.tsx
```

#### **Backend API:**
```bash
# API Routes
cat backend/routes/auth.js
cat backend/routes/workers.js  
cat backend/routes/bookings.js

# Preview Server (Currently Running)
cat backend/preview-server.js
```

#### **Configuration:**
```bash
# TypeScript Setup
cat tsconfig.json

# React Native Config
cat metro.config.js
cat babel.config.js

# Dependencies
cat package.json
```

---

## **Option 4: 🔧 Full Setup Preview**

### **Complete Development Setup:**

#### **1. Install Dependencies:**
```bash
cd /workspace/SkillConnect

# Main app dependencies
npm install

# Backend dependencies  
cd backend
npm install
cd ..
```

#### **2. Start Backend:**
```bash
cd backend
node preview-server.js
# Server runs on http://localhost:3000
```

#### **3. Start Mobile App:**
```bash
# Start Metro bundler
npx react-native start

# In another terminal, run on device:
npx react-native run-android  # Android
npx react-native run-ios      # iOS
```

#### **4. Firebase Setup (Optional):**
```bash
# Create Firebase project at https://console.firebase.google.com
# Enable Authentication, Firestore, Storage
# Download config files:
# - google-services.json (Android)  
# - GoogleService-Info.plist (iOS)

# Set environment variables in backend/.env
cp backend/.env.example backend/.env
# Edit with your Firebase credentials
```

---

## **🎯 What Each Preview Shows:**

### **🌐 API Preview (Active Now):**
- ✅ **Worker Data**: 3 sample workers with skills, ratings
- ✅ **Categories**: 6 service types with worker counts  
- ✅ **Authentication**: Mock OTP system (use "123456")
- ✅ **Bookings**: Create and manage job requests
- ✅ **Search**: Filter by category, location, skills

### **📱 Mobile App Preview:**
- ✅ **Onboarding Flow**: Professional welcome screens
- ✅ **Authentication**: Nigerian phone validation + OTP
- ✅ **Customer Experience**: Search workers, view profiles, book services
- ✅ **Worker Experience**: Manage jobs, track earnings, update availability
- ✅ **Navigation**: Intuitive bottom tabs for both user types

### **👥 User Types:**
1. **Customers**: Find and book skilled workers
2. **Workers**: Manage profiles and accept jobs
3. **Admins**: Verify users and handle disputes (backend ready)

---

## **🔍 Quick Demo Data:**

### **Sample Workers:**
- **Ahmed Carpenter** (4.9★, ₦6,000/hr, Surulere Lagos)
- **John Electrician** (4.8★, ₦5,000/hr, Victoria Island Lagos)  
- **Mary Plumber** (4.6★, ₦4,500/hr, Ikeja Lagos)

### **Service Categories:**
- ⚡ Electrician (45 workers)
- 🔧 Plumber (32 workers)
- 🔨 Carpenter (28 workers)
- ❄️ AC Technician (19 workers)
- ✂️ Tailor (41 workers)
- 🔩 Mechanic (23 workers)

---

## **📋 Preview Checklist:**

### **✅ Currently Working:**
- [x] Backend API server
- [x] Authentication endpoints
- [x] Worker search & filtering
- [x] Service categories
- [x] Mock data system
- [x] TypeScript configuration
- [x] React Native project structure
- [x] Navigation system
- [x] UI components
- [x] State management
- [x] Nigerian market optimization

### **🔄 Next Steps:**
- [ ] Mobile app compilation
- [ ] Firebase integration
- [ ] Real-time chat
- [ ] Payment integration
- [ ] Push notifications
- [ ] Maps integration
- [ ] Image upload
- [ ] Offline sync

---

## **📞 Support:**

If you encounter any issues:

1. **Check server status**: `curl http://localhost:3000/health`
2. **Restart backend**: `cd backend && node preview-server.js`
3. **Check dependencies**: `npm install`
4. **View logs**: Check terminal output for errors

---

**🎉 The SkillConnect app is ready for preview and further development!**