/**
 * Class name helper — join truthy class fragments.
 * No external dependency.
 */
export function cn(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(' ');
}
