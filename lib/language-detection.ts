// ============================================
// AKILI HEALTH - Language Detection for Nigerian Languages
// ============================================

import type { SupportedLanguage } from './types'

// Common words/phrases in Nigerian languages for detection
const LANGUAGE_MARKERS: Record<SupportedLanguage, string[]> = {
  en: [
    'the', 'is', 'are', 'was', 'were', 'have', 'has', 'been', 'being',
    'please', 'help', 'hospital', 'doctor', 'pain', 'emergency',
    'i am', 'i need', 'where is', 'how do', 'what is',
  ],
  pcm: [
    'wetin', 'dey', 'na', 'wey', 'abi', 'sha', 'abeg', 'wahala', 'gist',
    'jare', 'oya', 'shey', 'pikin', 'comot', 'enter', 'chop', 'vex',
    'no be', 'e don', 'make i', 'i wan', 'i dey', 'no dey', 'e dey',
    'how far', 'no wahala', 'e pain', 'body dey', 'head dey',
  ],
  yo: [
    'ṣé', 'ń', 'máà', 'kí', 'ó', 'ẹ', 'àwọn', 'pẹ̀lú', 'sí', 'ní',
    'bàwọ́', 'nígbà', 'kò', 'jẹ́', 'wà', 'ọjọ́', 'ilé', 'ọmọ',
    'báwo', 'ẹ̀mí', 'orí', 'àyà', 'inú', 'ìwòsàn', 'dókítà',
    'iranlowo', 'mo nilo', 'ibo ni', 'kini', 'eyi',
  ],
  ig: [
    'gịnị', 'ọ', 'na', 'nke', 'bụ', 'dị', 'ka', 'ma', 'ụfọdụ',
    'anyị', 'unu', 'ha', 'm', 'ị', 'ya', 'obi', 'ahụ', 'isi',
    'ụlọ ọgwụ', 'dibia', 'enyemaka', 'ọ na-eme', 'kedu', 'ebee',
    'ana m achọ', 'o nwere', 'nwanne',
  ],
  ha: [
    'ina', 'kana', 'yana', 'tana', 'muna', 'suna', 'wani', 'wata',
    'da', 'ba', 'ne', 'ce', 'shi', 'ta', 'su', 'mu', 'ku',
    'yaya', 'ina', 'wane', 'asibiti', 'likita', 'taimako',
    'na ji', 'ina bukatar', 'ina son', 'me ya faru',
  ],
}

// Character patterns unique to certain languages
const LANGUAGE_PATTERNS: Record<SupportedLanguage, RegExp[]> = {
  en: [],
  pcm: [],
  yo: [
    /[ẹọṣ]/i, // Yoruba special characters
    /[àáèéìíòóùú]/i, // Yoruba tone marks
  ],
  ig: [
    /[ịọụ]/i, // Igbo special characters
    /ṅ/i, // Igbo nasal n
  ],
  ha: [
    /[ɗɓƙ]/i, // Hausa special characters (less common in typing)
  ],
}

// Detect language from text
export function detectLanguage(text: string): SupportedLanguage {
  const normalizedText = text.toLowerCase().trim()
  
  if (!normalizedText) return 'en'

  const scores: Record<SupportedLanguage, number> = {
    en: 0,
    pcm: 0,
    yo: 0,
    ig: 0,
    ha: 0,
  }

  // Check for special character patterns first (high confidence)
  for (const [lang, patterns] of Object.entries(LANGUAGE_PATTERNS) as [SupportedLanguage, RegExp[]][]) {
    for (const pattern of patterns) {
      if (pattern.test(normalizedText)) {
        scores[lang] += 10 // High weight for character matches
      }
    }
  }

  // Check for word markers
  for (const [lang, markers] of Object.entries(LANGUAGE_MARKERS) as [SupportedLanguage, string[]][]) {
    for (const marker of markers) {
      // Check for word boundaries
      const regex = new RegExp(`\\b${marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      if (regex.test(normalizedText)) {
        scores[lang] += 1
      }
    }
  }

  // Pidgin-specific boosts (very common patterns)
  if (/\bdey\b/i.test(normalizedText)) scores.pcm += 5
  if (/\bna\b/i.test(normalizedText) && !/\bna\b.*\bna\b/i.test(normalizedText)) {
    // 'na' is common in Pidgin but also Igbo
    scores.pcm += 2
    scores.ig += 1
  }
  if (/\bwetin\b/i.test(normalizedText)) scores.pcm += 5
  if (/\babeg\b/i.test(normalizedText)) scores.pcm += 5

  // Find highest scoring language
  let maxScore = 0
  let detectedLang: SupportedLanguage = 'en'

  for (const [lang, score] of Object.entries(scores) as [SupportedLanguage, number][]) {
    if (score > maxScore) {
      maxScore = score
      detectedLang = lang
    }
  }

  // Default to English if no strong signal
  if (maxScore < 2) {
    return 'en'
  }

  return detectedLang
}

// Get language confirmation question
export function getLanguageConfirmation(
  detectedLang: SupportedLanguage
): Record<SupportedLanguage, string> {
  const langNames: Record<SupportedLanguage, Record<SupportedLanguage, string>> = {
    en: { en: 'English', pcm: 'Pidgin', yo: 'Yoruba', ig: 'Igbo', ha: 'Hausa' },
    pcm: { en: 'English', pcm: 'Pidgin', yo: 'Yoruba', ig: 'Igbo', ha: 'Hausa' },
    yo: { en: 'Gẹ̀ẹ́sì', pcm: 'Pidgin', yo: 'Yorùbá', ig: 'Igbo', ha: 'Hausa' },
    ig: { en: 'English', pcm: 'Pidgin', yo: 'Yoruba', ig: 'Igbo', ha: 'Hausa' },
    ha: { en: 'Turanci', pcm: 'Pidgin', yo: 'Yoruba', ig: 'Igbo', ha: 'Hausa' },
  }

  return {
    en: `I hear you speaking ${langNames.en[detectedLang]}. Should I continue in ${langNames.en[detectedLang]}?`,
    pcm: `I hear say you dey speak ${langNames.pcm[detectedLang]}. Make I continue for ${langNames.pcm[detectedLang]}?`,
    yo: `Mo gbọ́ pé ẹ ń sọ ${langNames.yo[detectedLang]}. Ṣé kí n máa bá ẹ sọ̀rọ̀ ní ${langNames.yo[detectedLang]}?`,
    ig: `Anụrụ m na ị na-asụ ${langNames.ig[detectedLang]}. Ka m gaa n'ihu na ${langNames.ig[detectedLang]}?`,
    ha: `Na ji kana magana da ${langNames.ha[detectedLang]}. Zan ci gaba da ${langNames.ha[detectedLang]}?`,
  }
}

// Get greeting in language
export function getGreeting(lang: SupportedLanguage, timeOfDay?: 'morning' | 'afternoon' | 'evening'): string {
  const time = timeOfDay || getCurrentTimeOfDay()
  
  const greetings: Record<SupportedLanguage, Record<string, string>> = {
    en: {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening',
    },
    pcm: {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening',
    },
    yo: {
      morning: 'E káàárọ̀',
      afternoon: 'E káàsán',
      evening: 'E kú ìrọ̀lẹ́',
    },
    ig: {
      morning: 'Ụtụtụ ọma',
      afternoon: 'Ehihie ọma',
      evening: 'Mgbede ọma',
    },
    ha: {
      morning: 'Barka da safiya',
      afternoon: 'Barka da rana',
      evening: 'Barka da yamma',
    },
  }

  return greetings[lang][time]
}

function getCurrentTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}
