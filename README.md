
# Speedrun Organizer

A modern Android app for speedrunners to organize their runs by game and category, with images, notes, and reminders.

## Features

- **Four Main Sections**: ILs, Full Runs, MultiRuns, Troll Runs
- **Game Management**: Add games with images, tags, and multiple categories
- **Category Tracking**: Track PB times, placements, target times, and auto-calculate differences
- **Smart Reminders**: Local notifications for run eligibility dates
- **Search & Sort**: Powerful filtering and sorting options
- **Dark Mode**: Toggle between light and dark themes
- **Data Export**: JSON backup for your speedrun data
- **Offline First**: All data stored locally with SQLite

## Getting Started

### Mobile Development Setup

This app is built with Capacitor for native Android capabilities. To run on a physical device:

1. **Export to GitHub** via the "Export to Github" button
2. **Clone your repository** and run `npm install`
3. **Add Android platform**: `npx cap add android`
4. **Update dependencies**: `npx cap update android`
5. **Build the project**: `npm run build`
6. **Sync with native**: `npx cap sync`
7. **Run on device**: `npx cap run android`

*Note: You'll need Android Studio installed for Android development.*

### Customization Guide

#### Theme Colors
Edit `src/index.css` to customize the color scheme:
```css
:root {
  --primary: your-color-here;
  --secondary: your-color-here;
  /* Add more custom colors */
}
```

#### Default Profile Images
Replace `/public/placeholder.svg` or modify the `defaultGameImage` setting in:
```typescript
// src/utils/storage.ts
const defaultSettings = {
  defaultGameImage: '/path/to/your/image.png'
};
```

#### Adding New Fields
To add fields to categories, modify:
1. `src/types/speedrun.ts` - Add to Category interface
2. `src/components/CategoryForm.tsx` - Add form inputs
3. `src/components/GameCard.tsx` - Display in cards

#### Notification Logic
Customize notifications in `src/utils/notifications.ts`:
```typescript
// Change reminder timing (currently 1 day before)
const reminderDate = new Date(eligibleDateTime.getTime() - 24 * 60 * 60 * 1000);

// Customize notification content
title: "Your Custom Title",
body: "Your custom message here"
```

#### Database Schema
The app uses localStorage for web/local development and will automatically use SQLite on mobile through Capacitor. Data structure is defined in `src/types/speedrun.ts`.

## Project Structure

```
src/
├── components/          # React components
│   ├── GameCard.tsx    # Expandable game display
│   ├── GameForm.tsx    # Add/edit games
│   ├── CategoryForm.tsx # Add/edit categories
│   └── SearchAndSort.tsx # Search and sorting controls
├── types/              # TypeScript interfaces
├── utils/              # Utility functions
│   ├── storage.ts      # Local data management
│   ├── notifications.ts # Push notification handling
│   └── timeCalculations.ts # Time math utilities
└── pages/
    └── Index.tsx       # Main app page
```

## Technologies Used

- **React** + **TypeScript** for the UI
- **Capacitor** for native mobile capabilities
- **Tailwind CSS** + **shadcn/ui** for styling
- **Local Storage** (web) / **SQLite** (mobile) for data
- **Local Notifications** for run reminders
- **Camera API** for image selection

## Data Export/Import

The app supports JSON export for backup purposes. Exported data includes:
- All games and categories
- App settings and preferences
- Export timestamp

Import functionality can be added by extending the `storage.importData()` method.

For questions or feature requests, check the app's notification settings and ensure proper permissions are granted for the best experience.
