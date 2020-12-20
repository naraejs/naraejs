import { createNamespace } from 'cls-hooked';
export const transactionNamespace = createNamespace('@naraejs/core/transactional');

export const S_SetCurrentTransactionStatus = Symbol();
export const S_AopTransactionBegin = Symbol();
export const S_AopTransactionDone = Symbol();
export const S_TransactionalConnectionProxy = Symbol();
