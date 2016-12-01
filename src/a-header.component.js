class AHeaderController {
  constructor($log) {
    this.$log = $log;
    this.numberOfRetries = 50000;
    this.numberOfCards = 4;
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
}

AHeaderController.$inject = ['$log'];

export const aHeader = {
  template: require('./a-header.html'),
  controller: AHeaderController,
  bindings: {
    onNumRetriesChanged: '&',
    onNumCardsChanged: '&'
  }
};
