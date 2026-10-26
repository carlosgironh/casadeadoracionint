import { useEffect, useState } from 'react';
import { getDeviceState } from './deviceDetector';
import type { DeviceState } from './deviceDetector';
import InstallTutorialScreen from './InstallTutorialScreen';

interface GatekeeperProps {
  children: React.ReactNode;
}

export default function Gatekeeper({ children }: GatekeeperProps) {
  const [deviceState, setDeviceState] = useState<DeviceState | null>(null);

  useEffect(() => {
    const state = getDeviceState();
    setDeviceState(state);

    if (state === 'android') {
      window.location.replace("https://play.google.com/store/apps/details?id=com.casadeadoracionint.lideres&pcampaignid=web_share");
      return;
    }

    if (state === 'desktop') {
      window.location.replace("https://casadeadoracionint.com/");
      return;
    }
  }, []);

  if (!deviceState) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (deviceState === 'android' || deviceState === 'desktop') {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Redirigiendo a tu tienda o sitio oficial...</p>
      </div>
    );
  }

  if (deviceState === 'ios-browser') {
    return <InstallTutorialScreen />;
  }

  // ios-standalone: acceso total
  return <>{children}</>;
}

