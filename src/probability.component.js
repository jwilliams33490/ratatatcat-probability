class ProbabilityController {
  constructor(d3Service, $document, $log, probabilityService, SalaryService) {
    this.$document = $document;
    this.$log = $log;
    this.$d3 = null;
    this.probabilityService = probabilityService;
    this.handExpectedValue = 0;

    this.SalaryService = SalaryService;
    this.ezeSalary = 80000;

    this.cards = [];
    for (let i = 0; i < 4; i++) {
      const card = {};
      card.use = true;
      card.show = true;
      card.selectedValues = [];
      card.actualValue = -1;
      card.maxKnownValue = 9;
      card.isKnownValue = false;
      card.expectedValue = 0;
      this.cards.push(card);
    }

    this.hand = [];
    this.deck = this.probabilityService.allCards();
    this.valueDeck = this.probabilityService.valueCards();
    this.genericDeck = this.valueDeck;
    this.genericDeckData = this.probabilityService.setDeckData(this.genericDeck);
    this.genericDeckCumulativeData = this.probabilityService.setCumulativeProbabilitesData(this.genericDeck);
    for (let i = 0; i < 4; i++) {
      this.cards[i].deck = this.valueDeck;
    }
    this.analyzeDecks();

    this.numberOfSelections = 5000;
    this.numberOfCards = 4;

    const self = this;
    d3Service.d3().then(d3 => {
      self.$d3 = d3;
      self.finishInit(d3);
    });
  }

  salaryValuesChanged() {
    this.$log.log(`ezeSalary: ${this.ezeSalary}`);
    this.$log.log(`hi`);
    this.SalaryService.save({ezeSalary: this.ezeSalary, ezeSeverance: 10000, ezeRetention: 10000, newSalary: 85000, newBonus: 20000});
  }

  finishInit() {
    this.setCardDataAndRedrawHistograms(true);
    this.drawCumulativeProbabilityGraph();
  }

  analyzeDecks() {
    for (let i = 0; i < 4; i++) {
      this.cards[i].deckData = this.probabilityService.setDeckData(this.cards[i].deck);
      this.cards[i].deckCumulativeData = this.probabilityService.setCumulativeProbabilitesData(this.cards[i].deck);
    }
  }

  setCardDataAndRedrawHistograms(newDraw) {
    this.selectXCardsFromDeck();

    for (let ci = 0; ci < 4; ci++) {
      this.buildCardHistogram(`card${ci}Prob`, this.cards[ci].selectedValues, [(this.cards[ci].deckData.suitMin - 1), (this.cards[ci].deckData.suitMax + 2)], newDraw);
    }
    this.buildCardHistogram("handProb", this.hand, [((this.numberOfCards * this.genericDeckData.suitMin) - 1), (this.numberOfCards * this.genericDeckData.suitMax) + 2], newDraw);
  }

  selectXCardsFromDeck() {
    this.probabilityService.selectXHandsFromDeckWithoutReplacement(this.genericDeck, this.cards, this.numberOfSelections);
    this.probabilityService.calculateHandExpectedValues(this.cards);

    this.hand = [];
    for (let i = 0; i < this.numberOfSelections; i++) {
      this.hand[i] = this.cards[0].selectedValues[i] + this.cards[1].selectedValues[i] + this.cards[2].selectedValues[i] + this.cards[3].selectedValues[i];
    }
    this.handExpectedValue = `${this.probabilityService.calcAvg(this.hand).toFixed(2)}*`;
  }

  buildCardHistogram(id, data, dataDomain, newDraw) {
    const h = this.$d3.select(`#${id}`);

    const formatCount = this.$d3.format(",.0f");

    let viewPortWidth = Number(h.attr("width"));
    let viewPortHeight = Number(h.attr("height"));

    if (!h.attr("width")) {
      if (id === "handProb") {
        viewPortWidth = 400;
      } else {
        viewPortWidth = 400;
      }
    }
    if (!h.attr("height")) {
      if (id === "handProb") {
        viewPortHeight = 200;
      } else {
        viewPortHeight = 200;
      }
    }

    const margin = {top: 10, right: 30, bottom: 30, left: 30};
    const width = viewPortWidth - margin.left - margin.right;
    const height = viewPortHeight - margin.top - margin.bottom;

    let g = {};
    if (newDraw) {
      g = h.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    } else {
      g = h.select("g");
    }

    const x = this.$d3.scaleLinear()
      .domain(dataDomain)
      .rangeRound([0, width]);

    const xAxisOffset = width / (dataDomain[1] - dataDomain[0]);
    const xAxisStart = Math.round(xAxisOffset * 1.5);
    const xAxisBackingStart = Math.round(xAxisOffset * 0.5);

    const xAxis = this.$d3.scaleLinear()
      .domain([dataDomain[0] + 1, dataDomain[1] - 2])
      .rangeRound([0, width - (xAxisOffset * 3)]);

    const xAxisTickValues = [];
    for (let i = dataDomain[0] + 1; i < dataDomain[1] - 1; i++) {
      xAxisTickValues.push(i);
    }

    const hgram = this.$d3.histogram()
      .domain(x.domain())
      .thresholds(x.ticks(dataDomain[1] - dataDomain[0]));

    const bins = hgram(data);

    const domainMax = this.$d3.max(bins, d => {
      return d.length;
    });

    const y = this.$d3.scaleLinear()
      .domain([0, domainMax])
      .range([height, 0]);

    const xAxisBackingData = [bins[0], bins[bins.length - 1]];

    const xAxisBackingLine = this.$d3.line()
        .x(d => {
          return x(d.x0);
        })
        .y(() => {
          return y(0);
        });

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

    if (id === "handProb") {
      bar.append("text")
        // .transtion(t)
        .attr("dy", ".75em")
        .style("font-size", "6px")
        .attr("y", ".4em")
        .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2 - 15)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text(d => {
          return formatCount(d.length);
        });
    } else {
      bar.append("text")
         // .transtion(t)
         .attr("dy", ".75em")
         .attr("y", 6)
         .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
         .attr("text-anchor", "middle")
         .text(d => {
           return formatCount(d.length);
         });
    }

    let xAxisObj = this.$d3.axisBottom(xAxis)
                    .tickValues(xAxisTickValues);
    if (id === "handProb") {
      xAxisObj = this.$d3.axisBottom(xAxis);
    }

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(${xAxisStart}, ${height})`)
      .call(xAxisObj);

    g.append("path")
        .datum(xAxisBackingData)
        .attr("class", "domain")
        .attr("stroke", "#000")
        .attr("fill", "none")
        .attr("transform", `translate(${xAxisBackingStart}, 0.5)`)
        .attr("d", xAxisBackingLine);
  }

  drawCumulativeProbabilityGraph() {
    this.drawSimpleCumulativeProbabilityGraph();
    this.drawMoreAccurateCumulativeProbabilityGraph();
  }

  drawSimpleCumulativeProbabilityGraph() {
    const svg = this.$d3.select("#cumulativeProb");

    let viewPortWidth = Number(svg.attr("width"));
    let viewPortHeight = Number(svg.attr("height"));

    if (!svg.attr("width")) {
      viewPortWidth = 900;
    }
    if (!svg.attr("height")) {
      viewPortHeight = 500;
    }

    const margin = {top: 20, right: 20, bottom: 30, left: 50};
    const width = viewPortWidth - margin.left - margin.right;
    const height = viewPortHeight - margin.top - margin.bottom;
    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

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
    this.genericDeckCumulativeData.forEach(suit => {
      const sub = [suit.id, (suit.cumulativeCount / this.genericDeck.length * 100)];
      data.push(sub);
    });

    x.domain(this.$d3.extent(data, d => {
      return d[0];
    }));
    y.domain([0, 100]);

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

  drawMoreAccurateCumulativeProbabilityGraph() {
    const svg = this.$d3.select("#betterCumulativeProb");

    let viewPortWidth = Number(svg.attr("width"));
    let viewPortHeight = Number(svg.attr("height"));

    if (!svg.attr("width")) {
      viewPortWidth = 900;
    }
    if (!svg.attr("height")) {
      viewPortHeight = 500;
    }

    const margin = {top: 20, right: 20, bottom: 30, left: 50};
    const width = viewPortWidth - margin.left - margin.right;
    const height = viewPortHeight - margin.top - margin.bottom;
    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Define the div for the tooltip
    const div = this.$d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    const x = this.$d3.scaleLinear()
        .rangeRound([0, width]);

    const y = this.$d3.scaleLinear()
        .rangeRound([height, 0]);

    const medianline = this.$d3.line()
        .x(d => {
          return x(d[0]);
        })
        .y(() => {
          return y(50);
        });

    const basicData = [];
    this.genericDeckCumulativeData.forEach(suit => {
      const sub = [suit.id, (suit.cumulativeCount / this.genericDeck.length * 100)];
      basicData.push(sub);
    });

    x.domain(this.$d3.extent(basicData, d => {
      return d[0];
    }));
    y.domain([0, 100]);

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
        .datum([basicData[0], basicData[basicData.length - 1]])
        .attr("class", "line")
        .style("stroke", "#ddd")
        .style("stroke-dasharray", "4,4")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("d", medianline);

    basicData.forEach(lineCoordinates => {
      g.append("circle")
          .datum(lineCoordinates)
          .attr("cy", d => {
            return y(d[1]);
          })
          .attr("cx", d => {
            return x(d[0]);
          })
          .attr("r", 4)
          .attr("stroke", "green")
          .attr("fill", "green")
          .on("mouseover", d => {
            div.transition()
              .duration(200)
              .style("opacity", 0.9);
            div.html(`${d[0]}, ${Number(d[1]).toFixed(2)}`)
              .style("left", `${this.$d3.event.pageX}px`)
              .style("top", `${(this.$d3.event.pageY - 28)}px`);
          })
          .on("mouseout", () => {
            div.transition()
              .duration(500)
              .style("opacity", 0);
          });
    });
  }

  onNumRetriesChanged(value) {
    this.numberOfSelections = value;
    this.setCardDataAndRedrawHistograms(false);
  }

  togglePanel(idx) {
    this.cards[idx].show = !this.cards[idx].show;
  }

  onCardsArrayChanged(enabledArray) {
    let i = 0;
    let idx = 0;
    enabledArray.forEach(n => {
      this.cards[idx].use = n;
      idx++;

      if (n) {
        i++;
      }
    });
    this.numberOfCards = i;
    this.setCardDataAndRedrawHistograms(false);
  }

  onCardValuesArrayChanged(valuesArray) {
    let idx = 0;
    valuesArray.forEach(n => {
      this.cards[idx].actualValue = n;
      this.cards[idx].isKnownValue = (n.length === 1 && n !== "?");
      this.cards[idx].maxKnownValue = this.readMaxValueFromDropdownValue(this.cards[idx]);
      idx++;
    });
    this.adjustDecks();
    this.analyzeDecks();
    this.setCardDataAndRedrawHistograms(false);
  }

  adjustDecks() {
    const startingDeck = this.createDeckWithKnownCardsRemoved();
    this.cards.forEach(c => {
      const cardStartingDeck = [];
      startingDeck.forEach(n => {
        if (c.isKnownValue) {
          cardStartingDeck.push(n);
        } else if (n <= c.maxKnownValue) {
          cardStartingDeck.push(n);
        }
      });
      c.deck = cardStartingDeck;
    });
  }

  createDeckWithKnownCardsRemoved() {
    const startingDeck = [];
    const removeCards = [];
    this.genericDeck.forEach(c => startingDeck.push(c));

    this.cards.forEach(cardData => {
      if (cardData.use && cardData.isKnownValue) {
        removeCards.push(cardData.maxKnownValue);
      }
    });

    removeCards.forEach(n => {
      const idx = startingDeck.indexOf(n);
      startingDeck.splice(idx, 1);
    });

    return startingDeck;
  }

  readMaxValueFromDropdownValue(card) {
    if (card.isKnownValue) {
      return Number(card.actualValue);
    } else if (card.actualValue === "?") {
      return 9;
    } else if (card.length < 4) {
      return 9;
    }
    const pre = "<= ";
    return Number(card.actualValue.substring(pre.length));
  }
}

ProbabilityController.$inject = ['d3Service', '$document', '$log', 'probabilityService', 'SalaryService'];

export const probability = {
  template: require('./probability.html'),
  controller: ProbabilityController,
  bindings: {
  }
};
