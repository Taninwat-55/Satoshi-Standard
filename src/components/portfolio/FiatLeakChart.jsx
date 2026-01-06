import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { fetchBitcoinPriceHistoryRange, getProvider } from '../../api/cryptoApi';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function FiatLeakChart({ currency = 'usd' }) {
    const [chartData, setChartData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [days, setDays] = useState(365 * 5); // Default to 5 years

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            setChartData(null);

            try {
                const prices = await fetchBitcoinPriceHistoryRange(currency, days);
                const provider = getProvider();

                if (!prices || prices.length === 0) {
                    if (provider.name === 'mempool') {
                        setError('Historical data is not available with Mempool.space provider.');
                    } else {
                        setError('Failed to load historical data.');
                    }
                    setIsLoading(false);
                    return;
                }

                const labels = prices.map(([timestamp]) =>
                    new Date(timestamp).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                );

                // Calculate Satoshis purchasable with 1 unit of fiat
                // 1 BTC = 100,000,000 Sats
                // Price = Fiat per BTC (e.g. 50,000 USD/BTC)
                // Sats per Fiat = 100,000,000 / Price
                const dataPoints = prices.map(([_, price]) => 100_000_000 / price);

                setChartData({
                    labels,
                    datasets: [
                        {
                            label: `Satoshis per 1 ${currency.toUpperCase()}`,
                            data: dataPoints,
                            borderColor: '#F7931A',
                            backgroundColor: 'rgba(247, 147, 26, 0.1)',
                            borderWidth: 2,
                            pointRadius: 0,
                            pointHoverRadius: 4,
                            fill: true,
                            tension: 0.4,
                        },
                    ],
                });
            } catch (err) {
                console.error(err);
                setError('An error occurred while fetching chart data.');
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [currency, days]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#F7931A',
                bodyColor: '#e2e8f0',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                callbacks: {
                    label: (context) => {
                        return `${Math.round(context.parsed.y).toLocaleString()} sats`;
                    }
                }
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    color: '#94a3b8',
                    maxTicksLimit: 6,
                },
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#94a3b8',
                    callback: (value) => value.toLocaleString(),
                },
                title: {
                    display: true,
                    text: 'Satoshis',
                    color: '#64748b',
                    font: {
                        size: 10
                    }
                }
            },
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false,
        },
    };

    if (error) {
        return (
            <div className="h-64 flex items-center justify-center bg-neutral-900/50 rounded-xl border border-white/5">
                <p className="text-neutral-400 text-sm flex items-center gap-2">
                    <span className="text-xl">⚠️</span> {error}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-neutral-900/50 p-6 rounded-xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white">Fiat Purchasing Power</h3>
                    <p className="text-sm text-neutral-400">
                        Purchasing power of 1 {currency.toUpperCase()} in Satoshis over time
                    </p>
                </div>
                <div className="flex bg-neutral-800 rounded-lg p-1">
                    {[365, 365 * 5, 365 * 10].map((d) => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={`px-3 py-1 text-xs rounded-md transition-all ${days === d
                                    ? 'bg-brand-orange text-white font-bold shadow-sm'
                                    : 'text-neutral-400 hover:text-white'
                                }`}
                        >
                            {d === 365 ? '1Y' : d === 365 * 5 ? '5Y' : '10Y'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-64 w-full">
                {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
                    </div>
                ) : (
                    <Line data={chartData} options={options} />
                )}
            </div>
        </div>
    );
}

export default FiatLeakChart;
