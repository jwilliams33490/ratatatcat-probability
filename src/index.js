import angular from 'angular';

import {techsModule} from './app/techs/index';
import 'angular-ui-router';
import routesConfig from './routes';

import {main} from './app/main';
import {header} from './app/header';
import {title} from './app/title';
import {footer} from './app/footer';

import {aHeader} from './a-header.component.js';
import prob from './probability.module.js';

import './index.scss';

angular
  .module('app', [techsModule, 'ui.router', prob])
  .config(routesConfig)
  .component('app', main)
  .component('aHeader', aHeader)
  .component('fountainHeader', header)
  .component('fountainTitle', title)
  .component('fountainFooter', footer);
