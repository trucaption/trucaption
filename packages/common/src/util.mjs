export function freeze(obj) {
  const frozen = Object.assign({}, obj);
  deepFreeze(frozen);
  return frozen;
}

function deepFreeze(obj) {
  if (typeof obj === "object") {
    Object.freeze(obj);
    Object.values(obj).forEach(deepFreeze);
  }
}
