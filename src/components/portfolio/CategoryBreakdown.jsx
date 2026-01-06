import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

function CategoryBreakdown({ items }) {
    const chartData = useMemo(() => {
        const categoryTotals = {};

        items.forEach((item) => {
            const category = item.category || 'Uncategorized';
            if (!categoryTotals[category]) {
                categoryTotals[category] = 0;
            }
            categoryTotals[category] += item.sats;
        });

        const categories = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);

        // Filter out if no data
        if (categories.length === 0 || (categories.length === 1 && categories[0] === 'Uncategorized' && data[0] === 0)) {
            return null;
        }

        return {
            labels: categories,
            datasets: [
                {
                    data: data,
                    backgroundColor: [
                        '#F7931A', // Brand Orange
                        '#3B82F6', // Blue
                        '#10B981', // Green
                        '#F472B6', // Pink
                        '#8B5CF6', // Purple
                        '#EF4444', // Red
                        '#F59E0B', // Amber
                        '#6366F1', // Indigo
                        '#EC4899', // Pink-600
                        '#64748B', // Slate (Uncategorized likely last if sorted, but here keys are random order)
                    ],
                    borderColor: '#171717', // Match bg
                    borderWidth: 2,
                },
            ],
        };
    }, [items]);

    if (!chartData) {
        return null;
    }

    const options = {
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: '#d4d4d4',
                    font: {
                        family: 'Inter',
                        size: 12,
                    },
                    boxWidth: 12,
                },
            },
        },
        maintainAspectRatio: false,
        cutout: '70%',
    };

    return (
        <div className='bg-transparent w-full h-full'>
            <div className='h-full relative'>
                <Doughnut data={chartData} options={options} />
            </div>
        </div>
    );
}

export default CategoryBreakdown;
