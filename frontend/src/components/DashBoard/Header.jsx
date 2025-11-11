import React, { useEffect, useRef } from 'react';

function Header() {
  const widgetRef = useRef(null);

  useEffect(() => {
    const container = widgetRef.current;

    if (container) {
      // Clear existing content
      container.innerHTML = `
        <div class="tradingview-widget-container__widget"></div>
      `;

      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
      script.async = true;
      script.innerHTML = JSON.stringify({
        symbols: [
          { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500 Index' },
          { proName: 'FOREXCOM:NSXUSD', title: 'US 100 Cash CFD' },
          { proName: 'FX_IDC:EURUSD', title: 'EUR to USD' },
          { proName: 'BITSTAMP:BTCUSD', title: 'Bitcoin' },
          { proName: 'BITSTAMP:ETHUSD', title: 'Ethereum' },
        ],
        showSymbolLogo: true,
        isTransparent: false,
        displayMode: 'adaptive',
        colorTheme: 'dark',
        locale: 'en', 
      });

      container.querySelector('.tradingview-widget-container__widget')?.appendChild(script);
    }
  }, []);

  return (
    <div className="tradingview-widget-container" ref={widgetRef} />
  );
}

export default Header;
