/**
 * DELETE INVALID BUILDINGS - Direct Firestore Script
 * 
 * Sekarang saya akan delete building dengan gridY >= 10
 * Tidak perlu admin SDK - kita pakai Firebase client library yang sudah ada
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load service account
const serviceAccountPath = path.join(__dirname, '../gen-lang-client-0259116762-firebase-adminsdk-fbsvc-7c6ff4504e.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ Service account file not found:', serviceAccountPath);
    process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'gen-lang-client-0259116762'
});

const db = admin.firestore();
const GRID_SIZE = 10;

async function deleteInvalidBuildings() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🏢 CivFit - Delete Invalid Buildings');
    console.log('═══════════════════════════════════════════════════════\n');

    try {
        // Get all users
        const usersSnapshot = await db.collection('users').get();

        if (usersSnapshot.empty) {
            console.log('❌ No users found');
            process.exit(0);
        }

        console.log(`📋 Found ${usersSnapshot.docs.length} user(s)\n`);

        let totalDeleted = 0;

        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            console.log(`👤 User: ${userId}`);

            // Get buildings for this user
            const buildingsSnapshot = await db
                .collection('users')
                .doc(userId)
                .collection('buildings')
                .get();

            if (buildingsSnapshot.empty) {
                console.log('   No buildings\n');
                continue;
            }

            console.log(`   Found ${buildingsSnapshot.docs.length} building(s):`);

            const toDelete = [];

            for (const buildingDoc of buildingsSnapshot.docs) {
                const building = buildingDoc.data();
                const gridX = building.gridX;
                const gridY = building.gridY;
                const buildingTypeId = building.buildingTypeId;

                const isValid =
                    typeof gridX === 'number' &&
                    typeof gridY === 'number' &&
                    Number.isInteger(gridX) &&
                    Number.isInteger(gridY) &&
                    gridX >= 0 &&
                    gridX < GRID_SIZE &&
                    gridY >= 0 &&
                    gridY < GRID_SIZE;

                if (!isValid) {
                    console.log(`   ⚠️  INVALID: ${buildingDoc.id} (${buildingTypeId}) @ [${gridX}, ${gridY}]`);
                    toDelete.push(buildingDoc.id);
                } else {
                    console.log(`   ✅ Valid: ${buildingDoc.id} (${buildingTypeId}) @ [${gridX}, ${gridY}]`);
                }
            }

            // Delete invalid buildings
            if (toDelete.length > 0) {
                console.log(`\n   🗑️  Deleting ${toDelete.length} invalid building(s)...`);

                for (const buildingId of toDelete) {
                    await db
                        .collection('users')
                        .doc(userId)
                        .collection('buildings')
                        .doc(buildingId)
                        .delete();
                    console.log(`      ✓ Deleted: ${buildingId}`);
                    totalDeleted++;
                }
            }

            console.log('');
        }

        console.log('═══════════════════════════════════════════════════════');
        console.log(`✅ COMPLETE`);
        console.log(`Total invalid buildings deleted: ${totalDeleted}`);
        console.log('═══════════════════════════════════════════════════════\n');

        if (totalDeleted > 0) {
            console.log('💡 Restart your app to see the changes!');
            console.log('   Buildings should now appear on the map.\n');
        } else {
            console.log('✨ All buildings are valid! No deletions needed.\n');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }

    process.exit(0);
}

deleteInvalidBuildings();
