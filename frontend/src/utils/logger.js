/**
 * Dev-only logger that redacts secrets from console output.
 */
const SECRET_PATTERN =
  /(password|passwd|pwd|api[_-]?key|authorization|bearer\s+[^\s]+|gsk_[A-Za-z0-9_-]+|token)/gi;

function redactValue(value) {
  if (value == null) return value;
  if (typeof value === 'string') {
    return value.replace(SECRET_PATTERN, '[REDACTED]');
  }
  if (value instanceof Error) {
    return new Error(redactValue(value.message));
  }
  if (Array.isArray(value)) return value.map(redactValue);
  if (typeof value === 'object') {
    try {
      return JSON.parse(redactValue(JSON.stringify(value)));
    } catch {
      return '[Object]';
    }
  }
  return value;
}

function emit(method, args) {
  if (!import.meta.env.DEV && method !== 'error') return;
  // Always allow error in prod but redacted
  // eslint-disable-next-line no-console
  console[method](...args.map(redactValue));
}

export const logger = {
  debug: (...args) => emit('debug', args),
  info: (...args) => emit('info', args),
  warn: (...args) => emit('warn', args),
  error: (...args) => emit('error', args),
};
