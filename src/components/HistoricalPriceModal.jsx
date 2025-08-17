import PriceChart from './PriceChart';

function HistoricalPriceModal({ isLoading, data, onClose }) {
  const renderContent = () => {
    if (isLoading) {
      return <p className='text-center'>Loading historical data...</p>;
    }
    if (data && data.error) {
      return <p className='text-red-400 text-center'>{data.error}</p>;
    }
    if (data && data.chartData) {
      const { itemName, chartData } = data;
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
            (Last 30 Days in Sats)
          </p>

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
      className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4'
      onClick={onClose}
    >
      <div
        className='bg-slate-800 text-white p-6 rounded-xl shadow-2xl max-w-2xl w-full relative border border-slate-700'
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className='absolute top-3 right-3 text-2xl text-slate-500 hover:text-white transition'
        >
          &times;
        </button>
        {renderContent()}
      </div>
    </div>
  );
}

export default HistoricalPriceModal;
