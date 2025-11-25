# Theme System Guide

## Night Mode Implementation

Your app now has a fully functional dark/light mode toggle using React Context and next-themes!

## How It Works

### Theme Provider (Context)

The `ThemeProvider` wraps your entire app and provides theme state to all components:

```tsx
<ThemeProvider
  attribute="class"        // Uses 'dark' class on <html>
  defaultTheme="light"     // Starts in light mode
  enableSystem            // Can detect system preference
  disableTransitionOnChange // Prevents flash during switch
>
  {children}
</ThemeProvider>
```

### Theme Toggle Button

Located in the header, allows users to switch between light and dark modes:
- 🌙 Moon icon in light mode
- ☀️ Sun icon in dark mode
- Uses React Context via `useTheme()` hook

## Color Mappings

### Light Mode (Default)
- **Background**: Beige (#ebebd3)
- **Primary**: Yale Blue (#083d77)
- **Secondary**: Naples Yellow (#f4d35e)
- **Accent**: Sandy Brown (#ee964b)
- **Destructive**: Tomato (#f95738)

### Dark Mode
- **Background**: Dark Yale Blue (#020c18)
- **Primary**: Naples Yellow (#f4d35e)
- **Secondary**: Sandy Brown (#ee964b)
- **Accent**: Sandy Brown (#ee964b)
- **Destructive**: Tomato (#f95738)

## Using Themes in Components

### Automatic Theme Support

All shadcn/ui components automatically support themes:

```tsx
<Button>Click me</Button>           // Adapts to theme
<Card>Content</Card>                // Adapts to theme
<Input placeholder="Type..." />     // Adapts to theme
```

### Custom Theme-Aware Components

Use semantic color classes that adapt:

```tsx
<div className="bg-background text-foreground">
  <h1 className="text-primary">Title</h1>
  <p className="text-muted-foreground">Description</p>
  <Button className="bg-primary text-primary-foreground">
    Action
  </Button>
</div>
```

### Direct Color Usage

You can also use your custom colors directly:

```tsx
// Light in both modes
<div className="bg-yale_blue text-beige">

// With shades
<div className="bg-yale_blue-500 hover:bg-yale_blue-600">

// Conditional based on theme
<div className="bg-beige dark:bg-yale_blue-900">
```

## Theme Toggle Location

The toggle button is in the header, between the logo and user navigation:

```
[Dreamality]  [🌙/☀️] [user@email.com] [Sign Out]
```

## Accessing Theme in Code

Use the `useTheme` hook in any client component:

```tsx
'use client'

import { useTheme } from 'next-themes'

export function MyComponent() {
  const { theme, setTheme } = useTheme()
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  )
}
```

## System Preference Detection

The theme system can detect user's OS preference:

- macOS/iOS: System Settings → Appearance
- Windows: Settings → Personalization → Colors
- Linux: Varies by desktop environment

If `enableSystem` is true, the app will respect this preference on first visit.

## Persistence

Theme preference is saved in localStorage:
- Key: `theme`
- Values: `'light'`, `'dark'`, or `'system'`
- Persists across sessions

## CSS Variables

All theme colors are defined as CSS variables in `app/globals.css`:

```css
:root {
  --primary: 211 87% 25%;        /* Yale Blue */
  --background: 60 37% 87%;      /* Beige */
  --secondary: 47 87% 66%;       /* Naples Yellow */
  /* ... */
}

.dark {
  --primary: 47 87% 66%;         /* Naples Yellow */
  --background: 211 93% 10%;     /* Dark Yale Blue */
  /* ... */
}
```

## Customizing Colors

### Change Light Mode Colors

Edit `app/globals.css` under `:root`:

```css
:root {
  --primary: 211 87% 25%;  /* Change this */
}
```

### Change Dark Mode Colors

Edit `app/globals.css` under `.dark`:

```css
.dark {
  --primary: 47 87% 66%;   /* Change this */
}
```

### Add New Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  my_custom_color: {
    DEFAULT: '#123456',
    500: '#123456',
    // ... more shades
  }
}
```

## Testing Themes

### Manual Testing
1. Click the moon/sun icon in header
2. Verify colors change
3. Check all pages (home, gallery, 3D models)
4. Test forms and buttons

### Programmatic Testing
```tsx
// In a client component
const { setTheme } = useTheme()

// Test light mode
setTheme('light')

// Test dark mode
setTheme('dark')
```

## Accessibility

The theme toggle includes:
- `sr-only` label for screen readers
- Keyboard accessible (Tab + Enter)
- Clear visual indication of current mode
- No flash on page load

## Browser Support

Works in all modern browsers:
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## Performance

- No flash on page load (`suppressHydrationWarning`)
- Instant theme switching
- Minimal JavaScript (~2KB)
- CSS-only color transitions

## Components Using Theme

All these components automatically adapt:
- Header
- Cards
- Buttons
- Forms (Input, Textarea, Label)
- Gallery
- 3D Model viewer
- Auth pages
- Error messages

## Future Enhancements

Potential additions:
- More theme options (blue theme, green theme, etc.)
- Custom theme builder
- Theme presets
- Scheduled theme switching (auto dark at night)

---

**Try it now!** Click the moon/sun icon in the header to toggle between light and dark modes! 🌙☀️

