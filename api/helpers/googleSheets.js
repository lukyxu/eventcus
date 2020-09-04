const { GoogleSpreadsheet } = require('google-spreadsheet');
const { response } = require('express');


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
      if (this.doc.sheetCount < 3) {
        this.memberSheet = await this.doc.addSheet({ title: "Members List" });
      } else {
        this.memberSheet = this.doc.sheetsByIndex[2];
      }
      console.log("Initiating");
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

    let headerLength =  this.responseSheet.headerValues.length
    
    console.log(this.responseSheet.headerValues);
    const ticketTypeColumnAddress = String.fromCharCode(64 + headerLength);
    const reservationStatusColumnAddress = String.fromCharCode(64 + headerLength + 1);
    const paymentStatusColumnAddress = String.fromCharCode(64 + headerLength + 2);

    await this.responseSheet.setHeaderRow(this.responseSheet.headerValues.concat(["Reservation Status", "Payment Status"]));

    // Create Ticket Type sheet
    await this.ticketTypeSheet.updateProperties({ title: "Ticket Types" })
    await this.ticketTypeSheet.setHeaderRow(["type", "price", "quantity", "allocated", "paid"])
    const rows = await this.ticketTypeSheet.addRows(ticketTypes)
    rows.map(async (row) => {
      row["allocated"] = `=ARRAYFORMULA(IFNA(ROWS(FILTER('${this.responseSheet.title}'!${ticketTypeColumnAddress}$1:${ticketTypeColumnAddress}, '${this.responseSheet.title}'!${ticketTypeColumnAddress}$1:${ticketTypeColumnAddress} = "${row["type"]}", 'Form responses 1'!${reservationStatusColumnAddress}$1:${reservationStatusColumnAddress} = "reserved")), 0))`;
      row["paid"] = `=ARRAYFORMULA(IFNA(ROWS(FILTER('${this.responseSheet.title}'!${ticketTypeColumnAddress}$1:${ticketTypeColumnAddress}, '${this.responseSheet.title}'!${ticketTypeColumnAddress}$1:${ticketTypeColumnAddress} = "${row["type"]}", 'Form responses 1'!${paymentStatusColumnAddress}$1:${paymentStatusColumnAddress} = "paid")), 0))`;

      await row.save();
    })
    const totalRow = await this.ticketTypeSheet.addRow({ type: "Total" })
    totalRow["quantity"] = `=SUM(C2:C${ticketTypes.length + 1})`
    totalRow["allocated"] = `=SUM(D2:D${ticketTypes.length + 1})`
    totalRow["paid"] = `=SUM(E2:E${ticketTypes.length + 1})`
    await totalRow.save();

    try {
      // Create Members sheet
      await this.memberSheet.loadCells('A1:A1');
      const cell = this.memberSheet.getCell(0, 0);
      cell.formula = '=IMPORTRANGE("https://docs.google.com/spreadsheets/d/1xnPmklouiafFZkaih4eI5qX3pHsHdViRN4w8SjsE8jo", "A:N")';
      await cell.save();

      // Add Member/Non-Member/Fresher column if shortcode column exists
      if (this.responseSheet.headerValues.indexOf("Imperial Shortcode") >= 0) {
        await this.responseSheet.setHeaderRow(this.responseSheet.headerValues.concat(["Member Status"]));
      }
    } catch (error) {
      console.log(error);
    }

  }

  async isTicketAvaliable(ticketType, ticketTypeRows) {
    var res = false;
    await ticketTypeRows.forEach(async (row) => {

      if (row["type"] != "Total") {
        if (row["type"] === ticketType && row["allocated"] < row["quantity"]) {
          row["allocated"] = parseInt(row["allocated"]) + 1;
          res = true;
        }
      }

    })
    return res;
  }

  async findPerson(timestamp, fullName) {
    const responseRows = await this.responseSheet.getRows();
    var res;
    responseRows.forEach((row) => {
      if (row["Timestamp"] == timestamp && row["Full Name"] == fullName) {
        res = row
      }
    });
    return res;

  }

  async changePaymentStatus(timestamp, fullName) {
    const person = await this.findPerson(timestamp, fullName);

    person["Payment Status"] = (person["Payment Status"] == "paid" ? "" : "paid");
    await person.save();
  }

  async changeReservationStatus(timestamp, fullName, ticketType, reservationStatus) {
    console.log("HEREEE")
    const person = await this.findPerson(timestamp, fullName);
    person["Ticket Type"] = ticketType;
    person["Reservation Status"] = reservationStatus;
    await person.save();
  }

  async allocate() {
    var responseRows = await this.responseSheet.getRows();
    const ticketTypeRows = await this.ticketTypeSheet.getRows();

    

    await this.responseSheet.loadHeaderRow();
    // Fill the Member Status column if it exists
    if (this.responseSheet.headerValues.indexOf("Member Status") >= 0) {
      const shortcodeColumnAddress = String.fromCharCode(64 + 1 + this.responseSheet.headerValues.indexOf("Imperial Shortcode"));
      responseRows.map(async (row, index) => {
        row["Member Status"] = `=ARRAYFORMULA(IFERROR(IF(VLOOKUP(${shortcodeColumnAddress}${index + 2}, 'Members List'!$D:$N,11, FALSE) = 1, "Fresher", "Member"),"Non-Member"))`;
        // try {
        //   await row.save();
        // } catch (error) {
        //   console.log(error);
        // }
      });
    }

    responseRows.map(async (row) => {
      if (row["Reservation Status"] === "") {
        const bool = await this.isTicketAvaliable(row["Ticket Type"], ticketTypeRows);
        // console.log(bool)
        if (bool) {
          row["Reservation Status"] = 'reserved';
        } else {
          row["Reservation Status"] = 'waitlist';
        }
        await row.save();
      }
    });

    console.log('allocated');
  }

  async camelCaseHeaders(callback) {
    try {
      console.log(this)
      await this.responseSheet.loadHeaderRow();
      const newHeaders = [];
      this.responseSheet.headerValues.map((header) => {
        newHeaders.push(this.toCamelCase(header));
      })
      console.log(newHeaders)
      await this.responseSheet.setHeaderRow(newHeaders);
      await this.responseSheet.addRow({Timestamp : "hi"})

  
      if (typeof callback === "function") {
        callback(this)
      }
    } catch (err) {
      console.log(err)
    }
   
  }

  async ticketReservationInfo(callback) {
    const ticketTypeRows = await this.ticketTypeSheet.getRows();
    const data = []
    ticketTypeRows.forEach((row) => {
      const unreserved = parseInt(row["quantity"]) - parseInt(row["allocated"])
      const reserved = row["allocated"] - row["paid"]
      data.push({ "type": row["type"], "paid": parseInt(row["paid"]), "reserved": reserved, "unreserved": unreserved, "quantity": parseInt(row["quantity"]) });
    })

    callback(data);
  }


  async getEmailsAndTicketTypes(callback) {
    const ticketTypeRows = await this.ticketTypeSheet.getRows();
    const responseRows = await this.responseSheet.getRows();

    const map = {};

    responseRows.forEach((row) => {

      let key = row["Ticket Type"] + '#' + row["Reservation Status"]
      let reservationStatus = row["Reservation Status"] || "Pending"
      console.log(reservationStatus)
      if (map[key] == null) {
        map[key] = {ticketType : row["Ticket Type"], reservationStatus, reservations : [ row["Email Address"] ] }
      } else {
        map[key] = {ticketType : row["Ticket Type"], reservationStatus, reservations : map[key].reservations.concat( [row["Email Address"]])}
      }
    })


    const data = Object.values(map)

    callback(data);
  }

  async getTicketAllocations(callback) {
    const responseRows = await this.responseSheet.getRows();

    const map = {};

    responseRows.forEach((row) => {
      let key = row["Ticket Type"] + '#' + row["Reservation Status"]
      let reservationStatus = row["Reservation Status"] || "Pending"
      if (map[key] == null) {
        map[key] = {ticketType : row["Ticket Type"], reservationStatus, reservations : [{timestamp : row["Timestamp"], name : row["Full Name"], paymentStatus : row["Payment Status"] }]}
      } else {
        map[key] = {ticketType : row["Ticket Type"], reservationStatus, reservations : map[key].reservations.concat([{timestamp : row["Timestamp"], name : row["Full Name"], paymentStatus : row["Payment Status"] }])}
      }
      if (row['Member Status']) {
        map[key].reservations[map[key].reservations.length - 1].memberStatus = row['Member Status'];
      }
    })

    const data = Object.values(map)

    callback(data);
  }

}

module.exports = GoogleSheetsReader;