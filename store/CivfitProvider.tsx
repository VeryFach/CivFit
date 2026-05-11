import React, { ReactNode, useEffect } from 'react';
import { useCivStore } from './appStore';

/**
 * CivfitProvider - Context wrapper for Zustand store
 * Initializes the store on app mount
 */
export const CivfitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const initialize = useCivStore((state) => state.initialize);

    useEffect(() => {
        // Initialize store on app mount
        initialize();
    }, [initialize]);

    return <>{children}</>;
};
