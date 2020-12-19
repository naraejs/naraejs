/**
 * narae.js core
 *
 * @author Joseph Lee <development@jc-lab.net>
 * @license
 * Copyright(c) 2020 JC-Lab.
 *
 * Apache License Version 2.0
 */

export interface IConnectionManagerHandler {
  name: string;

  /**
   * If false, the entire health check is not affected even if the health check fails.
   */
  essential: boolean;

  /**
   * If successful, resolve the Promise and return details.
   * If failure, reject the Promise. see {@link IHealthCheckError}
   */
  healthCheck(): Promise<any>;
}
