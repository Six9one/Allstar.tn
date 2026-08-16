importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
try {
  importScripts('/sw-push.js');
} catch (e) {
  console.log('sw-push import notice:', e);
}
