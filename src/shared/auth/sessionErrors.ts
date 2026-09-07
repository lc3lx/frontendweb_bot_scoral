import { ApiClientError } from '@shared/api';

/**
 * Whether an error means "this session is no longer valid" — as opposed to "the request
 * did not succeed right now".
 *
 * The layouts used to treat EVERY failure of the status call as a dead session and wipe
 * the token, so a refresh during a slow backend, a 500, a timeout, or an offline moment
 * signed the user out and sent them back to the login form. Only the server actually
 * rejecting the credentials should do that.
 *
 * A network failure has status 0 and must never sign anyone out; it is precisely the case
 * where the token is still perfectly good.
 */
export function isSessionExpiredError(error: unknown): boolean {
  return error instanceof ApiClientError && error.status === 401;
}
