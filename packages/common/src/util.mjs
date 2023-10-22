export function freeze(obj) {
  const frozen = Object.assign({}, obj);
  deepFreeze(frozen);
  return frozen;
}

function deepFreeze(obj) {
  if (typeof obj === "object") {
    Object.freeze(obj);
    for (const child of Object.values(obj)) {
      deepFreeze(child);
    }
  }
}
