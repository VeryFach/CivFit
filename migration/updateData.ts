import * as admin from "firebase-admin";

import {
    getFirestore,
} from "firebase-admin/firestore";

const serviceAccount =
    require(
        "../gen-lang-client-0259116762-firebase-adminsdk-fbsvc-7c6ff4504e.json"
    );

const app =
    admin.initializeApp({

        credential:
            admin.credential.cert(
                serviceAccount
            ),

        projectId:
            serviceAccount.project_id,
    });

const db =
    getFirestore(
        app,
        "ai-studio-31c6953d-abfc-4895-b893-d7d3cc27aff2"
    );

async function migrateBuildings() {

    const usersSnap =
        await db
            .collection("users")
            .get();

    console.log(
        `Found ${usersSnap.size} users`
    );

    for (const userDoc of usersSnap.docs) {

        const data =
            userDoc.data();

        console.log(
            JSON.stringify(data, null, 2)
        );

        console.log(
            `Processing ${userDoc.id}`
        );

        // VALIDASI
        if (
            !Array.isArray(
                data.city?.buildings
            )
        )  {

            console.log(
                "No buildings array"
            );

            continue;
        }

        console.log(
            `Found ${data.city.buildings.length} buildings`
        );

        // MIGRATE BUILDINGS
        for (const b of data.city.buildings) {

            if (
                b.gridX === undefined ||
                b.gridY === undefined
            ) {

                console.log(
                    "Skipping invalid building"
                );

                continue;
            }

            const buildingId =
                `${b.gridX}_${b.gridY}`;

            console.log(
                `Creating ${buildingId}`
            );

            await db
                .collection("users")
                .doc(userDoc.id)
                .collection("buildings")
                .doc(buildingId)
                .set({

                    buildingTypeId:
                        b.buildingTypeId,

                    gridX:
                        b.gridX,

                    gridY:
                        b.gridY,

                    level:
                        b.level ?? 1,

                    health:
                        b.health ?? 100,

                    createdAt:
                        b.createdAt ??
                        new Date().toISOString(),
                });
        }

        // DELETE OLD ARRAY
        await db
            .collection("users")
            .doc(userDoc.id)
            .update({

                "city.buildings":
                    admin.firestore
                        .FieldValue
                        .delete(),
            });

        console.log(
            `Deleted old buildings array`
        );
    }

    console.log(
        "Buildings migration complete"
    );
}

migrateBuildings()
    .then(() => {

        console.log("DONE");

        process.exit(0);
    })
    .catch((err) => {

        console.error(err);

        process.exit(1);
    });