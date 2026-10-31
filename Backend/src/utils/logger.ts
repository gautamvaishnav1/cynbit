/* Tiny timestamped logger. Never use console.log directly in the app. */

function timestamp(): string {
  return new Date().toISOString();
}

export const logger = {
  info(message: string): void {
    console.info(`[${timestamp()}] INFO  ${message}`);
  },
  warn(message: string): void {
    console.warn(`[${timestamp()}] WARN  ${message}`);
  },
  error(message: string, detail?: unknown): void {
    const suffix =
      detail instanceof Error
        ? ` — ${detail.message}`
        : detail !== undefined
          ? ` — ${String(detail)}`
          : '';
    console.error(`[${timestamp()}] ERROR ${message}${suffix}`);
  },
};
