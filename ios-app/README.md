# KWBPN iOS App

Kathmandu Ward Based Pickup Notifier - iOS Customer Application

## Architecture

- **SwiftUI** - Declarative UI framework
- **MVVM** - Model-View-ViewModel pattern
- **async/await** - Modern Swift concurrency
- **Firebase** - Backend services (Auth, Firestore, FCM)

## Project Structure

```
KWBPN/
├── App/                          # App entry point
│   ├── KWBPNApp.swift           # Main app struct
│   ├── AppDelegate.swift        # Push notification handling
│   └── AppState.swift           # Global auth state
│
├── Core/                         # Core utilities
│   ├── DI/                      # Dependency injection
│   ├── Extensions/              # Swift extensions
│   │   ├── Date+Extensions.swift
│   │   ├── String+Extensions.swift
│   │   └── View+Extensions.swift
│   ├── Utilities/               # Helpers
│   │   ├── Constants.swift
│   │   └── Logger.swift
│   └── Networking/
│       └── NetworkMonitor.swift # Offline detection
│
├── Services/                     # Business logic layer
│   ├── AuthService.swift        # Firebase Auth
│   ├── CustomerService.swift    # Customer CRUD
│   ├── PickupNotificationService.swift
│   ├── ResponseService.swift
│   └── NotificationService.swift # FCM handling
│
├── Models/                       # Data models
│   ├── Customer.swift
│   ├── Ward.swift
│   ├── PickupNotification.swift
│   ├── PickupResponse.swift
│   └── AppError.swift
│
├── Features/                     # Feature modules
│   ├── Onboarding/
│   │   ├── Views/
│   │   │   ├── SplashView.swift
│   │   │   ├── OnboardingView.swift
│   │   │   ├── PhoneInputView.swift
│   │   │   ├── OTPVerificationView.swift
│   │   │   └── ProfileSetupView.swift
│   │   └── ViewModels/
│   │       └── OnboardingViewModel.swift
│   │
│   ├── Home/
│   │   ├── Views/
│   │   │   ├── MainTabView.swift
│   │   │   └── HomeView.swift
│   │   └── ViewModels/
│   │       └── HomeViewModel.swift
│   │
│   ├── NotificationDetail/
│   │   ├── Views/
│   │   │   └── NotificationDetailView.swift
│   │   └── ViewModels/
│   │       └── NotificationDetailViewModel.swift
│   │
│   ├── History/
│   │   ├── Views/
│   │   │   └── HistoryView.swift
│   │   └── ViewModels/
│   │       └── HistoryViewModel.swift
│   │
│   └── Profile/
│       └── Views/
│           └── ProfileView.swift
│
├── Navigation/
│   └── Router.swift             # Navigation management
│
├── Components/                   # Reusable UI components
│   ├── Buttons/
│   │   ├── PrimaryButton.swift
│   │   └── ResponseButton.swift
│   ├── Inputs/
│   │   ├── PhoneTextField.swift
│   │   ├── OTPTextField.swift
│   │   └── WardPicker.swift
│   ├── Cards/
│   │   └── NotificationCard.swift
│   └── Common/
│       ├── LoadingView.swift
│       ├── ErrorView.swift
│       └── StatusBadge.swift
│
└── Resources/
    ├── Colors.swift             # Color definitions
    └── GoogleService-Info.plist # Firebase config
```

## Setup Instructions

### 1. Prerequisites
- Xcode 15.0+
- iOS 16.0+ deployment target
- CocoaPods or Swift Package Manager
- Firebase account

### 2. Firebase Setup
1. Create a Firebase project at https://console.firebase.google.com
2. Add an iOS app with bundle identifier `com.kwbpn.app`
3. Download `GoogleService-Info.plist`
4. Replace the example file in `Resources/`

### 3. Enable Firebase Services
- **Authentication**: Enable Phone sign-in method
- **Firestore**: Create database in production mode
- **Cloud Messaging**: Configure APNs certificates

### 4. Swift Package Manager Dependencies
Add to your Xcode project:
```swift
// Firebase iOS SDK
https://github.com/firebase/firebase-ios-sdk.git

// Products needed:
- FirebaseAuth
- FirebaseFirestore
- FirebaseMessaging
```

### 5. APNs Configuration
1. Create APNs key in Apple Developer Portal
2. Upload to Firebase Console > Project Settings > Cloud Messaging
3. Add Push Notifications capability in Xcode
4. Add Background Modes capability (Remote notifications)

## Key Features

### Authentication
- Phone OTP verification via Firebase Auth
- Automatic session management
- Custom claims for role-based access

### Notifications
- Real-time Firestore listeners
- FCM topic-based push notifications
- Offline support with local caching

### Response System
- YES/NO response buttons
- Response timestamp tracking
- Community response statistics

### Localization
- English and Nepali support
- Nepali numerals for ward numbers
- i18n-ready architecture

## Development

### Running the App
1. Open `KWBPN.xcodeproj` in Xcode
2. Select your development team
3. Choose a simulator or device
4. Build and run (⌘R)

### Testing
- Unit tests in `KWBPNTests/`
- UI tests in `KWBPNUITests/`
- Mock services available for preview providers

### Code Style
- SwiftLint for code consistency
- Follow Apple's Swift API Design Guidelines
- Use `@MainActor` for view models

## License

This is a college project. All rights reserved.
