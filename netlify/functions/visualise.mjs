// AI Visualiser: sends the customer's photo + description to Google Gemini's
// image-editing model and returns the edited image.
// Needs the environment variable GEMINI_API_KEY (set in Netlify > Site configuration > Environment variables).
// Optional: GEMINI_IMAGE_MODEL to switch model, VISUALISER_HOURLY_LIMIT (default 8 per visitor per hour).

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const hits = new Map(); // simple per-visitor rate limit (per warm function instance)

export default async (req, context) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const key = process.env.GEMINI_API_KEY;
  if (!key) return json({ error: "The AI visualiser hasn't been switched on yet. Please check back soon." }, 503);

  const limit = Number(process.env.VISUALISER_HOURLY_LIMIT || 8);
  const ip = context?.ip || req.headers.get("x-nf-client-connection-ip") || "anon";
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < 3600_000);
  if (recent.length >= limit) return json({ error: "You've reached the limit of designs for now. Please try again in an hour, or contact us to chat about your ideas." }, 429);

  let body;
  try { body = await req.json(); } catch { return json({ error: "Bad request" }, 400); }
  const { image, mimeType = "image/jpeg" } = body || {};
  const prompt = String(body?.prompt || "").trim().slice(0, 500);
  if (typeof image !== "string" || image.length < 100 || image.length > 5_500_000)
    return json({ error: "Please upload a photo (max ~4MB)." }, 400);
  if (!/^image\/(jpeg|png|webp)$/.test(mimeType)) return json({ error: "Unsupported image type." }, 400);
  if (prompt.length < 3) return json({ error: "Please describe what you'd like." }, 400);

  recent.push(now); hits.set(ip, recent);

  const instruction =
    "You are a landscape and concrete design visualiser for a concreting and landscaping business. " +
    "Edit the attached photo of a real property to show the customer's requested outdoor work as a realistic, " +
    "professionally finished result. Keep the same camera angle, perspective, lighting, house, fences and surroundings; " +
    "only change the areas needed for the request. Make it photorealistic, with no text, labels or watermarks. " +
    "If the request is not about outdoor landscaping, concreting, decking or garden work, just show a tidy, well-landscaped version of the space.\n\n" +
    "Customer request: " + prompt;

  const model = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: instruction }, { inline_data: { mime_type: mimeType, data: image } }] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
      })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error("Gemini error", r.status, JSON.stringify(data).slice(0, 500));
      return json({ error: "The AI is busy right now. Please try again in a minute." }, 502);
    }
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const img = parts.map(p => p.inlineData || p.inline_data).find(Boolean);
    if (!img?.data) {
      console.error("No image returned", JSON.stringify(data).slice(0, 500));
      return json({ error: "The AI couldn't create a design from that. Try a clearer photo or a different description." }, 422);
    }
    return json({ image: img.data, mimeType: img.mimeType || img.mime_type || "image/png" });
  } catch (err) {
    console.error(err);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
};

export const config = { path: "/api/visualise" };
