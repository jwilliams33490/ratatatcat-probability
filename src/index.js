import angular from 'angular';

import 'angular-ui-router';
import routesConfig from './routes';

import prob from './probability.module.js';
import CollapsiblePanel, {CollapsiblePanelController} from './collapsible-panel.directive.js';

import './index.scss';

import 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';

angular
  .module('app', ['ui.router', prob])
	.directive('collapsiblePanel', ['$log', $log => new CollapsiblePanel($log)])
	.controller('collapsiblePanelController', CollapsiblePanelController)
    .config(routesConfig);
