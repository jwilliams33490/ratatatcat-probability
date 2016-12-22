class probabilityService {
  constructor($log, d3Service) {
    this.$log = $log;

    const self = this;
    d3Service.d3().then(d3 => {
      self.$d3 = d3;
    });
  }

  selectOneCardFromDeckWithoutReplacement(deck, card) {
    let deckCardIdx = -1;
    if (card.use) {
      if (this.useActualValue(card)) {
        card.selectedValues.push(card.maxKnownValue);
        for (let i = 0; i < deck.length; i++) {
          if (deck[i] === card.maxKnownValue) {
            deckCardIdx = i;
          }
        }
      } else {
        let maxIdx = deck.length - 1;
        if (card.maxKnownValue < 9) {
          // assuming deck is sorted, we can reduce sort-space to 0 - maxKnownValue
          for (let i = 0; i < deck.length; i++) {
            if (deck[i] <= card.maxKnownValue) {
              maxIdx = i;
            }
          }
        }
        deckCardIdx = this.getRandomIdx(maxIdx);
        card.selectedValues.push(deck[deckCardIdx]);
      }
    } else {
      card.selectedValues.push(0);
    }

    // remove the selected card from deck
    if (deckCardIdx > -1) {
      deck.splice(deckCardIdx, 1);
    }

    return deck;
  }

  selectOneHandFromDeckWithoutReplacement(deck, cards) {
    let deckInUse = deck;
    for (let i = 0; i < cards.length; i++) {
      deckInUse = this.selectOneCardFromDeckWithoutReplacement(deckInUse, cards[i]);
    }
  }

  selectXHandsFromDeckWithoutReplacement(deck, cards, numberOfSelections) {
    cards.forEach(c => {
      c.selectedValues = [];
    });

    for (let i = 0; i < numberOfSelections; i++) {
      const freshDeck = [];
      deck.forEach(n => freshDeck.push(n));
      this.selectOneHandFromDeckWithoutReplacement(freshDeck, cards);
    }
  }

  calculatedCardExpectedValue(card) {
    card.expectedValue = this.calcAvg(card.selectedValues);
    if (!this.useActualValue(card)) {
      card.expectedValue = `${card.expectedValue.toFixed(2)}*`;
    }
  }

  calculateHandExpectedValues(cards) {
    cards.forEach(c => this.calculatedCardExpectedValue(c));
  }

  getRandomIdx(max) {
    return this.getRandomInt(0, max);
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

  mapSelectionToCard(selectionIdx, deck) {
    return deck[selectionIdx];
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
