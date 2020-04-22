const getHeader = (options) => `
prco-check-status

Server: ${options.server}
Environment: ${options.environment}
URL: ${options.url}
    `;

const oneguardCheckStatus = async (options) => {
  return {
    report: getHeader(options),
  };
};

module.exports = {
  oneguardCheckStatus,
};
