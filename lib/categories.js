// The category bank: each one pairs an image-search query with a rotating
// set of bilingual debate prompts. The daily cron job picks a fresh image
// for the query, then pairs it with a random prompt from the list — so the
// same visual query never produces the exact same debate twice in a row.
//
// Rewritten for a Gen-Z, meme-first voice: Hinglish captions, relatable
// slang ("red flag", "fit check", "main character energy"), still paired
// with real royalty-free photos from Unsplash/Pexels (not scraped meme
// images, which are almost never actually copyright-clear) — the humor
// comes from the caption/framing, not the source image.

export const CATEGORIES = [
  {
    id: "red-flag-or-nah",
    label_en: "Red Flag or Nah",
    label_hi: "रेड फ्लैग या नहीं",
    query: "candid awkward moment friends hangout",
    prompts: [
      { en: "He replied \"lol\" to your paragraph text. Red flag or nah?", hi: "पैराग्राफ भेजा, जवाब में सिर्फ \"lol\" आया — red flag या नहीं?" },
      { en: "Still uses 😂 unironically in 2026. Green flag or straight-up cringe?", hi: "अभी भी बिना mazaak के 😂 use करता है — green flag या पूरा cringe?" },
      { en: "Left you on read for 3 days then acted totally normal. Rate the audacity.", hi: "3 दिन तक read करके छोड़ा, फिर normal act किया — audacity को rate करो।" },
      { en: "Talks about themselves in third person. Ick or iconic?", hi: "खुद के बारे में third person में बात करता है — ick है या iconic?" },
      { en: "Showed up 45 minutes late, zero apology, just vibes. Red flag or nah?", hi: "45 मिनट लेट आया, कोई sorry नहीं, बस vibes — red flag या नहीं?" },
      { en: "Still has the ex's photos up \"for the memories.\" Trust the process or run?", hi: "Ex की फोटो अभी भी लगी है \"यादों के लिए\" — भरोसा करें या भाग जाएं?" },
    ],
  },
  {
    id: "cursed-or-blessed",
    label_en: "Cursed or Blessed",
    label_hi: "श्राप या वरदान",
    query: "bizarre interior design unusual room",
    prompts: [
      { en: "Found this on a rental listing. Cursed or blessed?", hi: "यह rental listing में मिला — cursed है या blessed?" },
      { en: "This is apparently someone's actual living room. Explain.", hi: "यह किसी का असली living room है — ज़रा समझाओ।" },
      { en: "Landlord said \"fully furnished.\" This is what he meant.", hi: "मकान मालिक ने कहा था \"fully furnished\" — मतलब यह था।" },
      { en: "Interior design or crime scene? You decide.", hi: "Interior design है या crime scene? आप बताओ।" },
      { en: "This exists in real life and someone pays rent for it.", hi: "यह असल ज़िंदगी में है और कोई इसका किराया भी देता है।" },
      { en: "10/10 no notes, or call the exorcist?", hi: "10/10 कोई शिकायत नहीं, या exorcist बुलाएं?" },
    ],
  },
  {
    id: "fit-check",
    label_en: "Fit Check",
    label_hi: "फिट चेक",
    query: "bold street fashion outfit statement",
    prompts: [
      { en: "POV: you wore this to the family function. Fit check.", hi: "POV: family function में यही पहन के गए — fit check।" },
      { en: "This fit is either couture or a cry for help.", hi: "यह fit couture है या मदद की पुकार।" },
      { en: "Wore this to college and not one professor said anything. Bold.", hi: "College में यह पहना और किसी professor ने कुछ नहीं कहा — बोल्ड है।" },
      { en: "Confidence: 100. Practicality: 0. Rate the fit.", hi: "Confidence: 100. Practicality: 0. Fit को rate करो।" },
      { en: "This is either Met Gala energy or laundry-day energy.", hi: "यह Met Gala energy है या laundry-day energy।" },
      { en: "Would your group chat roast you for this fit?", hi: "इस fit पर group chat में रोस्ट हो जाओगे क्या?" },
    ],
  },
  {
    id: "food-crimes",
    label_en: "Food Crimes",
    label_hi: "फूड क्राइम",
    query: "unusual food combination strange dish",
    prompts: [
      { en: "This combo shouldn't work. Does it?", hi: "यह combo काम नहीं करना चाहिए — पर करता है क्या?" },
      { en: "Someone's 3am hostel snack. Genius or food crime?", hi: "किसी का 3am hostel snack — genius है या food crime?" },
      { en: "This is what happens when Maggi meets ambition.", hi: "यह तब होता है जब Maggi की ambition बढ़ जाए।" },
      { en: "Would you eat this on camera for the clout?", hi: "Clout के लिए इसे camera पर खाओगे क्या?" },
      { en: "Chef's kiss, or call 100?", hi: "Chef's kiss या 100 नंबर लगाएं?" },
      { en: "This plate has main character energy. Discuss.", hi: "यह प्लेट main character energy दे रही है — discuss करो।" },
    ],
  },
  {
    id: "ai-chaos",
    label_en: "AI Chaos",
    label_hi: "AI का कमाल",
    query: "surreal glitch digital art abstract",
    prompts: [
      { en: "AI tried its best. Did it deliver?", hi: "AI ने पूरी कोशिश की — deliver किया या नहीं?" },
      { en: "This took either 3 seconds or 3 hours to generate. Guess.", hi: "यह बनाने में 3 सेकंड लगे या 3 घंटे — अंदाज़ा लगाओ।" },
      { en: "Count the fingers. Then rate it.", hi: "उंगलियां गिनो, फिर rate करो।" },
      { en: "Belongs in a museum, or in your nightmares?", hi: "यह museum में लगे या आपके सपनों में डर बनकर आए?" },
      { en: "AI art or modern art? Nobody can tell anymore.", hi: "AI art है या modern art? अब कोई बता नहीं सकता।" },
      { en: "Would you actually set this as your wallpaper? Be honest.", hi: "इसे wallpaper लगाओगे सच में? ईमानदारी से बताओ।" },
    ],
  },
  {
    id: "hostel-life",
    label_en: "Hostel Life",
    label_hi: "हॉस्टल लाइफ",
    query: "messy dorm room chaos college",
    prompts: [
      { en: "This is what \"I'll clean it tomorrow\" looks like after 2 weeks.", hi: "\"कल साफ करूंगा\" 2 हफ्ते बाद ऐसा दिखता है।" },
      { en: "Hostel room or evidence room? Vote.", hi: "Hostel room है या evidence room? Vote करो।" },
      { en: "Rate this setup out of 10. Roommate not included.", hi: "इस setup को 10 में से rate करो, roommate शामिल नहीं है।" },
      { en: "Peak exam-week chaos. Relatable or not?", hi: "यह exam-week का पीक chaos है — relatable है या नहीं?" },
      { en: "Mess or aesthetic? The eternal hostel debate.", hi: "गंदगी है या aesthetic? हॉस्टल की हमेशा वाली बहस।" },
      { en: "Would your mom survive seeing this? Be real.", hi: "क्या आपकी मम्मी यह देखकर बच पाएंगी? सच बताओ।" },
    ],
  },
  {
    id: "main-character-energy",
    label_en: "Main Character Energy",
    label_hi: "मेन कैरेक्टर एनर्जी",
    query: "aesthetic golden hour street photography",
    prompts: [
      { en: "This photo has main character energy. Agree?", hi: "इस फोटो में main character energy है — सहमत हो?" },
      { en: "POV: it's the opening scene of your life story.", hi: "POV: यह आपकी लाइफ स्टोरी का opening scene है।" },
      { en: "Certified aesthetic, or trying too hard? Vote.", hi: "Certified aesthetic है या बहुत कोशिश कर रहा है? Vote करो।" },
      { en: "This belongs on a vision board. Yes or no?", hi: "यह vision board पर होना चाहिए — हाँ या नहीं?" },
      { en: "Rate the vibe. No wrong answers, only vibes.", hi: "Vibe को rate करो। कोई गलत जवाब नहीं, बस vibes।" },
      { en: "Would you use this as your WhatsApp DP? Honestly.", hi: "इसे WhatsApp DP बनाओगे? ईमानदारी से बताओ।" },
    ],
  },
];

export function findCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || null;
}
