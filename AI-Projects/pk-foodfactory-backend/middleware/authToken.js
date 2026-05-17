/**
 * Read JWT from Authorization (Bearer) or X-Auth-Token.
 * X-Auth-Token is used when API CloudFront does not forward Authorization to origin.
 */
function extractBearerToken(req) {
  const raw =
    req.headers.authorization ||
    req.headers.Authorization ||
    req.headers['x-auth-token'] ||
    req.headers['X-Auth-Token'];

  if (!raw) return null;

  const value = String(raw).trim();
  if (!value) return null;

  if (value.toLowerCase().startsWith('bearer ')) {
    const token = value.slice(7).trim();
    return token || null;
  }

  // X-Auth-Token may carry the raw JWT without a Bearer prefix
  return value;
}

module.exports = { extractBearerToken };
