#!/usr/bin/env node

global.fetch = require("cross-fetch");

const getOptions = require("./utils/get-options").getOptions;
const checkStatus = require("./modules/check-status");

/*
    prco-check-status
*/
const prcoCheckStatus = async () => {
  getOptions()
    .then(async (options) => {
      return checkStatus(options);
    })
    .catch((e) => {
      console.log(e.errorMessage);
      return e;
    });
};

prcoCheckStatus();
