import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function ResultDisplay({ isLoading, result }) {
  if (isLoading) {
    return (
      <div className='mt-6 p-4 bg-slate-900/50 rounded-lg text-center h-20 flex flex-col justify-center'>
        <Skeleton width={120} style={{ margin: '0 auto' }} />
        <Skeleton width={200} height={30} style={{ margin: '4px auto 0' }} />
      </div>
    );
  }

  if (!result) {
    return (
      <p className='text-center text-slate-400 mt-8 h-20 flex items-center justify-center'>
        Enter an item and price to see the result.
      </p>
    );
  }

  if (result.mode === 'satsToFiat') {
    const formattedFiat = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: result.currency.toUpperCase(),
    }).format(result.fiat);

    return (
      <div className='mt-6 p-4 bg-slate-900/50 rounded-lg text-center h-20 flex flex-col justify-center'>
        <p className='text-md text-slate-300'>
          {parseInt(result.sats).toLocaleString('en-US')} sats is equal to
        </p>
        <p className='text-3xl font-bold text-[#F7931A] my-1'>
          {formattedFiat}
        </p>
      </div>
    );
  }

  return (
    <div className='mt-6 p-4 bg-slate-900/50 rounded-lg text-center h-20 flex flex-col justify-center'>
      <p className='text-md text-slate-300'>"{result.name}" costs</p>
      <p className='text-3xl font-bold text-[#F7931A] my-1'>
        {result.sats.toLocaleString('en-US')} sats
      </p>
    </div>
  );
}

export default ResultDisplay;
