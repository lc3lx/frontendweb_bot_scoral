import pageTransitionUrl from '@assets/audio/page-transition.mpeg';

const VOLUME = 0.1;

let sharedAudio: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement {
  if (!sharedAudio) {
    sharedAudio = new Audio(pageTransitionUrl);
    sharedAudio.preload = 'auto';
  }
  return sharedAudio;
}

/** Play the landing page-transition sound at 10% volume. Safe to call without user gesture (may no-op). */
export function playPageTransitionSound(): void {
  try {
    const audio = getAudio();
    audio.pause();
    audio.currentTime = 0;
    audio.volume = VOLUME;
    void audio.play().catch(() => {
      /* autoplay policies may block until a user gesture */
    });
  } catch {
    /* ignore */
  }
}

export { pageTransitionUrl };
