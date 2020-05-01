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
  console.log(`\n${reason}\n\n`);
  usage();
  process.exit(0);
};

const validatedEnv = () => {
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
      reason += `Invalid env variable: ${envVar}`;
    } else {
      validEnvVars[envVar] = process.env[envVar];
    }
  });

  if (reason) abortScript(reason);

  // expend credentials
  const [wis_username, wis_password] = validEnvVars.wis_credentials.split(",");
  validEnvVars.wis_username = wis_username;
  validEnvVars.wis_password = wis_password;

  const [oneguard_username, oneguard_password] = process.env.oneguard_credentials.split(",");
  validEnvVars.oneguard_username = oneguard_username;
  validEnvVars.oneguard_password = oneguard_password;

  ["wis_username", "wis_password", "oneguard_username", "oneguard_password"].forEach((envVar) => {
    if (validEnvVars[envVar] === undefined) {
      reason += `Invalid env variable: ${envVar}`;
    }
  });

  if (reason) abortScript(reason);

  return validEnvVars;
};

const validRequests = (requests) => {
  let reason = "";

  const result = requests.map((request) => {
    let [requestId, folderPath] = request.split(",");
    if (requestId === undefined || folderPath === undefined) {
      abortScript("Invalid request format.");
    }

    if (!validator.isNumeric(requestId)) {
      reason += `invalid requestId: non-numeric: ${requestId}`;
    }

    folderPath = path.normalize(folderPath);
    const containsSpaces = /.*\s.*/.test(folderPath);
    const containsTrailingSlash = /.*\/$/.test(folderPath);
    if (containsTrailingSlash) {
      folderPath.substr(0, -1);
    }

    return { requestId, folderPath };
  });

  return result;
};

const validatedOptions = () => {
  var options = parseArgs(process.argv.slice(2), {
    string: ["environment", "server", "requests", "help"],
    alias: { environment: "e", server: "s", requests: "r", help: "h" },
    default: { environment: "test" },
  });

  if (options.h !== undefined) abortScript("");

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

  if (reason) abortScript(reason);

  options.requests = validRequests(options._);

  // cleanup options
  ["-", "e", "s", "h"].forEach((option) => {
    delete options[option];
  });

  const envVars = validatedEnv();
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

  return options;
};

const getOptions = () => {
  const { server, environment, username, password, url, reportFolder, requests } = {
    ...validatedEnv(),
    ...validatedOptions(),
  };

  return { server, environment, username, password, url, reportFolder, requests };
};

module.exports = {
  getOptions,
};
