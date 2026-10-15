/**
 * Capabilities a host (Connect or the Android app) can offer the shared UI.
 * Every member is optional: the UI degrades gracefully when one is missing.
 */
export interface HostCapabilities {
  /** Schedule a loud alarm notification for the end of a safety check; `exact: false` means it may ring late. */
  scheduleSafetyAlarm?: (checkId: string, at: Date, contactName: string | null) => Promise<{ exact: boolean } | void>;
  cancelSafetyAlarm?: (checkId: string) => Promise<void>;
  /** Open the SMS composer prefilled for a contact (the user still taps send). */
  composeMessage?: (phone: string, body: string) => void;
  /** Current position, foreground only. */
  currentPosition?: () => Promise<{ lat: number; lng: number } | null>;
  /** Minutes today in the user's chosen apps; null when usage access isn't granted. */
  screenTimeToday?: () => Promise<number | null>;
  requestUsageAccess?: () => Promise<void>;
  /** Share plain text through the system share sheet. */
  shareText?: (title: string, text: string) => Promise<void>;
  /** Fetch a meeting feed (code4recovery JSON) without CORS limits. */
  fetchJson?: (url: string) => Promise<unknown>;
  /** Device-only privacy controls. */
  privacy?: {
    pinEnabled: boolean;
    setPin: (pin: string | null) => Promise<void>;
    disguisedIcon: boolean;
    setDisguisedIcon: (on: boolean) => Promise<void>;
  };
}
