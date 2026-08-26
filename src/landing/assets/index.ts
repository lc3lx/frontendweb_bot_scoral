/**
 * Typed asset registry — Landing / shared.
 * Register only assets exported from Figma MCP.
 * Folders: icons | illustrations | images | backgrounds | logos
 */
export type AssetKind =
  | 'icon'
  | 'illustration'
  | 'image'
  | 'background'
  | 'logo';

export type AssetFormat = 'svg' | 'png' | 'webp' | 'jpg';

export interface AssetSourceSet {
  src: string;
  width: number;
}

export interface RegisteredAsset {
  id: string;
  kind: AssetKind;
  src: string;
  srcSet?: AssetSourceSet[];
  sizes?: string;
  alt: string;
  format: AssetFormat;
  figmaNodeId?: string;
  width?: number;
  height?: number;
  preload?: boolean;
}

export const assetRegistry: Record<string, RegisteredAsset> = {
  // Populated when exporting from Figma (Phase 4+)
};

export function getAsset(id: string): RegisteredAsset | undefined {
  return assetRegistry[id];
}

export function listAssetsByKind(kind: AssetKind): RegisteredAsset[] {
  return Object.values(assetRegistry).filter((asset) => asset.kind === kind);
}

export function registerAsset(asset: RegisteredAsset): void {
  assetRegistry[asset.id] = asset;
}
