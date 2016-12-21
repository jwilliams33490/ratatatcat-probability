class AHeaderController {
  constructor($log) {
    this.$log = $log;
    this.numberOfRetries = 5000;
    this.numberOfCards = 4;
    // this.cardChoices = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    this.cardChoices = ['?', '0', '<= 1', '1', '<= 2', '2', '<= 3', '3', '<= 4', '4', '<= 5', '5', '<= 6', '6', '<= 7', '7', '<= 8', '8', '<= 9', '9'];
    this.card1 = '?';
    this.card2 = '?';
    this.card3 = '?';
    this.card4 = '?';
    this.useCard1 = true;
    this.useCard2 = true;
    this.useCard3 = true;
    this.useCard4 = true;

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

  numCardsChanged() {
    if (this.onNumCardsChanged) {
      this.onNumCardsChanged({numCards: this.numberOfCards});
    }
  }

  toggleEnabled2(id) {
    this.useCard[id] = !this.useCard[id];

    if (this.onCardsArrayChanged) {
      this.onCardsArrayChanged({enabledArray: this.useCard});
    }
    this.numberOfCards = 0;
    for (let i = 0; i < this.useCard.length; i++) {
      if (this.useCard[i]) {
        this.numberOfCards++;
      }
    }
  }

  changeCardValue2() {
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
    onNumCardsChanged: '&',
    onCardsArrayChanged: '&',
    onCardValuesArrayChanged: '&'
  }
};
