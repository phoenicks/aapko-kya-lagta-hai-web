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
        ? "Zero votes so far. Be the main character and go first."
        : pctUp >= 50
        ? `The internet agrees with you — ${pctUp}% said 👍, out of ${total} judged.`
        : `You're built different — only ${pctUp}% said 👍, out of ${total} judged.`,
    youSaidUp: "You said 👍",
    youSaidDown: "You said 👎",
    comments: "Comments",
    commentPlaceholder: "Drop your take…",
    namePlaceholder: "Your name (optional)",
    post: "Post",
    noComments: "No comments yet. Say something unhinged.",
    copyLink: "Copy link",
    linkCopied: "Link copied",
    whatsapp: "WhatsApp",
    shareOnX: "Share on X",
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
        ? "अभी तक ज़ीरो votes — main character बनो, सबसे पहले vote करो।"
        : pctUp >= 50
        ? `पूरा internet आपसे सहमत है — ${total} में से ${pctUp}% ने 👍 कहा।`
        : `आप अलग ही हो — ${total} में से सिर्फ ${pctUp}% ने 👍 कहा।`,
    youSaidUp: "आपने 👍 कहा",
    youSaidDown: "आपने 👎 कहा",
    comments: "Comments",
    commentPlaceholder: "अपनी राय drop करो…",
    namePlaceholder: "आपका नाम (optional)",
    post: "Post",
    noComments: "अभी तक कोई comment नहीं — कुछ unhinged बोलो।",
    copyLink: "Link copy करें",
    linkCopied: "Link copy हो गया",
    whatsapp: "WhatsApp",
    shareOnX: "X पर share करें",
  },
};
