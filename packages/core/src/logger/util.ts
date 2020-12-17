export function joinNamespaces(...args: (string | undefined)[]): string {
  return args.reduce((prev: any, cur) => {
    if (prev && cur) {
      return `${prev}.${cur}`;
    } else if (prev) {
      return prev;
    } else if (cur) {
      return cur;
    }
    return undefined;
  }, undefined);
}
