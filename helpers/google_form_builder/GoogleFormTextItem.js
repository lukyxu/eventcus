class GoogleFormTextItem {
  constructor() {
    this.title = "";
    this.required = false;
  }

  toString() {
    let content = "";
    if (this.title.length) {
      content += `.setTitle("${this.title}")`;
    }
    if (this.required) {
      content += `.setRequired(true)`;
    }
    return "form.addTextItem()" + content + ";";
  }
  
  setTitle(title) {
    this.title = title;
    return this;
  }

  setRequired() {
    this.required = true;
    return this;
  }
}

module.exports = GoogleFormTextItem;