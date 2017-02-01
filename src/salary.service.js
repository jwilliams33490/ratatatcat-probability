export default class SalaryService {
  constructor($resource) {
    this.$resource = $resource;
    const res = $resource('http://localhost:3500/');
    return res;
  }
}

SalaryService.$inject = ['$resource'];
