const rimraf = require("rimraf");
const {
  oneguardSoapResponseGood,
  oneguardSoapResponseMissing,
} = require("./__fixtures__/oneguard-envelope");
const checkStatus = require("./check-status").checkStatus;
const getOptions = require("../../utils/get-options").getOptions;

describe("prco-check-status oneguard support", () => {
  let args;

  describe("test environment", () => {
    beforeAll(() => {
      rimraf.sync(__dirname + "/__downloads__/oneguard/test/a/b/*");
      rimraf.sync(__dirname + "/__downloads__/oneguard/test/b o b/*");
      process.env.wis_credentials = "foo,bar";
      process.env.onegard_credentials = "foo,bar";
    });

    beforeEach(() => {
      fetch.resetMocks();
      args = [
        "node",
        "prco-check-status",
        "-s",
        "oneguard",
        "-e",
        "test",
        "15748,/oneguard/test/a/b/111",
      ];
    });

    describe("when passed a valid request", () => {
      describe("using paths with spaces", () => {
        it("should return fomatted report with one entry", async () => {
          const response = {
            body: oneguardSoapResponseGood,
            status: 222,
          };
          fetch.once(() => Promise.resolve(response));

          process.argv = [...args.slice(0, -1), "15748,/oneguard/test/b o b/333"];
          const options = await getOptions();
          const responses = await checkStatus(options);
          const report = responses[0].prco.finalReport;

          expect(fetch.mock.calls.length).toEqual(1);
          expect(report).toMatchSnapshot();
        });
      });

      describe("using paths without spaces", () => {
        it("should return fomatted report with one entry", async () => {
          const response = {
            body: oneguardSoapResponseGood,
            status: 222,
          };
          fetch.once(() => Promise.resolve(response));

          process.argv = [...args];
          const options = await getOptions();
          const responses = await checkStatus(options);
          const report = responses[0].prco.finalReport;

          expect(fetch.mock.calls.length).toEqual(1);
          expect(report).toMatchSnapshot();
        });
      });
    });

    describe("when passed multiple valid requests", () => {
      it("should return fomatted report with mutiple entrys", async () => {
        const response = {
          body: oneguardSoapResponseGood,
          status: 222,
        };
        fetch.once(() => Promise.resolve(response));
        fetch.once(() => Promise.resolve(response));

        process.argv = [...args, "15748,/oneguard/test/a/b/222"];
        const options = await getOptions();
        const responses = await checkStatus(options);
        const report = responses[0].prco.finalReport;

        expect(fetch.mock.calls.length).toEqual(2);
        expect(report).toMatchSnapshot();
      });
    });

    describe("when passed an invalid request", () => {
      it("should return fomatted report with one message: Status unavailable", async () => {
        const response = {
          body: oneguardSoapResponseMissing,
          status: 222,
        };
        fetch.once(() => Promise.resolve(response));

        process.argv = [...args.slice(0, -1), "838317,/oneguard/test/a/b/555"];
        const options = await getOptions();
        const responses = await checkStatus(options);
        const report = responses[0].prco.finalReport;

        expect(fetch.mock.calls.length).toEqual(1);
        expect(report).toMatchSnapshot();
      });
    });

    describe("when passed multiple invalid requests", () => {
      it("should return fomatted report with mutiple messages: Status unavailable", async () => {
        const response = {
          body: oneguardSoapResponseMissing,
          status: 222,
        };
        fetch.once(() => Promise.resolve(response));
        fetch.once(() => Promise.resolve(response));

        process.argv = [
          ...args.slice(0, -1),
          "838317,/oneguard/test/a/b/666",
          "838317,/oneguard/test/a/b/777",
        ];
        const options = await getOptions();
        const responses = await checkStatus(options);
        const report = responses[0].prco.finalReport;

        expect(fetch.mock.calls.length).toEqual(2);
        expect(report).toMatchSnapshot();
      });
    });

    describe("when encountering a server error", () => {
      it("should return fomatted report with message: Server error", async () => {
        const errorResponse = {
          body: oneguardSoapResponseGood,
          status: 500,
        };
        fetch.once(() => Promise.resolve(errorResponse));

        process.argv = [...args];
        const options = await getOptions();
        const responses = await checkStatus(options);
        const report = responses[0].prco.finalReport;

        expect(fetch.mock.calls.length).toEqual(1);
        expect(report).toMatchSnapshot();
      });
    });
  });

  describe("production environment", () => {
    beforeAll(() => {
      rimraf.sync(__dirname + "/__downloads__/oneguard/production/a/b/*");
      rimraf.sync(__dirname + "/__downloads__/oneguard/production/b o b/*");
      process.env.wis_credentials = "foo,bar";
      process.env.onegard_credentials = "foo,bar";
    });

    beforeEach(() => {
      fetch.resetMocks();
      args = [
        "node",
        "prco-check-status",
        "-s",
        "oneguard",
        "-e",
        "production",
        "197961,/oneguard/production/a/b/111",
      ];
    });

    describe("when passed a valid request", () => {
      describe("using paths with spaces", () => {
        it("should return fomatted report with one entry", async () => {
          const response = {
            body: oneguardSoapResponseGood,
            status: 222,
          };
          fetch.once(() => Promise.resolve(response));

          process.argv = [...args.slice(0, -1), "197961,/oneguard/production/b o b/333"];
          const options = await getOptions();
          const responses = await checkStatus(options);
          const report = responses[0].prco.finalReport;

          expect(fetch.mock.calls.length).toEqual(1);
          expect(report).toMatchSnapshot();
        });
      });
      describe("using paths without spaces", () => {
        it("should return fomatted report with one entry", async () => {
          const response = {
            body: oneguardSoapResponseGood,
            status: 222,
          };
          fetch.once(() => Promise.resolve(response));

          process.argv = [...args];
          const options = await getOptions();
          const responses = await checkStatus(options);
          const report = responses[0].prco.finalReport;

          expect(fetch.mock.calls.length).toEqual(1);
          expect(report).toMatchSnapshot();
        });
      });
    });

    describe("when passed multiple valid requests", () => {
      it("should return fomatted report with mutiple entrys", async () => {
        const response = {
          body: oneguardSoapResponseGood,
          status: 222,
        };
        fetch.once(() => Promise.resolve(response));
        fetch.once(() => Promise.resolve(response));

        process.argv = [...args, "197961,/oneguard/production/a/b/222"];
        const options = await getOptions();
        const responses = await checkStatus(options);
        const report = responses[0].prco.finalReport;

        expect(fetch.mock.calls.length).toEqual(2);
        expect(report).toMatchSnapshot();
      });
    });

    describe("when passed an invalid request", () => {
      it("should return fomatted report with one message: Status unavailable", async () => {
        const response = {
          body: oneguardSoapResponseMissing,
          status: 222,
        };
        fetch.once(() => Promise.resolve(response));

        process.argv = [...args.slice(0, -1), "197961,/oneguard/production/a/b/555"];
        const options = await getOptions();
        const responses = await checkStatus(options);
        const report = responses[0].prco.finalReport;

        expect(fetch.mock.calls.length).toEqual(1);
        expect(report).toMatchSnapshot();
      });
    });

    describe("when passed multiple invalid requests", () => {
      it("should return fomatted report with mutiple messages: Status unavailable", async () => {
        const response = {
          body: oneguardSoapResponseMissing,
          status: 222,
        };
        fetch.once(() => Promise.resolve(response));
        fetch.once(() => Promise.resolve(response));

        process.argv = [
          ...args.slice(0, -1),
          "197961,/oneguard/production/a/b/666",
          "196361,/oneguard/production/a/b/777",
        ];
        const options = await getOptions();
        const responses = await checkStatus(options);
        const report = responses[0].prco.finalReport;

        expect(fetch.mock.calls.length).toEqual(2);
        expect(report).toMatchSnapshot();
      });
    });

    describe("when encountering a server error", () => {
      it("should return fomatted report with message: Server error", async () => {
        const errorResponse = {
          body: oneguardSoapResponseGood,
          status: 500,
        };
        fetch.once(() => Promise.resolve(errorResponse));

        process.argv = [...args];
        const options = await getOptions();
        const responses = await checkStatus(options);
        const report = responses[0].prco.finalReport;

        expect(fetch.mock.calls.length).toEqual(1);
        expect(report).toMatchSnapshot();
      });
    });
  });
});
