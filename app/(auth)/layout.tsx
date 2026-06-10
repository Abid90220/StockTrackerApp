import Link from "next/link";
import Image from "next/image";

const marketStats = [
    { label: "S&P 500", value: "5,603.24", change: "+1.4%" },
    { label: "Nasdaq 100", value: "23,453.86", change: "+1.5%" },
    { label: "Dow 30", value: "44,425.52", change: "+0.8%" },
];

const watchlist = [
    { symbol: "NVDA", name: "NVIDIA Corp", price: "$181.46", change: "+2.21%" },
    { symbol: "MSFT", name: "Microsoft Corp", price: "$520.42", change: "+1.08%" },
    { symbol: "AAPL", name: "Apple Inc", price: "$233.16", change: "+1.54%" },
];

const Layout = async ({ children }: { children : React.ReactNode }) => {
    return (
        <main className="auth-layout">
            <section className="auth-left-section scrollbar-hide-default">
                <Link href="/" className="auth-logo">
                    <Image src="/assets/icons/logo.svg" alt="TradeInsight AI logo" width={190} height={32} className='h-8 w-auto' />
                </Link>

                <div className="pb-6 lg:pb-8 flex-1">{children}</div>
            </section>

            <section className="auth-right-section">
                <div className="z-10 relative lg:mt-4 lg:mb-16">
                    <blockquote className="auth-blockquote">
                        TradeInsight AI turns market data into clear investing signals. The alerts are timely, and the insights help me act with confidence.
                    </blockquote>
                    <div className="flex items-center justify-between">
                        <div>
                            <cite className="auth-testimonial-author">- Ethan R.</cite>
                            <p className="max-md:text-xs text-gray-500">Retail Investor</p>
                        </div>
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Image src="/assets/icons/star.svg" alt="Star" key={star} width={20} height={20} className="w-5 h-5" />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 relative">
                    <div className="auth-dashboard-preview absolute top-0" aria-label="TradeInsight AI dashboard preview">
                        <div className="preview-header">
                            <div className="flex items-center gap-3">
                                <Image src="/assets/icons/logo.svg" alt="TradeInsight AI" width={190} height={32} className="h-7 w-auto" />
                            </div>
                            <div className="preview-nav">
                                <span>Dashboard</span>
                                <span>Search</span>
                                <span>Alerts</span>
                            </div>
                            <div className="preview-user">BK</div>
                        </div>

                        <div className="preview-body">
                            <section className="preview-panel preview-market-panel">
                                <div className="preview-section-title">
                                    <h2>Market Summary</h2>
                                    <span>Live signals</span>
                                </div>
                                <div className="preview-tabs">
                                    <span>Indices</span>
                                    <span>Stocks</span>
                                    <span>ETFs</span>
                                </div>
                                <div className="preview-chart">
                                    <svg viewBox="0 0 720 230" role="img" aria-label="Green market trend line">
                                        <defs>
                                            <linearGradient id="preview-chart-fill" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.42" />
                                                <stop offset="100%" stopColor="#4ADE80" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M0 164 L55 190 L108 136 L162 150 L216 82 L270 116 L324 62 L378 94 L432 48 L486 132 L540 92 L594 142 L648 110 L720 66 L720 230 L0 230 Z" fill="url(#preview-chart-fill)" />
                                        <path d="M0 164 L55 190 L108 136 L162 150 L216 82 L270 116 L324 62 L378 94 L432 48 L486 132 L540 92 L594 142 L648 110 L720 66" fill="none" stroke="#4ADE80" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="preview-stat-grid">
                                    {marketStats.map((stat) => (
                                        <div className="preview-stat" key={stat.label}>
                                            <span>{stat.label}</span>
                                            <strong>{stat.value}</strong>
                                            <em>{stat.change}</em>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="preview-panel">
                                <div className="preview-section-title">
                                    <h2>Watchlist</h2>
                                    <span>3 alerts</span>
                                </div>
                                <div className="preview-watchlist">
                                    {watchlist.map((stock) => (
                                        <div className="preview-stock" key={stock.symbol}>
                                            <div className="preview-symbol">{stock.symbol.slice(0, 2)}</div>
                                            <div>
                                                <strong>{stock.symbol}</strong>
                                                <span>{stock.name}</span>
                                            </div>
                                            <div className="preview-price">
                                                <strong>{stock.price}</strong>
                                                <span>{stock.change}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="preview-panel preview-insight-panel">
                                <div className="preview-section-title">
                                    <h2>AI Insights</h2>
                                    <span>Updated now</span>
                                </div>
                                <div className="preview-insight">
                                    <span className="preview-pulse" />
                                    <p>Momentum strengthened across mega-cap technology while volatility stayed below the weekly average.</p>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
export default Layout
