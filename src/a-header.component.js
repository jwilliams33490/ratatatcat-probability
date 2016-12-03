class AHeaderController {
  constructor($log) {
    this.$log = $log;
    this.numberOfRetries = 50000;
    this.numberOfCards = 4;
    this.cardChoices = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    this.card1 = -1;
    this.card2 = -1;
    this.card3 = -1;
    this.card4 = -1;
    this.useCard1 = true;
    this.useCard2 = true;
    this.useCard3 = true;
    this.useCard4 = true;
  }

  numRetriesChanged() {
    if (this.onNumRetriesChanged) {
      this.onNumRetriesChanged({numRetries: this.numberOfRetries});
    }
  }

  numCardsChanged() {
    if (this.onNumCardsChanged) {
      this.onNumCardsChanged({numCards: this.numberOfCards});
    }
  }

  toggleEnabled(id) {
    this[id] = !this[id];

    if (this.onCardsArrayChanged) {
      this.onCardsArrayChanged({enabledArray: [this.useCard1, this.useCard2, this.useCard3, this.useCard4]});
    }
    let i = 0;
    if (this.useCard1) {
      i++;
    }
    if (this.useCard2) {
      i++;
    }
    if (this.useCard3) {
      i++;
    }
    if (this.useCard4) {
      i++;
    }
    this.numberOfCards = i;
  }

  changeCardValue() {
    if (this.onCardValuesArrayChanged) {
      this.onCardValuesArrayChanged({valuesArray: [this.card1, this.card2, this.card3, this.card4]});
    }
  }
}

AHeaderController.$inject = ['$log'];

export const aHeader = {
  template: require('./a-header.html'),
  controller: AHeaderController,
  bindings: {
    onNumRetriesChanged: '&',
    onNumCardsChanged: '&',
    onCardsArrayChanged: '&',
    onCardValuesArrayChanged: '&'
  }
};
