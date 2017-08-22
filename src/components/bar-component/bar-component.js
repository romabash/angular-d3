
(function(){
  'use strict';

  angular.module('App')
  .component('barDisplay', {
	templateUrl: 'src/components/bar-component/bar-component.html',
	controller: BarDisplayController,
	bindings: {
		data: '<' // in routes: data=app.barData.  When using $ctrl.data in template or controller, refering to app.barData
	}
  });

//Component Controller - Display
  BarDisplayController.$inject = ['d3Service', '$window', '$element'];
  function BarDisplayController(d3Service, $window, $element){
	  var $ctrl = this;

	  d3Service.d3().then(function(d3) {

	  	var margin = 20;
	  	var barHeight = 20;
	  	var barPadding = 5;

	  	$window.onresize = function() {
	  		$ctrl.render();
	  	};

	  	var canvas = d3.select('#bars')
	  		.append('svg')
	  		.style('width', '100%');
	  		//.style('border', '1px solid black');

	  	$ctrl.render = function() {
	  		//remove all previous items before render
	  		canvas.selectAll('*').remove();

	  		//set up width based on the size of the div
	  		var width = d3.select("#bars").node().offsetWidth - margin;
	  		// calculate the height of canvas
	  		var height = $ctrl.data.length * (barHeight + barPadding);
	  		// Use the schemeCategory10 scale function for multicolor support
	  		var color = d3.scaleOrdinal(d3.schemeCategory10);

	  		var xScale = d3.scaleLinear()
	  			.domain([0, d3.max($ctrl.data, function(d) { return d.score; }) ]) //max score
	  			.range([0, width]);

	  		// set the height based on the calculations above
	  		canvas.attr('height', height);

	  		//create the rectangles for the bar chart
	  		canvas.selectAll('rect')
	  		.data($ctrl.data).enter()
	  			.append('rect')
	  			.attr('height', barHeight)
	  			.attr('width', 140) //start from 140 and then transition
	  			.attr('x', Math.round(margin/2))
	  			.attr('y', function(d,i) {
	  				return i * (barHeight + barPadding);
	  			})
	  			.attr('fill', function(d, i) { return color(i); })
	  			.transition()
	  			.duration(1000)
	  			.attr('width', function(d) {
	  				return xScale(d.score);
	  			});

      } //Ends render function

	  	$ctrl.$doCheck = function(){
	  		$ctrl.render();
	  	};

    }); //Ends d3 promise

    $ctrl.$doCheck = function(){

    };

  } // Ends Controller

})();
