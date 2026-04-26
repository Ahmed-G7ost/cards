import React, { createContext, useContext, useEffect, useState } from 'react';

const DarkModeContext = createContext(null);

export function DarkModeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('livenet_dark_mode') === 'true';
    } catch (_) {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('livenet_dark_mode', dark);
  }, [dark]);

  function toggle() {
    setDark((d) => !d);
  }

  return (
    <DarkModeContext.Provider value={{ dark, toggle }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const ctx = useContext(DarkModeContext);
  if (!ctx) throw new Error('useDarkMode must be used within DarkModeProvider');
  return ctx;
}
