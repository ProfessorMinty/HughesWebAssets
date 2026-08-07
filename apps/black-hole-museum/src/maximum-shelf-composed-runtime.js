import { mountBlackHoleMuseum as mountMaximumShelfMuseum } from './maximum-shelf-runtime.js';
import { recomposeBlackHoleMuseum, STRUCTURE_VERSION } from './maximum-shelf-structure.js';

export async function mountBlackHoleMuseum(args) {
  await mountMaximumShelfMuseum(args);
  recomposeBlackHoleMuseum(args.mount);

  const shell = args.mount?.querySelector('.bhm-museum');
  if (shell) shell.dataset.structureVersion = STRUCTURE_VERSION;
}
