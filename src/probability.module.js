import angular from 'angular';
// import d3 from 'd3';

import {probability} from './probability.component.js';
import {d3Service} from './d3factory.js';
import {aHeader} from './a-header.component.js';

export default angular.module('prob', [])
  .component('probability', probability)
  .component('aHeader', aHeader)
  .service('d3Service', d3Service)
  .name;
