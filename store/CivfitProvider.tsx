import React, {
    ReactNode,
    useEffect,
} from "react";

import { AppState } from "react-native";

import { useCivStore } from "@/store";
import { updateLastActive } from "@/services/firebase/activity";

export const CivfitProvider: React.FC<{
    children: ReactNode;
}> = ({ children }) => {

    const uid =
        useCivStore((state) => state.currentUser?.uid);
    useEffect(() => {
        if (!uid) return;

        updateLastActive(uid);

        const subscription =
            AppState.addEventListener(
                "change",
                async (state) => {
                    if (state === "active") {
                        await updateLastActive(uid);
                    }
                }
            );

        return () => subscription.remove();
    }, [uid]);

    return <>{children}</>;
};