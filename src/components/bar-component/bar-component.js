
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
	  let $ctrl = this;

	  d3Service.d3().then(function(d3) {

	  	let margin = 20;
	  	let barHeight = 20;
	  	let barPadding = 5;

	  	$window.onresize = function() {
	  		$ctrl.render();
	  	};

	  	let canvas = d3.select('#bars')
	  		.append('svg')
	  		.style('width', '100%');
	  		//.style('border', '1px solid black');

	  	$ctrl.render = function() {
	  		//remove all previous items before render
	  		canvas.selectAll('*').remove();

	  		//set up width based on the size of the div
	  		let width = d3.select("#bars").node().offsetWidth - margin;
	  		// calculate the height of canvas
	  		let height = $ctrl.data.length * (barHeight + barPadding);
	  		// Use the schemeCategory10 scale function for multicolor support
	  		let color = d3.scaleOrdinal(d3.schemeCategory10);

	  		let xScale = d3.scaleLinear()
	  			.domain([0, d3.max($ctrl.data, function(d) { return d.score; }) ]) //max score
	  			.range([0, width]);

	  		// set the height based on the calculations above
	  		canvas.attr('height', height);

	  		//Create the rectangles for the bar chart
	  		let bars = canvas.selectAll('g')
	  		  .data($ctrl.data)
          .enter()
          .append("g");

	  		bars.append('rect')
	  		  .attr('height', barHeight)
	  		  .attr('width', 140) //start from 140 and then transition
	  		  .attr('x', 0)
	  		  .attr('y', function(d,i) {
	  		  	return i * (barHeight + barPadding);
	  		  })
	  		  .attr('fill', function(d, i) { return color(i); })
	  		  .transition()
	  		  .duration(1000)
	  		  .attr('width', function(d) {
	  		  	return xScale(d.score);
	  		  });

        bars.append("text")
    			.text(function(d) { return d.name; })
    			.attr("x", 0)
    			.attr("y", function(d,i) {
	  		  	return i * (barHeight + barPadding) + 15;
	  		  })
    			.attr("font-family", "sans-serif")
    			.attr("font-size", "14px")
    			.attr("fill", "#fff")
          .attr("font-weight", "bold");

      } //Ends render function

	  	$ctrl.$doCheck = function(){
	  		$ctrl.render();
	  	};

    }); //Ends d3 promise

    $ctrl.$doCheck = function(){
    };

    $ctrl.$onDestroy = function () {
      $window.onresize = null;
    }

  } // Ends Controller

})();
