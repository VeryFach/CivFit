/**
 * DELETE INVALID BUILDINGS - Web Client Script
 * 
 * Jalankan ini di browser console saat app sudah login
 * Akan delete semua building dengan koordinat invalid
 * 
 * Steps:
 * 1. Login ke app
 * 2. Buka F12 → Console tab
 * 3. Copy paste script ini
 * 4. Tekan Enter
 */

(async () => {
    try {
        console.log('🏢 CivFit - Delete Invalid Buildings (Web Client)');
        console.log('═══════════════════════════════════════════════════════\n');

        // Import Firebase modules dari app
        const { useCivStore } = await import('/src/store/appStore.ts');
        const { db } = await import('/src/services/firebase/index.ts');
        const { collection, getDocs, deleteDoc, doc } = await import('firebase/firestore');

        // Get current user dari store
        const store = useCivStore.getState();
        const userId = store.currentUser?.uid;

        if (!userId) {
            console.error('❌ No user logged in. Please login first.');
            return;
        }

        console.log(`👤 Logged in user: ${userId}\n`);
        console.log('🔍 Scanning buildings...\n');

        const GRID_SIZE = 10;
        let invalidCount = 0;
        let validCount = 0;

        // Get all buildings
        const buildingsRef = collection(db, 'users', userId, 'buildings');
        const buildingsSnapshot = await getDocs(buildingsRef);

        console.log(`📦 Found ${buildingsSnapshot.docs.length} building(s):\n`);

        // Check each building
        const toDelete = [];

        for (const buildingDoc of buildingsSnapshot.docs) {
            const building = buildingDoc.data();
            const gridX = building.gridX;
            const gridY = building.gridY;
            const buildingTypeId = building.buildingTypeId;
            const level = building.level || 1;

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
                console.log(
                    `  ⚠️  INVALID: ${buildingDoc.id} (${buildingTypeId} lvl${level}) @ [${gridX}, ${gridY}]`
                );
                toDelete.push({ id: buildingDoc.id, gridX, gridY, buildingTypeId, level });
                invalidCount++;
            } else {
                console.log(
                    `  ✅ Valid: ${buildingDoc.id} (${buildingTypeId} lvl${level}) @ [${gridX}, ${gridY}]`
                );
                validCount++;
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`  - Valid buildings: ${validCount}`);
        console.log(`  - Invalid buildings: ${invalidCount}\n`);

        if (invalidCount === 0) {
            console.log('✨ All buildings are valid! No deletion needed.\n');
            return;
        }

        // Confirm deletion
        const confirmed = window.confirm(
            `Delete ${invalidCount} invalid building(s)? This action cannot be undone.`
        );

        if (!confirmed) {
            console.log('❌ Deletion cancelled.\n');
            return;
        }

        console.log(`🗑️  Deleting ${invalidCount} invalid building(s)...\n`);

        // Delete invalid buildings
        for (const building of toDelete) {
            try {
                const ref = doc(db, 'users', userId, 'buildings', building.id);
                await deleteDoc(ref);
                console.log(
                    `  ✓ Deleted: ${building.id} (${building.buildingTypeId}) @ [${building.gridX}, ${building.gridY}]`
                );
            } catch (error) {
                console.error(
                    `  ✗ Failed to delete ${building.id}:`,
                    error.message
                );
            }
        }

        console.log(`\n✅ Cleanup complete!`);
        console.log(`   Deleted: ${invalidCount} building(s)`);
        console.log(`   Remaining: ${validCount} building(s)\n`);
        console.log('💡 The app should auto-reload buildings now.');
        console.log('   If not, refresh the page (F5).\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    }
})();
