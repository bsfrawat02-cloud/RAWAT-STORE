/**
 * Browser Push & In-App Notification Manager
 */

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch {
    return false;
  }
}

export function sendBrowserPushNotification(title: string, options?: {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
}) {
  if (!isNotificationSupported()) return;

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: options?.icon || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&q=80',
        badge: options?.badge || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&q=80',
        body: options?.body || 'RAWAT Card Store update received.',
        tag: options?.tag || `rawat-store-alert-${Date.now()}`,
        silent: false,
        ...options,
      });
    } catch (err) {
      console.warn('[Push Notification Error]', err);
    }
  }
}
