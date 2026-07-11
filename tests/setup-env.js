// Runs before any application module is loaded (jest "setupFiles").
// The app reads configuration through the "config" package, which maps
// environment variables via config/custom-environment-variables.json:
//   csm_jwtPrivateKey -> jwtPrivateKey
//   csm_db            -> db
// Provide test values here so no committed config file needs a secret.
process.env.csm_jwtPrivateKey =
  process.env.csm_jwtPrivateKey || "unit_test_jwt_private_key";
process.env.csm_db = process.env.csm_db || "mongodb://127.0.0.1:27017/unused";

// There is intentionally no config/test.json; silence the config warning.
process.env.SUPPRESS_NO_CONFIG_WARNING = "true";
