// The category bank: each one pairs an image-search query with a rotating
// set of bilingual (Hinglish-flavored) debate prompts. The daily cron job
// picks a fresh image for the query, then pairs it with a random prompt
// from the list — so the same visual query never produces the exact same
// debate twice in a row.
//
// Categories are tuned for Indian Gen Z life (campus, streetwear, street
// food, pop culture, content creation, hustle culture) rather than generic
// stock-photo themes. Image queries lean on India-specific keywords since
// Unsplash/Pexels are Western-stock-heavy by default.

export const CATEGORIES = [
  {
    id: "campus-life",
    label_en: "Campus & Hostel Life",
    label_hi: "कॉलेज लाइफ",
    query: "indian college campus students friends",
    prompts: [
      { en: "Mess food today. Rate it before you regret it.", hi: "आज का मेस खाना। रेट करने से पहले सोच लो।" },
      { en: "3 AM hostel session hits different. Relatable?", hi: "रात 3 बजे वाली hostel बात्स अलग ही हैं। Relatable?" },
      { en: "Bunking this lecture for this — worth it or not?", hi: "इसके लिए lecture bunk करना सही है या नहीं?" },
      { en: "First day of college fit check — pass or fail?", hi: "कॉलेज के पहले दिन की fit — pass या fail?" },
    ],
  },
  {
    id: "streetwear",
    label_en: "Streetwear & Fits",
    label_hi: "स्ट्रीटवियर",
    query: "indian streetwear fashion young india",
    prompts: [
      { en: "Thrifted this for ₹300. Flex or flop?", hi: "यह thrift से ₹300 में लिया। Flex है या flop?" },
      { en: "Would you wear this to a college fest?", hi: "क्या आप यह कॉलेज fest में पहनेंगे?" },
      { en: "Oversized fit — main character energy or too much?", hi: "Oversized fit — main character energy है या ज़्यादा?" },
      { en: "Rate this fit, no cap.", hi: "इस fit को रेट करो, बिल्कुल सच में।" },
    ],
  },
  {
    id: "street-food",
    label_en: "Street Food & Chai",
    label_hi: "स्ट्रीट फूड",
    query: "indian street food vendor stall",
    prompts: [
      { en: "Found this cart on the way to college. Try or skip?", hi: "कॉलेज जाते वक़्त यह ठेला मिला। Try करें या skip?" },
      { en: "₹20 street food that hits different — worth the hype?", hi: "₹20 वाला स्ट्रीट फूड जो हिट करता है — hype सही है?" },
      { en: "Chai break essential or overrated?", hi: "चाय ब्रेक ज़रूरी है या overrated?" },
      { en: "Would you eat this without checking the hygiene rating?", hi: "बिना hygiene रेटिंग देखे यह खाओगे?" },
    ],
  },
  {
    id: "pop-culture",
    label_en: "Pop Culture & OTT",
    label_hi: "पॉप कल्चर",
    query: "india concert crowd fans youth culture",
    prompts: [
      { en: "New show everyone's binging — hype or flop?", hi: "सबका नया binge-watch — hype है या flop?" },
      { en: "This meme is already everywhere. Still funny?", hi: "यह meme हर जगह है। अभी भी funny है?" },
      { en: "Fan edit or cringe?", hi: "Fan edit है या cringe?" },
      { en: "Would this trend still be relevant next week?", hi: "क्या यह trend अगले हफ्ते भी चलेगा?" },
    ],
  },
  {
    id: "reels-content",
    label_en: "Reels & Content",
    label_hi: "रील्स",
    query: "smartphone content creator vlogging india",
    prompts: [
      { en: "This reel has 2M views. Deserved or overrated?", hi: "इस reel के 2M views हैं। सही है या overrated?" },
      { en: "Would you duet this?", hi: "क्या आप इसका duet बनाओगे?" },
      { en: "Aesthetic feed or trying too hard?", hi: "Aesthetic feed है या ज़्यादा कोशिश?" },
      { en: "Save it, skip it, or send it to your bestie?", hi: "Save करो, skip करो, या bestie को भेजो?" },
    ],
  },
  {
    id: "startup-hustle",
    label_en: "Startup & Hustle",
    label_hi: "हसल कल्चर",
    query: "indian startup office young entrepreneur",
    prompts: [
      { en: "Side hustle idea from a 20-year-old — investable or nah?", hi: "20 साल के किसी की side hustle idea — invest करने लायक है या नहीं?" },
      { en: "Would you quit your 9-to-5 for this?", hi: "क्या आप इसके लिए अपनी 9-to-5 job छोड़ोगे?" },
      { en: "LinkedIn hustle-core or genuinely inspiring?", hi: "LinkedIn वाला hustle-core है या सच में inspiring?" },
      { en: "Bold move or way too risky?", hi: "बोल्ड move है या बहुत risky?" },
    ],
  },
];

export function findCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || null;
}
