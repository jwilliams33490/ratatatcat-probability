class AHeaderController {
  constructor($log) {
    this.$log = $log;
    this.$log.log('header loaded');
  }
}

AHeaderController.$inject = ['$log'];

export const aHeader = {
  template: require('./a-header.html'),
  controller: AHeaderController,
  bindings: {
  }
};
