# Lumosity Leaderboard - Static Design Mockups

This folder contains HTML/CSS static mockups of the key screens for the Lumosity Leaderboard web application.

## Files

- **styles.css** - Shared stylesheet containing the design system (colors, typography, components)
- **dashboard.html** - Main dashboard page with stats, quick score entry, achievements, and friend activity
- **leaderboard.html** - Global and friend leaderboards with ranking tables
- **score-entry.html** - Score submission form with game selection
- **friend-comparison.html** - Side-by-side comparison view with friend scores
- **login.html** - Authentication page with login form

## Design System

### Colors
- **Primary**: Blue (#3B82F6) - Trust, engagement
- **Secondary**: Purple (#8B5CF6) - Creativity, brain training
- **Success**: Green (#10B981) - Achievements, wins
- **Warning**: Orange (#F59E0B) - Challenges, streaks
- **Danger**: Red (#EF4444) - Losses, errors

### Typography
- Font Family: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto)
- Headings: Bold weights (600-700)
- Body: Regular weight (400-500)

### Components
- Cards with rounded corners (12px border-radius)
- Buttons with hover effects and transitions
- Form inputs with focus states
- Badges for achievements and status
- Progress bars for visual feedback
- Responsive grid layouts

## Viewing the Mockups

1. Open any HTML file in a modern web browser
2. All files reference `styles.css` in the same directory
3. Navigation links between pages are included (though non-functional in static version)
4. Designs are responsive and work on mobile devices

## Design Principles

1. **Modern & Clean**: Minimalist design with vibrant accent colors
2. **Gamified**: Badges, progress bars, and visual feedback throughout
3. **Mobile-First**: Responsive grid layouts, touch-friendly buttons
4. **Accessible**: High contrast, clear typography, keyboard navigation support

## Notes

- These are static mockups for visual reference only
- Interactive elements (forms, buttons) are styled but not functional
- Actual implementation will use Next.js components and Tailwind CSS
- Design may be refined during development based on user feedback
