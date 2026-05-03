// ============================================
// AKILI HEALTH - Emergency First Aid Guidance
// Safe, evidence-based first aid instructions
// ============================================

import type { SupportedLanguage } from './types'

export interface FirstAidGuidance {
  condition: string
  severity: 'critical' | 'serious' | 'moderate'
  doNotDo: string[]
  immediateActions: string[]
  seekHelp: string
}

// First aid guidance in multiple languages
export const FIRST_AID_GUIDANCE: Record<string, Record<SupportedLanguage, FirstAidGuidance>> = {
  cardiac_arrest: {
    en: {
      condition: 'Suspected Cardiac Arrest',
      severity: 'critical',
      doNotDo: [
        'Do NOT give the person water',
        'Do NOT leave them alone',
        'Do NOT waste time - every second counts',
      ],
      immediateActions: [
        'Call emergency services immediately (112 or 767)',
        'Check if they are responsive - tap and shout',
        'If not breathing, start CPR',
        'Push hard and fast in the center of the chest',
        'Push at least 5cm deep, 100-120 times per minute',
        'If available, ask someone to find an AED',
        'Continue until help arrives',
      ],
      seekHelp: 'This is a life-threatening emergency. Keep doing CPR until emergency services arrive.',
    },
    pcm: {
      condition: 'Heart Attack',
      severity: 'critical',
      doNotDo: [
        'No give am water',
        'No leave am alone',
        'No waste time - every second important',
      ],
      immediateActions: [
        'Call emergency people quick quick (112 or 767)',
        'Check if e dey respond - tap am, shout',
        'If e no dey breathe, start CPR',
        'Press well well for the middle of chest',
        'Press 5cm deep, 100-120 times per minute',
        'If AED machine dey, make person find am',
        'Continue until help reach',
      ],
      seekHelp: 'Na serious emergency be this. Continue dey do CPR until help come.',
    },
    yo: {
      condition: 'Ìdààmú Ọkàn',
      severity: 'critical',
      doNotDo: [
        'Má fún un ní omi',
        'Má fi í sílẹ̀ nìkan',
        'Má ṣe ṣíṣe àkókò - àkókò ló ṣe pàtàkì',
      ],
      immediateActions: [
        'Pe àwọn oníṣẹ́ pàjáwìrì lẹ́sẹ̀kẹsẹ̀ (112 tàbí 767)',
        'Wo bóyá ó ń dahùn - kan àn, kígbe',
        'Tí kò bá ń mí, bẹ̀rẹ̀ CPR',
        'Tẹ gidigidi ní àárín àyà',
        'Tẹ 5cm jìn, ìgbà 100-120 ní ìṣẹ́jú kan',
        'Bí AED bá wà, jẹ́ kí ẹnìkan rí i',
        'Máa ṣe títí ìrànlọ́wọ́ yóò fi dé',
      ],
      seekHelp: 'Pàjáwìrì ńlá nìyí. Máa ṣe CPR títí ìrànlọ́wọ́ yóò fi dé.',
    },
    ig: {
      condition: 'Ọrịa Obi',
      severity: 'critical',
      doNotDo: [
        'Enyela ya mmiri',
        'Ahapụla ya naanị ya',
        'Etufula oge - nkeji ọ bụla dị mkpa',
      ],
      immediateActions: [
        'Kpọọ ndị mberede ozugbo (112 ma ọ bụ 767)',
        'Lee ma ọ na-aza - metụ ya, tie mkpu',
        'Ọ bụrụ na ọ naghị eku ume, malite CPR',
        'Pịa ike n\'etiti obi',
        'Pịa 5cm omimi, ugboro 100-120 n\'otu nkeji',
        'Ọ bụrụ na AED dị, mee ka onye chọọ ya',
        'Gaa n\'ihu ruo mgbe enyemaka ga-abịa',
      ],
      seekHelp: 'Nke a bụ mberede dị egwu. Gaa n\'ihu na CPR ruo mgbe ndị enyemaka ga-abịa.',
    },
    ha: {
      condition: 'Bugun Zuciya',
      severity: 'critical',
      doNotDo: [
        'Kada ka ba shi ruwa',
        'Kada ka bar shi kadai',
        'Kada ka ɓata lokaci - kowane dakika yana da muhimmanci',
      ],
      immediateActions: [
        'Kira sabis na gaggawa nan da nan (112 ko 767)',
        'Duba ko yana amsa - taɓa shi, yi kuka',
        'Idan ba ya numfashi, fara CPR',
        'Danna sosai a tsakiyar kirji',
        'Danna 5cm zurfi, sau 100-120 a minti daya',
        'Idan AED yana can, bari wani ya neme shi',
        'Ci gaba har sai taimako ya zo',
      ],
      seekHelp: 'Wannan gaggawa ne mai tsanani. Ci gaba da CPR har sai taimako ya zo.',
    },
  },
  
  severe_bleeding: {
    en: {
      condition: 'Severe Bleeding',
      severity: 'critical',
      doNotDo: [
        'Do NOT remove objects stuck in the wound',
        'Do NOT apply a tourniquet unless trained',
        'Do NOT lift the bandage to check - add more on top',
      ],
      immediateActions: [
        'Call emergency services (112 or 767)',
        'Apply firm, direct pressure with a clean cloth',
        'Keep the pressure steady - do not release',
        'Lay the person down and elevate the injured area if possible',
        'If blood soaks through, add more cloth on top',
        'Keep them warm and calm',
      ],
      seekHelp: 'Get to a hospital immediately. Continue applying pressure.',
    },
    pcm: {
      condition: 'Serious Bleeding',
      severity: 'critical',
      doNotDo: [
        'No comot anything wey don enter the wound',
        'No tie tourniquet unless you sabi how',
        'No remove the cloth wey you use press - add more on top',
      ],
      immediateActions: [
        'Call emergency people (112 or 767)',
        'Press the wound well well with clean cloth',
        'Hold am steady - no release',
        'Make the person lie down, raise the place wey dey bleed',
        'If blood pass through cloth, add more cloth on top',
        'Keep am warm and calm',
      ],
      seekHelp: 'Go hospital quick quick. Continue dey press the wound.',
    },
    yo: {
      condition: 'Ẹ̀jẹ̀ Púpọ̀',
      severity: 'critical',
      doNotDo: [
        'Má yọ ohunkóhun tí ó wọ inú ọgbẹ́',
        'Má dì tourniquet àyàfi tí o bá ti kọ́ ẹ̀kọ́',
        'Má gbé aṣọ náà láti ṣàyẹ̀wò - fi míì lé e',
      ],
      immediateActions: [
        'Pe àwọn oníṣẹ́ pàjáwìrì (112 tàbí 767)',
        'Fi aṣọ mímọ́ tẹ ọgbẹ́ náà gidigidi',
        'Mú tẹ́lẹ̀ - má jẹ́ kí ó tú',
        'Jẹ́ kí ẹni náà dùbúlẹ̀, gbé ibikíbi tí ó gbọgbẹ́',
        'Tí ẹ̀jẹ̀ bá gbá aṣọ náà já, fi míì lé e',
        'Mú un gbona àti dákẹ́jẹ́ẹ́',
      ],
      seekHelp: 'Lọ sí ilé-ìwòsàn lẹ́sẹ̀kẹsẹ̀. Máa tẹ ọgbẹ́ náà.',
    },
    ig: {
      condition: 'Ọbara Na-agba Ike',
      severity: 'critical',
      doNotDo: [
        'Ewepụla ihe ọ bụla dị n\'ọnya ahụ',
        'Ekenela tourniquet ma ọ bụrụ na ị mụtaghị',
        'Ewepụla akwa ahụ - tinye ọzọ n\'elu',
      ],
      immediateActions: [
        'Kpọọ ndị mberede (112 ma ọ bụ 767)',
        'Pịa ọnya ahụ ike na akwa dị ọcha',
        'Jide ya nke ọma - ahapụla',
        'Mee ka onye ahụ dinara ala, bulie ebe ahụ ọbara na-esi apụta',
        'Ọ bụrụ na ọbara gafere akwa, tinye ọzọ n\'elu',
        'Mee ka o dị okpomọkụ ma dịkwa jụụ',
      ],
      seekHelp: 'Gaa ụlọ ọgwụ ozugbo. Gaa n\'ihu na-apị.',
    },
    ha: {
      condition: 'Zubar Jini Mai Tsanani',
      severity: 'critical',
      doNotDo: [
        'Kada ka cire abin da ke cikin rauni',
        'Kada ka daure tourniquet sai dai idan ka koyi',
        'Kada ka cire zanen don duba - saka wani a kai',
      ],
      immediateActions: [
        'Kira sabis na gaggawa (112 ko 767)',
        'Danna raunin sosai da zane mai tsabta',
        'Riƙe shi a hankali - kada ka sake',
        'Bari mutumin ya kwanta, ɗaga wurin da ke zubar jini',
        'Idan jini ya ratsa zanen, saka wani a kai',
        'Riƙe shi dumi da nutsuwa',
      ],
      seekHelp: 'Je asibiti nan da nan. Ci gaba da dannawa.',
    },
  },

  snake_bite: {
    en: {
      condition: 'Snake Bite',
      severity: 'serious',
      doNotDo: [
        'Do NOT cut the wound',
        'Do NOT try to suck out the venom',
        'Do NOT apply ice or cold water',
        'Do NOT apply a tight tourniquet',
        'Do NOT give alcohol or aspirin',
      ],
      immediateActions: [
        'Call emergency services immediately',
        'Keep the person calm and still',
        'Remove any tight clothing or jewelry near the bite',
        'Keep the bitten area below heart level',
        'Clean the wound gently with soap and water',
        'Cover with a clean, dry bandage',
        'Note the time of the bite',
        'Try to remember the snake appearance (but do not try to catch it)',
      ],
      seekHelp: 'Get to a hospital with antivenom immediately. Time is critical.',
    },
    pcm: {
      condition: 'Snake Don Bite',
      severity: 'serious',
      doNotDo: [
        'No cut the wound',
        'No try suck the poison comot',
        'No put ice or cold water',
        'No tie am too tight',
        'No give alcohol or aspirin',
      ],
      immediateActions: [
        'Call emergency people quick quick',
        'Make the person stay calm, no move too much',
        'Remove any tight cloth or jewelry near where snake bite',
        'Keep the place wey snake bite below heart',
        'Clean the wound small with soap and water',
        'Cover am with clean, dry cloth',
        'Note what time snake bite',
        'Try remember how the snake look (but no try catch am)',
      ],
      seekHelp: 'Go hospital wey get antivenom quick quick. Time dey important.',
    },
    yo: {
      condition: 'Ejò Bù',
      severity: 'serious',
      doNotDo: [
        'Má gé ọgbẹ́ náà',
        'Má gbìyànjú láti fa oró náà jáde',
        'Má fi yìnyín tàbí omi tútù sí',
        'Má dì í kíkankíkan',
        'Má fún un ní ọtí tàbí aspirin',
      ],
      immediateActions: [
        'Pe àwọn oníṣẹ́ pàjáwìrì lẹ́sẹ̀kẹsẹ̀',
        'Jẹ́ kí ẹni náà dakẹ́ àti dúró',
        'Yọ aṣọ tàbí ọ̀ṣọ́ kíkún kúrò ní ìtòsí ibùjẹ́',
        'Jẹ́ kí ibi tí ejò bù wà ní ìsàlẹ̀ ọkàn',
        'Fọ ọgbẹ́ náà díẹ̀díẹ̀ pẹ̀lú ọṣẹ àti omi',
        'Bo pẹ̀lú aṣọ mímọ́, gbígbẹ',
        'Kọ àkókò tí ejò bù',
        'Gbìyànjú láti rántí bí ejò náà ṣe rí',
      ],
      seekHelp: 'Lọ sí ilé-ìwòsàn tí ó ní antivenom lẹ́sẹ̀kẹsẹ̀. Àkókò ṣe pàtàkì.',
    },
    ig: {
      condition: 'Agwọ Tara',
      severity: 'serious',
      doNotDo: [
        'Egbupụla ọnya ahụ',
        'Anwala ịmịpụ nsị ahụ',
        'Etinyela ice ma ọ bụ mmiri oyi',
        'Ekenela ya nke ukwuu',
        'Enyela mmanya ma ọ bụ aspirin',
      ],
      immediateActions: [
        'Kpọọ ndị mberede ozugbo',
        'Mee ka onye ahụ dịrị jụụ ma kwụsị ịkwaga',
        'Wepụ akwa ma ọ bụ ọla dị nso ebe agwọ tara',
        'Mee ka ebe agwọ tara dị n\'okpuru obi',
        'Sachaa ọnya ahụ nwayọọ na ncha na mmiri',
        'Kpuchie ya na akwa dị ọcha ma kpọọ nkụ',
        'Depụta oge agwọ tara',
        'Gbalịa icheta otu agwọ ahụ si dị',
      ],
      seekHelp: 'Gaa ụlọ ọgwụ nwere antivenom ozugbo. Oge dị mkpa.',
    },
    ha: {
      condition: 'Cizon Maciji',
      severity: 'serious',
      doNotDo: [
        'Kada ka yanka raunin',
        'Kada ka yi kokarin tsotsar guba',
        'Kada ka sa kankara ko ruwan sanyi',
        'Kada ka daure shi sosai',
        'Kada ka ba shi barasa ko aspirin',
      ],
      immediateActions: [
        'Kira sabis na gaggawa nan da nan',
        'Bari mutumin ya natsu kuma kada ya motsa',
        'Cire duk wani rigar da ke matsawa ko kayan ado kusa da cizon',
        'Ajiye wurin cizon a kasa da zuciya',
        'Tsaftace raunin a hankali da sabulu da ruwa',
        'Rufe shi da bandeji mai tsabta, busasshiya',
        'Rubuta lokacin da aka ciza',
        'Yi kokarin tuna yadda macin yake',
      ],
      seekHelp: 'Je asibiti mai antivenom nan da nan. Lokaci yana da mahimmanci.',
    },
  },

  unconscious_person: {
    en: {
      condition: 'Unconscious Person',
      severity: 'serious',
      doNotDo: [
        'Do NOT give them food or water',
        'Do NOT shake them violently',
        'Do NOT leave them unattended',
      ],
      immediateActions: [
        'Call emergency services immediately (112 or 767)',
        'Check if they are breathing',
        'If breathing: place them in recovery position (on their side)',
        'If NOT breathing: start CPR',
        'Keep their airway clear',
        'Stay with them until help arrives',
      ],
      seekHelp: 'This is a medical emergency. Get professional help immediately.',
    },
    pcm: {
      condition: 'Person Wey Don Faint',
      severity: 'serious',
      doNotDo: [
        'No give am food or water',
        'No shake am anyhow',
        'No leave am alone',
      ],
      immediateActions: [
        'Call emergency people quick quick (112 or 767)',
        'Check if e dey breathe',
        'If e dey breathe: put am for e side',
        'If e no dey breathe: start CPR',
        'Make sure air fit enter',
        'Stay with am until help come',
      ],
      seekHelp: 'Na serious wahala be this. Get professional help quick quick.',
    },
    yo: {
      condition: 'Ẹni Tí Ó Ṣubú',
      severity: 'serious',
      doNotDo: [
        'Má fún un ní oúnjẹ tàbí omi',
        'Má gbọ̀n ọ́n gidigidi',
        'Má fi í sílẹ̀ láìsí abójútó',
      ],
      immediateActions: [
        'Pe àwọn oníṣẹ́ pàjáwìrì lẹ́sẹ̀kẹsẹ̀ (112 tàbí 767)',
        'Ṣàyẹ̀wò bóyá ó ń mí',
        'Tí ó bá ń mí: fi sí ipò ìgbàlà (ní ẹ̀gbẹ́)',
        'Tí kò bá ń mí: bẹ̀rẹ̀ CPR',
        'Jẹ́ kí ọ̀nà afẹ́fẹ́ rẹ̀ ṣí',
        'Wà pẹ̀lú rẹ̀ títí ìrànlọ́wọ́ yóò fi dé',
      ],
      seekHelp: 'Pàjáwìrì ìlera nìyí. Gba ìrànlọ́wọ́ alamọ́dájú lẹ́sẹ̀kẹsẹ̀.',
    },
    ig: {
      condition: 'Onye Na-adaghị Anya',
      severity: 'serious',
      doNotDo: [
        'Enyela ya nri ma ọ bụ mmiri',
        'Emala ya ike',
        'Ahapụla ya naanị ya',
      ],
      immediateActions: [
        'Kpọọ ndị mberede ozugbo (112 ma ọ bụ 767)',
        'Lee ma ọ na-eku ume',
        'Ọ bụrụ na ọ na-eku ume: dọnye ya n\'akụkụ',
        'Ọ bụrụ na ọ naghị eku ume: malite CPR',
        'Mee ka ụzọ ifufe dị mfe',
        'Nọnyere ya ruo mgbe enyemaka ga-abịa',
      ],
      seekHelp: 'Nke a bụ mberede ahụike. Nweta enyemaka ọkachamara ozugbo.',
    },
    ha: {
      condition: 'Mutumin Da Ba Ya Sani',
      severity: 'serious',
      doNotDo: [
        'Kada ka ba shi abinci ko ruwa',
        'Kada ka girgiza shi sosai',
        'Kada ka bar shi kadai',
      ],
      immediateActions: [
        'Kira sabis na gaggawa nan da nan (112 ko 767)',
        'Duba ko yana numfashi',
        'Idan yana numfashi: sanya shi a gefensa',
        'Idan ba ya numfashi: fara CPR',
        'Bari hanyar numfashi ta buɗe',
        'Zauna tare da shi har sai taimako ya zo',
      ],
      seekHelp: 'Wannan gaggawa ce ta lafiya. Sami taimakon ƙwararru nan da nan.',
    },
  },
}

// Get first aid guidance for a condition
export function getFirstAidGuidance(
  condition: string,
  language: SupportedLanguage
): FirstAidGuidance | null {
  const guidance = FIRST_AID_GUIDANCE[condition]
  if (!guidance) return null
  return guidance[language] || guidance['en']
}

// Get available conditions
export function getAvailableConditions(): string[] {
  return Object.keys(FIRST_AID_GUIDANCE)
}
