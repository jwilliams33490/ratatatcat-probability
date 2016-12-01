class d3Service {
  constructor($document, $q, $rootScope, $window, $log) {
    this.$log = $log;
    const d = $q.defer();

    function onScriptLoad() {
      // Load client in the browser
      const d1 = d;
      // const self = this;
      $rootScope.$apply(() => {
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
      if (this.readyState === 'complete') {
        onScriptLoad();
      }
    };
    scriptTag.onload = onScriptLoad;

    const s = $document[0].getElementsByTagName('body')[0];
    s.appendChild(scriptTag);

    return {
      d3: () => {
        return d.promise;
      }
    };
  }
}

d3Service.$inject = ['$document', '$q', '$rootScope', '$window', '$log'];

export {d3Service};
