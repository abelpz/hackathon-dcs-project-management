import React, { createContext, useContext, useState } from 'react';

// Define all possible screens in the application
export type Screen = {
  id: string;
  name: 'projects' | 'projectDetails' | 'createProject';
  params?: Record<string, string>;
};

interface NavigationContextType {
  currentScreen: Screen;
  navigationHistory: Screen[];
  navigateTo: (screen: Screen) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [navigationHistory, setNavigationHistory] = useState<Screen[]>([
    { id: 'initial', name: 'projects' }
  ]);

  const navigateTo = (screen: Screen) => {
    setNavigationHistory(prev => [...prev, screen]);
  };

  const goBack = () => {
    setNavigationHistory(prev => {
      if (prev.length <= 1) return prev;
      return prev.slice(0, -1);
    });
  };

  const value = {
    currentScreen: navigationHistory[navigationHistory.length - 1],
    navigationHistory,
    navigateTo,
    goBack
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
} 