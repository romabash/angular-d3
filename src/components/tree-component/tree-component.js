(function(){
  'use strict';

  angular.module('App')
  .component('treeDisplay', {
	  templateUrl: 'src/components/tree-component/tree-component.html',
	  controller: TreeDisplayController,
	  bindings: {
		  jsonData: '<',
		  newNode: '<'
	  }
  });

//Component Controller - Display
  TreeDisplayController.$inject = ['d3Service', '$window', '$element', '$rootScope'];
  function TreeDisplayController(d3Service, $window, $element, $rootScope){
	var $ctrl = this;

	d3Service.d3().then(function(d3) {

		//Declare letiables for activated nodes
		let activated_node; //activated node (circle)
		let appending_node; //node to add to
		let nodeToAdd; //node being added (dragging node) based on its data
		let temp_position = { "x": 0, "y": 0 };

		//Set dimensions and margins of the diagram
		let margin = {top: 20, right: 90, bottom: 30, left:90};
		let width = 600 - margin.left - margin.right;
		let height = 400 - margin.top - margin.bottom;

		//Declare canvas with dimension and Zoom
		let canvas = d3.select("#tree").append("svg")
		//.attr("width", width + margin.left + margin.right)
	   .style('width', '100%')
		.attr("height", height + margin.top + margin.bottom)
		//.attr("transform", "translate(" + margin.left + "," + margin.top + ")" )
		.style("background-color", '#e2fffc')
		.style("border", "1px solid #b7c9e5")
		.call(d3.zoom()
			.on("zoom", function() { canvas.attr("transform", d3.event.transform)
		}))
		.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")" );


		$ctrl.render = function(jsonData){

		canvas.selectAll('*').remove();

		canvas.selectAll("circle")
			.data($ctrl.newNode)
			.enter()
			.append("circle")
				.attr("cx", function(d, i) { return (i+1) * 40} )
				.attr("cy", function(d, i) { return 20} )
				.attr("r", 17)
				.style("fill", "#042559")
				.attr('cursor', 'pointer')
				.call(d3.drag()
					.on("start", dragstarted)
					.on("drag", dragged)
					.on("end", dragended)
				);

		//Declare a Tree Layout and assign the size
		let treemap = d3.tree().size([height, width]);

		//Gets the root object of the JSON
		let root = d3.hierarchy(jsonData, function(d) {
			return d.children;
		})

		$ctrl.treeData = treemap(root); //Map the node data to the Tree Layout (Still just root Object)
		let nodes = $ctrl.treeData.descendants(); //Array of separate objects from the tree-made treeData
		let links = nodes.slice(1); //Array of separate objects MINUS the first Root Object

		// Normalize for fixed-depth - Changes y for shorter paths
		nodes.forEach(function(d){ d.y = d.depth * 180});

		//Function to draw the paths
		let drawPath = function(d) {
			return "M" + d.y + "," + d.x
			+ "C" + (d.y + d.parent.y) / 2 + "," + d.x
			+ " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
			+ " " + d.parent.y + "," + d.parent.x;
		};

		//Add Paths First to have circles drawn over the path lines
		canvas.selectAll(".link")
		.data(links)
		.enter()
		.append("path")
			.attr("class", "link")
			.attr("fill", "none")
			.attr("stroke", "grey")
			.attr("d", drawPath);

		// adds each node as a group - from nodes
		let node = canvas.selectAll(".node")
			.data(nodes)
			.enter()
			.append("g")
				.attr("class", "node")
				.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")";} )
				.on("mouseover", function(d) {
					if (activated_node) {
					appending_node = d;
					//d.parent gets the most upstream parent
					}
				});

		// adds the circle to the node to see on canvas
		node.append("circle")
			.attr("r", 17)
			.attr('cursor', 'pointer')
			.on("mouseover", function() {
				//activate the this circle
				d3.select(this).classed("activated", true);
				//get the active dragging $ctrl.new_node
				let draging_new_node = d3.select(".active");

				//if circle is being dragged
				if(draging_new_node._groups[0][0] != null){
					let draging_new_node_position = draging_new_node._groups[0][0].getBoundingClientRect();
					let activated_node_position = d3.select(this)._groups[0][0].getBoundingClientRect();

					//check if the circle is inside the element
					let overlaping = overlap(draging_new_node_position, activated_node_position);
					if(overlaping){
						activated_node = true; //used in the node to get the node data
					}
				}
			})
			.on("mouseout", function() {
				d3.select(this).classed("activated", false);
				activated_node = false;
			});

			// adds the text to the node
			node.append("text")
				.text(function(d) { return d.data.name; })
				.attr("transform", "translate(" + -18 + "," + -22 + ")" );

		} //ends render function


		//returns true if elements overlap
		function overlap(elem1, elem2) {
			return !(elem1.right < elem2.left ||
				elem1.left > elem2.right ||
				elem1.bottom < elem2.top ||
				elem1.top > elem2.bottom)
		}

		function dragstarted(d) {
			temp_position.x = d3.event.x;
			temp_position.y = d3.event.y;
			//set the dragging new node as active
			d3.select(this).classed("active", true);

			//Create a copy of the data of the node
			nodeToAdd = JSON.parse(JSON.stringify(d));
		}

		function dragged(d) {
			d3.select(this)
				.attr("cx", d.x = d3.event.x)
				.attr("cy", d.x = d3.event.y)
		}

		function dragended(d) {

			//get the activated node circle
			let activated_node = d3.select(".activated");
			//get this dragging node circle
			let draging_new_node = d3.select(this);

			//if node is activated
			if(activated_node._groups[0][0] != null){

				let draging_new_node_position = draging_new_node._groups[0][0].getBoundingClientRect();
				let activated_node_position = activated_node._groups[0][0].getBoundingClientRect();
				//check if the circle is inside the element
				let overlaping = overlap(draging_new_node_position, activated_node_position);
				//if inside change color to blue
				if(overlaping && appending_node){

					//add children if empty node
					if (!appending_node.children){
						appending_node.children = [];
						appending_node.data.children = [];
					}

					appending_node.children.push(nodeToAdd);
					appending_node.data.children.push(nodeToAdd);
					console.log($ctrl.treeData);
				}
				d3.select(this).classed("active", false);
				d3.select(this)
					.attr("cx", d.x = temp_position.x)
					.attr("cy", d.x = temp_position.y);
			}
			else {
				d3.select(this).classed("active", false);
				d3.select(this)
					.attr("cx", d.x = temp_position.x)
					.attr("cy", d.x = temp_position.y);
			}

		$ctrl.render($ctrl.treeData.data) //pass in as a json
		}

		$ctrl.render($ctrl.jsonData)

	}); //Ends d3 promise

  } //ends controller function

})();
