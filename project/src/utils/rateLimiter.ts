export class RateLimiter {
  private tokens: number;
  private maxTokens: number;
  private tokenRefillRate: number;
  private lastRefill: number;

  constructor({ maxRequests, perMinute }: { maxRequests: number; perMinute: number }) {
    this.tokens = maxRequests;
    this.maxTokens = maxRequests;
    this.tokenRefillRate = maxRequests / perMinute;
    this.lastRefill = Date.now();
  }

  private refillTokens() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const refill = (timePassed / 1000) * this.tokenRefillRate;
    
    this.tokens = Math.min(this.maxTokens, this.tokens + refill);
    this.lastRefill = now;
  }

  async waitForToken(): Promise<void> {
    this.refillTokens();

    if (this.tokens < 1) {
      const waitTime = (1 / this.tokenRefillRate) * 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.waitForToken();
    }

    this.tokens -= 1;
  }
}