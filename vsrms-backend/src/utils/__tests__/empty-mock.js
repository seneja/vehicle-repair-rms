// Functional mock to satisfy library initializations like jwksClient({ ... })
module.exports = function() {
  return {};
};
