import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "TradeInsight AI",
    description:
        "Track real-time stock prices, get AI-powered insights, personalized alerts and detailed company research.",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body>{children}</body>
        </html>
    )
}
