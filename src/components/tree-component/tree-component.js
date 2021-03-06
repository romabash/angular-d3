
(function(){
  'use strict';

  angular.module('App')
  .component('treeDisplay', {
	templateUrl:'src/components/tree-component/tree-component.html',
	controller: TreeDisplayController,
	bindings: {
		jsonData: '<',
		newNode: '<'
	}
  });

//Component Controller - Display
  TreeDisplayController.$inject = ['d3Service', '$window', '$element', '$rootScope'];
  function TreeDisplayController(d3Service, $window, $element, $rootScope){

    let $ctrl = this;

	  d3Service.d3().then(function(d3) {

      d3.select("body").on('click', outsideClick);

		  //Declare variables
		  let activatedNode; //activated new dragging node (circle)
		  let currentNode; //node to add to
      let clickedNode; //node when clicked to remove
		  let nodeToAdd; //node being added (dragging node) based on its data
		  let tempPosition = { "x": 0, "y": 0};

		  //Set dimensions and margins of the diagram
		  let margin = {top: 20, right: 90, bottom: 30, left:90};
		  let width = 600 - margin.left - margin.right;
		  let height = 400 - margin.top - margin.bottom;

		  //Declare canvas with dimension and Zoom
		  let canvas = d3.select("#tree").append("svg")
		  .style('width', '100%')
		  .attr("height", height + margin.top + margin.bottom)
		  .style("background-color", 'AliceBlue')
		  .style("border", "1px solid #b7c9e5")
		  .call(d3.zoom().on("zoom", function() {
         canvas.attr("transform", d3.event.transform);
       }))
		  .append("g")
		  	.attr("transform", "translate(" + margin.left + "," + margin.top + ")" );

		  //Main render function - takes json object as parameter for the tree
		  $ctrl.render = function(jsonData){
		  	canvas.selectAll('*').remove();

		  	//Create new node and group the circle and its text to drag together
		  	let circle = canvas.selectAll("g")
		  		.data($ctrl.newNode)
		  		.enter()
		  		.append("g")
		  		.call(d3.drag()
		  			.on("start", dragstarted)
		  			.on("drag", dragged)
		  			.on("end", dragended)
		  		);

		  	circle.append("circle")
		  		.attr("cx", 20)
		  		.attr("cy", 20)
		  		.attr("r", 17)
		  		.style("fill", "#35bac4")
		  		.attr('cursor', 'pointer');

		  	circle.append("text")
		  		.text(function(d) { return d.name; })
		  		.attr("x", 0)
		  		.attr("y", 0)
		  		.attr("font-family", "sans-serif")
		  		.attr("font-size", "12px")
		  		.attr("fill", "black");

		  	//Gets the root object of the passed json object
		  	let root = d3.hierarchy(jsonData, function(d) {
		  		return d.children;
		  	});

		  	//Declare a Tree Layout and assign the size
		  	let treemap = d3.tree().size([height, width]);

		  	$ctrl.treeData = treemap(root); //Map the node data to the Tree Layout (Still just root Object)
		  	let nodes = $ctrl.treeData.descendants(); //Array of separate objects from the tree-made treeData
		  	let links = nodes.slice(1); //Array of separate objects MINUS the first Root Object

		  	// Normalize for fixed-depth - Changes y for shorter paths
		  	nodes.forEach(function(d){ d.y = d.depth * 180});

		  	//Add Paths first to have circles drawn over the path lines
		  	canvas.selectAll(".link")
		  	.data(links)
		  	.enter()
		  	.append("path")
		  		.attr("class", "link")
		  		.attr("fill", "none")
		  		.attr("stroke", "grey")
		  		.attr("d", drawPath);

		  	//Add each node as a group - from nodes
		  	let node = canvas.selectAll(".node")
		  		.data(nodes)
		  		.enter()
		  		.append("g")
		  			.attr("class", "node")
		  			.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")";} )
		  			.on("mouseover", getNodeInfo)
            .on('click', onClick);

		  	//Add the circle to the node to see on canvas
		  	node.append("circle")
		  		.attr("r", 17)
		  		.attr('cursor', 'pointer')
		  		.on("mouseover", activate)
		  		.on("mouseout", deactivate);

		  	//Add the text to the node - name
		  	node.append("text")
		  		.text(function(d) { return d.data.name; })
		  		.attr("transform", "translate(" + -20 + "," + -25 + ")" );

		  }//Ends render function

		  //Call render Function with initial jsonData from Controller
		  $ctrl.render($ctrl.jsonData)

      /* -------------- FUNCTIONS -------------- */

		  //Activate current node of the tree
		  function activate(d) {
		  	//Activate this node
		  	d3.select(this).classed("activated", true);
		  	//Get the active draggingNewNode - class added in dragstarted function
		  	let dragingNewNode = d3.select(".active");

		  	//If draggingNewNode is being dragged
		  	if(dragingNewNode._groups[0][0] != null){
		  		let dragingNewNodePosition = dragingNewNode._groups[0][0].getBoundingClientRect();
		  		let activatedNodePosition = d3.select(this)._groups[0][0].getBoundingClientRect();
		  		//Check if the draggingNewNode is inside the element
		  		let overlaping = overlap(dragingNewNodePosition, activatedNodePosition);
		  		if(overlaping){
		  			activatedNode = true; //Used in mouseover event of the node to get the node data
		  		}
		  	}
		  }//Ends activate function

		  //De-activate Current Node of the Tree
		  function deactivate(d) {
		  	d3.select(this).classed("activated", false);
		  	activatedNode = false;
		  }

      //Assign the node info to currentNode to push new node into it
		  function getNodeInfo(d) {
		  	if (activatedNode) {
		  		currentNode = d; //Used in dragended function to push new node
		  	}
		  }

      //onClick Function to add the X to remove the node
      function onClick(d) {
        d3.event.stopPropagation(); //Stop click on the body event
        clickedNode = d;

        //Check if another node is already clicked, remove X if yes
        if( d3.selectAll(".clicked")._groups[0].length > 0 ){
          canvas.selectAll(".clicked").remove();
        }
        //Add X on click to remove the node only if it has a parent - not for root node
        if(clickedNode.parent){
          d3.select(this).append("g")
            .attr("class", "clicked")
              .append("text")
              .text("X")
              .style("font-size", "24px")
              .attr("fill", "red")
              .attr('cursor', 'pointer')
              .attr("transform", "translate(" + 20 + "," + -20 + ")" )
              .on("click", onRemove);
        }
      }//Ends onClick function

      //Function when clicked outside of the node to remove X
      function outsideClick() {
        canvas.selectAll(".clicked").remove();
      }

      //Function to remove the node and its children from treeData
      function onRemove() {
        //Compare clickedNode to its parent's children and remove the node from the parent
        for(let i=0; i<clickedNode.parent.children.length; i++){
          if (clickedNode === clickedNode.parent.children[i]){
            clickedNode.parent.children.splice(i,1);
            clickedNode.parent.data.children.splice(i,1)
          }
        }
        $ctrl.render($ctrl.treeData.data) //pass in as a json
      }


		  function dragstarted(d) {
        //Remove X from any node if any
        if( d3.selectAll(".clicked")._groups[0].length > 0 ){
          canvas.selectAll(".clicked").remove();
        }

		  	tempPosition.x = d3.event.x;
		  	tempPosition.y = d3.event.y;
		  	//Set the dragging new node as active (only applying class to the circle, not text)
		  	d3.select(this).select("circle").classed("active", true);
		  	//Create a copy of the data of the node
		  	nodeToAdd = JSON.parse(JSON.stringify(d));
		  }

		  function dragged(d) {
		  	d3.select(this)
		  		.attr("transform", "translate(" + (d3.event.x-20) + "," + (d3.event.y-20) + ")");
		  }

		  function dragended(d) {
		  	//Get the activated node circle
		  	let activatedNode = d3.select(".activated");
		  	//Get this dragging node circle
		  	let dragingNewNode = d3.select(this);

		  	//If node is activated
		  	if(activatedNode._groups[0][0] != null){
		  		let dragingNewNodePosition = dragingNewNode._groups[0][0].getBoundingClientRect();
		  		let activatedNodePosition = activatedNode._groups[0][0].getBoundingClientRect();
		  		//Check if the circle is inside the element
		  		let overlaping = overlap(dragingNewNodePosition, activatedNodePosition);

		  		if(overlaping && currentNode){
		  			//Add children array if empty node doesn't have children
		  			if (!currentNode.children){
		  				currentNode.children = [];
		  				currentNode.data.children = [];
		  			}

		  			currentNode.children.push(nodeToAdd);
		  			currentNode.data.children.push(nodeToAdd);
		  		}
		  		//Return back and set draggingNewNode to no longer active
		  		d3.select(this).classed("active", false);
		  		d3.select(this)
		  		.attr("transform", "translate(" + tempPosition.x + "," + tempPosition.y + ")");
		  	}
		  	else {
		  		//Return back if didn't append node
		  		d3.select(this).classed("active", false);
		  		d3.select(this)
		  		.attr("transform", "translate(" + tempPosition.x + "," + tempPosition.y + ")");
		  	}

		  	$ctrl.render($ctrl.treeData.data) //pass in as a json

		  }//Ends dragended function

		  //Returns true if elements overlap
		  function overlap(elem1, elem2) {
		  	return !(elem1.right < elem2.left ||
		  		elem1.left > elem2.right ||
		  		elem1.bottom < elem2.top ||
		  		elem1.top > elem2.bottom)
		  }

		  //Function to draw the paths
		  function drawPath(d) {
		  	return "M" + d.y + "," + d.x
		  	+ "C" + (d.y + d.parent.y) / 2 + "," + d.x
		  	+ " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
		  	+ " " + d.parent.y + "," + d.parent.x;
		  };

		  //Function to count the most children to readjust the tree height
		  function childrenCount(node, count){
		  	if(node.children){
		  		if (count < node.children.length){
		  			$ctrl.count = node.children.length;
		  		}
		  		//go through all its children
		  		for(let i = 0; i < node.children.length; i++){
		  			//if the current child in the for loop has children of its own
		  			//call recurse again on it to decend the whole tree
		  			if (node.children[i].children){
		  				childrenCount(node.children[i], $ctrl.count);
		  			}
		  		}
		  	}
		  	return $ctrl.count;
		  }

	  });//Ends d3 promise

  }//Ends controller function

})();
