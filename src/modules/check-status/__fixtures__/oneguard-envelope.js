const oneguardSoapResponseGood = () => `
<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://InspectionService/">
    <SOAP-ENV:Body>
        <ns1:GetRequestResponse>
            <RequestResponseResult>
                <success>true</success>
                <status>closed</status>
                <state>7</state>
                <message>Inspection Request Complete</message>
                <report>https://test.oneguardinspections.com/components/com_rstickets/files/2020/05/04/PRCOTEST7/PRCO TEST-0000000007_PDF_Report.pdf</report>
            </RequestResponseResult>
        </ns1:GetRequestResponse>
    </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;

const oneguardSoapResponseMissing = () => `
<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://InspectionService/">
    <SOAP-ENV:Body>
        <ns1:GetRequestResponse>
            <RequestResponseResult>
                <success>true</success>
                <status/>
                <state/>
                <message/>
                <report/>
            </RequestResponseResult>
        </ns1:GetRequestResponse>
    </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;

module.exports = { oneguardSoapResponseGood, oneguardSoapResponseMissing };
