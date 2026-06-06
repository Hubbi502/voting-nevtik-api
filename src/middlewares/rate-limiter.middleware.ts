import { Request, Response, NextFunction } from "express";

/**
 * Simple in-memory rate limiter without external dependencies.
 * Tracks request counts per IP address using a Map with automatic cleanup.
 * 
 * For production, consider using Redis-based rate limiting.
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export function rateLimiter(options: {
  windowMs: number;    // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;    // Custom error message
}) {
  const { windowMs, maxRequests, message } = options;
  const store = new Map<string, RateLimitEntry>();

  // Cleanup expired entries every minute
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetTime) {
        store.delete(key);
      }
    }
  }, 60_000);

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetTime) {
      // New window
      store.set(key, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    entry.count++;

    if (entry.count > maxRequests) {
      res.status(429).json({
        success: false,
        message: message || "Terlalu banyak request. Silakan coba lagi nanti.",
        data: null,
      });
      return;
    }

    next();
  };
}
