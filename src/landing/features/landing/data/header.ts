import logoUrl from '@landing/assets/logos/scar-alpha-logo.png';
import { registerAsset } from '@landing/assets';

registerAsset({
  id: 'logo-scar-alpha',
  kind: 'logo',
  src: logoUrl,
  alt: 'Scar Alpha AI',
  format: 'png',
  figmaNodeId: '56:8085',
  width: 401,
  height: 122,
});

export { logoUrl as scarAlphaLogo };
