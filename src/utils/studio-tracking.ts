import { trackEvent } from './tracking';
export function trackStudioEvent(name: string, params: Record<string, unknown> = {}) {
 try {
  const choice = JSON.parse(localStorage.getItem('strategicSlothPrivacyV1') || 'null');
  if (!choice?.analytics || !Number.isFinite(choice.updated) || choice.updated > Date.now() || Date.now() - choice.updated >= 180 * 24 * 60 * 60 * 1000) return;
  trackEvent(name, params);
 } catch { /* Tracking never interrupts the enquiry. */ }
}
