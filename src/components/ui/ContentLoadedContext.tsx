'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type ContentLoadedContextType = {
  isContentLoaded: boolean;
  setContentLoaded: (loaded: boolean) => void;
};

const ContentLoadedContext = createContext<ContentLoadedContextType | undefined>(undefined);

export function ContentLoadedProvider({ children }: { children: ReactNode }) {
  const [isContentLoaded, setIsContentLoaded] = useState(false);

  const setContentLoaded = (loaded: boolean) => {
    setIsContentLoaded(loaded);
  };

  return (
    <ContentLoadedContext.Provider value={{ isContentLoaded, setContentLoaded }}>
      {children}
    </ContentLoadedContext.Provider>
  );
}

export function useContentLoaded() {
  const context = useContext(ContentLoadedContext);
  if (context === undefined) {
    throw new Error('useContentLoaded must be used within ContentLoadedProvider');
  }
  return context;
}