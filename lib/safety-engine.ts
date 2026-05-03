// ============================================
// AKILI HEALTH - Safety Engine (Layer 3)
// This layer MUST run BEFORE any AI/LLM calls
// It detects emergencies and provides immediate response
// ============================================

import type { EmergencyInfo, SupportedLanguage } from './types'
import { getNearbyHospitalsLink } from './maps'
import { FIRST_AID_GUIDANCE } from './emergency-first-aid'

// Emergency patterns - Keywords that trigger immediate emergency response
const EMERGENCY_PATTERNS = {
  // Cardiac emergencies
  chest_pain_with: [
    /chest.*(pain|tight|pressure|heavy)/i,
    /heart.*(attack|pain|problem)/i,
    /(can'?t|cannot|difficulty).*(breath|breathing)/i,
    /pain.*arm.*chest/i,
    /chest.*radiating/i,
    /àyà.*dùn/i, // Yoruba: chest pain
    /obi.*awa.*ụfụ/i, // Igbo: chest pain
    /ciwon.*kirji/i, // Hausa: chest pain
    /chest.*dey.*pain/i, // Pidgin
  ],

  // Breathing emergencies
  breathing_difficulty: [
    /can'?t.*breath/i,
    /difficulty.*breathing/i,
    /struggling.*breath/i,
    /choking/i,
    /suffocating/i,
    /no.*oxygen/i,
    /air.*blocked/i,
    /asthma.*attack/i,
    /i.*no.*fit.*breath/i, // Pidgin
    /kò.*lè.*mí/i, // Yoruba
    /anaghị.*eku.*ume/i, // Igbo
    /ba.*ya.*numfashi/i, // Hausa
  ],

  // Stroke symptoms
  stroke_signs: [
    /stroke/i,
    /face.*drooping/i,
    /arm.*weakness/i,
    /speech.*difficulty/i,
    /sudden.*confusion/i,
    /sudden.*numbness/i,
    /sudden.*trouble.*seeing/i,
    /sudden.*dizziness/i,
    /one.*side.*(weak|numb|paralyzed)/i,
    /slurred.*speech/i,
  ],

  // Severe bleeding
  severe_bleeding: [
    /blood.*everywhere/i,
    /heavy.*bleeding/i,
    /bleeding.*won'?t.*stop/i,
    /lot.*of.*blood/i,
    /bleeding.*badly/i,
    /blood.*comot.*plenty/i, // Pidgin
    /ẹ̀jẹ̀.*púpọ̀/i, // Yoruba
    /ọbara.*na.*agba.*ike/i, // Igbo
    /jini.*da.*yawa/i, // Hausa
  ],

  // Unconsciousness
  unconscious: [
    /unconscious/i,
    /not.*responding/i,
    /won'?t.*wake.*up/i,
    /fainted/i,
    /collapsed/i,
    /passed.*out/i,
    /no.*response/i,
    /e.*don.*faint/i, // Pidgin
    /e.*no.*dey.*answer/i, // Pidgin
    /ó.*ṣubú/i, // Yoruba
    /ọ.*dara.*ala/i, // Igbo
    /ya.*suma/i, // Hausa
  ],

  // Severe trauma
  severe_trauma: [
    /car.*accident/i,
    /serious.*accident/i,
    /hit.*by.*(car|vehicle|motorcycle)/i,
    /motor.*accident/i,
    /fell.*from.*height/i,
    /head.*injury/i,
    /broken.*bone/i,
    /gbam/i, // Pidgin: accident
    /accident/i,
  ],

  // Poisoning
  poisoning: [
    /poison/i,
    /swallowed.*(chemical|bleach|acid)/i,
    /drank.*poison/i,
    /overdose/i,
    /drug.*overdose/i,
    /ate.*poison/i,
  ],

  // Seizure
  seizure: [
    /seizure/i,
    /convulsion/i,
    /fitting/i,
    /shaking.*uncontrollably/i,
    /epilepsy.*attack/i,
    /e.*dey.*shake/i, // Pidgin
    /body.*dey.*shake/i, // Pidgin
  ],

  // Snake bite
  snake_bite: [
    /snake.*bit/i,
    /bitten.*snake/i,
    /snake.*bite/i,
    /ejò.*bù/i, // Yoruba
    /agwọ.*tara/i, // Igbo
    /maciji.*cizo/i, // Hausa
    /snake.*don.*bite/i, // Pidgin
  ],

  // Severe allergic reaction
  anaphylaxis: [
    /allergic.*reaction/i,
    /throat.*swelling/i,
    /can'?t.*swallow/i,
    /lips.*swelling/i,
    /face.*swelling/i,
    /hives.*everywhere/i,
    /anaphylaxis/i,
    /severe.*allergy/i,
  ],

  // Pregnancy emergencies
  pregnancy_emergency: [
    /pregnant.*(bleeding|blood)/i,
    /water.*broke/i,
    /labour.*pain/i,
    /baby.*coming/i,
    /contractions/i,
    /placenta/i,
    /miscarriage/i,
    /ectopic/i,
    /oyún.*ẹ̀jẹ̀/i, // Yoruba: pregnancy bleeding
  ],

  // Child emergencies
  child_emergency: [
    /baby.*not.*breathing/i,
    /child.*choking/i,
    /baby.*turning.*blue/i,
    /infant.*unconscious/i,
    /child.*convulsion/i,
    /newborn.*problem/i,
    /pikin.*no.*dey.*breathe/i, // Pidgin
  ],

  // Suicide/Self-harm (requires immediate but sensitive response)
  mental_crisis: [
    /want.*to.*die/i,
    /kill.*myself/i,
    /suicide/i,
    /self.*harm/i,
    /hurt.*myself/i,
    /end.*my.*life/i,
    /no.*reason.*to.*live/i,
  ],
}

// Emergency response messages
const EMERGENCY_RESPONSES: Record<string, Record<SupportedLanguage, string>> = {
  chest_pain_with: {
    en: 'This sounds like a possible heart emergency. Call emergency services immediately (112 or 767). Do NOT wait. Go to the nearest hospital NOW.',
    pcm: 'This one fit be heart wahala. Call 112 or 767 now now. No wait. Go hospital NOW.',
    yo: 'Èyí lè jẹ́ pàjáwìrì ọkàn. Pe 112 tàbí 767 lẹ́sẹ̀kẹsẹ̀. Má dúró. Lọ sí ilé-ìwòsàn BÁYÌÍ.',
    ig: 'Nke a nwere ike ịbụ mberede obi. Kpọọ 112 ma ọ bụ 767 ozugbo. Echere. Gaa ụlọ ọgwụ UGBU A.',
    ha: 'Wannan na iya zama gaggawa ta zuciya. Kira 112 ko 767 nan da nan. Kada ka jira. Je asibiti YANZU.',
  },
  breathing_difficulty: {
    en: 'Breathing problems are serious. Call emergency services NOW (112 or 767). If someone is choking, use the Heimlich maneuver. Get to a hospital immediately.',
    pcm: 'Breathing wahala na serious matter. Call 112 or 767 NOW. If person dey choke, use Heimlich. Go hospital quick quick.',
    yo: 'Ìṣòro mímí jẹ́ ohun tó le. Pe àwọn oníṣẹ́ pàjáwìrì BÁYÌÍ (112 tàbí 767). Lọ sí ilé-ìwòsàn lẹ́sẹ̀kẹsẹ̀.',
    ig: 'Nsogbu iku ume dị njọ. Kpọọ ndị mberede UGBU A (112 ma ọ bụ 767). Gaa ụlọ ọgwụ ozugbo.',
    ha: 'Matsalar numfashi abu ne mai tsanani. Kira sabis na gaggawa YANZU (112 ko 767). Je asibiti nan da nan.',
  },
  stroke_signs: {
    en: 'These symptoms could indicate a stroke. Remember FAST: Face drooping, Arm weakness, Speech difficulty, Time to call 112. Every minute counts!',
    pcm: 'This symptoms fit be stroke. Remember FAST: Face drop, Arm weak, Speech problem, Time to call 112. Every minute count!',
    yo: 'Àwọn àmì wọ̀nyí lè tọ́ka sí ọ̀gbẹ́ ọpọlọ. Pe 112 lẹ́sẹ̀kẹsẹ̀. Àkókò ṣe pàtàkì!',
    ig: 'Ihe ịrịba ama ndị a nwere ike igosi stroke. Kpọọ 112 ozugbo. Oge dị mkpa!',
    ha: 'Alamomin nan na iya nuna bugun jini. Kira 112 nan da nan. Lokaci yana da muhimmanci!',
  },
  severe_bleeding: {
    en: 'Apply firm pressure to the wound with a clean cloth. Do NOT remove it. Call 112 or go to the nearest hospital immediately.',
    pcm: 'Press the wound well well with clean cloth. No remove am. Call 112 or go hospital now now.',
    yo: 'Fi aṣọ mímọ́ tẹ ọgbẹ́ náà gidigidi. Má yọ ọ́. Pe 112 tàbí lọ sí ilé-ìwòsàn tó sún mọ́ lẹ́sẹ̀kẹsẹ̀.',
    ig: 'Pịa ọnya ahụ ike na akwa dị ọcha. Ewepụla ya. Kpọọ 112 ma ọ bụ gaa ụlọ ọgwụ kacha nso ozugbo.',
    ha: 'Danna raunin sosai da zane mai tsabta. Kada ka cire shi. Kira 112 ko je asibiti nan da nan.',
  },
  unconscious: {
    en: 'Check if the person is breathing. If breathing, place them on their side (recovery position). If NOT breathing, start CPR. Call 112 NOW.',
    pcm: 'Check if the person dey breathe. If e dey breathe, put am for side. If e no dey breathe, start CPR. Call 112 NOW.',
    yo: 'Ṣàyẹ̀wò bóyá ẹni náà ń mí. Tí ó bá ń mí, fi sí ẹ̀gbẹ́ rẹ̀. Tí kò bá ń mí, bẹ̀rẹ̀ CPR. Pe 112 BÁYÌÍ.',
    ig: 'Lee ma onye ahụ na-eku ume. Ọ bụrụ na ọ na-eku ume, dọnye ya n\'akụkụ. Ọ bụrụ na ọ naghị, malite CPR. Kpọọ 112 UGBU A.',
    ha: 'Duba ko mutumin yana numfashi. Idan yana numfashi, sanya shi a gefensa. Idan ba ya ba, fara CPR. Kira 112 YANZU.',
  },
  severe_trauma: {
    en: 'Do NOT move the person unless they are in immediate danger. Call 112 immediately. Keep them still and warm.',
    pcm: 'No move the person unless danger dey. Call 112 now now. Make am stay still and warm.',
    yo: 'Má gbé ẹni náà àyàfi tí ó bá wà nínú ewu lẹ́sẹ̀kẹsẹ̀. Pe 112 lẹ́sẹ̀kẹsẹ̀. Jẹ́ kí ó dákẹ́ àti gbona.',
    ig: 'Ekwughịla onye ahụ ma ọ bụrụ na ha nọ n\'ihe egwu ozugbo. Kpọọ 112 ozugbo. Mee ka ha kwụsị ma dịkwa okpomọkụ.',
    ha: 'Kada ka motsa mutumin sai dai idan yana cikin haɗari nan da nan. Kira 112 nan da nan. Bari ya zauna kuma dumi.',
  },
  poisoning: {
    en: 'Call Poison Control or 112 immediately. Do NOT make them vomit unless instructed. Bring the poison container to the hospital.',
    pcm: 'Call Poison Control or 112 now now. No make am vomit unless dem tell you. Carry the poison container go hospital.',
    yo: 'Pe Poison Control tàbí 112 lẹ́sẹ̀kẹsẹ̀. Má jẹ́ kí ó bì àyàfi tí wọ́n bá sọ fún ẹ. Gbé àpò oró náà lọ sí ilé-ìwòsàn.',
    ig: 'Kpọọ Poison Control ma ọ bụ 112 ozugbo. Emela ka ha gbọọ ọgwụgwọ ma ọ bụrụ na agwala gị. Buru ite nsị gaa ụlọ ọgwụ.',
    ha: 'Kira Poison Control ko 112 nan da nan. Kada ka sa su yi amai sai dai an gaya maka. Kawo kwalbar guban zuwa asibiti.',
  },
  seizure: {
    en: 'Do NOT restrain them or put anything in their mouth. Clear the area of dangerous objects. Time the seizure. Call 112 if it lasts more than 5 minutes.',
    pcm: 'No hold am down or put anything for mouth. Clear area of dangerous things. Time how long e dey. Call 112 if e pass 5 minutes.',
    yo: 'Má dè é tàbí fi ohunkóhun sí ẹnu rẹ̀. Yọ àwọn ohun tó lè ṣe é léwu kúrò. Ṣàkókò àsìkò tí ó máa ń rọ̀. Pe 112 tí ó bá ju ìṣẹ́jú 5 lọ.',
    ig: 'Ejidela ha ma ọ bụ tinye ihe ọ bụla n\'ọnụ ha. Kpochapụ ihe dị ize ndụ. Gụọ oge. Kpọọ 112 ọ bụrụ na ọ gara karịa nkeji 5.',
    ha: 'Kada ka riƙe shi ko saka komai a bakinsa. Share yankin abubuwa masu haɗari. Yi lokacin farfadiya. Kira 112 idan ya wuce mintuna 5.',
  },
  snake_bite: {
    en: 'Keep calm and still. Do NOT cut the wound or suck the venom. Remove jewelry. Keep the bite below heart level. Go to a hospital with antivenom NOW.',
    pcm: 'Stay calm, no move. No cut the wound, no suck poison. Remove ring and chain. Keep where snake bite below heart. Go hospital wey get antivenom NOW.',
    yo: 'Má yọ̀, má rin. Má gé ọgbẹ́ náà tàbí fa oró jáde. Yọ ọ̀ṣọ́ kúrò. Jẹ́ kí ibi tí ejò bù wà ní ìsàlẹ̀ ọkàn. Lọ sí ilé-ìwòsàn tí ó ní antivenom BÁYÌÍ.',
    ig: 'Dị jụụ ma kwụsị. Egbupụla ọnya ahụ ma ọ bụ mịpụ nsị. Wepụ ọla. Mee ka ebe agwọ tara dị n\'okpuru obi. Gaa ụlọ ọgwụ nwere antivenom UGBU A.',
    ha: 'Zauna a hankali kuma kada ka motsa. Kada ka yanke raunin ko tsotsar guba. Cire kayan ado. Ajiye wurin cizon a kasa da zuciya. Je asibiti mai antivenom YANZU.',
  },
  anaphylaxis: {
    en: 'This is a severe allergic reaction. If they have an EpiPen, use it immediately. Call 112. Go to the hospital NOW.',
    pcm: 'This na serious allergic reaction. If dem get EpiPen, use am now now. Call 112. Go hospital NOW.',
    yo: 'Èyí jẹ́ àlérjì tó le gan. Tí wọ́n bá ní EpiPen, lò ó lẹ́sẹ̀kẹsẹ̀. Pe 112. Lọ sí ilé-ìwòsàn BÁYÌÍ.',
    ig: 'Nke a bụ mmetụta allergy siri ike. Ọ bụrụ na ha nwere EpiPen, jiri ya ozugbo. Kpọọ 112. Gaa ụlọ ọgwụ UGBU A.',
    ha: 'Wannan mummunan halin rashin lafiya ne. Idan suna da EpiPen, yi amfani da shi nan da nan. Kira 112. Je asibiti YANZU.',
  },
  pregnancy_emergency: {
    en: 'Pregnancy complications need immediate medical care. Call 112 or go to the nearest hospital with maternity services NOW.',
    pcm: 'Pregnancy wahala need doctor quick quick. Call 112 or go hospital wey get maternity NOW.',
    yo: 'Àwọn ìṣòro oyún nílò ìtọ́jú tó yára. Pe 112 tàbí lọ sí ilé-ìwòsàn tó ní iṣẹ́ ìbímọ BÁYÌÍ.',
    ig: 'Nsogbu ime nwere mkpa nlekọta ahụike ozugbo. Kpọọ 112 ma ọ bụ gaa ụlọ ọgwụ kacha nso nke nwere ọrụ ọmụmụ UGBU A.',
    ha: 'Matsalolin ciki suna buƙatar kulawar likita nan da nan. Kira 112 ko je asibitin da ke kusa da sabis na haihuwa YANZU.',
  },
  child_emergency: {
    en: 'Child emergencies need immediate action. Call 112. If the child is not breathing, start infant/child CPR. Go to a hospital NOW.',
    pcm: 'Pikin wahala need quick action. Call 112. If pikin no dey breathe, start CPR for pikin. Go hospital NOW.',
    yo: 'Pàjáwìrì ọmọdé nílò ìgbéṣẹ̀ lẹ́sẹ̀kẹsẹ̀. Pe 112. Tí ọmọ náà kò bá ń mí, bẹ̀rẹ̀ CPR fún ọmọdé. Lọ sí ilé-ìwòsàn BÁYÌÍ.',
    ig: 'Mberede nwa nwere mkpa omume ozugbo. Kpọọ 112. Ọ bụrụ na nwata ahụ anaghị eku ume, malite CPR nwa. Gaa ụlọ ọgwụ UGBU A.',
    ha: 'Gaggawa yara suna buƙatar aiki nan da nan. Kira 112. Idan yaron ba ya numfashi, fara CPR na yaro. Je asibiti YANZU.',
  },
  mental_crisis: {
    en: 'I hear you, and I am concerned about you. Please call a mental health helpline immediately: 0800-2255-4673 (toll-free). You matter, and help is available.',
    pcm: 'I hear you, and I dey worried about you. Please call mental health people: 0800-2255-4673 (free call). You matter, help dey.',
    yo: 'Mo gbọ́ ọ, mo sì ń ro o. Jọ̀wọ́ pe ìlà ìrànlọ́wọ́ ìlera ọpọlọ lẹ́sẹ̀kẹsẹ̀: 0800-2255-4673. O ṣe pàtàkì, ìrànlọ́wọ́ wà.',
    ig: 'Anụrụ m gị, ana m echegbu onwe m banyere gị. Biko kpọọ ahụike uche: 0800-2255-4673 (n\'efu). Ị dị mkpa, enyemaka dị.',
    ha: 'Na ji ku, kuma ina damuwa game da ku. Da fatan za a kira layin taimakon lafiyar ƙwaƙwalwa: 0800-2255-4673 (kyauta). Kuna da muhimmanci, akwai taimako.',
  },
}

// Default emergency info
const DEFAULT_EMERGENCY_NUMBER = '112'
const LAGOS_AMBULANCE = '767'

// Check if message contains emergency
export function emergencyCheck(
  message: string,
  userState?: string,
  userLat?: number,
  userLng?: number
): {
  isEmergency: boolean
  condition?: string
  message?: string
  callNumber?: string
  googleMapsLink?: string
  firstAidGuidance?: typeof FIRST_AID_GUIDANCE[keyof typeof FIRST_AID_GUIDANCE]['en']
} {
  const normalizedMessage = message.toLowerCase()

  for (const [condition, patterns] of Object.entries(EMERGENCY_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalizedMessage)) {
        const callNumber = getEmergencyNumber(userState)
        const googleMapsLink = userLat && userLng
          ? getNearbyHospitalsLink(userLat, userLng)
          : 'https://www.google.com/maps/search/hospitals+near+me'

        // Get first aid guidance if available
        const firstAid = FIRST_AID_GUIDANCE[condition]?.['en']

        return {
          isEmergency: true,
          condition,
          message: EMERGENCY_RESPONSES[condition]?.['en'] || 
            'This is an emergency. Call 112 or go to the nearest hospital immediately.',
          callNumber,
          googleMapsLink,
          firstAidGuidance: firstAid,
        }
      }
    }
  }

  return { isEmergency: false }
}

// Get emergency response in specific language
export function getEmergencyResponse(
  condition: string,
  language: SupportedLanguage
): string {
  return (
    EMERGENCY_RESPONSES[condition]?.[language] ||
    EMERGENCY_RESPONSES[condition]?.['en'] ||
    'This is an emergency. Call 112 or go to the nearest hospital immediately.'
  )
}

// Get emergency number for state
function getEmergencyNumber(state?: string): string {
  if (state?.toLowerCase().includes('lagos')) {
    return LAGOS_AMBULANCE
  }
  return DEFAULT_EMERGENCY_NUMBER
}

// Build emergency info object
export function buildEmergencyInfo(
  condition: string,
  language: SupportedLanguage,
  userLat?: number,
  userLng?: number,
  userState?: string
): EmergencyInfo {
  const callNumber = getEmergencyNumber(userState)
  const googleMapsLink = userLat && userLng
    ? getNearbyHospitalsLink(userLat, userLng)
    : 'https://www.google.com/maps/search/hospitals+near+me'
  
  const firstAid = FIRST_AID_GUIDANCE[condition]?.[language] || FIRST_AID_GUIDANCE[condition]?.['en']

  return {
    condition,
    message: getEmergencyResponse(condition, language),
    callNumber,
    googleMapsLink,
    firstAidInstructions: firstAid?.immediateActions || [],
  }
}
