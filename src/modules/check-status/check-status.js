const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const parser = require("fast-xml-parser");
const axios = require("axios");

const isRunningTests = typeof jest !== "undefined";

/*
    confirmHierarchicalFolder
*/
const confirmHierarchicalFolder = (folderPath) => {
  // confirm container folder exist
  const containerFolder = path.dirname(folderPath);
  const missingContainerFolder = !fs.existsSync(containerFolder);
  if (missingContainerFolder) {
    return false;
  }

  // create report folder if necessary
  const reportFolder = path.join(folderPath);
  const missingReportFolder = !fs.existsSync(reportFolder);
  if (missingReportFolder) {
    fs.mkdirSync(reportFolder);
  }

  return true;
};

/*
    isReasonToAbortDownload
*/
const isReasonToAbortDownload = (response) => {
  const requestId = response.prco.request.requestId;

  const abortDownload = (reason) => {
    if (isRunningTests) return;

    console.log(`Download aborted for requestId ${requestId}: ${reason}`);
  };

  const containerFolder = isRunningTests
    ? path.join(__dirname, "/__downloads__")
    : response.prco.options.reportFolder;
  const folderPath = path.join(containerFolder, response.prco.request.folderPath);

  const wisReportUrlPath = "json.Report";
  const oneguardReportUrlPath = "json.report";
  const wisServer = response.prco.options.server === "wis";
  const reportUrlPath = wisServer ? wisReportUrlPath : oneguardReportUrlPath;
  const missingReportUrl = !_.get(response.prco, reportUrlPath, "");

  if (missingReportUrl) {
    abortDownload("Missing report URL");
    return true;
  }

  // confirmHierarchicalFolder creates container folder
  const missingHierarchicalFolder = !confirmHierarchicalFolder(folderPath);
  if (missingHierarchicalFolder) {
    abortDownload("Missing hierarchical folder");
    return true;
  }

  const filename = path.basename(folderPath);
  const filePath = path.join(folderPath, `${filename}.pdf`);
  const reportAlreadyExists = fs.existsSync(filePath);
  if (reportAlreadyExists) {
    abortDownload("Report already exists");
    return true;
  }

  return false;
};

/*
    downloadFile
*/
const downloadFile = async ({ reportUrl, filePath }) => {
  return axios({
    method: "get",
    url: reportUrl,
    responseType: "stream",
  })
    .then((response) => {
      response.data.pipe(fs.createWriteStream(filePath));
      return "download complete";
    })
    .catch((e) => {
      console.log("error", e);
    });
};

/*
    downloadReport
*/
const downloadReport = async (response) => {
  if (isReasonToAbortDownload(response)) return Promise.resolve("aborted");

  const containerFolder = isRunningTests
    ? path.join(__dirname, "/__downloads__")
    : response.prco.options.reportFolder;
  const folderPath = path.join(containerFolder, response.prco.request.folderPath);
  const requestId = response.prco.request.requestId;

  const wisServer = response.prco.options.server === "wis";
  const reportUrl = wisServer ? response.prco.json.Report : response.prco.json.report;

  const filename = path.basename(folderPath);
  const filePath = path.join(folderPath, `${filename}.pdf`);

  if (!isRunningTests) {
    console.log(
      `downloading report: \nRequestId: ${requestId}\nReportUrl: ${reportUrl}\nPath: ${filePath}\n`
    );
  }

  return downloadFile({ requestId, reportUrl, filePath });
};

/*
    downloadReports
*/
const downloadReports = async (responses) => {
  responses.forEach((response) => downloadReport(response));
};

/*
    reportFromJson
*/
const reportFromJson = (response) => {
  const json = response.prco.json;
  const requestId = response.prco.request.requestId;
  const missingJson = !json || json === null;
  if (missingJson) return `\n---\nStatus unavailable for: ${requestId}\n\n`;

  let report = "\n---\n";

  const genWisReport = () => {
    ["RequestID", "Details", "Images", "Report"].map((field) => {
      if (json[field]) {
        report = report.concat(`${field}: ${json[field]}\n`);
      }
    });
  };

  const genOneguardReport = () => {
    report = report.concat(`requestId: ${requestId}\n`);
    ["status", "state", "message", "report"].map((field) => {
      if (json[field]) {
        report = report.concat(`${field}: ${json[field]}\n`);
      }
    });
  };

  const wisServer = response.prco.options.server === "wis";
  wisServer ? genWisReport() : genOneguardReport();

  return report;
};

/*
    xml2json
*/
const xml2json = async (response) => {
  const xml = await response.text();
  const jsonObj = parser.parse(xml);

  const wisPrefix =
    "soap:Envelope.soap:Body.CheckStatusResponse.CheckStatusResult.diffgr:diffgram.NewDataSet.tblInspectionRequest";

  const oneGuardPrefix =
    "SOAP-ENV:Envelope.SOAP-ENV:Body.ns1:GetRequestResponse.RequestResponseResult";

  const prefix = response.prco.options.server === "wis" ? wisPrefix : oneGuardPrefix;

  const json = _.get(jsonObj, prefix, null);

  return json;
};

/*
    getXml
*/
const getXml = ({ options: { server, username, password }, request: { requestId } }) => {
  const wisXml = `
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Header>
        <AuthenticateHeader xmlns="http://www.wisinspections.com/">
          <Username>${username}</Username>
          <Password>${password}</Password>
        </AuthenticateHeader>
      </soap:Header>
      <soap:Body>
        <CheckStatus xmlns="http://www.wisinspections.com/">
          <RequestID>${requestId}</RequestID>
        </CheckStatus>
      </soap:Body>
    </soap:Envelope>
    `;

  const oneguardXml = `<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:ns1="https://test.oneguardinspections.com/webService/status/api">
    <SOAP-ENV:Header>
        <ns1:AuthenticateHeader>
            <UserName>${username}</UserName>
            <Password>${password}</Password>
        </ns1:AuthenticateHeader>
    </SOAP-ENV:Header>
    <SOAP-ENV:Body>
        <SOAP-ENV:GetRequest>
            <request_id>${requestId}</request_id>
            <tpa_code>PRCO</tpa_code>
        </SOAP-ENV:GetRequest>
    </SOAP-ENV:Body>
</SOAP-ENV:Envelope>
    `;

  const xml = server == "wis" ? wisXml : oneguardXml;

  return xml.trim();
};

/*
    hasServerError
*/
const hasServerError = (response) => {
  const HTTP_CODE_400 = 400;
  const hasServerError = parseInt(response.status, 10) >= HTTP_CODE_400;
  return hasServerError;
};

/*
    fetchStatus
*/
const fetchStatus = async (container) => {
  const fetchOptions = {
    method: "post",
    headers: {
      ["content-type"]: "text/xml; charset=utf-8",
    },
    body: getXml(container),
  };

  return fetch(container.options.url, fetchOptions)
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.log("ERROR :", error);
    });
};

/*
    fetchResponses
*/
const fetchResponses = async (options) => {
  const promises = options.requests.map((request) => {
    return fetchStatus({ options, request })
      .then((response) => {
        response.prco = { options, request };
        return response;
      })
      .then(async (response) => {
        if (hasServerError(response)) {
          response.prco.report = `\n---\nServer error for request id: ${response.prco.request.requestId}\n`;
          return response;
        }

        response.prco.json = await xml2json(response);
        response.prco.report = reportFromJson(response);

        return response;
      });
  });

  return Promise.all(promises);
};

/*
    printReport
*/
const printReport = async (responses) => {
  const { environment, server } = responses[0].prco.options;
  const header = `\nprco-check-status\nserver: ${server}\nenvironment: ${environment}\n`;
  const body = responses
    .map((res) => {
      return _.get(res, "prco.report", "");
    })
    .join("\n")
    .concat("\n\nFinished\n\n");

  const report = header.concat(body);

  if (!isRunningTests) console.log(report);
};

/*
    wisCheckStatus
*/
const checkStatus = async (options) => {
  const responses = await fetchResponses(options);
  await printReport(responses);
  downloadReports(responses);

  return responses;
};

module.exports = {
  checkStatus,
};
