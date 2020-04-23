const getRequestSoapResponse = () => `
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <soap:Body>
        <CheckStatusResponse xmlns="http://www.wisinspections.com/">
            <CheckStatusResult>
                <xs:schema id="NewDataSet" xmlns="" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:msdata="urn:schemas-microsoft-com:xml-msdata">
                    <xs:element name="NewDataSet" msdata:IsDataSet="true" msdata:UseCurrentLocale="true">
                        <xs:complexType>
                            <xs:choice minOccurs="0" maxOccurs="unbounded">
                                <xs:element name="tblInspectionRequest">
                                    <xs:complexType>
                                        <xs:sequence>
                                            <xs:element name="RequestID" type="xs:int" minOccurs="0" />
                                            <xs:element name="Details" type="xs:string" minOccurs="0" />
                                            <xs:element name="Images" type="xs:string" minOccurs="0" />
                                            <xs:element name="Report" type="xs:string" minOccurs="0" />
                                        </xs:sequence>
                                    </xs:complexType>
                                </xs:element>
                            </xs:choice>
                        </xs:complexType>
                    </xs:element>
                </xs:schema>
                <diffgr:diffgram xmlns:msdata="urn:schemas-microsoft-com:xml-msdata" xmlns:diffgr="urn:schemas-microsoft-com:xml-diffgram-v1">
                    <NewDataSet xmlns="">
                        <tblInspectionRequest diffgr:id="tblInspectionRequest1" msdata:rowOrder="0">
                            <RequestID>758317</RequestID>
                            <Details>http://www.wisinspections.com/Customer/InspectionDetails.aspx?requestID=iiHiK1bYlMo%%</Details>
                            <Images>http://www.wisinspections.com/Customer/InspectionPictures.aspx?requestID=iiHiK1bYlMo%%</Images>
                            <Report>http://www.wisinspections.com/Customer/InspectionReport.aspx?requestID=iiHiK1bYlMo%%</Report>
                        </tblInspectionRequest>
                    </NewDataSet>
                </diffgr:diffgram>
            </CheckStatusResult>
        </CheckStatusResponse>
    </soap:Body>
</soap:Envelope>
`;

const getMissingRequestSoapResponse = () => `
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <soap:Body>
        <CheckStatusResponse xmlns="http://www.wisinspections.com/">
            <CheckStatusResult>
                <xs:schema id="NewDataSet" xmlns="" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:msdata="urn:schemas-microsoft-com:xml-msdata">
                    <xs:element name="NewDataSet" msdata:IsDataSet="true" msdata:UseCurrentLocale="true">
                        <xs:complexType>
                            <xs:choice minOccurs="0" maxOccurs="unbounded">
                                <xs:element name="tblInspectionRequest">
                                    <xs:complexType>
                                        <xs:sequence>
                                            <xs:element name="RequestID" type="xs:int" minOccurs="0" />
                                            <xs:element name="Details" type="xs:string" minOccurs="0" />
                                            <xs:element name="Images" type="xs:string" minOccurs="0" />
                                            <xs:element name="Report" type="xs:string" minOccurs="0" />
                                        </xs:sequence>
                                    </xs:complexType>
                                </xs:element>
                            </xs:choice>
                        </xs:complexType>
                    </xs:element>
                </xs:schema>
                <diffgr:diffgram xmlns:msdata="urn:schemas-microsoft-com:xml-msdata" xmlns:diffgr="urn:schemas-microsoft-com:xml-diffgram-v1" />
            </CheckStatusResult>
        </CheckStatusResponse>
    </soap:Body>
</soap:Envelope>`;

module.exports = { getRequestSoapResponse, getMissingRequestSoapResponse };
