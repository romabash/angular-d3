
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
				templateUrl:'src/home-template.html'
	  	})
	  	//Bar page
    	.state('bar', {
				url: '/bar',
				template:'<bar-display data="app.barData"></bar-display>',
				controller: 'MainCtrl as app'
	  	})
			//Tree page
      .state('tree', {
					url: '/tree',
					template:'<tree-display json-data="app.jsonData" new-node="app.newNode" data="app.barData"></tree-display>',
					controller: 'MainCtrl as app'
	  	});

	}

})();
