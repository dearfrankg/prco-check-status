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
  const requestId = response.wis.request.requestId;

  const abortDownload = (reason) => {
    if (isRunningTests) return;

    console.log(`Download aborted for requestId ${requestId}: ${reason}`);
  };

  const containerFolder = isRunningTests
    ? path.join(__dirname, "/__downloads__")
    : response.wis.options.reportFolder;
  const folderPath = path.join(containerFolder, response.wis.request.folderPath);

  const missingReportUrl = !_.get(response.wis, "json.Report", "");
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
const downloadFile = async ({ requestId, reportUrl, filePath }) => {
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
    : response.wis.options.reportFolder;
  const folderPath = path.join(containerFolder, response.wis.request.folderPath);
  const requestId = response.wis.request.requestId;
  const reportUrl = response.wis.json.Report;

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
const downloadReports = async (responses, filePath) => {
  responses.forEach((response) => downloadReport(response));
};

/*
    reportFromJson
*/
const reportFromJson = (response) => {
  const json = response.wis.json;
  const requestId = response.wis.request.requestId;
  const missingJson = !json || json === null;
  if (missingJson) return `\n---\nStatus unavailable for: ${requestId}\n\n`;

  let report = "\n---\n";
  ["RequestID", "Details", "Images", "Report"].map((field) => {
    if (json[field]) {
      report = report.concat(`${field}: ${json[field]}\n`);
    }
  });

  return report;
};

/*
    xml2json
*/
const xml2json = async (response) => {
  const xml = await response.text();
  const jsonObj = parser.parse(xml);
  const prefix =
    "soap:Envelope.soap:Body.CheckStatusResponse.CheckStatusResult.diffgr:diffgram.NewDataSet.tblInspectionRequest";
  const json = _.get(jsonObj, prefix, null);

  return json;
};

/*
    getXml
*/
const getXml = ({ username, password, requestId }) => {
  const xml = `
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

  return xml.trim();
};

/*
    augmentResponse
*/
const augmentResponse = async (response) => {
  response.wis.json = await xml2json(response);
  response.wis.report = reportFromJson(response);

  return response;
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
    insertOptions
*/
const insertOptions = (response, options, request) => {
  response.wis = {
    options,
    request,
  };

  return response;
};

/*
    fetchStatus
*/
const fetchStatus = async (request, options) => {
  const fetchOptions = {
    method: "post",
    headers: {
      ["content-type"]: "text/xml; charset=utf-8",
    },
    body: getXml({
      username: options.username,
      password: options.password,
      requestId: request.requestId,
    }),
  };

  return fetch(options.url, fetchOptions)
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
    return fetchStatus(request, options)
      .then((response) => insertOptions(response, options, request))
      .then((response) => {
        if (hasServerError(response)) {
          response.wis.report = `\n---\nServer error for request id: ${response.wis.request.requestId}\n`;
          return response;
        }

        return augmentResponse(response);
      });
  });

  return Promise.all(promises);
};

/*
    printReport
*/
const printReport = async (responses) => {
  if (isRunningTests) return;

  const { environment, server } = responses[0].wis.options;
  const header = `\nprco-check-status\nserver: ${server}\nenvironment: ${environment}\n`;
  const body = responses
    .map((res) => {
      return _.get(res, "wis.report", "");
    })
    .join("\n")
    .concat("\n\nFinished\n\n");

  const report = header.concat(body);
  console.log(report);
};

/*
    wisCheckStatus
*/
const wisCheckStatus = async (options) => {
  const responses = await fetchResponses(options);
  await printReport(responses);
  downloadReports(responses);

  return responses;
};

module.exports = {
  wisCheckStatus,
  downloadFile,
};
