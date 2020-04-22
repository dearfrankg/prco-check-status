const parseArgs = require("minimist");
const validator = require("validator");
const path = require("path");
require("dotenv").config();

const usage = () => {
  const message = `USAGE:

  prco-check-status [options] requests...

  options:

      -e, --environment   environment to use: test or production -- defaults to test
      -s, --server        server to call: wis or oneguard
      -h, --help          show this usage text

  requests:

      request-id,path-to-download

  examples:

      prco-check-status -h

      prco-check-status -e production -s wis 768123/a/b 876321,/q/a

      prco-check-status --environment test --server oneguard 768123/a/b 876321,/q/a

  `;
  console.log(message);
};

const abortScript = (reason) => {
  console.log(`\n${reason}`);
  usage();
  process.exit(0);
};

const validRequests = (requests) => {
  const result = requests.map((request) => {
    let [requestId, folderPath] = request.split(",");
    if (!validator.isNumeric(requestId)) {
      throw new Error("invalid format: requestId");
    }

    folderPath = path.normalize(folderPath);
    const containsSpaces = /.*\s.*/.test(folderPath);
    const containsTrailingSlash = /.*\/$/.test(folderPath);
    if (containsSpaces || containsTrailingSlash) {
      throw new Error("invalid format: folderPath");
    }

    return { requestId, folderPath };
  });

  return result;
};

const validateEnv = (options) => {
  let reason;

  if (
    !process.env.wis_credentials ||
    !process.env.wis_test_url ||
    !process.env.wis_prod_url ||
    !process.env.wis_report_folder ||
    !process.env.oneguard_credentials ||
    !process.env.oneguard_test_url ||
    !process.env.oneguard_prod_url ||
    !process.env.oneguard_report_folder
  ) {
    reason += "Invalid .env file: missing fields.\n";
  }

  const [wis_username, wis_password] = process.env.wis_credentials.split(",");
  const [oneguard_username, oneguard_password] = process.env.oneguard_credentials.split(",");

  if (!wis_username || !wis_password || !oneguard_username || !oneguard_password) {
    reason += "Invalid .env file: missing fields.\n";
  }

  let env;

  if (options.server === "wis") {
    env = {
      username: wis_username,
      password: wis_password,
      url: options.environment === "test" ? process.env.wis_test_url : process.env.wis_prod_url,
      reportFolder: path.resolve(process.env.wis_report_folder),
    };
  } else {
    env = {
      username: oneguard_username,
      password: oneguard_password,
      url:
        options.environment === "test"
          ? process.env.oneguard_test_url
          : process.env.oneguard_prod_url,
      reportFolder: path.resolve(process.env.oneguard_report_folder),
    };
  }

  reason && abortScript(reason);

  return env;
};

const validateOptions = (options) => {
  let reason = "";
  if (options.environment !== "test" && options.environment !== "production") {
    reason += "Invalid environment: choose test or production.\n";
  }

  if (options.server !== "wis" && options.server !== "oneguard") {
    reason += "Invalid server: choose wis or oneguard.\n";
  }

  if (!options._ || !options._.length) {
    reason += "Invalid requests: no request entered.\n";
  }

  let requests;

  try {
    requests = validRequests(options._);
  } catch {
    reason += "Invalid requests: wrong format.\n";
  }

  reason && abortScript(reason);

  delete options._;
  delete options.e;
  delete options.s;

  return { ...options, requests, ...validateEnv(options) };
};

const getOptions = () => {
  var options = parseArgs(process.argv.slice(2), {
    string: ["environment", "server", "requests", "help"],
    alias: { environment: "e", server: "s", requests: "r", help: "h" },
    default: { environment: "test" },
  });

  if (options.h !== undefined) abortScript("");

  return validateOptions(options);
};

module.exports = {
  getOptions,
};
