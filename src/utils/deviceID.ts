// src/utils/useDeviceId.ts
import { useEffect, useState } from 'react';

import FingerprintJS from '@fingerprintjs/fingerprintjs';

const DEVICE_KEY = '__admin_device_id__';

export function useDeviceId() {
  const [deviceId, setDeviceId] = useState<string>(() => localStorage.getItem(DEVICE_KEY) || '');

  useEffect(() => {
    if (deviceId) return; // 已有缓存，直接返回

    FingerprintJS.load()
      .then((fp) => fp.get())
      .then((result) => {
        const id = result.visitorId;
        localStorage.setItem(DEVICE_KEY, id);
        setDeviceId(id);
      });
  }, [deviceId]);

  return deviceId;
}
