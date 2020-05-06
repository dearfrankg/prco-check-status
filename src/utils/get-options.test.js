const getOptions = require("./get-options").getOptions;

const getCommandOptions = (options) => {
  const commandOptions = {
    language: "node",
    command: "prco-text",
    from: "415-935-3327",
    to: "415-935-3327",
    message: "hi",
  };

  Object.keys(options).forEach((option) => {
    commandOptions[option] = options[option];
  });

  const result = [
    commandOptions["language"],
    commandOptions["command"],
    "--from",
    commandOptions["from"],
    "--to",
    commandOptions["to"],
    "--message",
    commandOptions["message"],
  ];

  return result;
};

describe("get-options", () => {
  let response;

  beforeEach(() => {
    response = "";
    process.env.wis_credentials = "foo,bar";
    process.env.oneguard_credentials = "foo,bar";
  });

  describe("invalid options", () => {
    describe("when command given no options", () => {
      it("should show error and usage", async () => {
        process.argv = ["node", "prco-check-status"];
        getOptions().catch((e) => {
          expect(e).toMatchSnapshot();
        });
      });
    });

    describe("when command given invalid 'config_env_file' option (file not found)", () => {
      it("should show error and usage", async () => {
        process.argv = ["node", "prco-check-status", "-c", "/foo"];
        getOptions().catch(async (e) => {
          expect(e).toMatchSnapshot();
        });
      });
    });

    describe("when command given invalid 'environment' option (not test or production)", () => {
      it("should show error and usage", async () => {
        process.argv = ["node", "prco-check-status", "-e", "foo"];
        getOptions().catch(async (e) => {
          expect(e).toMatchSnapshot();
        });
      });
    });

    describe("when command given invalid 'service' option (not wis or oneguard)", () => {
      it("should show error and usage", async () => {
        process.argv = ["node", "prco-check-status", "-s", "foo"];
        getOptions().catch(async (e) => {
          expect(e).toMatchSnapshot();
        });
      });
    });

    describe("when command given invalid 'request' option", () => {
      it("should show error and usage when missing comma", async () => {
        process.argv = ["node", "prco-check-status", "-s", "wis", "765786/foo/bar"];
        getOptions().catch(async (e) => {
          expect(e).toMatchSnapshot();
        });
      });

      it("should show error and usage when missing hierarchical path", async () => {
        process.argv = ["node", "prco-check-status", "-s", "wis", "765786"];
        getOptions().catch(async (e) => {
          expect(e).toMatchSnapshot();
        });
      });

      it("should show error and usage when requestId not numeric", async () => {
        process.argv = ["node", "prco-check-status", "-s", "wis", "75A87,/foo/bar"];
        getOptions().catch(async (e) => {
          expect(e).toMatchSnapshot();
        });
      });
    });

    describe("when wis_credentials poorly formatted", () => {
      it("should show error and usage", async () => {
        process.argv = ["node", "prco-check-status", "-s", "wis", "-e", "test", "768432,/foo/bar"];
        process.env.wis_credentials = "foo";
        getOptions().catch((e) => {
          expect(e).toMatchSnapshot();
        });
      });
    });

    describe("when oneguard_credentials poorly formatted", () => {
      it("should show error and usage", async () => {
        process.argv = ["node", "prco-check-status", "-s", "wis", "-e", "test", "768432,/foo/bar"];
        process.env.oneguard_credentials = "foo";
        getOptions().catch((e) => {
          expect(e).toMatchSnapshot();
        });
      });
    });
  });

  describe("valid options", () => {
    describe("when command given 'help' option", () => {
      it("should only display usage", async () => {
        process.argv = ["node", "prco-check-status", "-h"];
        getOptions().catch(async (e) => {
          expect(e).toMatchSnapshot();
        });
      });
    });

    describe("when comand given 'all valid options'", () => {
      it("should return object containing the valid options", async () => {
        process.argv = ["node", "prco-check-status", "-s", "wis", "-e", "test", "768432,/foo/bar"];
        response = await getOptions();
        expect(response).toMatchSnapshot();
      });
    });

    describe("when comand given 'all valid options' including including paths with spaces", () => {
      it("should return object containing the valid options", async () => {
        process.argv = [
          "node",
          "prco-check-status",
          "-s",
          "wis",
          "-e",
          "test",
          "768432,/foo/bar/b u n",
        ];
        response = await getOptions();
        expect(response).toMatchSnapshot();
      });
    });
  });
});
