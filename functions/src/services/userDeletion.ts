import * as admin from "firebase-admin";

const db = admin.firestore();

export async function deleteUserData(
    uid: string
) {
    const userRef =
        db.collection("users").doc(uid);

    // Hapus user document + seluruh subcollection
    await db.recursiveDelete(
        userRef
    );

    // Hapus leaderboard jika ada
    await db
        .collection("leaderboard")
        .doc(uid)
        .delete()
        .catch(() => { });
}

export async function deleteUserCompletely(
    uid: string
) {
    await deleteUserData(uid);

    await admin.auth().deleteUser(uid);
}