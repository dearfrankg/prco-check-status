#!/usr/bin/env node

global.fetch = require("cross-fetch");

const wisCheckStatus = require("./modules/wis/wis").wisCheckStatus;
const oneguardCheckStatus = require("./modules/oneguard/oneguard").oneguardCheckStatus;

/*
    prcoCheckStatus
*/
const prcoCheckStatus = async () => {
  const options = require("./utils/get-options.js").getOptions();
  console.log("options :", options);

  return options.server === "wis"
    ? await wisCheckStatus(options)
    : await oneguardCheckStatus(options);
};

prcoCheckStatus();
