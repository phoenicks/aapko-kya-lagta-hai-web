export const STR = {
  en: {
    tagline: "What do you think?",
    allCats: "All",
    agree: "👍 Agree",
    disagree: "👎 Disagree",
    share: "Share result",
    next: "Next →",
    viewDebate: "View full debate & comments →",
    verdict: (pctUp, total) =>
      total === 0
        ? "Be the first to vote."
        : pctUp >= 50
        ? `The crowd agrees with you — ${pctUp}% said 👍, out of ${total} judged.`
        : `You're with the minority here — only ${pctUp}% said 👍, out of ${total} judged.`,
    youSaidUp: "You said 👍",
    youSaidDown: "You said 👎",
    comments: "Comments",
    commentPlaceholder: "Add a comment…",
    namePlaceholder: "Your name (optional)",
    post: "Post",
    noComments: "No comments yet — be the first to weigh in.",
    copyLink: "Copy link",
    linkCopied: "Link copied",
    whatsapp: "WhatsApp",
    shareOnX: "Share on X",
    caughtUp: "You're all caught up 🎉",
    checkBackTomorrow: "New debates drop daily — check back tomorrow.",
    noDebatesInCategory: "No debates here yet — check back soon.",
    couldntLoad: "Couldn't load debates — check your connection.",
    tryAgain: "Try again",
  },
  hi: {
    tagline: "आपको क्या लगता है?",
    allCats: "सभी",
    agree: "👍 सहमत",
    disagree: "👎 असहमत",
    share: "Result share करें",
    next: "अगली →",
    viewDebate: "पूरी debate और comments देखें →",
    verdict: (pctUp, total) =>
      total === 0
        ? "सबसे पहले vote करें।"
        : pctUp >= 50
        ? `भीड़ आपसे सहमत है — ${total} में से ${pctUp}% ने 👍 कहा।`
        : `इस बार आप minority में हैं — ${total} में से सिर्फ ${pctUp}% ने 👍 कहा।`,
    youSaidUp: "आपने 👍 कहा",
    youSaidDown: "आपने 👎 कहा",
    comments: "Comments",
    commentPlaceholder: "अपनी राय लिखें…",
    namePlaceholder: "आपका नाम (optional)",
    post: "Post",
    noComments: "अभी तक कोई comment नहीं — सबसे पहले लिखें।",
    copyLink: "Link copy करें",
    linkCopied: "Link copy हो गया",
    whatsapp: "WhatsApp",
    shareOnX: "X पर share करें",
    caughtUp: "आप सब देख चुके हैं 🎉",
    checkBackTomorrow: "रोज़ नई debates आती हैं — कल फिर देखें।",
    noDebatesInCategory: "अभी यहाँ कोई debate नहीं — जल्द ही आएगी।",
    couldntLoad: "Debates load नहीं हो पाईं — अपना connection चेक करें।",
    tryAgain: "फिर कोशिश करें",
  },
};
