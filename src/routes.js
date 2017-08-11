
(function(){
	'use strict';
	
	angular.module('App')
	.config(RoutesConfig);
	
	RoutesConfig.$inject = ['$stateProvider', '$urlRouterProvider'];
	function RoutesConfig($stateProvider, $urlRouterProvider){
	  
      //Redirect to home page if no other URL matches
      $urlRouterProvider.otherwise('/');

      //Set up UI states
      $stateProvider

      //Home page
      .state('home', {
		url: '/',
		template:'<main-display data="app.barData"></main-display>',
		controller: 'MainCtrl as app'
	  });
	  
	}
	
})();




