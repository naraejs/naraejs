/**
 * narae.js express module
 *
 * @author Joseph Lee <development@jc-lab.net>
 * @license
 * Copyright(c) 2020 JC-Lab.
 *
 * Apache License Version 2.0
 */

export function joinUrl(a: string, b: string): string {
  const _a = a.endsWith('/') ? a.substring(0, a.length - 1) : a;
  const _b = b.startsWith('/') ? b.substring(1) : b;
  return _a + '/' + _b;
}

export interface IParsedContentType {
  contentType: string;
  attributes: Record<string, string>;
}

const CONTENT_TYPE_REGEX = /^([a-zA-Z0-9+_/-]+)\s*(;(.*))?$/;
export function parseContentType(input: string | undefined): IParsedContentType | undefined {
  const testResult = input && CONTENT_TYPE_REGEX.exec(input);
  if (!testResult) {
    return undefined;
  }
  const attributes: Record<string, string> = testResult && testResult[3] &&
    testResult[3]
      .split(';')
      .map(v => v.trim())
      .reduce((out, cur) => {
        const keyPos = cur.indexOf('=');
        const key = cur.substr(0, keyPos).toLowerCase();
        const value = cur.substr(keyPos + 1);
        out[key] = value;
        return out;
      }, {} as Record<string, string>)
    || {};
  return {
    contentType: testResult[1],
    attributes: attributes
  };
}
