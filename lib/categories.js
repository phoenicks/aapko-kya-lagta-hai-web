// The category bank: each one pairs an image-search query with a rotating
// set of bilingual debate prompts. The daily cron job picks a fresh image
// for the query, then pairs it with a random prompt from the list — so the
// same visual query never produces the exact same debate twice in a row.

export const CATEGORIES = [
  {
    id: "street-art",
    label_en: "Street Art",
    label_hi: "स्ट्रीट आर्ट",
    query: "graffiti mural street art wall",
    prompts: [
      { en: "This mural just went up two blocks from here.", hi: "यह म्यूरल यहाँ से दो ब्लॉक दूर अभी-अभी बना है।" },
      { en: "The city wants to paint over this. Save it or scrap it?", hi: "नगर निगम इसे मिटाना चाहती है — बचाएं या हटाएं?" },
      { en: "Street art or just vandalism?", hi: "यह स्ट्रीट आर्ट है या सिर्फ बर्बादी?" },
      { en: "Would this look good on your street?", hi: "क्या यह आपकी गली में अच्छा लगेगा?" },
    ],
  },
  {
    id: "fashion",
    label_en: "Fashion",
    label_hi: "फैशन",
    query: "street fashion outfit style",
    prompts: [
      { en: "Would you wear this out?", hi: "क्या आप इसे पहनकर बाहर जाएंगे?", },
      { en: "Office-appropriate or too much?", hi: "ऑफिस के लिए ठीक है या ज़्यादा है?" },
      { en: "Bold statement or trying too hard?", hi: "बोल्ड स्टेटमेंट है या ज़्यादा कोशिश?" },
      { en: "Rate this fit, honestly.", hi: "ईमानदारी से इस लुक को रेट करें।" },
    ],
  },
  {
    id: "home-decor",
    label_en: "Home & Décor",
    label_hi: "घर सजावट",
    query: "home interior design living room",
    prompts: [
      { en: "Client wants this exact style in their living room. Good call?", hi: "क्लाइंट को living room में बिल्कुल यही स्टाइल चाहिए — सही फैसला?" },
      { en: "Minimalist or just empty?", hi: "मिनिमलिस्ट है या बस खाली?" },
      { en: "Would you live here?", hi: "क्या आप यहाँ रहना पसंद करेंगे?" },
      { en: "This is either genius or a huge mistake.", hi: "यह या तो शानदार आइडिया है या बड़ी गलती।" },
    ],
  },
  {
    id: "food",
    label_en: "Food",
    label_hi: "खाना",
    query: "food plating restaurant dish",
    prompts: [
      { en: "Chef's new plating for the tasting menu — worth the price?", hi: "शेफ का नया plating — कीमत के लायक है?" },
      { en: "Would you order this again?", hi: "क्या आप इसे दोबारा order करेंगे?" },
      { en: "Looks better than it probably tastes?", hi: "देखने में जितना अच्छा है, स्वाद में भी उतना होगा?" },
      { en: "Rate this plate out of 10.", hi: "इस प्लेट को 10 में से रेट करें।" },
    ],
  },
  {
    id: "digital-art",
    label_en: "Digital & AI Art",
    label_hi: "डिजिटल आर्ट",
    query: "digital art surreal illustration",
    prompts: [
      { en: "Does this count as real art?", hi: "क्या इसे असली आर्ट माना जाए?" },
      { en: "Would you hang this on your wall?", hi: "क्या आप इसे अपनी दीवार पर लगाएंगे?" },
      { en: "This took either five minutes or five hours. Guess.", hi: "यह पाँच मिनट में बना या पाँच घंटे में — अंदाज़ा लगाएं।" },
      { en: "Beautiful or just weird?", hi: "खूबसूरत है या बस अजीब?" },
    ],
  },
  {
    id: "everyday-life",
    label_en: "Everyday Life",
    label_hi: "रोज़मर्रा की ज़िंदगी",
    query: "everyday life candid city scene",
    prompts: [
      { en: "Normal Tuesday or peak chaos?", hi: "आम मंगलवार है या पूरा अफरा-तफरी?" },
      { en: "Have you seen something like this before?", hi: "क्या आपने पहले कभी ऐसा कुछ देखा है?" },
      { en: "This is either relatable or just sad.", hi: "यह या तो relatable है या बस दुखद।" },
      { en: "What's really going on here?", hi: "यहाँ असल में क्या चल रहा है?" },
    ],
  },
];

export function findCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || null;
}
