#!/usr/bin/env node

global.fetch = require("cross-fetch");

const getOptions = require("./utils/get-options").getOptions;
const wisCheckStatus = require("./modules/wis/wis").wisCheckStatus;
const oneguardCheckStatus = require("./modules/oneguard/oneguard").oneguardCheckStatus;

/*
    prco-check-status
*/
const prcoCheckStatus = async () => {
  getOptions()
    .then(async (options) => {
      const checkStatus = options.server === "wis" ? wisCheckStatus : oneguardCheckStatus;
      return checkStatus(options);
    })
    .catch((e) => {
      console.log(e.errorMessage);
      return e;
    });
};

prcoCheckStatus();
