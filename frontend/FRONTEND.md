# Frontend - IAM Policy Generator

## Overview

React 18 + TypeScript single-page application with a stunning Apple/Spotify-inspired UI for generating IAM policies using natural language.

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm 9+ installed

### Installation

```bash
cd frontend
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or next available port if 5173 is in use)

### Building

Create an optimized production build:

```bash
npm run build
```

Output will be in the `dist/` directory.

### Testing

Run unit tests:

```bash
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

Generate coverage report:

```bash
npm run test:coverage
```

## Configuration

Create a `.env.local` file (copy from `.env.example`):

```bash
cp .env.example .env.local
```

Update the API endpoint:

```env
VITE_API_ENDPOINT=https://your-api-gateway-endpoint/generate-policy
```

## Architecture

### Components

- **App.tsx**: Main application component with split-panel layout
- **hooks/usePolicyGenerator.ts**: Custom hook for API communication

### Features

- Natural language input textarea with character count and tips
- Real-time policy generation with loading state
- Monaco Editor for syntax-highlighted JSON display
- Copy-to-clipboard functionality with visual feedback
- Error handling and validation
- Fully responsive design

### Styling

- **Tailwind CSS v4**: Utility-first CSS framework
- **Dark theme**: Apple/Spotify inspired dark mode
- **Gradient accents**: Blue to purple gradients for visual appeal
- **Glass morphism**: Subtle transparency effects

## Testing

### Test Files

- `src/__tests__/App.test.tsx`: App component tests (8 tests)
- `src/__tests__/usePolicyGenerator.test.ts`: Hook tests (7 tests)

### Test Coverage

- 15 unit tests covering:
  - Component rendering
  - User interactions (input, button clicks)
  - API integration
  - Error handling
  - State management

All tests pass with Vitest + React Testing Library.

## Dependencies

### Production
- **react**: 19.1.1
- **react-dom**: 19.1.1
- **@monaco-editor/react**: 4.7.0 - Code editor
- **tailwindcss**: 4.1.15 - CSS framework
- **lucide-react**: 0.546.0 - Icon library

### Development
- **vite**: 7.1.7 - Build tool
- **typescript**: 5.9.3
- **vitest**: 3.2.4 - Test framework
- **@testing-library/react**: 16.3.0
- **postcss**: 8.5.6 - CSS processing

## Project Structure

```
frontend/
├── src/
│   ├── App.tsx                 # Main component
│   ├── App.css                 # App styles (Tailwind)
│   ├── index.css               # Global styles
│   ├── main.tsx                # Entry point
│   ├── hooks/
│   │   └── usePolicyGenerator.ts   # API hook
│   ├── __tests__/
│   │   ├── App.test.tsx        # Component tests
│   │   └── usePolicyGenerator.test.ts  # Hook tests
│   └── setup.ts                # Test setup
├── public/                     # Static assets
├── package.json
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── index.html
```

## API Integration

The frontend communicates with the backend via the `usePolicyGenerator` hook:

```typescript
const { policy, loading, error, generate } = usePolicyGenerator();

// Generate policy
await generate("Lambda function needs S3 read access");

// Access results
console.log(policy);      // Generated IAM policy JSON
console.log(loading);     // true during API call
console.log(error);       // Error message if any
```

### API Endpoint

**POST** `/generate-policy`

**Request:**
```json
{
  "description": "Lambda function needs read-only access to S3 bucket 'data-lake'"
}
```

**Response:**
```json
{
  "policy": {
    "Version": "2012-10-17",
    "Statement": [...]
  },
  "explanation": "...",
  "warnings": []
}
```

## Performance

- **Vite**: ~400ms cold start
- **Monaco Editor**: Lazy-loaded for minimal initial bundle
- **Tree-shaking**: Unused code removed in production build
- **Code splitting**: Automatic route-based splits

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Any modern ES2020+ compatible browser

## Troubleshooting

### Port Already in Use

Vite automatically tries the next available port. Check the terminal output for the actual URL.

### CSS Not Loading

Clear the cache and restart:

```bash
rm -rf node_modules/.vite
npm run dev
```

### Tests Failing

Ensure all dependencies are installed:

```bash
npm install
npm test -- --run
```

## Contributing

1. Write tests first (TDD approach)
2. Implement features
3. Run tests: `npm test`
4. Build: `npm run build`
5. Commit changes

## License

See root repository LICENSE.
