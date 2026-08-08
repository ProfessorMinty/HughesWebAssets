import { mountBlackHoleMuseum as mountBaseBlackHoleMuseum } from 'https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets@6765a4c8ec7c6fdf2ef5e9abd7b65dc30da4ca85/apps/black-hole-museum/src/v2/renderer.js';
import { stabilizeBlackHoleV2 } from 'https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets@6765a4c8ec7c6fdf2ef5e9abd7b65dc30da4ca85/apps/black-hole-museum/src/v2/stabilization.js';

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
