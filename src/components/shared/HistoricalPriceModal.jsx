import PriceChart from './PriceChart';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function HistoricalPriceModal({
  isLoading,
  data,
  onClose,
  timeRange,
  setTimeRange,
}) {
  const timeRanges = [
    { label: '7D', days: 7 },
    { label: '30D', days: 30 },
    { label: '90D', days: 90 },
    { label: '1Y', days: 365 },
  ];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div>
          <Skeleton height={32} width={280} style={{ margin: '0 auto 4px' }} />
          <Skeleton height={20} width={200} style={{ margin: '0 auto 24px' }} />
          <Skeleton height={256} />
        </div>
      );
    }
    if (data && data.error) {
      return <p className='text-red-400 text-center'>{data.error}</p>;
    }
    if (data && data.chartData) {
      const { itemName, chartData } = data;
      // Ensure chartData is not empty before trying to access elements
      if (chartData.length < 2) {
        return (
          <p className='text-center'>Not enough data to display a chart.</p>
        );
      }

      const startPrice = chartData[0].sats;
      const endPrice = chartData[chartData.length - 1].sats;
      const percentageChange = ((endPrice - startPrice) / startPrice) * 100;
      const isCheaper = percentageChange < 0;

      return (
        <>
          <h3 className='text-2xl font-bold mb-2 text-white text-center'>
            Price History for "{itemName}"
          </h3>
          <p className='text-sm text-slate-400 text-center mb-4'>
            (Last {timeRange} Days in Sats)
          </p>

          <div className='flex justify-center space-x-2 mb-4'>
            {timeRanges.map((range) => (
              <button
                key={range.days}
                onClick={() => setTimeRange(range.days)}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition ${
                  timeRange === range.days
                    ? 'bg-[#F7931A] text-slate-900'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          <div className='h-64'>
            <PriceChart chartData={chartData} />
          </div>

          <div
            className={`mt-6 p-4 rounded-lg text-center ${
              isCheaper
                ? 'bg-green-500/10 text-green-300'
                : 'bg-red-500/10 text-red-300'
            }`}
          >
            <p className='font-bold text-lg'>
              This item has become {Math.abs(percentageChange).toFixed(1)}%{' '}
              {isCheaper ? 'CHEAPER' : 'MORE EXPENSIVE'} in Bitcoin terms.
            </p>
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <div
      className='fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4'
      onClick={onClose}
    >
      <div
        className='bg-neutral-900/80 backdrop-blur-xl text-white p-6 rounded-2xl shadow-2xl max-w-2xl w-full relative border border-white/10'
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className='absolute top-3 right-3 text-2xl text-neutral-500 hover:text-white transition'
        >
          &times;
        </button>
        {renderContent()}
      </div>
    </div>
  );
}

export default HistoricalPriceModal;
