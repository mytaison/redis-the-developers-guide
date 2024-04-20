import { randomBytes } from "crypto";
import { client } from "./client";

export const withLock = async (
  key: string,
  cb: (redisClient: Client, signal: any) => any
) => {
  // Initialize few variables to control retry behavior
  const retryDelaysMs = 100;
  let retries = 20;
  // Generate a random value to store at lock key
  const token = randomBytes(6).toString("hex");
  // Create a lock value
  const lockKey = `lock:${key}`;
  // Locking timeout in MS
  const timeoutMs = 2000;
  // Setup a while loop to implement retry behavior
  while (retries >= 0) {
    retries--;

    // Try to do SET NX Operation
    const acquired = await client.set(lockKey, token, { NX: true, PX: 2000 });
    if (!acquired) {
      // Else brief pause and retry operation
      await pause(retryDelaysMs);
      continue;
    }
    // If the set is sucessful, run the callback
    try {
      const signal = { expired: false };
      setTimeout(() => {
        signal.expired = true;
      }, timeoutMs);
      const proxiedClient = buildClientProxy(timeoutMs);
      const result = await cb(proxiedClient, signal);
      return result;
    } finally {
      // Unset the lock key
      await client.del(lockKey);
    }
  }
};

type Client = typeof client;
const buildClientProxy = (timeoutMs: number) => {
  const startTime = Date.now();
  const handler = {
    get(target: Client, prop: keyof Client) {
      if (Date.now() >= startTime + timeoutMs) {
        throw new Error("Lock is expired.");
      }
      const value = target[prop];
      return typeof value === "function" ? value.bind(target) : value;
    },
  };
  return new Proxy(client, handler) as Client;
};

export const pause = (duration: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
};
