/**
 * CLEANUP SCRIPT - Gunakan ini dari browser console
 * 
 * 1. Copy semua code di bawah
 * 2. Buka app di browser
 * 3. Open Developer Console (F12)
 * 4. Paste code
 * 5. Tekan Enter
 * 
 * Script ini akan:
 * - Get the Zustand store
 * - Call cleanOutOfBoundBuildings() 
 * - Delete invalid buildings
 * - Restart sync
 */

// Code for browser console:

(async () => {
    try {
        console.log('🏢 CivFit - Cleaning Out-of-Bounds Buildings\n');

        // Import store
        const { useCivStore } = await import('/src/store/appStore.ts');
        const store = useCivStore.getState();

        console.log('📊 Current state:');
        console.log(`  - Buildings: ${store.buildings.length}`);
        console.log(`  - User: ${store.currentUser?.uid || 'Not logged in'}\n`);

        // Call cleanup
        const deleted = await store.cleanOutOfBoundBuildings();

        console.log(`✅ Cleanup complete!`);
        console.log(`  - Deleted: ${deleted} invalid building(s)`);
        console.log(`  - Remaining: ${store.buildings.length} valid building(s)\n`);

        console.log('💡 Tip: App should auto-reload buildings from Firestore now!');
        console.log('   Check the map in 2-3 seconds.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
})();
