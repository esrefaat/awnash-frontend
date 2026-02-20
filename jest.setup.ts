import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'dark',
    resolvedTheme: 'dark',
    setTheme: jest.fn(),
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: (ns?: string) => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: jest.fn().mockResolvedValue(undefined),
    },
  }),
  initReactI18next: { type: '3rdParty', init: jest.fn() },
}));

jest.mock('@/lib/i18n', () => ({
  __esModule: true,
  default: { language: 'en', changeLanguage: jest.fn() },
  RTL_LANGUAGES: ['ar', 'ur', 'he', 'fa'],
  SUPPORTED_LANGUAGES: [
    { code: 'en', name: 'English', direction: 'ltr' },
    { code: 'ar', name: 'العربية', direction: 'rtl' },
    { code: 'ur', name: 'اردو', direction: 'rtl' },
  ],
}));

// Suppress console noise during tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    if (msg.includes('Not implemented') || msg.includes('act(')) return;
    originalConsoleError(...args);
  };
  console.warn = (...args: unknown[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    if (msg.includes('Unauthorized')) return;
    originalConsoleWarn(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
