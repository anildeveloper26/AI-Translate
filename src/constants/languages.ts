export const LANGUAGES = [
  { code: 'hi-IN', label: 'Hindi + English (Hinglish)' },
  { code: 'en-IN', label: 'English (India)' },
  { code: 'en-US', label: 'English (US)' },
  { code: 'te-IN', label: 'Telugu' },
  { code: 'ta-IN', label: 'Tamil' },
  { code: 'kn-IN', label: 'Kannada' },
  { code: 'mr-IN', label: 'Marathi' },
  { code: 'bn-IN', label: 'Bengali' },
] as const

export const DEFAULT_LANGUAGE = 'hi-IN'

export const languageLabel = (code: string) => LANGUAGES.find((l) => l.code === code)?.label ?? code
