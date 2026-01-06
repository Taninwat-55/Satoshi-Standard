import React from 'react';
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
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function PriceChart({ chartData }) {
  const data = {
    labels: chartData.map((d) => d.date),
    datasets: [
      {
        label: 'Price in Sats',
        data: chartData.map((d) => d.sats),
        borderColor: '#F7931A',
        backgroundColor: 'rgba(247, 147, 26, 0.2)',
        fill: true,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US').format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: '#a3a3a3',
        },
        grid: {
          color: 'rgba(163, 163, 163, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#a3a3a3',
          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6,
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return <Line options={options} data={data} />;
}

export default PriceChart;
