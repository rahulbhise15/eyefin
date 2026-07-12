import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

async function tgSend(chatId: string | number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

// Telegram webhook. Point the bot's webhook here (or have Hermes forward
// updates). A "/start <anonId>" stitches that Telegram account onto the
// existing anonymous EyeFin user, so watchlist + tags carry over.
http.route({
  path: "/telegram/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const update = await request.json().catch(() => null);
    const msg = update?.message;
    const text: string = msg?.text ?? "";
    const chatId = msg?.chat?.id;
    if (!chatId) return new Response("ok");

    const m = text.match(/^\/start\s+(\S+)/);
    if (m) {
      const anonId = m[1];
      const res = await ctx.runMutation(api.users.linkTelegram, {
        anonId,
        telegramId: String(chatId),
      });
      await tgSend(
        chatId,
        res.ok
          ? "✓ Connected to EyeFin. Your watchlist is linked — I'll send one calm, plain-English brief each morning. Never a tip."
          : "Hmm, I couldn't find your EyeFin session. Open the Connect link from the app again."
      );
    } else if (/^\/start/.test(text)) {
      await tgSend(chatId, "Welcome to EyeFin. Open the app and tap “Connect Telegram” to link your watchlist.");
    }
    return new Response("ok");
  }),
});

// Plain JSON endpoint for Hermes (or manual) to stitch: POST { anonId, telegramId }.
http.route({
  path: "/link-telegram",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json().catch(() => ({}));
    const { anonId, telegramId } = body ?? {};
    if (!anonId || !telegramId)
      return new Response(JSON.stringify({ ok: false, reason: "anonId and telegramId required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    const res = await ctx.runMutation(api.users.linkTelegram, {
      anonId: String(anonId),
      telegramId: String(telegramId),
    });
    return new Response(JSON.stringify(res), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
