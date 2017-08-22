
(function(){
  'use strict';

  angular.module('App')
  .controller('MainCtrl', MainCtrl);


//Controller
  MainCtrl.$inject = ['MainService'];
  function MainCtrl(MainService){

    var app = this;

    app.barData = [
      {name: "Bar 1", score: 10},
      {name: "Bar 2", score: 40},
      {name: 'Bar 3', score: 70},
      {name: "Bar 4", score: 100}
    ];

  }

})();
