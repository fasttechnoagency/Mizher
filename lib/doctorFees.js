// Shared helpers to compute a doctor's per-service consultation fees and
// which consultation types are active, based on settings saved in DoctorServicesTab.

const FEE_KEYS = { message: 'fee_message', voice: 'fee_voice', video: 'fee_video' };
const ACTIVE_KEYS = { message: 'active_message', voice: 'active_voice', video: 'active_video' };
// Each service falls back to its own independent default — never derived from another service's price.
const DEFAULT_FEES = { message: 15, voice: 20, video: 25 };

export function getDoctorFee(doctor, consultType) {
  if (!doctor) return DEFAULT_FEES[consultType] ?? 0;
  const feeKey = FEE_KEYS[consultType];
  const fee = doctor[feeKey];
  if (fee !== undefined && fee !== null && fee !== '') return fee;
  return DEFAULT_FEES[consultType] ?? 0;
}

export function isConsultTypeActive(doctor, consultType) {
  if (!doctor) return true;
  const activeKey = ACTIVE_KEYS[consultType];
  return doctor[activeKey] !== false;
}

export function getActiveConsultTypes(doctor) {
  return ['message', 'voice', 'video'].filter(t => isConsultTypeActive(doctor, t));
}