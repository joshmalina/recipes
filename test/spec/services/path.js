'use strict';

describe('Service: Path', function () {

  // load the service's module
  beforeEach(module('recipesApp'));

  // instantiate service
  var Path;
  beforeEach(inject(function (_Path_) {
    Path = _Path_;
  }));

  it('should do something', function () {
    expect(!!Path).toBe(true);
  });

});
