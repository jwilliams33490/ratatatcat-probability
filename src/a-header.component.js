class AHeaderController {
  constructor($log) {
    this.$log = $log;
    this.numberOfRetries = 5000;
    this.numberOfCards = 4;
    this.cardChoices = ['?', '0', '<= 1', '1', '<= 2', '2', '<= 3', '3', '<= 4', '4', '<= 5', '5', '<= 6', '6', '<= 7', '7', '<= 8', '8', '<= 9', '9'];
    this.card = [];
    this.useCard = [];
    for (let i = 0; i < this.numberOfCards; i++) {
      this.card.push('?');
      this.useCard.push(true);
    }
  }

  numRetriesChanged() {
    if (this.onNumRetriesChanged) {
      this.onNumRetriesChanged({numRetries: this.numberOfRetries});
    }
  }

  toggleEnabled(id) {
    this.useCard[id] = !this.useCard[id];

    if (this.onCardsArrayChanged) {
      this.onCardsArrayChanged({enabledArray: this.useCard});
    }
  }

  changeCardValue() {
    if (this.onCardValuesArrayChanged) {
      this.onCardValuesArrayChanged({valuesArray: this.card});
    }
  }
}

AHeaderController.$inject = ['$log'];

export const aHeader = {
  template: require('./a-header.html'),
  controller: AHeaderController,
  bindings: {
    onNumRetriesChanged: '&',
    onCardsArrayChanged: '&',
    onCardValuesArrayChanged: '&'
  }
};
