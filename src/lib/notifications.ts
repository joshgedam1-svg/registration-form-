// Client utility for handling Web Push & Browser Notifications

export async function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    return registration;
  } catch (err) {
    console.error('Failed to register service worker:', err);
    return null;
  }
}

export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await registerServiceWorker();
    }
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'denied';
  }
}

export async function sendLocalPushNotification(
  title: string,
  body: string,
  url: string = '/admin/players'
): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  let permission = Notification.permission;
  if (permission !== 'granted') {
    permission = await requestNotificationPermission();
    if (permission !== 'granted') return false;
  }

  // 1. Try Service Worker showNotification (Real Mobile Drop-Down Notification)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, {
          body,
          icon: '/logo.svg',
          badge: '/logo.svg',
          data: { url },
          tag: 'cal-alert-' + Date.now()
        } as any);
        return true;
      }
    } catch (err) {
      console.warn('SW notification fallback to window.Notification', err);
    }
  }

  // 2. Fallback to standard window Notification
  try {
    const notif = new Notification(title, {
      body,
      icon: '/logo.svg',
      data: { url }
    });
    notif.onclick = () => {
      window.focus();
      window.location.href = url;
    };
    return true;
  } catch (err) {
    console.error('Failed to trigger window Notification:', err);
    return false;
  }
}
