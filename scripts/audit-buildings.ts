/**
 * AUDIT SCRIPT: Diagnose Invalid Building Coordinates
 * 
 * Purpose: 
 * - Scan Firestore for buildings dengan koordinat invalid (>= GRID_SIZE)
 * - Report detail tentang data yang bermasalah
 * - Option untuk cleanup
 * 
 * Usage:
 * npx ts-node scripts/audit-buildings.ts [--clean] [--uid=YOUR_UID]
 * 
 * Examples:
 * npx ts-node scripts/audit-buildings.ts                          # Audit only
 * npx ts-node scripts/audit-buildings.ts --clean                  # Audit + cleanup semua user
 * npx ts-node scripts/audit-buildings.ts --uid=user123 --clean    # Cleanup specific user
 */

import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Firebase configuration
const serviceAccountPath = path.resolve(__dirname, '../gen-lang-client-0259116762-firebase-adminsdk-fbsvc-7c6ff4504e.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error(`❌ Service account not found at: ${serviceAccountPath}`);
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

try {
    initializeApp({
        credential: cert(serviceAccount)
    });
} catch (e: any) {
    if (!e.message.includes('already initialized')) {
        throw e;
    }
}

const db = getFirestore();
const GRID_SIZE = 10; // Must match core/constants.ts

interface InvalidBuilding {
    userId: string;
    buildingId: string;
    buildingTypeId: string;
    gridX: number;
    gridY: number;
    level: number;
    reason: string;
}

async function auditBuildings(userUid?: string): Promise<InvalidBuilding[]> {
    console.log('🔍 Scanning Firestore for invalid buildings...\n');

    const invalidBuildings: InvalidBuilding[] = [];

    try {
        // Get all users or specific user
        let usersSnapshot;
        if (userUid) {
            const userDoc = await db.collection('users').doc(userUid).get();
            if (!userDoc.exists) {
                console.error(`❌ User not found: ${userUid}`);
                return [];
            }
            usersSnapshot = { docs: [userDoc] };
        } else {
            usersSnapshot = await db.collection('users').get();
        }

        console.log(`📋 Checking ${usersSnapshot.docs.length} user(s)...\n`);

        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            const userData = userDoc.data();

            // Check buildings subcollection
            const buildingsRef = db.collection('users').doc(userId).collection('buildings');
            const buildingsSnapshot = await buildingsRef.get();

            if (buildingsSnapshot.empty) {
                console.log(`  ✅ ${userId}: No buildings`);
                continue;
            }

            console.log(`  📦 ${userId}: ${buildingsSnapshot.docs.length} building(s)`);

            for (const buildingDoc of buildingsSnapshot.docs) {
                const building = buildingDoc.data();
                const gridX = building.gridX;
                const gridY = building.gridY;
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
                    const reason = getInvalidReason(gridX, gridY);
                    invalidBuildings.push({
                        userId,
                        buildingId: buildingDoc.id,
                        buildingTypeId: building.buildingTypeId,
                        gridX,
                        gridY,
                        level: building.level || 1,
                        reason
                    });
                    console.log(
                        `    ⚠️  INVALID: ${buildingDoc.id} (${building.buildingTypeId}) @ [${gridX}, ${gridY}] - ${reason}`
                    );
                } else {
                    console.log(
                        `      ✓ Valid: ${buildingDoc.id} @ [${gridX}, ${gridY}]`
                    );
                }
            }
        }
    } catch (error) {
        console.error('❌ Error during audit:', error);
    }

    return invalidBuildings;
}

function getInvalidReason(gridX: number, gridY: number): string {
    const reasons = [];
    if (typeof gridX !== 'number') reasons.push('gridX is not a number');
    else if (!Number.isInteger(gridX)) reasons.push('gridX is not an integer');
    else if (gridX < 0) reasons.push(`gridX < 0 (${gridX})`);
    else if (gridX >= GRID_SIZE) reasons.push(`gridX >= GRID_SIZE (${gridX} >= ${GRID_SIZE})`);

    if (typeof gridY !== 'number') reasons.push('gridY is not a number');
    else if (!Number.isInteger(gridY)) reasons.push('gridY is not an integer');
    else if (gridY < 0) reasons.push(`gridY < 0 (${gridY})`);
    else if (gridY >= GRID_SIZE) reasons.push(`gridY >= GRID_SIZE (${gridY} >= ${GRID_SIZE})`);

    return reasons.join(', ');
}

async function cleanupInvalidBuildings(invalidBuildings: InvalidBuilding[]): Promise<void> {
    if (invalidBuildings.length === 0) {
        console.log('\n✅ No invalid buildings to cleanup!');
        return;
    }

    console.log(`\n🧹 Preparing to delete ${invalidBuildings.length} invalid building(s)...\n`);

    // Group by user
    const byUser = invalidBuildings.reduce((acc, b) => {
        if (!acc[b.userId]) acc[b.userId] = [];
        acc[b.userId].push(b);
        return acc;
    }, {} as Record<string, InvalidBuilding[]>);

    let totalDeleted = 0;

    for (const [userId, buildings] of Object.entries(byUser)) {
        console.log(`  🗑️  ${userId}: Deleting ${buildings.length} building(s)`);

        const batch = db.batch();

        for (const building of buildings) {
            const buildingRef = db.collection('users').doc(userId).collection('buildings').doc(building.buildingId);
            batch.delete(buildingRef);
            console.log(
                `      - ${building.buildingId} (${building.buildingTypeId} lvl${building.level}) @ [${building.gridX}, ${building.gridY}]`
            );
        }

        await batch.commit();
        totalDeleted += buildings.length;
    }

    console.log(`\n✅ Cleanup complete! Deleted ${totalDeleted} invalid building(s)`);
    console.log('\n💡 Next: Restart app to reload buildings from Firestore');
}

async function main() {
    const args = process.argv.slice(2);
    const shouldClean = args.includes('--clean');
    const uidArg = args.find(arg => arg.startsWith('--uid='));
    const userUid = uidArg ? uidArg.split('=')[1] : undefined;

    console.log('═══════════════════════════════════════════════════════');
    console.log('🏢 CivFit Building Coordinate Audit');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`GRID_SIZE: ${GRID_SIZE} (valid coordinates: 0-${GRID_SIZE - 1})`);
    console.log(`Mode: ${shouldClean ? '🧹 AUDIT + CLEANUP' : '🔍 AUDIT ONLY'}`);
    if (userUid) console.log(`User: ${userUid}`);
    console.log('═══════════════════════════════════════════════════════\n');

    try {
        const invalidBuildings = await auditBuildings(userUid);

        console.log('\n═══════════════════════════════════════════════════════');
        console.log(`📊 SUMMARY`);
        console.log('═══════════════════════════════════════════════════════');
        console.log(`Total invalid buildings found: ${invalidBuildings.length}`);

        if (invalidBuildings.length > 0) {
            console.log('\nInvalid Buildings:');
            invalidBuildings.forEach(b => {
                console.log(`  • ${b.userId}/${b.buildingId}`);
                console.log(`    Type: ${b.buildingTypeId}, Level: ${b.level}`);
                console.log(`    Coords: [${b.gridX}, ${b.gridY}] - ${b.reason}`);
            });

            if (shouldClean) {
                const readline = await import('readline');
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                await new Promise<void>(resolve => {
                    rl.question('\n⚠️  Are you sure you want to delete these buildings? (yes/no): ', async answer => {
                        rl.close();
                        if (answer.toLowerCase() === 'yes') {
                            await cleanupInvalidBuildings(invalidBuildings);
                        } else {
                            console.log('\n❌ Cleanup cancelled');
                        }
                        resolve();
                    });
                });
            } else {
                console.log('\n💡 Run with --clean flag to delete these buildings:');
                console.log(`   npx ts-node scripts/audit-buildings.ts --clean`);
                if (userUid) console.log(`   npx ts-node scripts/audit-buildings.ts --uid=${userUid} --clean`);
            }
        }

        console.log('\n═══════════════════════════════════════════════════════\n');
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }

    process.exit(0);
}

main();
