import HomeClient from './HomeClient';
import { getNotaryProfile } from './lib/notaryProfile';

// Sin esto Next.js pre-renderiza esta página como estática en build time,
// congelando los números de teléfono al momento del build en vez de leerlos
// en vivo del perfil central en cada visita.
export const dynamic = 'force-dynamic';

// Server component: trae en vivo el número del IVR (Twilio) y el número
// personal/directo del notario desde el perfil central, y se los pasa al
// client component. Son dos números distintos — el IVR es el robot de voz,
// el directo es el celular real del notario.
export default async function Page() {
  const profile = await getNotaryProfile().catch(() => null);
  return (
    <HomeClient
      ivrPhone={profile?.twilioPhoneNumber || ''}
      directPhone={profile?.ownerPhone || ''}
    />
  );
}
