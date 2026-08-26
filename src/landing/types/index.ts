export type { AppRoute } from '@landing/constants/routes';
export type { BreakpointName } from '@landing/constants/breakpoints';
export type { FigmaLandingNodeId } from '@landing/constants/figma';
export type { LandingSectionId } from '@landing/features/landing';
export type { RegisteredAsset, AssetKind, AssetFormat, AssetSourceSet } from '@landing/assets';

export interface RouteHandle {
  title?: string;
  figmaNodeId?: string;
}
