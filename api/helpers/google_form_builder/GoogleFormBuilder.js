let CheckboxItem = require("./GoogleFormCheckboxItem")
let ListItem = require("./GoogleFormListItem")
let MultipleChoiceItem = require("./GoogleFormMultipleChoiceItem")
let TextItem = require("./GoogleFormTextItem")
let jsesc = require('jsesc') 

function closeFormStr() {
  return "form.setAcceptingResponses(false);form.setCustomClosedFormMessage('Ticket Reservations are currently closed.');"
}

class GoogleFormBuilder {
  constructor(formName, title, description, serviceAccount) {
    this.formName = formName;
    this.title = title || "";
    this.description = description || "";
    this.serviceAccount = serviceAccount || "";
    this.linked = false;
    this.openTime = null;
    this.items = [];
  }

  linkWithSheets() {
    this.linked = true;
  }

  toString() {
    let content = `var form = FormApp.create('${this.formName}');`;
    if (this.title.length){
      content += `form.setTitle('${jsesc(this.title)}');`
    }
    if (this.description.length){
      content += `form.setDescription('${jsesc(this.description)}');`
    }
    for (let i = 0; i < this.items.length; i++) {
      content += this.items[i].toString()
    }
    if (this.formClosed()) {
      content += closeFormStr()
    }
    if(this.linked) {
      content += `var sheet = SpreadsheetApp.create("Responses", 50, 20);form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());sheet.addEditor("${this.serviceAccount}");Logger.log('Published URL: ' + form.getPublishedUrl());Logger.log('Editor URL: ' + form.getEditUrl());var res = {'formResUrl' : form.getPublishedUrl(), 'formEditUrl' : form.getEditUrl(), 'sheetId' : sheet.getId(), 'formId' :form.getId(), 'sheetUrl' : sheet.getUrl() };return res;`
    }
    return content.replace(/;/g, ';\n')
  }

  formClosed() {
    return this.openTime && ((new Date()).getTime() < this.openTime.getTime())
  }

  toFunctionString() {
    return `function myFunction() {\n${this.toString()}}`
  }

  setTitle(title) {
    this.title = title;
  }

  setServiceAccount(serviceAccount) {
    this.serviceAccount = serviceAccount;
  }

  setDescription(description) {
    this.description = description;
  }

  setFormOpenTime(openTime) {
    this.openTime = openTime;
  }

  addMultipleChoiceItem() {
    let item = new MultipleChoiceItem();
    this.items.push(item)
    return item
  }

  addCheckboxItem() {
    let item = new CheckboxItem();
    this.items.push(item)
    return item
  }

  addTextItem() {
    let item = new TextItem();
    this.items.push(item)
    return item
  }

  addListItem() {
    let item = new ListItem();
    this.items.push(item)
    return item
  }
}

module.exports = GoogleFormBuilder;