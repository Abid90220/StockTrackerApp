import mongoose, { Schema, model, models } from "mongoose";

export type EmailSubscriberDocument = {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    country?: string;
    investmentGoals?: string;
    riskTolerance?: string;
    preferredIndustry?: string;
    dailyDigestEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
};

const EmailSubscriberSchema = new Schema<EmailSubscriberDocument>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        country: { type: String, trim: true },
        investmentGoals: { type: String, trim: true },
        riskTolerance: { type: String, trim: true },
        preferredIndustry: { type: String, trim: true },
        dailyDigestEnabled: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const EmailSubscriber =
    models.EmailSubscriber || model<EmailSubscriberDocument>("EmailSubscriber", EmailSubscriberSchema);
