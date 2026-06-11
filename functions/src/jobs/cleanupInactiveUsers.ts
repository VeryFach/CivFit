import * as admin from "firebase-admin";
import { onSchedule } from "firebase-functions/v2/scheduler";

import {
    deleteUserCompletely,
} from "../services/userDeletion";

export const cleanupInactiveUsers =
    onSchedule(
        {
            schedule: "0 3 * * *",
            timeZone: "Asia/Jakarta",
        },
        async () => {

            const cutoff =
                admin.firestore.Timestamp.fromDate(
                    new Date(
                        Date.now() -
                        90 * 24 * 60 * 60 * 1000
                    )
                );

            const snapshot =
                await admin
                    .firestore()
                    .collection("users")
                    .where(
                        "lastActiveAt",
                        "<",
                        cutoff
                    )
                    .get();

            for (const userDoc of snapshot.docs) {

                try {

                    await deleteUserCompletely(
                        userDoc.id
                    );

                    console.log(
                        `Deleted user ${userDoc.id}`
                    );

                } catch (error) {

                    console.error(
                        `Failed deleting ${userDoc.id}`,
                        error
                    );

                }

            }
        }
    );