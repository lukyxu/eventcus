let CheckboxItem = require("./GoogleFormCheckboxItem")
let ListItem = require("./GoogleFormListItem")
let MultipleChoiceItem = require("./GoogleFormMultipleChoiceItem")
let TextItem = require("./GoogleFormTextItem")

class GoogleFormBuilder {
  constructor(formName, title, description, serviceAccount) {
    this.formName = formName;
    this.title = title || "";
    this.description = description || "";
    this.serviceAccount = serviceAccount || "";
    this.linked = false;
    this.items = [];
  }

  linkWithSheets() {
    this.linked = true;
  }

  toString() {
    let content = `var form = FormApp.create('${this.formName}');`;
    if (this.title.length){
      content += `form.setTitle("${this.title}");`
    }
    if (this.description.length){
      content += `form.setDescription("${this.description}");`
    }
    for (let i = 0; i < this.items.length; i++) {
      content += this.items[i].toString()
    }
    if(this.linked) {
      content += `var sheet = SpreadsheetApp.create("Responses", 50, 20);form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());sheet.addEditor("${this.serviceAccount}");Logger.log('Published URL: ' + form.getPublishedUrl());Logger.log('Editor URL: ' + form.getEditUrl());   var res = {'formResLink' : form.getPublishedUrl(), 'formEditLink' : form .getEditUrl(), 'sheetId' : sheet.getId() };return res;`
    }
    return content.replace(/;/g, ';\n')
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