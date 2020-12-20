/**
 * narae.js core
 *
 * @author Joseph Lee <development@jc-lab.net>
 * @license
 * Copyright(c) 2020 JC-Lab.
 *
 * Apache License Version 2.0
 */

export interface ITransactionData {}

export interface ITransactionalConnection {
  /**
   * Unique Connection Id
   */
  getConnectionId(): any;

  /**
   * Begin Transaction
   */
  doBegin(): Promise<void>;

  /**
   * Commit
   */
  doCommit(): Promise<void>;

  /**
   * Rollback
   */
  doRollback(): Promise<void>;

  /**
   * Optional transaction data
   */
  getTransactionData?(): ITransactionData;
}

export interface IConnectionManagerHandler<TConnection = never> {
  name: string;

  /**
   * If false, the entire health check is not affected even if the health check fails.
   */
  essential: boolean;

  /**
   * If true, transactions are automatically processed when Transactional Annotation is set.
   */
  transactional?: boolean;

  /**
   * If successful, resolve the Promise and return details.
   * If failure, reject the Promise. see {@link IHealthCheckError}
   */
  healthCheck(): Promise<any>;

  /**
   * TransactionalConnection
   *
   * If transactional is set, must implement {@link ITransactionalConnection}
   */
  getConnection?(): Promise<TConnection>;
}
