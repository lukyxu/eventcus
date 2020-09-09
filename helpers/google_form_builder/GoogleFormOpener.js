class GoogleFormOpener {
  constructor(formId) {
    this.formId = formId;
    this.formOpen = false;
    this.formClose = false;
  }

  openForm() {
    this.formOpen = true;
    this.formClose = false;
    return this;
  }

  closeForm() {
    this.formOpen = false;
    this.formClose = true;
    return this;
  }

  toString() {
    let content = `var form = FormApp.openById('${this.formId}');`;
    if (this.formOpen) {
      content += `form.setAcceptingResponses(true);`
    } else if (this.formClose) {
      content += `form.setAcceptingResponses(false);`
    }
    return content.replace(/;/g, ';\n')
  }

  toFunctionString() {
    return `function myFunction() {\n${this.toString()}}`
  }
}

module.exports = GoogleFormOpener;