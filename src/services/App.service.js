
(function(){
  'use strict';
	
  angular.module('App')
  .service('MainService', MainService);
  
//Service - MainService
  MainService.$inject = ['d3Service'];
  function MainService(d3Service){
	  
    var service = this;

  }
	
})();