"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
    // Check if already initialized
    if ((0, app_1.getApps)().length > 0) {
        return (0, firestore_1.getFirestore)((0, app_1.getApps)()[0]);
    }
    // Validate required environment variables
    const requiredEnvVars = [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_PRIVATE_KEY',
    ];
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            throw new Error(`${envVar} environment variable is required for Firebase Admin SDK`);
        }
    }
    try {
        // Initialize with service account credentials
        const adminApp = (0, app_1.initializeApp)({
            credential: (0, app_1.cert)({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
            projectId: process.env.FIREBASE_PROJECT_ID,
        });
        const adminDb = (0, firestore_1.getFirestore)(adminApp);
        return adminDb;
    }
    catch (error) {
        console.error('❌ Failed to initialize Firebase Admin SDK:', error);
        throw error;
    }
};
// Export the admin database instance
exports.db = initializeFirebaseAdmin();
//# sourceMappingURL=firebase-admin.js.map