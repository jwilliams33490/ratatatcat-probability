class probabilityService {
  constructor($log, d3Service) {
    this.$log = $log;

    const self = this;
    d3Service.d3().then(d3 => {
      self.$d3 = d3;
    });
  }

  selectXCardsFromDeckForOneCard(deck, numberOfSelections, card) {
    card.deck = this.$d3.range(numberOfSelections).map(() => {
      if (card.use) {
        if (this.useActualValue(card)) {
          return card.maxKnownValue;
        }
        return this.mapSelectionToCard(Math.random() * deck.length | 0, deck);
      }
      return 0;
    });
    card.expectedValue = this.calcAvg(card.deck);
    if (!this.useActualValue(card)) {
      card.expectedValue = `${card.expectedValue.toFixed(2)}*`;
    }
  }

  useActualValue(card) {
    return card.isKnownValue;
  }

  calcAvg(arrayOfValues) {
    let i = 0;
    arrayOfValues.forEach(n => {
      i += n;
    });
    return i / arrayOfValues.length;
  }

  mapSelectionToCard(roll, deck) {
    return deck[roll];
  }

  valueCards() {
    const cards = [];
    let x = 0;
    let numOfRank = 9;
    let numOfDuplicates = 4;
    for (let y = 0; y < numOfRank; y++) {
      for (let w = 0; w < numOfDuplicates; w++) {
        cards[(y * numOfDuplicates) + w] = x;
      }
      x += 1;
    }
    const startAt = numOfRank * numOfDuplicates;
    numOfRank = 1;
    numOfDuplicates = 9;
    for (let y = 0; y < 1; y++) {
      for (let w = 0; w < numOfDuplicates; w++) {
        cards[startAt + (y * numOfDuplicates) + w] = x;
      }
      x += 1;
    }
    return cards;
  }

  allCards() {
    const cards = this.valueCards();
    let x = 11;
    const startAt = cards.length - 1;
    const numOfRank = 3;
    const numOfDuplicates = 3;
    for (let y = 0; y < numOfRank; y++) {
      for (let w = 0; w < numOfDuplicates; w++) {
        cards[startAt + (y * numOfDuplicates) + w] = x;
      }
      x += 1;
    }
    return cards;
  }

  setCumulativeProbabilitesData(deck) {
    let currentSuit = -1;
    let currentCumulativeSuit = null;
    const cumulativeSuitData = [];
    deck.forEach(card => {
      if (currentSuit !== card) {
        if (currentCumulativeSuit) {
          cumulativeSuitData.push(currentCumulativeSuit);
        }
        currentCumulativeSuit = {id: card, count: 0};
        currentSuit = card;
      }
      currentCumulativeSuit.count++;
    });
    if (currentCumulativeSuit) {
      cumulativeSuitData.push(currentCumulativeSuit);
    }

    let totalSoFar = 0;
    cumulativeSuitData.forEach(suit => {
      totalSoFar += suit.count;
      suit.cumulativeCount = totalSoFar;
    });
    return cumulativeSuitData;
  }

  setDeckData(deck) {
    const data = {};
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    deck.forEach(c => {
      min = Math.min(c, min);
      max = Math.max(c, max);
    });
    data.suitMin = min;
    data.suitMax = max;

    return data;
  }
}

probabilityService.$inject = ['$log', 'd3Service'];

export {probabilityService};
