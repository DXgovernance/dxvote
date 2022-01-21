export class CacheLoadError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'CacheLoadError';
  }
}
