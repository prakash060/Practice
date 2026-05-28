const User = require('../models/User');

const LOGIN_METHODS = ['otp', 'password'];

function buildLoginMethodsResponse(user) {
  const availableMethods = ['otp'];
  if (user?.password) availableMethods.push('password');

  const lastLoginMethod =
    user?.lastLoginMethod && availableMethods.includes(user.lastLoginMethod)
      ? user.lastLoginMethod
      : null;

  const suggestedMethod = lastLoginMethod || availableMethods[0];

  return { availableMethods, lastLoginMethod, suggestedMethod };
}

async function recordSuccessfulLogin(userId, method) {
  if (!LOGIN_METHODS.includes(method)) return;
  await User.findByIdAndUpdate(userId, { $set: { lastLoginMethod: method } });
}

module.exports = {
  LOGIN_METHODS,
  buildLoginMethodsResponse,
  recordSuccessfulLogin,
};
