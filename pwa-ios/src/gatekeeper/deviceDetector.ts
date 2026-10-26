export type DeviceState = 'android' | 'desktop' | 'ios-browser' | 'ios-standalone';

export function getDeviceState(): DeviceState {
  // Soporte para pruebas en desarrollo con parámetro URL ?preview=
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const preview = params.get('preview');
    if (preview === 'standalone') return 'ios-standalone';
    if (preview === 'browser') return 'ios-browser';
    if (preview === 'android') return 'android';
    if (preview === 'desktop') return 'desktop';
  }

  const ua = (typeof navigator !== 'undefined' ? (navigator.userAgent || navigator.vendor || (window as any).opera) : '') || '';
  const isAndroid = /android/i.test(ua);
  
  // Detección iOS: iPhone, iPod, iPad y también iPadOS en procesadores Apple Silicon (M1/M2/M3)
  const isIOS = /iPad|iPhone|iPod/.test(ua) || 
                (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (isAndroid) {
    return 'android';
  }

  if (!isIOS) {
    return 'desktop';
  }

  // Comprobar si está corriendo como PWA instalada en iOS
  const isStandalone = (typeof window !== 'undefined' && ((window.navigator as any).standalone === true)) || 
                       (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);

  return isStandalone ? 'ios-standalone' : 'ios-browser';
}
