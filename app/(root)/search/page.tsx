'use client';

import {useMemo, useState} from "react";
import Link from "next/link";
import {Search} from "lucide-react";
import {Input} from "@/components/ui/input";

const STOCKS: Stock[] = [
    {symbol: "AAPL", name: "Apple Inc", exchange: "NASDAQ", type: "Common Stock"},
    {symbol: "MSFT", name: "Microsoft Corp", exchange: "NASDAQ", type: "Common Stock"},
    {symbol: "GOOGL", name: "Alphabet Inc", exchange: "NASDAQ", type: "Common Stock"},
    {symbol: "AMZN", name: "Amazon.com Inc", exchange: "NASDAQ", type: "Common Stock"},
    {symbol: "TSLA", name: "Tesla Inc", exchange: "NASDAQ", type: "Common Stock"},
    {symbol: "META", name: "Meta Platforms Inc", exchange: "NASDAQ", type: "Common Stock"},
    {symbol: "NVDA", name: "NVIDIA Corp", exchange: "NASDAQ", type: "Common Stock"},
    {symbol: "NFLX", name: "Netflix Inc", exchange: "NASDAQ", type: "Common Stock"},
    {symbol: "ORCL", name: "Oracle Corp", exchange: "NYSE", type: "Common Stock"},
    {symbol: "CRM", name: "Salesforce Inc", exchange: "NYSE", type: "Common Stock"},
    {symbol: "ADBE", name: "Adobe Inc", exchange: "NASDAQ", type: "Common Stock"},
    {symbol: "INTC", name: "Intel Corp", exchange: "NASDAQ", type: "Common Stock"},
    {symbol: "AMD", name: "Advanced Micro Devices Inc", exchange: "NASDAQ", type: "Common Stock"},
    {symbol: "PYPL", name: "PayPal Holdings Inc", exchange: "NASDAQ", type: "Common Stock"},
    {symbol: "UBER", name: "Uber Technologies Inc", exchange: "NYSE", type: "Common Stock"},
    {symbol: "SHOP", name: "Shopify Inc", exchange: "NYSE", type: "Common Stock"},
    {symbol: "COIN", name: "Coinbase Global Inc", exchange: "NASDAQ", type: "Common Stock"},
    {symbol: "PLTR", name: "Palantir Technologies Inc", exchange: "NASDAQ", type: "Common Stock"},
    {symbol: "BABA", name: "Alibaba Group Holding Ltd", exchange: "NYSE", type: "ADR"},
    {symbol: "JPM", name: "JPMorgan Chase & Co", exchange: "NYSE", type: "Common Stock"},
    {symbol: "BAC", name: "Bank of America Corp", exchange: "NYSE", type: "Common Stock"},
    {symbol: "V", name: "Visa Inc", exchange: "NYSE", type: "Common Stock"},
    {symbol: "MA", name: "Mastercard Inc", exchange: "NYSE", type: "Common Stock"},
];

const SearchPage = () => {
    const [query, setQuery] = useState("");

    const filteredStocks = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) return STOCKS;

        return STOCKS.filter((stock) =>
            [stock.symbol, stock.name, stock.exchange, stock.type]
                .join(" ")
                .toLowerCase()
                .includes(normalizedQuery)
        );
    }, [query]);

    return (
        <div className="space-y-8">
            <section className="space-y-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-100">Search Stocks</h1>
                    <p className="mt-2 text-gray-500">Find companies by symbol, name, exchange, or security type.</p>
                </div>

                <div className="relative max-w-3xl">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                    <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search AAPL, NVIDIA, NASDAQ..."
                        className="h-14 rounded-lg border-gray-600 bg-gray-800 pl-12 text-base text-gray-400 placeholder:text-gray-500 focus-visible:border-yellow-500 focus-visible:ring-yellow-500/20"
                    />
                </div>
            </section>

            <section className="overflow-hidden rounded-lg border border-gray-600 bg-gray-800">
                <div className="flex items-center justify-between border-b border-gray-600 bg-gray-700 px-5 py-4">
                    <h2 className="text-lg font-semibold text-gray-100">Results</h2>
                    <span className="text-sm font-medium text-yellow-400">{filteredStocks.length} matches</span>
                </div>

                {filteredStocks.length > 0 ? (
                    <div className="divide-y divide-gray-600">
                        {filteredStocks.map((stock) => (
                            <div key={stock.symbol} className="grid gap-4 px-5 py-4 transition-colors hover:bg-gray-700/60 md:grid-cols-[120px_1fr_160px_160px] md:items-center">
                                <div>
                                    <span className="text-xl font-bold text-gray-100">{stock.symbol}</span>
                                    <span className="mt-1 block text-sm text-yellow-400">{stock.exchange}</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-400">{stock.name}</h3>
                                    <p className="mt-1 text-sm text-gray-500">{stock.type}</p>
                                </div>
                                <Link
                                    href={`https://finance.yahoo.com/quote/${stock.symbol}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded bg-gray-700 px-3 py-2 text-center text-sm font-medium text-gray-400 transition-colors hover:bg-gray-600 hover:text-yellow-400"
                                >
                                    Market data
                                </Link>
                                <Link
                                    href={`https://www.tradingview.com/symbols/${stock.exchange}-${stock.symbol}/`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded bg-yellow-500 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-yellow-400"
                                >
                                    Open chart
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="px-5 py-12 text-center">
                        <p className="text-lg font-semibold text-gray-400">No stocks found</p>
                        <p className="mt-2 text-gray-500">Try a symbol like NVDA or a company name like Microsoft.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default SearchPage;
