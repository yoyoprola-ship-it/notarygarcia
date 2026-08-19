import HomeClient from './HomeClient';
import { getNotaryProfile } from './lib/notaryProfile';
import { trackVisit } from './lib/trackVisit';
import { adminDb } from './lib/firebaseAdmin';
import { isOpenNow } from './lib/timeSlots';
import type { WorkingHours } from './types';

// Sin esto Next.js pre-renderiza esta página como estática en build time,
// congelando los números de teléfono al momento del build en vez de leerlos
// en vivo del perfil central en cada visita.
export const dynamic = 'force-dynamic';

// Server component: trae en vivo el número del IVR (Twilio) y el número
// personal/directo del notario desde el perfil central, y se los pasa al
// client component. Son dos números distintos — el IVR es el robot de voz,
// el directo es el celular real del notario. También calcula en el server
// si el notario está dentro de horario ahora mismo, para el botón de
// servicio urgente (no tiene sentido ofrecerlo fuera de horario).
export default async function Page() {
  void trackVisit();
  const profile = await getNotaryProfile().catch(() => null);
  const cfgSnap = await adminDb.doc('notarygarcia_config/hours').get().catch(() => null);
  const cfg = cfgSnap?.exists ? (cfgSnap.data() as WorkingHours) : null;
  return (
    <HomeClient
      ivrPhone={profile?.twilioPhoneNumber || ''}
      directPhone={profile?.ownerPhone || ''}
      isOpenNow={isOpenNow(cfg)}
    />
  );
}
