/**
 * narae.js core
 *
 * @author Joseph Lee <development@jc-lab.net>
 * @license
 * Copyright(c) 2020 JC-Lab.
 *
 * Apache License Version 2.0
 */

export interface IHealthChecker {
  name: string;
  required: boolean;
  check: () => Promise<boolean>;
}

export interface IHealthCheckResult {
  name: string;
  required: boolean;
  alive: boolean;
  details?: any;
}

export interface IHealthCheckResponse {
  status: 'UP' | 'DOWN';
  details?: Record<string, IHealthCheckResponse>;
}

/**
 * Usage:
 *  class YourError extends Error implements IHealthCheckError { ... }
 */
export interface IHealthCheckError {
  details?: any;
}
