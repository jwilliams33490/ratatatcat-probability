class ProbabilityController {
  constructor(d3Service, $document, $log) {
    this.$document = $document;
    this.$log = $log;
    this.$d3 = null;
    this.card1 = [];
    this.card2 = [];
    this.card3 = [];
    this.card4 = [];
    this.showC1 = true;
    this.showC2 = true;
    this.showC3 = true;
    this.showC4 = true;
    this.hand = [];
    this.deck = this.cards();
    this.valueDeck = this.valueCards();
    this.deckInUse = this.valueDeck;
    this.deckInUseData = this.setDeckData(this.deckInUse);
    this.deckCumulativeData = this.setCumulativeProbabilitesData(this.deckInUse);

    this.numberOfSelections = 50000;
    this.numberOfCards = 4;

    const self = this;
    d3Service.d3().then(d3 => {
      self.$d3 = d3;
      self.finishInit(d3);
    });
  }

  finishInit() {
    this.setCardDataAndRedrawHistograms(true);
    this.drawCumulativeProbabilityGraph();
  }

  setCardDataAndRedrawHistograms(newDraw) {
    this.selectXCardsFromDeck(this.valueDeck);

    this.buildCardHistogram("card1Prob", this.card1, [(this.deckInUseData.suitMin - 1), (this.deckInUseData.suitMax + 2)], newDraw);
    this.buildCardHistogram("card2Prob", this.card2, [(this.deckInUseData.suitMin - 1), (this.deckInUseData.suitMax + 2)], newDraw);
    this.buildCardHistogram("card3Prob", this.card3, [(this.deckInUseData.suitMin - 1), (this.deckInUseData.suitMax + 2)], newDraw);
    this.buildCardHistogram("card4Prob", this.card4, [(this.deckInUseData.suitMin - 1), (this.deckInUseData.suitMax + 2)], newDraw);
    this.buildCardHistogram("handProb", this.hand, [((this.numberOfCards * this.deckInUseData.suitMin) - 1), (this.numberOfCards * this.deckInUseData.suitMax) + 2], newDraw);
  }

  selectXCardsFromDeck(deck) {
    this.$log.log(`recalculating...numberOfCards: ${this.numberOfCards}`);

    this.card1 = this.$d3.range(this.numberOfSelections).map(() => {
      if (this.numberOfCards > 0) {
        return this.mapSelectionToCard(Math.random() * deck.length | 0, deck);
      }
      return 0;
    });

    this.card2 = this.$d3.range(this.numberOfSelections).map(() => {
      if (this.numberOfCards > 1) {
        return this.mapSelectionToCard(Math.random() * deck.length | 0, deck);
      }
      return 0;
    });

    this.card3 = this.$d3.range(this.numberOfSelections).map(() => {
      if (this.numberOfCards > 2) {
        return this.mapSelectionToCard(Math.random() * deck.length | 0, deck);
      }
      return 0;
    });

    this.card4 = this.$d3.range(this.numberOfSelections).map(() => {
      if (this.numberOfCards > 3) {
        return this.mapSelectionToCard(Math.random() * deck.length | 0, deck);
      }
      return 0;
    });

    this.hand = [];
    for (let i = 0; i < this.numberOfSelections; i++) {
      this.hand[i] = this.card1[i] + this.card2[i] + this.card3[i] + this.card4[i];
    }
  }

  buildCardHistogram(id, data, dataDomain, newDraw) {
    const h = this.$d3.select(`#${id}`);

    const formatCount = this.$d3.format(",.0f");

    const margin = {top: 10, right: 30, bottom: 30, left: 30};
    const width = Number(h.attr("width")) - margin.left - margin.right;
    const height = Number(h.attr("height")) - margin.top - margin.bottom;

    let g = {};
    if (newDraw) {
      g = h.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    } else {
      g = h.select("g");
    }

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

    // const t = this.$d3.transition().duration(7500);

    const y = this.$d3.scaleLinear()
      .domain([0, domainMax])
      .range([height, 0]);

    g.selectAll(".axis.axis--x")
      .remove();

    g.selectAll(".bar")
      // .transition(t)
      .remove();

    const bar = g.selectAll(".bar")
      // .transtion(t)
      .data(bins)
      .enter()
      .append("g")
      .attr("class", "bar")
      .attr("transform", d => {
        return `translate(${x(d.x0)},${y(d.length)})`;
      });

    bar.append("rect")
      // .transtion(t)
      .attr("x", 1)
      .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
      .attr("height", d => {
        return height - y(d.length);
      });

    bar.append("text")
      // .transtion(t)
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

  drawCumulativeProbabilityGraph() {
    const svg = this.$d3.select("#cumulativeProb");
    const margin = {top: 20, right: 20, bottom: 30, left: 50};
    const width = Number(svg.attr("width")) - margin.left - margin.right;
    const height = Number(svg.attr("height")) - margin.top - margin.bottom;
    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    // const parseTime = this.$d3.timeParse("%d-%b-%y");

    const x = this.$d3.scaleLinear()
        .rangeRound([0, width]);

    const y = this.$d3.scaleLinear()
        .rangeRound([height, 0]);

    const line = this.$d3.line()
        .x(d => {
          return x(d[0]);
        })
        .y(d => {
          return y(d[1]);
        });

    const medianline = this.$d3.line()
        .x(d => {
          return x(d[0]);
        })
        .y(() => {
          return y(50);
        });

    const data = [];
    this.deckCumulativeData.forEach(suit => {
      const sub = [suit.id, (suit.cumulativeCount / this.deckInUse.length * 100)];
      data.push(sub);
    });

    x.domain(this.$d3.extent(data, d => {
      return d[0];
    }));
    y.domain(this.$d3.extent(data, d => {
      return d[1];
    }));

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", `translate(0, ${height})`)
        .call(this.$d3.axisBottom(x));

    g.append("g")
        .attr("class", "axis axis--y")
        .call(this.$d3.axisLeft(y))
      .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .style("text-anchor", "end")
        .text("Cumulative Pct (%)");

    g.append("path")
        .datum(data)
        .attr("class", "line")
        .style("stroke", "#ddd")
        .style("stroke-dasharray", "4,4")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("d", medianline);

    g.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("stroke", "green")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("d", line);
  }

  onNumRetriesChanged(value) {
    this.numberOfSelections = value;
    this.setCardDataAndRedrawHistograms(false);
  }

  onNumCardsChanged(value) {
    this.$log.log(`on numcards changed: ${value}`);
    this.numberOfCards = value;
    this.setCardDataAndRedrawHistograms(false);
  }

  togglePanel(id) {
    this.$log.log(id);

    this[id] = !this[id];

    const panel = this.$document[0].getElementById(id);
    let y = panel;
    let x = y;
    y = x;
    x = y;

    this.$log.log(this);

    // panel.getElementsByTagName('.panel-body').slideUp();
// $(document).on('click', '.panel-heading span.clickable', function(e){
//     var $this = $(this);
//   if(!$this.hasClass('panel-collapsed')) {
//     $this.parents('.panel').find('.panel-body').slideUp();
//     $this.addClass('panel-collapsed');
//     $this.find('i').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
//   } else {
//     $this.parents('.panel').find('.panel-body').slideDown();
//     $this.removeClass('panel-collapsed');
//     $this.find('i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
//   }
// })
  }
}

ProbabilityController.$inject = ['d3Service', '$document', '$log'];

export const probability = {
  template: require('./probability.html'),
  controller: ProbabilityController,
  bindings: {
  }
};
