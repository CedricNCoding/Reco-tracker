
import { useState, useEffect } from 'react';
import { Bell, X, Ruler, Cookie } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { getAllEntries } from '@/lib/storage';

export default function NotificationBanner() {
  const [show, setShow] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [waistReminder, setWaistReminder] = useState(false);
  const [mercrediSnack, setMercrediSnack] = useState(false);

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission);
      if (Notification.permission === 'default') {
        const shown = sessionStorage.getItem('notif-banner-shown');
        if (!shown) {
          setShow(true);
          sessionStorage.setItem('notif-banner-shown', '1');
        }
      }
    }

    // Check waist reminder (every 15 days)
    checkWaistReminder();

    // Check mercredi snack (Wednesday 17h)
    checkMercrediSnack();

    // Schedule periodic checks
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      scheduleReminders();
    }
  }, []);

  function checkWaistReminder() {
    const entries = getAllEntries();
    const allEntries = Object.values(entries);
    const waistEntries = allEntries.filter((e) => e.waist_cm !== null).sort((a, b) => b.id.localeCompare(a.id));
    if (waistEntries.length === 0) {
      // Never measured — show reminder if user has at least 7 entries
      if (allEntries.length >= 7) setWaistReminder(true);
    } else {
      const lastDate = new Date(waistEntries[0].id + 'T00:00:00');
      const days = differenceInDays(new Date(), lastDate);
      if (days >= 14) setWaistReminder(true);
    }
  }

  function checkMercrediSnack() {
    const now = new Date();
    const isWednesday = now.getDay() === 3;
    const hour = now.getHours();
    // Show between 16h and 18h on Wednesday
    if (isWednesday && hour >= 16 && hour < 18) {
      const dismissed = sessionStorage.getItem('mercredi-snack-dismissed');
      if (!dismissed) setMercrediSnack(true);
    }
  }

  async function requestPermission() {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') scheduleReminders();
    setShow(false);
  }

  return (
    <>
      {/* Notification permission */}
      {show && permission !== 'granted' && (
        <div className="bg-accent-amber/15 rounded-2xl p-4 flex items-start gap-3">
          <Bell size={20} className="text-accent-amber shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Activer les rappels ?</p>
            <p className="text-xs text-text-secondary mt-0.5">
              Rappel matinal check-in, dimanche bilan, mercredi collation.
            </p>
            <button type="button" onClick={requestPermission} className="mt-2 text-xs font-bold text-accent-amber underline">
              Autoriser les notifications
            </button>
          </div>
          <button type="button" onClick={() => setShow(false)} className="text-text-secondary"><X size={16} /></button>
        </div>
      )}

      {/* Waist reminder */}
      {waistReminder && (
        <div className="bg-accent-amber/15 rounded-2xl p-4 flex items-start gap-3">
          <Ruler size={20} className="text-accent-amber shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Tour de taille</p>
            <p className="text-xs text-text-secondary mt-0.5">
              Ca fait plus de 2 semaines — pense a mesurer ton tour de taille aujourd'hui.
            </p>
          </div>
          <button type="button" onClick={() => setWaistReminder(false)} className="text-text-secondary"><X size={16} /></button>
        </div>
      )}

      {/* Mercredi snack */}
      {mercrediSnack && (
        <div className="bg-accent-green/15 rounded-2xl p-4 flex items-start gap-3">
          <Cookie size={20} className="text-accent-green shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Snack avant la piscine</p>
            <p className="text-xs text-text-secondary mt-0.5">
              Banane + shaker whey 60-90 min avant la brasse !
            </p>
          </div>
          <button type="button" onClick={() => { setMercrediSnack(false); sessionStorage.setItem('mercredi-snack-dismissed', '1'); }} className="text-text-secondary"><X size={16} /></button>
        </div>
      )}
    </>
  );
}

function scheduleReminders() {
  const intervalId = setInterval(() => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const day = now.getDay();

    if (hour === 8 && minute === 0) {
      showNotification('Check-in du matin', "N'oublie pas de remplir ton check-in quotidien !");
    }
    if (day === 0 && hour === 20 && minute === 0) {
      showNotification('Bilan hebdomadaire', 'Dimanche soir — genere et copie ton bilan !');
    }
    if (day === 3 && hour === 17 && minute === 0) {
      showNotification('Snack avant la piscine', 'Banane + shaker whey 60-90 min avant la brasse !');
    }
  }, 60000);

  // Cleanup not strictly needed for app lifetime, but good practice
  return () => clearInterval(intervalId);
}

function showNotification(title: string, body: string) {
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/icons/icon-192.png', tag: title });
  }
}
