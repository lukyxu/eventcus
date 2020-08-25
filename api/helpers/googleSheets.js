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
      this.ticketTypeSheet = this.doc.sheetsByIndex[1];
      console.log(this.responseSheet.title);
      // await this.sheet.getRows()

      // console.log("col " + this.sheet.columnCount)
      // console.log("cell stats " + this.sheet.cellStats)
      // console.log("loaded " + this.sheet.cellStats.loaded)
      // console.log("nonempty " + this.sheet.cellStats.nonEmpty)
      // console.log("headers " + this.sheet.headerValues)

      // console.log(rows[0]);
      callback(this);
    } catch (err) {
      console.log(err);
    }
  }

  toCamelCase(string) {
    return string.replace(/\s+(.)/g, function (match, group) { 
      return group.toUpperCase()  
    })
  }

  async configSheet(ticketTypes) {
    // Add payment and reservation status headers 
    await this.responseSheet.loadHeaderRow();
    const newHeaders = [];
    this.responseSheet.headerValues.map((header) => {
      newHeaders.push(this.toCamelCase(header));
    })
    console.log(this.responseSheet.headerValues);


    const ticketTypeColumnAddress = String.fromCharCode(64 + newHeaders.length);
    const reservationStatusColumnAddress = String.fromCharCode(64 + newHeaders.length + 1);
    const paymentStatusColumnAddress = String.fromCharCode(64 + newHeaders.length + 2);
    console.log(ticketTypeColumnAddress);


    await this.responseSheet.setHeaderRow(newHeaders.concat(["ReservationStatus", "PaymentStatus"]));

    // Create Ticket Type sheet
    await this.ticketTypeSheet.updateProperties({ title: "Ticket Types" })
    await this.ticketTypeSheet.setHeaderRow(["type", "price", "quantity", "allocated", "paid"])
    const rows = await this.ticketTypeSheet.addRows(ticketTypes)
    rows.map(async (row) => {
      row.allocated = `=ARRAYFORMULA(IFNA(ROWS(FILTER('${this.responseSheet.title}'!${ticketTypeColumnAddress}$1:${ticketTypeColumnAddress}, '${this.responseSheet.title}'!${ticketTypeColumnAddress}$1:${ticketTypeColumnAddress} = "${row.type}", 'Form responses 1'!${reservationStatusColumnAddress}$1:${reservationStatusColumnAddress} = "reserved")), 0))`;
      row.paid = `=ARRAYFORMULA(IFNA(ROWS(FILTER('${this.responseSheet.title}'!${ticketTypeColumnAddress}$1:${ticketTypeColumnAddress}, '${this.responseSheet.title}'!${ticketTypeColumnAddress}$1:${ticketTypeColumnAddress} = "${row.type}", 'Form responses 1'!${paymentStatusColumnAddress}$1:${paymentStatusColumnAddress} = "paid")), 0))`;
    
      await row.save();
    })
  }

  async isTicketAvaliable(ticketType, ticketTypeRows) {
    var res = false;
    await ticketTypeRows.forEach(async (row) => {
      if (row.type === ticketType && row.allocated < row.quantity) {
        row.allocated = parseInt(row.allocated) + 1;
        // console.log(row.type);
        res = true;
      }
    })
    return res;
  }

  async findPerson(timestamp, fullName) {
    const responseRows = await this.ticketTypeSheet.getRows();
    responseRows.map((row) => {
      if (row.timestamp == timestamp && row.fullName == fullName) {
        return row
      }
    });

  }

  async changePaymentStatus(timestamp, fullName) {
    const person = await this.findPerson(timestamp, fullName);

    person.PaymentStatus = (person.PaymentStatus == "paid" ? "" : "paid");
  }

  async changeReservationStatus(timestamp, fullName) {
    const person = await this.findPerson(timestamp, fullName);

    person.ReservationStatus = (person.ReservationStatus == "reserved" ? "waitlist" : "reserved");
  }

  async allocate() {
    const responseRows = await this.responseSheet.getRows();
    const ticketTypeRows = await this.ticketTypeSheet.getRows();

    await responseRows.map(async (row) => {
      // console.log(row.Timestamp);
      if (row.ReservationStatus == null) {
        const bool  = await this.isTicketAvaliable(row.TicketType, ticketTypeRows);
        // console.log(bool)
        if (bool) {
          row.ReservationStatus = 'reserved';
        } else {
          row.ReservationStatus = 'waitlist';
        }
        await row.save();
      }
    });


    console.log('allocated');
  }

  async ticketReservationInfo(callback) {
    const ticketTypeRows = await this.ticketTypeSheet.getRows();
    const data = []
    ticketTypeRows.forEach( (row) => {
      // Todo change to include paid, unreserved = total - paid - reserved
      const unreserved = parseInt(row.quantity) - parseInt(row.allocated)
      data.push({"type" : row.type, "reserved" : row.allocated, "unreserved" : unreserved, "quantity" : row.quantity})
    })

    callback(data);

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