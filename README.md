# React Native Timer App

A comprehensive and customizable timer management application built with React Native. Features include category-based organization, progress visualization, local notifications, and theme support.

---

## 🚀 Features

### Core Features ✅

- **Timer Creation**: Create timers with custom names, durations (hours/minutes/seconds), and categories
- **Category Management**: Organize timers by categories with color-coded indicators
- **Timer Controls**: Start, pause, reset, and delete individual timers
- **Progress Visualization**: Real-time progress bars and percentage indicators
- **Bulk Actions**: Start, pause, or reset all timers in a category
- **Timer History**: Track completed timers with timestamps and durations

### Enhanced Features ✅

- **Halfway Alerts**: Optional notifications when timers reach 50% completion
- **Background Notifications**: Receive notifications when timers complete, even when app is closed
- **Theme Support**: Light and dark theme toggle with automatic persistence
- **Search & Filter**: Search timers by name or filter by category
- **Data Export**: Export timer data and history as JSON
- **Persistent Storage**: All data automatically saved and restored using AsyncStorage

### UI/UX Features ✅

- **Responsive Design**: Clean, modern interface that works on all screen sizes
- **Smooth Animations**: Progress animations and interactive feedback
- **Icon Integration**: Ionicons for consistent visual language
- **Category Grouping**: Expandable/collapsible category sections
- **Empty States**: Helpful placeholder content when no data exists
- **Pull-to-Refresh**: Refresh functionality on all list screens

## Screenshots

(Screenshots would be added here for the actual submission)

## Installation & Setup

### Prerequisites

- Node.js (>= 18)
- React Native development environment set up
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/KShaurya01/newTimerApp.git
   cd TimerApp
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **iOS Setup**

   ```bash
   cd ios && pod install && cd ..
   ```

4. **Android Setup**

   - Ensure Android Studio is installed
   - Start an Android emulator or connect a physical device

5. **Run the app**

   ```bash
   # For iOS
   npx react-native run-ios

   # For Android
   npx react-native run-android
   ```

### Android Specific Setup

The app includes vector icons that require font files. These are automatically copied during the build process, but if you encounter icon display issues:

1. Ensure the Ionicons font is in `android/app/src/main/assets/fonts/`
2. Clean and rebuild the project:
   ```bash
   cd android && ./gradlew clean && cd ..
   npx react-native run-android
   ```

### iOS Specific Setup

For iOS notifications to work properly:

1. Ensure proper provisioning profiles are set up
2. Test notification permissions on a physical device (simulator limitations apply)

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── CategorySection.tsx
│   └── TimerCard.tsx
├── constants/           # Theme definitions and constants
│   └── themes.ts
├── context/            # React Context for state management
│   └── TimerContext.tsx
├── navigation/         # Navigation configuration
│   └── AppNavigator.tsx
├── screens/           # Screen components
│   ├── AddTimerScreen.tsx
│   ├── HistoryScreen.tsx
│   └── HomeScreen.tsx
├── services/          # External service integrations
│   └── NotificationService.ts
├── types/            # TypeScript type definitions
│   └── index.ts
└── utils/           # Utility functions
    ├── storage.ts
    └── timerUtils.ts
```

## Architecture & Technical Details

### State Management

- **React Context + useReducer**: Centralized state management for timers, categories, and history
- **TypeScript**: Comprehensive type safety throughout the application
- **AsyncStorage**: Automatic persistence of all app data

### Timer Logic

- **Real-time Countdown**: Efficient timer implementation using setInterval
- **Background Support**: Notifications ensure timers continue even when app is closed
- **Status Management**: Comprehensive timer states (idle, running, paused, completed)

### Notification System

- **Local Notifications**: Background timer completion alerts
- **Halfway Alerts**: Optional 50% completion notifications
- **Permission Handling**: Automatic permission requests for Android/iOS
- **Notification Channels**: Android-specific notification categorization

### Theme System

- **Dynamic Theming**: Real-time theme switching between light and dark modes
- **Consistent Design**: Centralized theme tokens for colors, spacing, and typography
- **Automatic Persistence**: Theme preference saved and restored

## Dependencies

### Core Dependencies

- `react-native`: 0.80.1
- `@react-navigation/native`: Navigation framework
- `@react-navigation/stack`: Stack navigation
- `@react-navigation/bottom-tabs`: Tab navigation
- `@react-native-async-storage/async-storage`: Data persistence
- `react-native-vector-icons`: Icon system
- `react-native-push-notification`: Background notifications

### Development Dependencies

- `typescript`: Type safety
- `@types/react-native-vector-icons`: TypeScript definitions
- `@types/react-native-push-notification`: TypeScript definitions
- `eslint`: Code linting
- `prettier`: Code formatting

## Key Implementation Decisions

### Timer Management

- Chose setInterval over complex timer libraries for simplicity and control
- Implemented countdown logic in individual components for better performance
- Used context for centralized timer operations (start, pause, reset)

### Notification Strategy

- Local notifications instead of push notifications (no server required)
- Fallback immediate notifications for completion events
- Automatic cleanup of scheduled notifications on timer actions

### State Architecture

- Single source of truth with React Context
- Reducer pattern for predictable state updates
- Automatic persistence with debounced saving

### UI/UX Decisions

- Category-based organization for better timer management
- Progress visualization for immediate feedback
- Bulk actions for efficient multi-timer operations
- Search and filtering for large timer collections

## Testing Strategy

The app has been designed with testability in mind:

- Separated business logic from UI components
- Pure utility functions for timer calculations
- Context-based state management for easy mocking
- TypeScript for compile-time error catching

## Performance Considerations

- **Efficient Rendering**: Timer updates only affect individual components
- **Debounced Persistence**: Storage operations are batched to avoid excessive writes
- **Optimized Animations**: Using React Native Animated API for smooth performance
- **Memory Management**: Proper cleanup of intervals and listeners

## Known Limitations & Future Enhancements

### Current Limitations

- Notifications require app to be backgrounded, not completely killed (platform limitation)
- Maximum timer duration limited to 24 hours for UX reasons
- Export functionality uses device sharing system (no cloud sync)

### Potential Future Enhancements

1. **Cloud Sync**: Firebase integration for cross-device synchronization
2. **Timer Templates**: Predefined timer configurations
3. **Statistics**: Detailed analytics on timer usage patterns
4. **Recurring Timers**: Support for repeating timer schedules
5. **Sound Customization**: Custom notification sounds
6. **Widget Support**: Home screen timer widgets
7. **Team Features**: Shared timers for group activities

## Assumptions Made During Development

1. **User Base**: Designed for personal productivity and time management
2. **Usage Patterns**: Users will create multiple timers across different categories
3. **Platform Support**: Equal importance given to both iOS and Android
4. **Offline First**: App functions completely offline with local storage
5. **Notification Permissions**: Users will grant notification permissions for full functionality
6. **Device Capabilities**: Modern devices with sufficient storage and processing power

## Build & Distribution

### Development Build

```bash
# Debug build for testing
npx react-native run-android --variant=debug
npx react-native run-ios --configuration=Debug
```

### Release Build

```bash
# Android APK
cd android && ./gradlew assembleRelease

# iOS Archive
# Use Xcode for iOS release builds
```

### APK Location

After building, the APK can be found at:
`android/app/build/outputs/apk/release/app-release.apk`
