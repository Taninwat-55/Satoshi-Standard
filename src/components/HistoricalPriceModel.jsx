function HistoricalPriceModal({ isLoading, data, onClose }) {
  const renderContent = () => {
    if (isLoading) return <p>Loading historical data...</p>;
    if (data && data.error) return <p className='text-red-400'>{data.error}</p>;
    if (data) {
      const { itemName, currentSats, historicalSats } = data;
      const difference = currentSats - historicalSats;
      const percentageChange = ((currentSats - historicalSats) / historicalSats) * 100;
      const isCheaper = difference < 0;
      return (
        <>
          <h3 className='text-2xl font-bold mb-4 text-white'>Price History for "{itemName}"</h3>
          <div className='space-y-2 text-lg'>
            <p><strong className="text-slate-300">Price today:</strong> <span className="text-[#F7931A] font-semibold">{Math.round(currentSats).toLocaleString('en-US')} sats</span></p>
            <p><strong className="text-slate-300">Price 30 days ago:</strong> <span className="font-semibold">{Math.round(historicalSats).toLocaleString('en-US')} sats</span></p>
          </div>
          <div className={`mt-6 p-4 rounded-lg text-center ${isCheaper ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
            <p className='font-bold text-lg'>This item has become {Math.abs(percentageChange).toFixed(1)}% {isCheaper ? 'CHEAPER' : 'MORE EXPENSIVE'} in Bitcoin terms.</p>
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4' onClick={onClose}>
      <div className='bg-slate-800 text-white p-8 rounded-xl shadow-2xl max-w-lg w-full relative border border-slate-700' onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className='absolute top-3 right-3 text-2xl text-slate-500 hover:text-white transition'>&times;</button>
        {renderContent()}
      </div>
    </div>
  );
}

export default HistoricalPriceModal;