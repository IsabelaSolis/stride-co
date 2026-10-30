function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
function pick(source, fields) {
  const result = {};
  for (const field of fields) {
    if (source && source[field] !== undefined) result[field] = source[field];
  }
  return result;
}

module.exports = { parseId, pick };