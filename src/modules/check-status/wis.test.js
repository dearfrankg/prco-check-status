const rimraf = require("rimraf");
const {
  getRequestSoapResponse,
  getMissingRequestSoapResponse,
} = require("./__fixtures__/wis-envelope");
const checkStatus = require("./check-status").checkStatus;
const getOptions = require("../../utils/get-options").getOptions;

describe("checkStatus for wis", () => {
  beforeAll(() => {
    rimraf.sync(__dirname + "/__downloads__/a/b/c/*");
    process.env.wis_credentials = "foo,bar";
    process.env.onegard_credentials = "foo,bar";
  });

  beforeEach(() => {
    fetch.resetMocks();
  });

  describe("when passed a valid request", () => {
    it("should return fomatted report with one entry", async () => {
      const goodResponse = {
        body: getRequestSoapResponse,
        status: 222,
      };
      fetch.once(() => Promise.resolve(goodResponse));

      process.argv = [
        "node",
        "prco-check-status",
        "-e",
        "production",
        "-s",
        "wis",
        "758317,/a/b/c/111",
      ];
      const options = await getOptions();
      const responses = await checkStatus(options);

      expect(fetch.mock.calls.length).toEqual(1);
      const responseList = responses.map((res) => ({
        wis: res.wis,
      }));

      expect(responseList).toMatchSnapshot();
    });
  });

  describe("when passed multiple valid requests", () => {
    it("should return fomatted report with mutiple entrys", async () => {
      const goodResponse = {
        body: getRequestSoapResponse,
        status: 222,
      };
      fetch.once(() => Promise.resolve(goodResponse));
      fetch.once(() => Promise.resolve(goodResponse));

      process.argv = [
        "node",
        "prco-check-status",
        "-e",
        "production",
        "-s",
        "wis",
        "758317,/a/b/c/222",
        "758317,/a/b/c/333",
      ];
      const options = await getOptions();
      const responses = await checkStatus(options);

      expect(fetch.mock.calls.length).toEqual(2);
      const responseList = responses.map((res) => ({
        wis: res.wis,
      }));

      expect(responseList).toMatchSnapshot();
    });
  });

  describe("when passed an invalid request", () => {
    it("should return fomatted report with one message: Status unavailable", async () => {
      const goodResponse = {
        body: getMissingRequestSoapResponse,
        status: 222,
      };
      fetch.once(() => Promise.resolve(goodResponse));

      process.argv = [
        "node",
        "prco-check-status",
        "-e",
        "production",
        "-s",
        "wis",
        "838317,/a/b/c/444",
      ];
      const options = await getOptions();
      const responses = await checkStatus(options);

      expect(fetch.mock.calls.length).toEqual(1);
      const responseList = responses.map((res) => ({
        wis: res.wis,
      }));

      expect(responseList).toMatchSnapshot();
    });
  });

  describe("when passed multiple invalid requests", () => {
    it("should return fomatted report with mutiple messages: Status unavailable", async () => {
      const goodResponse = {
        body: getMissingRequestSoapResponse,
        status: 222,
      };
      fetch.once(() => Promise.resolve(goodResponse));
      fetch.once(() => Promise.resolve(goodResponse));

      process.argv = [
        "node",
        "prco-check-status",
        "-e",
        "production",
        "-s",
        "wis",
        "838317,/a/b/c/555",
        "838317,/a/b/c/666",
      ];
      const options = await getOptions();
      const responses = await checkStatus(options);

      expect(fetch.mock.calls.length).toEqual(2);
      const responseList = responses.map((res) => ({
        wis: res.wis,
      }));

      expect(responseList).toMatchSnapshot();
    });
  });

  describe("when encountering a server error", () => {
    it("should return fomatted report with message: Server error", async () => {
      const errorResponse = {
        body: getRequestSoapResponse,
        status: 500,
      };
      fetch.once(() => Promise.resolve(errorResponse));

      process.argv = [
        "node",
        "prco-check-status",
        "-e",
        "production",
        "-s",
        "wis",
        "758317,/a/b/c/777",
      ];
      const options = await getOptions();
      const responses = await checkStatus(options);

      expect(fetch.mock.calls.length).toEqual(1);
      const responseList = responses.map((res) => ({
        wis: res.wis,
      }));

      expect(responseList).toMatchSnapshot();
    });
  });
});
