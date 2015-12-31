module.exports = function (obj, msg) {
  if (obj == null) return null;
  if (typeof obj === 'object') return obj;
  try {
    return JSON.parse(obj);
  } catch (e) {
    e.message = msg || e.message;
    throw e;
  }
};