import { NO_MARKET_NEWS, POPULAR_STOCK_SYMBOLS } from "@/lib/constants";
import { connectToDatabase } from "@/database/mongoose";
import { EmailSubscriber } from "@/database/models/EmailSubscriber";

type DigestArticle = Pick<MarketNewsArticle, "headline" | "summary" | "source" | "url" | "datetime">;

type GeneratedDigest = {
    subject: string;
    intro: string;
    highlights: string[];
    outlook: string;
};

type SendDigestResult = {
    email: string;
    status: "sent" | "skipped" | "failed";
    id?: string;
    reason?: string;
};

const FINNHUB_MARKET_NEWS_URL = "https://finnhub.io/api/v1/news?category=general";
const GEMINI_GENERATE_CONTENT_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const RESEND_EMAILS_URL = "https://api.resend.com/emails";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const DEFAULT_FROM_EMAIL = "TradeInsight AI <onboarding@resend.dev>";

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, "").trim();

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const uniq = <T,>(items: T[]) => Array.from(new Set(items));

export const getDigestRecipients = async () => {
    await connectToDatabase();

    const subscribers = await EmailSubscriber.find({ dailyDigestEnabled: true })
        .select("email")
        .lean<{ email: string }[]>();

    return uniq(subscribers.map((subscriber) => subscriber.email.trim().toLowerCase()).filter(Boolean));
};

const normalizeArticle = (article: RawNewsArticle): DigestArticle | null => {
    if (!article.headline || !article.url) return null;

    return {
        headline: article.headline,
        summary: article.summary || "No summary provided.",
        source: article.source || "Market news",
        url: article.url,
        datetime: article.datetime || Math.floor(Date.now() / 1000),
    };
};

export const fetchMarketNews = async () => {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) return [];

    const response = await fetch(`${FINNHUB_MARKET_NEWS_URL}&token=${apiKey}`, {
        next: { revalidate: 0 },
    });

    if (!response.ok) {
        throw new Error(`Finnhub market news request failed with ${response.status}`);
    }

    const rawArticles = (await response.json()) as RawNewsArticle[];

    return rawArticles
        .map(normalizeArticle)
        .filter((article): article is DigestArticle => article !== null)
        .slice(0, 8);
};

const fallbackDigest = (articles: DigestArticle[]): GeneratedDigest => ({
    subject: "Your daily TradeInsight AI market briefing",
    intro:
        articles.length > 0
            ? "Here are the market stories worth watching today, summarized for a quick morning read."
            : stripHtml(NO_MARKET_NEWS),
    highlights:
        articles.length > 0
            ? articles.slice(0, 4).map((article) => `${article.headline}: ${article.summary}`)
            : ["No market news was available from the configured news provider today."],
    outlook:
        articles.length > 0
            ? `Keep an eye on high-volume names such as ${POPULAR_STOCK_SYMBOLS.slice(0, 5).join(", ")} while the market digests these updates.`
            : "The digest endpoint is working, but it needs a market-news API key to generate fresh coverage.",
});

const parseGeminiText = (payload: unknown) => {
    if (!payload || typeof payload !== "object") return "";
    const maybePayload = payload as {
        candidates?: Array<{
            content?: {
                parts?: Array<{ text?: string }>;
            };
        }>;
    };

    return (maybePayload.candidates ?? [])
        .flatMap((candidate) => candidate.content?.parts ?? [])
        .map((part) => part.text ?? "")
        .join("")
        .trim();
};

const parseGeneratedDigest = (value: string, articles: DigestArticle[]) => {
    try {
        const parsed = JSON.parse(value) as Partial<GeneratedDigest>;
        const highlights = Array.isArray(parsed.highlights)
            ? parsed.highlights.filter((highlight): highlight is string => typeof highlight === "string")
            : [];

        if (parsed.subject && parsed.intro && highlights.length > 0 && parsed.outlook) {
            return {
                subject: parsed.subject,
                intro: parsed.intro,
                highlights,
                outlook: parsed.outlook,
            };
        }
    } catch {
        return fallbackDigest(articles);
    }

    return fallbackDigest(articles);
};

export const generateDigest = async (articles: DigestArticle[]) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return fallbackDigest(articles);

    const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
    const response = await fetch(`${GEMINI_GENERATE_CONTENT_URL}/${model}:generateContent`, {
        method: "POST",
        headers: {
            "x-goog-api-key": apiKey,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            systemInstruction: {
                parts: [
                    {
                        text: "You write concise daily stock-market email briefings. Return only valid JSON with keys subject, intro, highlights, and outlook. highlights must be an array of 3-5 short strings.",
                    },
                ],
            },
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: JSON.stringify({
                                date: new Date().toISOString().slice(0, 10),
                                articles,
                                popularSymbols: POPULAR_STOCK_SYMBOLS.slice(0, 12),
                            }),
                        },
                    ],
                },
            ],
            generationConfig: {
                responseMimeType: "application/json",
                responseJsonSchema: {
                    type: "object",
                    additionalProperties: false,
                    required: ["subject", "intro", "highlights", "outlook"],
                    properties: {
                        subject: { type: "string" },
                        intro: { type: "string" },
                        highlights: {
                            type: "array",
                            minItems: 3,
                            maxItems: 5,
                            items: { type: "string" },
                        },
                        outlook: { type: "string" },
                    },
                },
            },
        }),
    });

    if (!response.ok) {
        throw new Error(`Gemini digest generation failed with ${response.status}`);
    }

    return parseGeneratedDigest(parseGeminiText(await response.json()), articles);
};

export const renderDigestEmail = (digest: GeneratedDigest, articles: DigestArticle[]) => {
    const highlights = digest.highlights
        .map(
            (highlight) =>
                `<li style="margin:0 0 12px 0;color:#d1d5db;line-height:1.55;">${escapeHtml(highlight)}</li>`
        )
        .join("");

    const sources = articles
        .slice(0, 5)
        .map(
            (article) =>
                `<li style="margin:0 0 10px 0;"><a href="${escapeHtml(article.url)}" style="color:#4ade80;text-decoration:none;">${escapeHtml(article.headline)}</a><span style="color:#9ca3af;"> - ${escapeHtml(article.source)}</span></li>`
        )
        .join("");

    return `<!doctype html>
<html>
<body style="margin:0;background:#07130b;font-family:Arial,Helvetica,sans-serif;color:#f3f4f6;">
  <main style="max-width:640px;margin:0 auto;padding:32px 20px;">
    <p style="margin:0 0 8px 0;color:#4ade80;font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:12px;">TradeInsight AI</p>
    <h1 style="margin:0 0 18px 0;font-size:28px;line-height:1.2;color:#f9fafb;">${escapeHtml(digest.subject)}</h1>
    <p style="margin:0 0 24px 0;color:#d1d5db;line-height:1.6;font-size:16px;">${escapeHtml(digest.intro)}</p>
    <ul style="padding-left:22px;margin:0 0 24px 0;">${highlights}</ul>
    <p style="margin:0 0 28px 0;color:#e5e7eb;line-height:1.6;font-size:16px;">${escapeHtml(digest.outlook)}</p>
    ${sources ? `<h2 style="margin:0 0 12px 0;font-size:18px;color:#f9fafb;">Sources</h2><ul style="padding-left:20px;margin:0;">${sources}</ul>` : ""}
  </main>
</body>
</html>`;
};

export const sendDigestEmails = async (recipients: string[], subject: string, html: string) => {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.DAILY_DIGEST_FROM || DEFAULT_FROM_EMAIL;

    if (!apiKey) {
        return recipients.map<SendDigestResult>((email) => ({
            email,
            status: "skipped",
            reason: "RESEND_API_KEY is not configured",
        }));
    }

    return Promise.all(
        recipients.map(async (email) => {
            const response = await fetch(RESEND_EMAILS_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from,
                    to: [email],
                    subject,
                    html,
                }),
            });

            if (!response.ok) {
                return {
                    email,
                    status: "failed",
                    reason: `Resend request failed with ${response.status}`,
                } satisfies SendDigestResult;
            }

            const payload = (await response.json()) as { id?: string };
            return { email, status: "sent", id: payload.id } satisfies SendDigestResult;
        })
    );
};
