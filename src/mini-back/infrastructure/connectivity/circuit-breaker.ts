import { connectivityManager } from "./connectivity-manager";

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

class CircuitBreaker {
  private failures = 0;

  private readonly failureThreshold = 3;

  private readonly retryTimeout = 5000;

  private state: CircuitState = "CLOSED";

  private nextAttempt = 0;

  getState() {
    return this.state;
  }

  private open() {
    this.state = "OPEN";
    this.nextAttempt = Date.now() + this.retryTimeout;

    connectivityManager.reportHeartbeat(false);
    // console.log("[CircuitBreaker] OPEN");
  }

  private close() {
    this.failures = 0;
    this.state = "CLOSED";

    connectivityManager.reportHeartbeat(true);

    // console.log("[CircuitBreaker] CLOSED");
  }

  private halfOpen() {
    this.state = "HALF_OPEN";

    // console.log("[CircuitBreaker] HALF_OPEN");
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() > this.nextAttempt) {
        this.halfOpen();
      } else {
        throw new Error("Circuit breaker OPEN");
      }
    }

    try {
      const result = await fn();

      this.close();

      return result;
    } catch (error) {
      this.failures++;

      if (this.failures >= this.failureThreshold) {
        this.open();
      }

      throw error;
    }
  }
}

export const circuitBreaker = new CircuitBreaker();
