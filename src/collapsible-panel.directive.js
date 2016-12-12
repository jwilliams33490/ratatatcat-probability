export default class CollapsiblePanel {
  constructor($log) {
    this.$log = $log;

    this.templateUrl = './collapsible-panel.html';
    this.restrict = 'A';
    this.controller = CollapsiblePanelController;

    // this.transclude = true;

    this.scope = {
      panelTitle: '@',
      showBadge: '<',
      badgeValue: '<'
    };

    // this.link = function (scope, el, attrs, ctrl, transclude) {
    //   el.find('.content').append(transclude());
    // };
  }
}

export class CollapsiblePanelController {
  constructor($scope, $log) {
    $scope.$log = $log;
    $scope.toggleBody = this.toggleBody;
    $scope.showBody = true;
  }

  toggleBody() {
    this.showBody = !this.showBody;
  }
}

CollapsiblePanelController.$inject = ['$scope', '$log'];
