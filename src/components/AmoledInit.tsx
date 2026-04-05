'use client';

import { useEffect } from 'react';

export default function AmoledInit() {
  useEffect(() => {
    const amoled = localStorage.getItem('recomp-amoled') === 'true';
    if (amoled) {
      document.documentElement.style.setProperty('--bg-primary', '#000000');
      document.body.style.background = '#000000';
    }
  }, []);
  return null;
}
