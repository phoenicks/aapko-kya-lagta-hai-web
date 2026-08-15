// Draws a 1080x1080 shareable result card ("I said 👍, 63% agreed") and
// returns a PNG data URL. Runs client-side only. Falls back to a text-only
// card (no photo) if the source image can't be canvas-exported due to CORS —
// this keeps the feature working even if an image host changes its policy.
export async function buildShareCardDataUrl({ post, lang, direction, pctUp, pctDown }) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  const W = canvas.width;

  function roundRect(x, y, w, h, r) {
    if (w < r * 2) r = w / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function wrapText(text, x, y, maxWidth, lineHeight, maxLines) {
    const words = text.split(" ");
    let line = "";
    let curY = y;
    let lines = 0;
    for (let n = 0; n < words.length && lines < maxLines; n++) {
      const test = line + words[n] + " ";
      if (ctx.measureText(test).width > maxWidth && line !== "") {
        ctx.fillText(line, x, curY);
        line = words[n] + " ";
        curY += lineHeight;
        lines++;
      } else {
        line = test;
      }
    }
    ctx.fillText(line, x, curY);
  }

  function drawChrome(withImageBottom) {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#1a1a19");
    grad.addColorStop(1, "#0b0b0b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 46px system-ui, -apple-system, sans-serif";
    ctx.fillText("Aapko Kya Lagta Hai", 60, 90);
    ctx.font = "500 24px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#c3c2b7";
    ctx.fillText("आपको क्या लगता है?", 60, 128);

    const promptText = lang === "hi" ? post.prompt_hi : post.prompt_en;
    ctx.font = "600 30px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#ffffff";
    wrapText(`"${promptText}"`, 60, withImageBottom ? 620 : 260, W - 120, 40, 3);

    const barY = withImageBottom ? 700 : 340;
    const barX = 60,
      barW = W - 120,
      barH = 46;
    ctx.fillStyle = "#e34948";
    roundRect(barX, barY, barW, barH, 12);
    ctx.fill();
    ctx.fillStyle = "#2a78d6";
    roundRect(barX, barY, barW * (pctUp / 100), barH, 12);
    ctx.fill();

    ctx.font = "700 22px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`${pctUp}% 👍`, barX + 16, barY + 31);
    const downText = `${pctDown}% 👎`;
    const downW = ctx.measureText(downText).width;
    ctx.fillText(downText, barX + barW - downW - 16, barY + 31);

    ctx.font = "600 24px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = direction === "up" ? "#2a78d6" : "#e34948";
    ctx.fillText(direction === "up" ? "I said 👍" : "I said 👎", barX, barY + 100);

    ctx.font = "400 18px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#898781";
    ctx.fillText("aapkokyalagtahai.com", barX, canvas.height - 50);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        ctx.drawImage(img, 0, 0, W, 560);
        const grad = ctx.createLinearGradient(0, 380, 0, 560);
        grad.addColorStop(0, "rgba(11,11,11,0)");
        grad.addColorStop(1, "rgba(11,11,11,1)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 380, W, 180);
        drawChrome(true);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        drawChrome(false);
        try {
          resolve(canvas.toDataURL("image/png"));
        } catch {
          resolve(null);
        }
      }
    };
    img.onerror = () => {
      drawChrome(false);
      try {
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    img.src = post.image_url;
  });
}
