import { mountBlackHoleMuseum as mountBaseBlackHoleMuseum } from 'https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets@169ac410ae30d4b90d30aa148b49bc480d43f95b/apps/black-hole-museum/src/v2/renderer.js';
import { stabilizeBlackHoleV2 } from 'https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets@169ac410ae30d4b90d30aa148b49bc480d43f95b/apps/black-hole-museum/src/v2/stabilization.js';

export async function mountBlackHoleMuseum(args) {
  await mountBaseBlackHoleMuseum(args);
  const target = args.root || args.mount;
  if (!target) return;

  const previousDestroy = target.__bhv2Destroy;
  let stopStabilization = () => {};
  try {
    stopStabilization = stabilizeBlackHoleV2(target);
  } catch (error) {
    console.warn('[HRV BHM V2] Noncritical stabilization helper failed.', error);
  }

  target.__bhv2Destroy = () => {
    try { stopStabilization(); }
    finally { previousDestroy?.(); }
  };
}
