import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function ResultDisplay({ isLoading, result, satsMode }) {
  if (isLoading) {
    return (
      <div className='mt-6 pt-5 border-t border-white/5 text-center h-24 flex flex-col justify-center gap-2'>
        <Skeleton width={120} style={{ margin: '0 auto' }} />
        <Skeleton width={200} height={32} style={{ margin: '0 auto' }} />
      </div>
    );
  }

  if (!result) {
    return (
      <div className='mt-6 pt-5 border-t border-white/5 text-center h-24 flex items-center justify-center'>
        <p className='text-neutral-500 text-sm'>Enter an item and price to see the result.</p>
      </div>
    );
  }

  if (result.mode === 'satsToFiat') {
    const formattedFiat = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: result.currency.toUpperCase(),
    }).format(result.fiat);

    return (
      <div className='mt-6 pt-5 border-t border-white/5 text-center h-24 flex flex-col justify-center'>
        <p className='text-sm text-neutral-400'>
          {parseInt(result.sats).toLocaleString('en-US')} sats is equal to
        </p>
        <p className='text-4xl font-bold text-brand-orange tracking-tight mt-1'>
          {satsMode ? (
            <span className='opacity-50 blur-[4px] select-none'>$ 0.00 XXX</span>
          ) : (
            formattedFiat
          )}
        </p>
      </div>
    );
  }

  return (
    <div className='mt-6 pt-5 border-t border-white/5 text-center h-24 flex flex-col justify-center'>
      <p className='text-sm text-neutral-400'>
        &quot;{result.name}&quot; costs
      </p>
      <p className='text-4xl font-bold text-brand-orange tracking-tight font-mono mt-1'>
        {result.sats.toLocaleString('en-US')}{' '}
        <span className='text-lg font-medium font-sans text-neutral-500'>sats</span>
      </p>
    </div>
  );
}

export default ResultDisplay;
