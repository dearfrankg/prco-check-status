const fs = require("fs");
const path = require("path");
const parseArgs = require("minimist");
const validator = require("validator");

const usage = () => {
  const message = `USAGE:

        prco-check-status [options] requests...

        OPTIONS:

            -c, --config_env_file   location of file containing environment variables
                                    defaults to $HOME/protected/check-status-env
            -h, --help              display usage help
            -e, --environment       environment to use: test or production -- defaults to test
            -s, --server            server to call: wis or oneguard

        REQUESTS:

            request-id,path-to-download

        EXAMPLES:

            prco-check-status -h

            prco-check-status -e production -s wis 758317,/a/b 876321,/q/a

            prco-check-status --environment test --server oneguard 758317,/a/b 876321,/q/a


  `;

  return message;
};

const throwError = (reason) => {
  throw {
    errorMessage: `\n${reason}\n\n` + usage(),
    error: new Error("Error in get-options"),
  };
};

const validatedEnv = async () => {
  const envVars = [
    "wis_credentials",
    "wis_test_url",
    "wis_prod_url",
    "wis_report_folder",
    "oneguard_credentials",
    "oneguard_test_url",
    "oneguard_prod_url",
    "oneguard_report_folder",
  ];

  const validEnvVars = {};
  let reason = "";
  envVars.forEach((envVar) => {
    if (process.env[envVar] === undefined) {
      reason += `Invalid env variable: ${envVar}\n`;
    } else {
      validEnvVars[envVar] = process.env[envVar];
    }
  });

  if (reason) throwError(reason);

  // expend credentials
  const [wis_username, wis_password] = validEnvVars.wis_credentials.toString().split(",");
  if (!wis_username || !wis_password) throwError("Invalid formatting of wis credentials");
  validEnvVars.wis_username = wis_username;
  validEnvVars.wis_password = wis_password;

  const [oneguard_username, oneguard_password] = process.env.oneguard_credentials
    .toString()
    .split(",");
  if (!oneguard_username || !oneguard_password)
    throwError("Invalid formatting of oneguard credentials");
  validEnvVars.oneguard_username = oneguard_username;
  validEnvVars.oneguard_password = oneguard_password;

  ["wis_username", "wis_password", "oneguard_username", "oneguard_password"].forEach((envVar) => {
    if (validEnvVars[envVar] === undefined) {
      reason += `Invalid env variable: ${envVar}\n`;
    }
  });

  if (reason) throwError(reason);

  return validEnvVars;
};

const validRequests = async (requests) => {
  let reason = "";

  const result = requests.map((request) => {
    let [requestId, folderPath] = request.toString().split(",");
    if (!requestId || !folderPath) {
      throwError("Invalid request");
    }

    if (!validator.isNumeric(requestId)) {
      reason += `invalid requestId: non-numeric: ${requestId}`;
    }

    folderPath = path.normalize(folderPath);
    const containsTrailingSlash = /.*\/$/.test(folderPath);
    if (containsTrailingSlash) {
      folderPath.substr(0, -1);
    }

    return { requestId, folderPath };
  });

  if (reason) throwError(reason);

  return result;
};

const getFilteredObject = (obj, allowedList) =>
  Object.fromEntries(Object.entries(obj).filter(([key]) => allowedList.includes(key)));

const validatedOptions = async () => {
  var options = parseArgs(process.argv.slice(2), {
    string: ["config_env_file", "environment", "server", "requests", "help"],
    alias: { config_env_file: "c", environment: "e", server: "s", requests: "r", help: "h" },
    default: { environment: "test" },
  });

  const config_env_file =
    options.config_env_file || path.join(process.env.HOME, "protected", "prco-check-status-env");

  if (!fs.existsSync(config_env_file)) throwError(`Missing env file: ${config_env_file}`);

  require("dotenv").config({ path: config_env_file });

  const envVars = await validatedEnv();
  if (options.server === "wis") {
    options.username = envVars.wis_username;
    options.password = envVars.wis_password;
    options.reportFolder = envVars.wis_report_folder;
    options.url = options.environment === "test" ? envVars.wis_test_url : envVars.wis_prod_url;
  } else {
    options.username = envVars.oneguard_username;
    options.password = envVars.oneguard_password;
    options.reportFolder = envVars.oneguard_report_folder;
    options.url =
      options.environment === "test" ? envVars.oneguard_test_url : envVars.oneguard_prod_url;
  }

  let reason = "";

  if (options.h !== undefined) throwError("");

  if (options.environment !== "test" && options.environment !== "production") {
    reason += "Invalid environment: choose test or production.\n";
  }

  if (options.server !== "wis" && options.server !== "oneguard") {
    reason += "Invalid server: choose wis or oneguard.\n";
  }

  if (!options._ || !options._.length) {
    reason += "Invalid requests: no request entered.\n";
  }

  if (reason) throwError(reason);

  options.requests = await validRequests(options._);

  const result = getFilteredObject(options, [
    "server",
    "environment",
    "username",
    "password",
    "url",
    "reportFolder",
    "requests",
  ]);

  return result;
};

const getOptions = () => validatedOptions();

module.exports = {
  getOptions,
};
