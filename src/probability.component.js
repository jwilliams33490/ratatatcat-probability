class ProbabilityController {
  constructor(d3Service, $log) {
    this.$log = $log;
    this.$d3 = null;
    this.card1 = [];
    this.card2 = [];
    this.hand = [];
    this.deck = this.cards();
    this.valueDeck = this.valueCards();

    const self = this;
    d3Service.d3().then(d3 => {
      self.$d3 = d3;

      self.finishInit(d3);

      self.buildCardHistogram("card1Prob", self.card1, [-1, 11]);
      self.buildCardHistogram("card2Prob", self.card2, [-1, 11]);
      self.buildCardHistogram("handProb", self.hand, [-1, 19]);
    });
  }

  finishInit() {
    this.selectXCardsFromDeck(99999, this.valueDeck);

    this.$log.log('jb');
    this.$log.log(this.deck);
    this.$log.log(this.valueDeck);
    this.$log.log(this.card1);
    this.$log.log(this.card2);
    this.$log.log(this.hand);
    this.$log.log('jb2');
  }

  selectXCardsFromDeck(numberOfSelections, deck) {
    this.card1 = this.$d3.range(numberOfSelections).map(() => {
      return this.mapSelectionToCard(Math.random() * deck.length | 0, deck);
    });

    this.card2 = this.$d3.range(numberOfSelections).map(() => {
      return this.mapSelectionToCard(Math.random() * deck.length | 0, deck);
    });

    for (let i = 0; i < numberOfSelections; i++) {
      this.hand[i] = this.card1[i] + this.card2[i];
    }
  }

  buildCardHistogram(id, data, dataDomain) {
    const h = this.$d3.select(`#${id}`);

    const formatCount = this.$d3.format(",.0f");

    const margin = {top: 10, right: 30, bottom: 30, left: 30};
    const width = Number(h.attr("width")) - margin.left - margin.right;
    const height = Number(h.attr("height")) - margin.top - margin.bottom;
    const g = h.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = this.$d3.scaleLinear()
      .domain(dataDomain)
      .rangeRound([0, width]);

    const hgram = this.$d3.histogram()
      .domain(x.domain())
      .thresholds(x.ticks(dataDomain[1] - dataDomain[0]));

    const bins = hgram(data);

    const domainMax = this.$d3.max(bins, d => {
      return d.length;
    });
    this.$log.log(`scale: domain [0,${domainMax}], range [${height}, 0]`);
    const y = this.$d3.scaleLinear()
      .domain([0, domainMax])
      .range([height, 0]);

    const bar = g.selectAll(".bar")
      .data(bins)
      .enter().append("g")
      .attr("class", "bar")
      .attr("transform", d => {
        return `translate(${x(d.x0)},${y(d.length)})`;
      });

    bar.append("rect")
      .attr("x", 1)
      .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
      .attr("height", d => {
        return height - y(d.length);
      });

    bar.append("text")
      .attr("dy", ".75em")
      .attr("y", 6)
      .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
      .attr("text-anchor", "middle")
      .text(d => {
        return formatCount(d.length);
      });

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0,${height})`)
      .call(this.$d3.axisBottom(x));
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

  cards() {
    const cards = valueCards();
    let x = 11;
    let startAt = cards.length - 1;
    let numOfRank = 3;
    let numOfDuplicates = 3;
    for (let y = 0; y < 3; y++) {
      for (let w = 0; w < numOfDuplicates; w++) {
        cards[startAt + (y * numOfDuplicates) + w] = x;
      }
      x += 1;
    }
    return cards;
  }
}

ProbabilityController.$inject = ['d3Service', '$log'];

export const probability = {
  template: require('./probability.html'),
  controller: ProbabilityController,
  bindings: {
  }
};
