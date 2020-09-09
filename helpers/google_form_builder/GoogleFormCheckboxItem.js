class GoogleFormCheckboxItem {
  constructor() {
    this.title = "";
    this.choices = [];
    this.required = false;
    this.other = false;
  }

  toString() {
    let content = "";
    if (this.title.length) {
      content += `.setTitle("${this.title}")`;
    }
    if (this.choices.length) {
      let stringified = this.choices.map(x => `'${x}'`);
      content += `.setChoiceValues([${stringified.join()}])`;
    }
    if (this.other) {
      content += `.showOtherOption(true)`;
    }
    if (this.required) {
      content += `.setRequired(true)`;
    }
    return "form.addCheckboxItem()" + content + ";";
  }
  
  setTitle(title) {
    this.title = title;
    return this;
  }

  setChoices(choices){
    this.choices = choices;
    return this;
  }

  setRequired() {
    this.required = true;
    return this;
  }

  showOtherOption() {
    this.other = true;
    return this;
  }
}

module.exports = GoogleFormCheckboxItem;