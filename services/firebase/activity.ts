import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
} from "firebase/firestore";

import { db } from "./index";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function updateLastActive(
    uid: string
) {
    const userRef =
        doc(db, "users", uid);

    const snapshot =
        await getDoc(userRef);

    if (!snapshot.exists()) {
        return;
    }

    const data =
        snapshot.data();

    const lastSync =
        data.lastActivitySyncAt?.toMillis?.() ?? 0;

    const now =
        Date.now();

    if (now - lastSync < DAY_MS) {
        return;
    }

    try {

        await setDoc(
            userRef,
            {
                lastActiveAt: serverTimestamp(),
                lastActivitySyncAt: serverTimestamp(),
            },
            { merge: true }
        );

        console.log(
            "[ACTIVITY] Firestore updated"
        );

    } catch (error) {

        console.error(
            "[ACTIVITY] Firestore error",
            error
        );

    }
}