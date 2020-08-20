const { GoogleSpreadsheet } = require('google-spreadsheet');


class GoogleSheetsReader {
  constructor(spreadsheetId, credentials_path) {
    this.credentials_path = credentials_path || 'sa-credentials.json'
    this.spreadsheetId = spreadsheetId

      // spreadsheet key is the long id in the sheets URL
      this.doc = new GoogleSpreadsheet(spreadsheetId);

  }

  async init(callback) {
    try {

      // OR load directly from json file if not in secure environment
      await this.doc.useServiceAccountAuth(require('./../sa-credentials.json'));
      // OR use API key -- only for read-only access to public sheets
      // doc.useApiKey('YOUR-API-KEY');
      await this.doc.loadInfo();
      this.sheet = this.doc.sheetsByIndex[0]; // or use doc.sheetsById[id]
      console.log(this.sheet.title);
      // const rows = await this.sheet.getRows();
      // console.log(rows[0]);
      callback(this);
    } catch(err) {
      console.log(err)
    }
  }

  async getHeaders() {
    const rows = await this.sheet.getRows();
    console.log(rows[0]);
  }

  async read() {
    // read cells
    await this.sheet.loadCells('A1:B4');

    // read/write cell values
    const a1 = sheet.getCell(0, 0); // access cells using a zero-based index
    const b2 = sheet.getCellByA1('B2'); // or A1 style notation
    // access everything about the cell
    console.log(a1.value);
    console.log(a1.formula);
    console.log(a1.formattedValue);
    console.log(b2.value)


  }

}

module.exports = GoogleSheetsReader;