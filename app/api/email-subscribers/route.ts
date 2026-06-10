import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/mongoose";
import { EmailSubscriber } from "@/database/models/EmailSubscriber";

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export async function POST(request: Request) {
    const formData = (await request.json()) as Partial<SignUpFormData>;
    const email = formData.email?.trim().toLowerCase();
    const name = formData.fullName?.trim();

    if (!email || !name || !isValidEmail(email)) {
        return NextResponse.json({ error: "A valid name and email are required" }, { status: 400 });
    }

    await connectToDatabase();

    const subscriber = await EmailSubscriber.findOneAndUpdate(
        { email },
        {
            $set: {
                name,
                country: formData.country,
                investmentGoals: formData.investmentGoals,
                riskTolerance: formData.riskTolerance,
                preferredIndustry: formData.preferredIndustry,
                dailyDigestEnabled: true,
            },
            $setOnInsert: { email },
        },
        { new: true, upsert: true }
    );

    return NextResponse.json({
        ok: true,
        subscriber: {
            id: subscriber._id.toString(),
            email: subscriber.email,
        },
    });
}
