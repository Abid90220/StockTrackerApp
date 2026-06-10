import { NextRequest, NextResponse } from "next/server";
import {
    fetchMarketNews,
    generateDigest,
    getDigestRecipients,
    renderDigestEmail,
    sendDigestEmails,
} from "@/lib/email/daily-stock-news";

export const dynamic = "force-dynamic";

const isAuthorized = (request: NextRequest) => {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret && process.env.NODE_ENV !== "production") return true;
    if (!cronSecret) return false;

    const authorization = request.headers.get("authorization");
    const headerSecret = request.headers.get("x-cron-secret");
    const querySecret = request.nextUrl.searchParams.get("secret");

    return authorization === `Bearer ${cronSecret}` || headerSecret === cronSecret || querySecret === cronSecret;
};

export async function GET(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recipients = await getDigestRecipients();
    if (recipients.length === 0) {
        return NextResponse.json(
            {
                error: "No daily digest subscribers found",
                hint: "Users are added automatically when they sign up.",
            },
            { status: 400 }
        );
    }

    const articles = await fetchMarketNews();
    const digest = await generateDigest(articles);
    const html = renderDigestEmail(digest, articles);
    const results = await sendDigestEmails(recipients, digest.subject, html);

    return NextResponse.json({
        ok: results.every((result) => result.status !== "failed"),
        articleCount: articles.length,
        recipients: results,
        preview: process.env.RESEND_API_KEY ? undefined : { subject: digest.subject, html },
    });
}
