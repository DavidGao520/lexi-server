import admin from 'firebase-admin';
import webpush from 'web-push';
import mongoose from 'mongoose';
import serviceAccount from './firebase/lexi-admin-sdk.json';
import { mongoDbProvider } from './src/mongoDBProvider';

// ✅ Initialize MongoDB
mongoDbProvider.initialize();

// ✅ Define UserPush model
const userPushSchema = new mongoose.Schema({
  userId: String,
  pushInfo: mongoose.Schema.Types.Mixed, // Compatible with FCM token (string) and iOS PWA subscription (object)
});
const UserPush = mongoDbProvider.getModel('UserPush', userPushSchema);

// ✅ Initialize FCM (Desktop/Android)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
  });
}

// ✅ Configure Web Push (iOS PWA)
const vapidKeys = {
  publicKey: "BPAAFzY5QwnqR9zNx7DclRpkKdDfJMVh-w9j1Sx-Fnn0G6GGVjZISWFxQ7cktdr08SsNmPYTOwbwMu6fqk3L_YQ",
  privateKey: "0LW7BhiRWlZF63OhBSwArtgDHAw7Mmo9DVZaiMw7VTk"
};
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// ✅ Send notification to Desktop/Android
async function sendToDesktopAndroid(token: string) {
  const message = {
    notification: {
      title: 'Lexi AI Notification ✨',
      body: 'Hello from the Cloud!',
    },
    token,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ [FCM] Successfully sent:', response);
  } catch (error) {
    console.error('❌ [FCM] Failed to send:', error);
  }
}

// ✅ Send notification to iOS PWA
async function sendToIOSPWA(subscription: any) {
  try {
    const response = await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: "Lexi Notification Test 📲",
        body: "🎉 You have received a notification!",
      })
    );
    console.log("✅ [WebPush] Successfully sent:", response.statusCode || response);
  } catch (error) {
    console.error("❌ [WebPush] Failed to send:", error);
  }
}

// ✅ Detect and send
async function sendNotification(pushInfo: any) {
  try {
    if (!pushInfo) {
      console.error("❌ [Error] pushInfo is empty");
      return;
    }

    if (typeof pushInfo === "string") {
      console.log("🟢 Detected FCM token");
      await sendToDesktopAndroid(pushInfo);
    } else if (typeof pushInfo === "object" && pushInfo.endpoint) {
      console.log("🔵 Detected iOS PWA subscription");
      await sendToIOSPWA(pushInfo);
    } else {
      console.warn("⚠️ Unknown pushInfo format:", pushInfo);
    }
  } catch (error) {
    console.error("❌ [Error] Failed to send notification:", error);
  }
}

// ✅ Main function: Fetch all users from DB and broadcast
(async () => {
  try {
    const users = await UserPush.find({});
    console.log(`📢 Found ${users.length} users in database`);

    for (const user of users) {
      console.log(`➡️ Sending notification to user: ${user.userId}`);
      await sendNotification(user.pushInfo);
    }

    console.log("✅ Broadcast completed");
    process.exit(0);
  } catch (err) {
    console.error("❌ Broadcast error:", err);
    process.exit(1);
  }
})();
