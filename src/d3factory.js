class d3Service {
  constructor($document, $q, $rootScope, $window, $log) {
    this.$log = $log;
    const d = $q.defer();

    function onScriptLoad() {
      // Load client in the browser
      $log.log('hi4');
      const l = $log;
      const d1 = d;
      // const self = this;
      $rootScope.$apply(() => {
        l.log('hi2');
        d1.resolve($window.d3);
      });
    }

    // Create a script tag with d3 as the source
    // and call our onScriptLoad callback when it
    // has been loaded
    const scriptTag = $document[0].createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.async = true;
    scriptTag.src = 'http://d3js.org/d3.v4.min.js';
    scriptTag.onreadystatechange = function () {
      this.$log.log('hi3');
      if (this.readyState === 'complete') {
        onScriptLoad();
      }
    };
    scriptTag.onload = onScriptLoad;
    this.$log.log('hi');

    const s = $document[0].getElementsByTagName('body')[0];
    this.$log.log(s);
    s.appendChild(scriptTag);
    this.$log.log(s);

    return {
      d3: () => {
        return d.promise;
      }
    };
  }
}

d3Service.$inject = ['$document', '$q', '$rootScope', '$window', '$log'];

export {d3Service};
