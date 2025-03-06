import React, { createContext, useContext, useCallback, useState } from 'react';

export type Screen = 
    | { type: 'projects' }
    | { type: 'project-details'; projectId: string }
    | { type: 'milestone-details'; projectId: string; milestoneId: string }
    | { type: 'task-details'; projectId: string; milestoneId: string; taskId: string };

interface NavigationState {
    history: Screen[];
    currentScreen: Screen;
}

interface NavigationContextType {
    currentScreen: Screen;
    navigate: (screen: Screen) => void;
    goBack: () => void;
    canGoBack: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
};

interface NavigationProviderProps {
    children: React.ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
    const [state, setState] = useState<NavigationState>({
        history: [],
        currentScreen: { type: 'projects' }
    });

    const navigate = useCallback((screen: Screen) => {
        setState(prev => ({
            history: [...prev.history, prev.currentScreen],
            currentScreen: screen
        }));
    }, []);

    const goBack = useCallback(() => {
        setState(prev => {
            if (prev.history.length === 0) return prev;

            const newHistory = [...prev.history];
            const lastScreen = newHistory.pop()!;

            return {
                history: newHistory,
                currentScreen: lastScreen
            };
        });
    }, []);

    const value = {
        currentScreen: state.currentScreen,
        navigate,
        goBack,
        canGoBack: state.history.length > 0
    };

    return (
        <NavigationContext.Provider value={value}>
            {children}
        </NavigationContext.Provider>
    );
}; 