/**
 * setAdminRole
 *
 * Callable function to create/update admin accounts.
 * Only super_admin can call this function.
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const logger = functions.logger;
const db = admin.firestore();

interface SetAdminRoleData {
  targetUid: string;
  email: string;
  name: string;
  role: "admin" | "super_admin";
}

export const setAdminRole = functions
  .region("asia-south1")
  .https.onCall(async (data: SetAdminRoleData, context) => {
    // Verify caller is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be authenticated to call this function"
      );
    }

    // Verify caller is super_admin
    const callerRole = context.auth.token.role;
    if (callerRole !== "super_admin") {
      logger.warn(
        `Unauthorized admin creation attempt by ${context.auth.uid} (role: ${callerRole})`
      );
      throw new functions.https.HttpsError(
        "permission-denied",
        "Only super admins can create admin accounts"
      );
    }

    // Validate input
    const { targetUid, email, name, role } = data;

    if (!targetUid || !email || !name || !role) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields: targetUid, email, name, role"
      );
    }

    if (!["admin", "super_admin"].includes(role)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Role must be 'admin' or 'super_admin'"
      );
    }

    logger.info(
      `Setting admin role: ${targetUid} as ${role} by ${context.auth.uid}`
    );

    try {
      // Set custom claims
      await admin.auth().setCustomUserClaims(targetUid, { role });

      // Create/update admin document in Firestore
      await db.collection("admins").doc(targetUid).set(
        {
          email,
          name,
          role,
          createdBy: context.auth.uid,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          isActive: true,
        },
        { merge: true }
      );

      // Log to audit trail
      await db.collection("auditLogs").add({
        action: "ADMIN_ROLE_SET",
        targetUid,
        role,
        performedBy: context.auth.uid,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      logger.info(`Admin role set successfully: ${targetUid} as ${role}`);

      return {
        success: true,
        message: `User ${targetUid} is now ${role}`,
      };
    } catch (error) {
      logger.error(`Error setting admin role for ${targetUid}:`, error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to set admin role"
      );
    }
  });
