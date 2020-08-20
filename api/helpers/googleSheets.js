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
      this.responseSheet = this.doc.sheetsByIndex[0]; // or use doc.sheetsById[id]
      this.ticketSheet = this.doc.sheetsByIndex[1];
      console.log(this.responseSheet.title);
      // await this.sheet.getRows()

      // console.log("col " + this.sheet.columnCount)
      // console.log("cell stats " + this.sheet.cellStats)
      // console.log("loaded " + this.sheet.cellStats.loaded)
      // console.log("nonempty " + this.sheet.cellStats.nonEmpty)
      // console.log("headers " + this.sheet.headerValues)
      
      // console.log(rows[0]);
      callback(this);
    } catch(err) {
      console.log(err)
    }
  }

  async configSheet(ticketTypes) {
    // Add payment and reservation status headers 
    await this.responseSheet.loadHeaderRow();
    await this.responseSheet.setHeaderRow(this.responseSheet.headerValues.concat(["Payment status", "Reservation status"]));
    
    // Create Ticket Type sheet
    await this.ticketSheet.updateProperties({title: "Ticket Types"})
    await this.ticketSheet.setHeaderRow(["type", "price", "quantity", "allocated"])
    const rows = await this.ticketSheet.addRows(ticketTypes)
    rows.map((row) => {
      row.allocated = 0
      row.save()
    })
  }

  async getHeaders() {
    const rows = await this.responseSheet.getRows();
    console.log(rows[0]);
  }

  async read() {
    // read cells
    await this.responseSheet.loadCells('A1:B4');

    // read/write cell values
    const a1 = responseSheet.getCell(0, 0); // access cells using a zero-based index
    const b2 = responseSheet.getCellByA1('B2'); // or A1 style notation
    // access everything about the cell
    console.log(a1.value);
    console.log(a1.formula);
    console.log(a1.formattedValue);
    console.log(b2.value)


  }

}

module.exports = GoogleSheetsReader;