//*********************************************
// FUNCTIONS FOR DRAWING:
//*********************************************
/**
 * Initial draw function, prepare grid data, and call redraw at the end.
 */
function draw() {
	// d3.js bookkeeping to set what happens on each time tick in the simulation:
	force.on('tick', function () {
		vis.selectAll('line.link')
			.attr('x1', function (d) {
				return d.source.x;
			})
			.attr('y1', function (d) {
				return d.source.y;
			})
			.attr('x2', function (d) {
				return d.target.x;
			})
			.attr('y2', function (d) {
				return d.target.y;
			});
		vis.selectAll('.node')
			.attr("fixed", function (d) {
				return d.fixed
			}) // fixed a node
		.attr("transform", function (d) {
			return "translate(" + d.x + "," + d.y + ")";
		});
	});
	var name2nodeIndex = {}
	if (nodes.length == 0) {
		// Go through the first time and set up the nodes with indices:
		for (x in tree) {
			if ((tree[x].name != undefined || tree[x].module != undefined) && tree[x].from == undefined) {
				nodeName = tree[x].name
				nodeObject = (tree[x].object == "node") ? "gridNode" : tree[x].object
				isfixed = (tree[x].latitude != undefined && tree[x].longitude != undefined) ? true : false
				// Hack to make sure electrical nodes are classed differently than graph nodes for coloring purposes:
				if (undefined != tree[x].bustype && tree[x].bustype == 'SWING')
					nodeObject += ' swingNode'
				nodeIndex = nodes.length
				nodes.push({
					name: nodeName,
					treeIndex: parseInt(x),
					objectType: nodeObject,
					chargeMultiple: 1,
					x: tree[x].latitude,
					y: tree[x].longitude,
					fixed: isfixed
				})
				name2nodeIndex[nodeName] = nodeIndex
			}
		}

		// Go through a second time and set up the links:
		for (x in tree) {
			if (tree[x].name != undefined) {
				if (tree[x].from != undefined && tree[x].to != undefined) {
					name2nodeIndex[tree[x].name] = links.length
					links.push({
						source: name2nodeIndex[tree[x].from],
						target: name2nodeIndex[tree[x].to],
						treeIndex: parseInt(x),
						objectType: 'fromTo'
					})
				} else if (tree[x].parent != undefined) {
					links.push({
						source: name2nodeIndex[tree[x].name],
						target: name2nodeIndex[tree[x].parent],
						objectType: 'parentChild'
					})
				}
			}
		}
	}
	// This makes a fancy fade-in.
	vis.style('opacity', 1e-6)
		.transition()
		.duration(1500)
		.style('opacity', 1);
	// Start the layout.
	force.start();

	// Feeder loading
	var interval = setInterval(function () {
		if (force.alpha() < 0.05) {
			removeProgressDialog()
			clearInterval(interval)
		} else if (nodes[parseInt(Math.random() * nodes.length)].fixed) {
			removeProgressDialog()
			clearInterval(interval)
		} else {
			// Run the layout in the background until performance is acceptable.
			for (i = 0; i < 10; ++i) force.tick()		
		}
	}, 1000)

	// Start drawing.
	redraw()
}

/**
 * Draw svg elements. Start d3.force at the end. TODO: performance issue.
 */
function redraw() {
	link = d3.select('#linkLayer').selectAll('line.link')
		.data(links, function (d) {
			return d.source.treeIndex + '-' + d.target.treeIndex
		})

	link.enter().append('svg:line')
		.on('click', onCompClick)
		.attr('class', function (d) {
			return 'link ' + d.objectType
		})
		.attr('id', function (d) {
			return 'n' + d.treeIndex
		})
		.style('stroke-width', LINE_LINK_STROKE_WIDTH)
                .attr("marker-end", "url(#arrow)")
/*
		.attr('marker-start',
			function (d) {
				// console.log(d);
				treeData = tree[d.treeIndex]
				if (d.objectType == 'fromTo') {
					if (treeData.object == "transformer") {
						return "url(#transformerMarker)"
					};
					if (treeData.object == "fuse") {
						return "url(#fuseMarker)"
					};
					if (treeData.object == "regulator") {
						return "url(#regulatorMarker)"
					};
				};
			})
*/
	link.exit().remove()

	node = vis.selectAll('.node').data(nodes, function (d) {
		return d.treeIndex
	}).enter()
		.append("g")
		.call(force.drag)
		.attr('class', function (d) {
			return 'node ' + d.objectType
		})
		.attr('id', function (d) {
			return 'n' + d.treeIndex
		})
		.on('click', onCompClick)
	fontSizeRedraw(zoomer.scale());

	// Put the main circle on there, sized according to its size.
	node.append('svg:circle')
		.attr('id', function (d) {
			return 'circ' + d.treeIndex
		})
		.attr('class', 'nodeCircle')
		.attr('cx', 0)
		.attr('cy', 0)
		.attr('r', function (d) {
			return d.chargeMultiple * NODE_CIRCLE_RADIUS
		})
	// .attr("r", 100)
        .style('fill', function (d) {
            return d.color
        })
	.style('stroke-width', NODE_STROKE_WIDTH - 0.2);

	node.append('svg:circle')
		.attr('class', function (d) {
			if (d.fixed) {
				return 'nodeIsPinned'
			} else {
				return 'nodeNotPinned'
			}
		})

	node.selectAll('.nodeIsPinned')
		.attr('id', function (d) {
			return 'pin' + d.treeIndex
		})
	node.selectAll('.nodeNotPinned')
		.attr('id', function (d) {
			return 'pin' + d.treeIndex
		})

	node.append("svg:text")
		.attr("class", "nodetext")
	// Get rid of deleted nodes.
	vis.selectAll('.node').data(nodes, function (d) {
		return d.treeIndex
	}).exit().remove()

	d3.selectAll('.nodeIsPinned')
		.attr('cx', 0)
		.attr('cy', 0)
		.attr('r', PINNED_NODE_CIRCLE_RADIUS)
		.style('stroke-width', PINNED_NODE_STROKE_SIZE);
	d3.selectAll('.nodeNotPinned').attr('r', null)
	d3.selectAll('.node.selected').style('stroke-width', NODE_SELECTED_STROKE_WIDTH)

	// Updata sizes
	vis.selectAll('.nodeCircle').data(nodes, function (d) {
		return d.treeIndex
	})
		.attr('r', function (d) {
			return d.chargeMultiple * NODE_CIRCLE_RADIUS
		})

	// Show scalegrid. 
	force.start()
}

/**
 * Redraw font text size when move over nodes.
 * @param {number} scale 
 */
function fontSizeRedraw(scale) {
	d3.selectAll('.nodetext')
		.style('font-size', TEXT_FONT_SIZE / scale)
		.style("stroke-width", 1 / scale)
		.text(function (d) {
			if (d.chargeMultiple != 1) {
				return d.objectType + ' has hidden children'
			} else {
				return d.objectType
			}
		});
	
}

/**
 * Redraw after zoom level changes.
 */
function zoomRedraw() {
	var previourLevel = 1;
	// console.log(d3.event.scale, d3.event.translate)
	vis.attr('transform', 'translate(' + d3.event.translate + ')' + ' scale(' + d3.event.scale + ')')
	if (d3.event.scale < 1) {
		d3.selectAll('.link').style("stroke-width", LINE_LINK_STROKE_WIDTH / d3.event.scale);
	}
	fontSizeRedraw(d3.event.scale);
	previourLevel = d3.event.scale;
}

/**
 * Using zoomer to translate position(x, y) and set scale s
 * @param {number} x  
 * @param {number} y 
 * @param {number} s  
 */
function zoom(x, y, s) {
	vis.transition().duration(1000).attr('transform', 'translate(' + x + ',' + y + ') scale(' + s + ')')
	// Set the behavior scale and translate to the current condition.
	zoomer.scale(s)
	zoomer.translate([x, y])
	// reset link width
	if (s < 1) {
		d3.selectAll('.link').style("stroke-width", LINE_LINK_STROKE_WIDTH / s);
	} else {
		d3.selectAll("line.link").style("stroke-width", LINE_LINK_STROKE_WIDTH);
	}
	
	// console.log(zoomer.scale(), s)
	// redraw font-size
	fontSizeRedraw(s)
}

/**
 * Reset zoom to level 1 and translate to (0, 0)
 */
function zoomReset() {
	// TODO: rework our algorithm so we can zoom to fill the screen with the graph, not just go back to zoom level zero.
	zoom(0, 0, 1);
}

/**
 * Zoom to fix window size
 */
function zoomToFit() {
	function fly(attr_func, comp_func) {
		var largest;
		var my_n;
		for (i = 0; i < nodes.length; i++) {
			if (nodes[i].fixed === true) {
				if (!largest || comp_func(attr_func(nodes[i]), largest)) {
					largest = attr_func(nodes[i])
					my_n = nodes[i]
				}
			}
		}
		return my_n;
	}

	function the_center(bounds, i) {
		return ((bounds[0][i] + bounds[1][i]) / 2)
	}

	function xcenter() {
		return the_center(get_bounds(), 0) * zoomer.scale()
	}

	function ycenter() {
		return the_center(get_bounds(), 1) * zoomer.scale()
	}

	function window_hoz_center() {
		return ($(window).width() / 2) / ($(window).width() / 1000);
	}

	function window_vert_center() {
		var extra = $("#title").outerHeight() + $("#toolbar").outerHeight()
		var win_height = $(window).height() - extra
		return (win_height / 2 + extra) / ($(window).height() / 1000);
	}

	function center_feeder() {
		var trans_amt_x = window_hoz_center() - xcenter();
		var trans_amt_y = window_vert_center() - ycenter();
		zoom(trans_amt_x, trans_amt_y, zoomer.scale())
	}
	var rets_x = function (n) {
		return n.x;
	};
	var rets_y = function (n) {
		return n.y;
	};
	var lt = function (a, b) {
		return a < b;
	};
	var gt = function (a, b) {
		return a > b;
	};

	function get_bounds() {
		low_x = fly(rets_x, lt).x;
		high_x = fly(rets_x, gt).x;
		low_y = fly(rets_y, lt).y;
		high_y = fly(rets_y, gt).y;
		return [
			[low_x, low_y],
			[high_x, high_y]
		];
	}

	function win_h() {
		var extra = $("#title").outerHeight() + $("#toolbar").outerHeight()
		var win_h = $(window).height() - extra
		return win_h / ($(window).height() / 1000)
	}

	function get_width(bounds, i) {
		return bounds[1][i] - bounds[0][i];
	}

	function xwidth() {
		return get_width(get_bounds(), 0)
	}

	function ywidth() {
		return get_width(get_bounds(), 1)
	}
	zoom(0, 0, win_h() / ywidth())
	center_feeder()
}

/**
 * Zoom to select element in the center of current window
 */
function zoomToSelection() {
	domTargets = document.getElementsByClassName('selected')
	if (domTargets.length != 1) {
		return false
	}
	if (domTargets[0].nodeName == 'line') {
		x = getSelectedLink()['source']['x']
		y = getSelectedLink()['source']['y']
	} else {
		x = getSelectedNode()['x']
		y = getSelectedNode()['y']
	}
	var scale = 15
	var xNew = -x * scale + graphSvg.clientWidth / 2
	var yNew = -y * scale + graphSvg.clientHeight / 2
		// Zooming to a node's coordinates
	zoom(xNew, yNew, scale)
}

/**
 * Get center coordinates based on zoomer's scale and translate position
 * @return {[number, number]} Coordinate|[0,0]
 */
function getCenterCoordinates() {
	try {
		x = zoomer.translate()[0]
		y = zoomer.translate()[1]
		s = 1/zoomer.scale()
		xMod = graphSvg.clientWidth/2
		yMod = graphSvg.clientHeight/2
		return [s*(xMod-x), s*(yMod-y)]
	} catch(err) {
		// Probably haven't transformed yet.
		return [0,0]
	}
}

//*********************************************
// EVENT HANDLER FUNCTIONS, SELECT AND SEARCH FUNCTIONS
//*********************************************
/**
 * Node or link click event handler function, also used in components search.
 * @param {Object} d
 * @param {number} i  
 */
function onCompClick(d, i) {
	function classify(d, c) {
		svg = d3.select('#graphSvg')
		// turn off the old styled one, then style the new one
		svg.select('.' + c).classed(c, false);
		svg.select("#n" + d.treeIndex).classed(c, true);
	}
	// Start showing the table.
	// gebi('selected').className = ''
	// Abort if we try to select a parentChild relationship.
	if (d.objectType == 'parentChild') return false;
	// Multiselection case handled first:
	if (d3.event && d3.event.altKey) {
		classify(d, 'multiselected')
		return false
	}
	console.log(['treeIndex=' + d.treeIndex, 'name=' + d.name, 'obType=' + d.objectType])
	// Visually identify the selected node.
	classify(d, 'selected')
	// clear the selected table
	table = gebi('selected')
	table.setAttribute('keypress', "hotkeys()")
	tableClear(table)
	treeData = tree[d.treeIndex]
	ti = d.treeIndex;
	selectNode();
}

/**
 * Clear selected component either click in blank or delete that component
 */
function clearSelection() {
	try {
		svg.select('.selected').classed('selected', false)
		svg.select('.multiselected').classed('multiselected', false)
	} catch (err) {
		// ignore the error we get because we use svg before we define it--it'll be generated very fast after page load.
	}
	// deselect function inside tablescript.js
	deselect()
}

/**
 * Select component via tree index, when a list of components is found, use it to iterate next component.
 * @param  {number} treeIndex
 */
function selectViaTreeIndex(treeIndex) {
	if (tree[treeIndex].hasOwnProperty('from')) {
		// That particular tree item is a link:
		linkI = findIndex(links, 'treeIndex', treeIndex)
		onCompClick(links[linkI], linkI)
	} else if (tree[treeIndex].hasOwnProperty('object') && tree[treeIndex]['object'] != 'player') {
		// Or it's a node:
		nodeI = findIndex(nodes, 'treeIndex', treeIndex)
		onCompClick(nodes[nodeI], nodeI)
	} else {
		nodeI = findIndex(nodes, 'treeIndex', treeIndex)
		onCompClick(nodes[nodeI], nodeI)
		// Degenerate case: object without visual representation.
	}
}

/**
 * graphSvg click handler function, clear selected component.
 */
function onSvgBlankCanvasClick() {
	if (window.event.toElement.tagName == 'svg') {
		clearSelection()
	}
}

/**
 * Return a node object, if the node is selected.
 * @return {Object} node return single node object, if not find, return undefined.
 */
function getSelectedNode() {
	try {
		hits = document.getElementsByClassName('selected')
		nodeIndex = findIndex(nodes, 'treeIndex', hits[0]['id'].substr(1))
		return nodes[nodeIndex]
	} catch (err) {
		// We had no selection, or the selection wasn't in the links.
		return undefined
	}
}

/**
 * Return a node object, if multinodes selected.
 * @return {Object} node 
 */
function getAltSelectedNode() {
	try {
		hits = document.getElementsByClassName('multiselected')
		nodeIndex = findIndex(nodes, 'treeIndex', hits[0]['id'].substr(1))
		return nodes[nodeIndex]
	} catch (err) {
		// We had no selection, or the selection wasn't in the links.
		return undefined
	}
}

/**
 * Return a link object, if the link is selected.
 * @return {Object} link return a single link object, if not find, return undefined.
 */
function getSelectedLink() {
	try {
		hits = document.getElementsByClassName('selected')
		linkIndex = findIndex(links, 'treeIndex', hits[0]['id'].substr(1))
		return links[linkIndex]
	} catch (err) {
		// We had no selection, or the selection wasn't in the links.
		return undefined
	}
}

/**
 * Hotkeys binding the page onkeypress event.
 */
function hotkeys() {
	// IE8 and earlier
	if (window.event) {
		x = event.keyCode
	}
	// IE9/Firefox/Chrome/Opera/Safari
	else if (event.which) {
		x = event.which
	}
	keychar = String.fromCharCode(x);
	if (event.target.type != 'text' && $("#otherButtons").css("display") == "none") {
		// Dispatch the key:
		if (keychar == 'p') {
			toggleSelectedPin()
		} else if (keychar == 'f') {
			foldAtSelected()
		} else if (keychar == 'u') {
			unfoldAtSelected()
		}
	}
}

//**************************************************
// ADDING COMPONENTS FUNCTIONS
//**************************************************
/**
 * Fill menu of "Add" button and its handler functions.
 */
function fillComponentMenu() {
	newObjectMenu = gebi('newObjectMenu')
	for (component in components) {
		if (undefined == components[component]['from'] && undefined == components[component]['parent']) {
			addingFunctionName = 'newNode'
		} else if (undefined == components[component]['from']) {
			addingFunctionName = 'newChildAtSelected'
		} else {
			addingFunctionName = 'newLink'
		}
		newObjectMenu.innerHTML += ('<li><a href="javascript:' + addingFunctionName + '(\'' + component + '\')">' + component + '</a></li>')
	}
}

/**
 * Add a new node based on the name of component. Set node attributes, and add to nodes list. Redraw the graph at the end.
 * @param  {string} componentName
 */
function newNode(componentName) {
	// Get the stuff we need.
	component = clone(components[componentName])
	treeNewIndex = nextTreeKey()
	// Put the component in the tree with a new name.
	tree[treeNewIndex] = component
	tree[treeNewIndex].name = componentName + String(treeNewIndex)
	// Add to the nodes.
	newType = component.object
	// Hack to make sure we color nodes correctly:
	if (newType == 'node') newType = 'gridNode'
	if (undefined != tree[treeNewIndex].bustype && tree[treeNewIndex].bustype == 'SWING') newType += ' swingNode'
	// Add the node to the center of the graph
	coords = getCenterCoordinates()
	nodeToAdd = {
		name: component.name,
		objectType: newType,
		treeIndex: treeNewIndex,
		chargeMultiple: 1,
		fixed: true,
		x: coords[0],
		y: coords[1],
		px: coords[0],
		py: coords[1]
	}
	nodes.push(nodeToAdd)
	redraw()
}

/**
 * Add a new link based on the name of component. Set link attributes, and add to nodes list. Redraw the graph at the end.
 * @param  {string} componentName
 */
function newLink(componentName) {
	// Fail if we have an incorrect selection.
	function alreadyLinked(nodeName1, nodeName2) {
		for (linkId in links) {
			sourceName = links[linkId].source.name
			targetName = links[linkId].target.name
			if ((nodeName1 == sourceName && nodeName2 == targetName) || (nodeName1 == targetName && nodeName2 == sourceName)) {
				return true
			}
		}
		return false
	}
	try {
		selectedName = getSelectedNode()['name']
		altSelectedName = getAltSelectedNode()['name']
	} catch (err) {
		// Key error!
		selectedName = undefined
		altSelectedName = undefined
	}
	// Check validation of a link
	if (undefined == selectedName || undefined == altSelectedName || selectedName == altSelectedName || alreadyLinked(selectedName, altSelectedName)) {
		alert('I am sorry, but we cannot insert a link there.')
		return false
	}
	// Get the stuff we need.
	component = clone(components[componentName])
	treeNewIndex = nextTreeKey()
	// Make sure component's to and from are set.
	component['from'] = selectedName
	component['to'] = altSelectedName
	// Put the component in the tree with a new name.
	tree[treeNewIndex] = component
	tree[treeNewIndex].name = componentName + String(treeNewIndex)
	// TODO: make absolutely sure we're not clobbering a name. We should just come up with a unique naming convention.
	// Add to the links.
	linkToAdd = {
		source: nodes[findIndex(nodes, 'name', selectedName)],
		target: nodes[findIndex(nodes, 'name', altSelectedName)],
		treeIndex: treeNewIndex,
		objectType: 'fromTo'
	}
	links.push(linkToAdd)
	redraw()
}

/**
 * Add a new child node at selected component
 * @param  {string} componentName
 */
function newChildAtSelected(componentName) {
	if (undefined == getSelectedNode()) {
		alert('I am sorry, but we cannot insert a child element there.')
		return false
	}
	// Get the stuff we need.
	component = clone(components[componentName])
	newChildAtLocation(component, getSelectedNode()['treeIndex'])
	redraw()
}

/**
 * Append a node to its parent's 
 * @param  {Object} component
 * @param  {number} treeIndex
 * @return {Object} nodeToAdd
 */
function newChildAtLocation(component, treeIndex) {
	treeNewIndex = nextTreeKey()
	newName = component['object'] + String(treeNewIndex)
	// Make sure component's parent is set.
	component['parent'] = tree[treeIndex]['name']
	// decide which attribute should be put into node and tree
	if (tree[treeIndex].latitude != undefined && tree[treeIndex].longitude != undefined) {
		component['latitude'] = tree[treeIndex].latitude + Math.random() * 4 - 2
		component['longitude'] = tree[treeIndex].longitude + Math.random() * 4 - 2
		// Put the component in the tree with a new name.
		tree[treeNewIndex] = component
		tree[treeNewIndex].name = newName
		// Add to the nodes.
		// TODO: when the previour graph is pinned, it should set fixed as false rather than true
		if (d3.selectAll('.node.gridNode').attr('fixed') == 'true') {
			isfixed = true
		} else {
			isfixed = false
		}
		nodeToAdd = {
			name: component.name,
			objectType: component.object,
			treeIndex: treeNewIndex,
			chargeMultiple: 1,
			x: component['latitude'],
			y: component['longitude'],
			fixed: isfixed
		}
		nodes.push(nodeToAdd)
	} else {
		if (d3.selectAll('.node.gridNode').attr('fixed') == 'true' && tree[treeIndex].latitude != undefined) {
			isfixed = true
		} else {
			isfixed = false
		}
		tree[treeNewIndex] = component
		tree[treeNewIndex].name = newName
		nodeToAdd = {
			name: component.name,
			objectType: component.object,
			treeIndex: treeNewIndex,
			chargeMultiple: 1,
			fixed: isfixed
		}
		nodes.push(nodeToAdd)
	}
	// Add to the links.
	linkToAdd = {
		source: nodes[findIndex(nodes, 'name', newName)],
		target: nodes[findIndex(nodes, 'name', tree[treeIndex]['name'])],
		objectType: 'parentChild'
	}
	links.push(linkToAdd)
	return nodeToAdd
}

//*********************************************
// EDITING FUNCTIONS
//*********************************************
/**
 * Handler function of adding static load to houses.
 */
function staticLoadsToHouses() {
	function randomHouse() {
		newHouse = {}
		newHouse['object'] = 'house'
		newHouse['air_temperature'] = '70'
		newHouse['cooling_COP'] = randomInt(25, 40) / 10.0 + ''
		newHouse['cooling_setpoint'] = 'cooling' + randomInt(1, 8) + '*1'
		newHouse['cooling_system_type'] = randomChoice(['ELECTRIC', 'HEAT_PUMP', 'NONE'])
		// House sizing distribution from http://www.census.gov/housing/ahs/
		// between 1100 and 3000. Probably needs a normal distribution.
		area = 1800 + 500 * randomGaussian()
		if (area < 500) {
			area = 500
		}
		area = area.toPrecision(2) * 1.0 + ''
		newHouse['floor_area'] = area
		newHouse['heating_COP'] = randomInt(20, 35) / 10.0 + ''
		newHouse['heating_setpoint'] = 'heating' + randomInt(1, 8) + '*1'
		newHouse['heating_system_type'] = randomChoice(['RESISTANCE', 'HEAT_PUMP', 'GAS'])
		newHouse['mass_temperature'] = '70'
		skew = 1200 * randomGaussian()
		skew = skew.toPrecision(3) * 1.0 + ''
		newHouse['schedule_skew'] = skew
		newHouse['thermal_integrity_level'] = randomChoice([1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6]) + ''
		treeNewIndex = nextTreeKey()
		newHouse['name'] = 'synhouse' + treeNewIndex
		return newHouse
	}

	function randomLights() {
		newLights = {}
		newLights['object'] = 'ZIPload'
		newLights['power_fraction'] = '0.400000'
		newLights['current_fraction'] = '0.300000'
		newLights['impedance_pf'] = '1.000'
		newLights['current_pf'] = '1.000'
		newLights['power_pf'] = '1.000'
		newLights['impedance_fraction'] = '0.300000'
		newLights['heatgain_fraction'] = '0.9'
		power = 1.2 + randomGaussian()
		if (power < 0) {
			power = -1 * power
		}
		power = power.toPrecision(3) * 1.0 + ''
		newLights['base_power'] = 'LIGHTS*' + 1.33
		skew = 2000 * randomGaussian()
		skew = skew.toPrecision(3) * 1.0 + ''
		newLights['schedule_skew'] = skew
		treeNewIndex = nextTreeKey()
		newLights['name'] = 'synLights' + treeNewIndex
		return newLights
	}

	function randomWaterHeater() {
		newHeater = {}
		if (randomChoice([1, 2, 3]) == 3) {
			return false
		}
		// Static properties.
		newHeater['object'] = 'waterheater'
		newHeater['temperature'] = '135'
		newHeater['tank_volume'] = '50'
		newHeater['location'] = 'INSIDE'
		// Uniformly distributed properties.
		newHeater['heating_element_capacity'] = randomInt(37, 53) / 10.0 + ''
		newHeater['thermostat_deadband'] = randomInt(20, 60) / 10.0 + ''
		newHeater['demand'] = 'water' + randomInt(1, 20) + '*1'
		newHeater['tank_UA'] = randomInt(20, 40) / 10.0 + ''
		// Gaussian properties.
		skew = 2000 * randomGaussian()
		skew = skew.toPrecision(3) * 1.0 + ''
		newHeater['schedule_skew'] = skew
		newHeater['tank_setpoint'] = (randomGaussian() * 2 + 130).toPrecision(3) + ''
		// between 1100 and 3000. Probably needs a normal distribution.
		treeNewIndex = nextTreeKey()
		newHeater['name'] = 'synwaterheater' + treeNewIndex
		return newHeater
	}

	function replaceAllHouses() {
		progressBarUpdate(percentage)
		if (i < tkeys.length && !in_use && percentage != 100) {
			in_use = true
			var limit = i + 100
			for (; i < tkeys.length && i < limit; i++) {
				index = tkeys[i]
				if (tree[index].hasOwnProperty('object') && tree[index].hasOwnProperty('parent') && tree[index]['object'] == 'triplex_node') {
					//get the parent index in tree, actually it is triplex_meter index
					parentIndex = findIndex(tree, 'name', tree[index]['parent'])
					// delete the triplex_node
					deleteObject(index)
					// create a new node which parent is 
					newHouse = randomHouse()
					newLights = randomLights()
					newHeater = randomWaterHeater()
					newChildAtLocation(newHouse, parentIndex)
					houseIndex = findIndex(tree, 'name', newHouse['name'])
					newChildAtLocation(newLights, houseIndex)
					if (newHeater != false) {
						newChildAtLocation(newHeater, houseIndex)
					}
				}
				percentage = Math.round(i / tkeys.length * 100).toFixed(2)
			}
			in_use = false
		} else {
			redraw()
			removeProgressBar()
			in_use = false;
			clearInterval(inter)
		}
	}

	function progressBarUpdate(percentage) {
		if (document.getElementById('progBar') != undefined)
			document.getElementById('progColor').style.width = percentage + '%'
	}

	function noTriplexNode() {
		for (x in hiddenNodes) {
			if (hiddenNodes[x].objectType != undefined && hiddenNodes[x].objectType == 'triplex_node')
				return true
		}
		return false
	}

	i = 0
	percentage = 0
	in_use = false;
	// TODO: for secondary system has 'load', replace it with triplex_meter and triplex_node
	tkeys = Object.keys(tree)
	if (noTriplexNode()) {
		alert('TRIPLEX NODES have been hidden by the layout, please unfold them first.')
	} else {
		showProgressBar('Please wait. Houses are being generated.')
		// set interval function to run replaceAllHouses every 10 ms, if it is running, will put one request in the queue.
		inter = setInterval(replaceAllHouses, 10)
	}
}

/**
 * UNKNOWN
 */
function replaceLoadWithTriplex() {
	var tkeys = Object.keys(tree);
	var count = tkeys.length;
	// TODO: performance issue here, same with staticLoadsToHouses()
	for (var i = count - 1; i >= 0; i--) {
		if (tree[tkeys[i]].object != undefined && tree[tkeys[i]].object == 'load') {
			// Add triplex_meter
			parentIndex = findIndex(tree, 'name', tree[tkeys[i]]['parent'])
			triName = 'tri' + tree[tkeys[i]].name
			triPhases = tree[tkeys[i]].phases
			triObject = 'triplex_meter'
			triVol = tree[tkeys[i]].nominal_voltage
			triMeter = {
				'name': triName,
				'phases': triPhases,
				'object': triObject,
				'nominal_voltage': triVol
			}
			newNode = newChildAtLocation(triMeter, parentIndex)
			// Add triplex_node
			parentIndex = findIndex(tree, 'name', newNode.name)
			triNodeName = 'triNode' + newNode.name
			triNodeParents = newNode.name
			triNodePower = Math.max(parseFloat(tree[tkeys[i]].constant_power_A), parseFloat(tree[tkeys[i]].constant_power_B), parseFloat(tree[tkeys[i]].constant_power_C))
			triNodePhases = tree[tkeys[i]].phases
			triNodeVol = tree[tkeys[i]].nominal_voltage
			triNode = {
				'name': triNodeName,
				'phases': triNodePhases,
				'power_12': triNodePower,
				'object': 'triplex_node',
				'nominal_voltage': triNodeVol
			}
			newChildAtLocation(triNode, parentIndex)
			// delete load object
			deleteObject(tkeys[i])
		}
	}
}

/**
 * Handler function of adding solar based on percentage it wants to add.
 */
function solarAdding() {
	function makeNewInverter(phases) {
		newInverter = {}
		newInverter['object'] = 'inverter'
		newInverter['phases'] = phases
		newInverter['generator_status'] = 'ONLINE'
		newInverter['inverter_type'] = 'PWM'
		newInverter['generator_mode'] = 'CONSTANT_PF'
		treeNewIndex = nextTreeKey()
		newInverter['name'] = 'synInverter' + treeNewIndex
		return newInverter
	}

	function newRandomPanels() {
		newPanels = {}
		newPanels['object'] = 'solar'
		newPanels['generator_mode'] = 'SUPPLY_DRIVEN'
		newPanels['generator_status'] = 'ONLINE'
		newPanels['panel_type'] = 'SINGLE_CRYSTAL_SILICON'
		newPanels['efficiency'] = '0.1' + randomInt(0, 5)
		newPanels['area'] = randomInt(2, 8) + '00 sf'
		treeNewIndex = nextTreeKey()
		newInverter['name'] = 'synSolar' + treeNewIndex
		return newPanels
	}

	function walkAndAddSolar() {
		progressBarUpdate(percentage)
		// for (index in tree) {
		if (i < tkeys.length && !in_use && percentage != 100) {
			in_use = true
			var limit = i + 100
			for (; i < tkeys.length && i < limit; i++) {
				index = tkeys[i]
				if (tree[index].hasOwnProperty('object') && tree[index]['object'] == 'house') {
					if (Math.random() < (gebi('solarAddingPercentage').value / 100.0)) {
						meterIndex = findIndex(tree, 'name', tree[index]['parent'])
						newInverter = makeNewInverter(tree[index]['phases'])
						newPanels = newRandomPanels()
						newChildAtLocation(newInverter, meterIndex)
						inverterIndex = findIndex(tree, 'name', newInverter['name'])
						newChildAtLocation(newPanels, inverterIndex)
						redraw() // fix overlap nodes
					}
				}
			}
			percentage = Math.round(i / tkeys.length * 100).toFixed(2)
			in_use = false
		} else {
			redraw()
			removeProgressBar()
			is_use = false
			clearInterval(inter2)
		}
	}

	function progressBarUpdate(percentage) {
		if (document.getElementById('progBar') != undefined)
			document.getElementById('progColor').style.width = percentage + '%'
	}

	function noHouse() {
		for (x in hiddenNodes) {
			if (hiddenNodes[x].objectType != undefined && hiddenNodes[x].objectType == 'house')
				return true
		}
		return false
	}
	i = 0;
	percentage = 0;
	in_use = false;
	tkeys = Object.keys(tree)
	if (noHouse()) {
		alert('Houses have been hidden in the layout, please unfold it first.')
	} else {
		showProgressBar('Please wait. Solar is being generated.')
		// HACK: we do this extra timeout so the DOM gets execution priority and redraws the page.
		// setTimeout(walkAndAddSolar, 1000);	
		inter2 = setInterval(walkAndAddSolar, 10)
	}

}

//*********************************************
// PINNING FUNCTIONS
//*********************************************
/**
 * Set all nodes to be pinned, including nodes and hiddenNodes.
 */
function pinAll() {
	for (node in nodes) {
		gebi('pin' + nodes[node].treeIndex).setAttribute('class', 'nodeIsPinned')
		nodes[node].fixed = true
	}
	for (hNode in hiddenNodes) {
		gebi('pin' + hiddenNodes[hNode].treeIndex).setAttribute('class', 'nodeIsPinned')
		hiddenNodes[hNode].fixed = true
	}
	redraw()
}

/**
 * Unpin all nodes, including nodes and hiddenNodes.
 */
function unPinAll() {
	for (node in nodes) {
		gebi('pin' + nodes[node].treeIndex).setAttribute('class', 'nodeNotPinned')
		nodes[node].fixed = false
	}
	for (hNode in hiddenNodes) {
		gebi('pin' + hiddenNodes[hNode].treeIndex).setAttribute('class', 'nodeNotPinned')
		hiddenNodes[hNode].fixed = false
	}
	redraw()
}

/**
 * Toggle function at selected nodes.
 */
function toggleSelectedPin() {
	selNode = getSelectedNode()
	pinCircle = gebi('pin' + selNode.treeIndex)
	if (pinCircle.getAttribute('class') == 'nodeIsPinned') {
		pinCircle.setAttribute('class', 'nodeNotPinned')
		selNode.fixed = false
	} else {
		pinCircle.setAttribute('class', 'nodeIsPinned')
		selNode.fixed = true
	}
	redraw()
}

//*********************************************
// FINDING TOOLBAR FUNCTIONS
//*********************************************
/**
 * Find elements through input string, iterate every elements in tree to find out all matched elements.
 * @param  {string} inString
 * @return {Object[]} results
 */
function findElementsViaString(inString) {
	results = []
	for (key in tree) {
		subIndex = JSON.stringify(tree[key]).indexOf(inString)
		if (subIndex != -1 && tree[key]['object'] != 'player' && (tree[key].hasOwnProperty('object') || tree[key].hasOwnProperty('module'))) {
			results.push(key)
		}
	}
	return results
}

/**
 * Handler function of "Back" button, find the previours string input.
 */
function backButton() {
	if (!prevObjName) {
		console.log("There is no previous object")
		return
	}
	$("#searchTerm").val("\"name\":\"" + prevObjName + "\"")
	findNext()
}

/**
 * Handler function of "Next" button in "Find" toolbox. 
 * If objects are found, zoom to the first object in the list.
 * 
 */
function findNext() {
	if ($(".selected").length && treeData.object.indexOf("configuration") < 0) {
		// We don't want to store configuration objects in the history, right?
		prevObjName = treeData.name
	} else {
		prevObjName = undefined
	}

	term = gebi('searchTerm').value
	if (oldSearchTerm != term) {
		oldSearchTerm = term
		searchCursor = undefined
	}
	hits = findElementsViaString(term)
	// TODO: What if it is hidden(folded).
	gebi('searchHitCount').innerHTML = hits.length + ' Hits'
	try {
		if (hits.length == 0) {
			return false
		}
		if (searchCursor == undefined) {
			selectViaTreeIndex(hits[0])
			searchCursor = 0
		} else {
			searchCursor++
			if (searchCursor == hits.length) {
				searchCursor = 0
			}
			if (searchCursor == -1) {
				searchCursor = hits.length - 2
			}
			selectViaTreeIndex(hits[searchCursor])
		}
		zoomToSelection()
	} catch (err) {
		alert('Objects have been hidden in the layout, please unfold them first.\n' + err.message)
	}
}

/**
 * Handler function of "Previous" botton in "Find" toolbox, find previous object in a matched list.
 */
function findPrevious() {
	if (searchCursor == undefined) {
		findNext()
	} else {
		searchCursor -= 2
		findNext()
	}
}

/**
 * Delete object by its tree index. Clear selected object, and redraw after deleting object in tree.
 * @param  {number} treeIndex
 */
function deleteObject(treeIndex) {
	// Figure out whether we have a node or an link:
	var isNode = true
	for (prop in tree[treeIndex])
		if (prop == 'from') isNode = false
	if (isNode) {
		// Check for connections and abort if we have them.
		nodeName = tree[treeIndex].name
		for (indexVar in tree) {
			if (tree[indexVar].from == nodeName || tree[indexVar].to == nodeName || tree[indexVar].parent == nodeName) {
				alert('We can only delete nodes that aren\'t connected')
				return false
			}
		}
		// No connection, so delete the node:
		var nodeIndex
		for (x = 0; x < nodes.length; x++) {
			if (nodes[x].treeIndex == treeIndex) nodeIndex = x
		}
		nodes.splice(nodeIndex, 1)
		// If we have a parent child situation, delete the link:
		if (tree[treeIndex].parent != undefined) {
			var linkIndex
			for (x = 0; x < links.length; x++) {
				if (links[x].source.name == nodeName) linkIndex = x
			}
			links.splice(linkIndex, 1)
		}
	} else {
		// Delete link:
		var linkIndex
		for (x = 0; x < links.length; x++) {
			if (links[x].treeIndex == treeIndex) linkIndex = x
		}
		links.splice(linkIndex, 1)
	}
	// Delete tree object:
	delete tree[treeIndex]
	clearSelection()
	redraw()
}

/**
 * Return a maximum key value which has not been used in tree object.
 * @return {number} key
 */
function nextTreeKey() {
	keyList = Object.keys(tree)
	max = 0
	for (x in keyList) {
		intKey = parseInt(keyList[x]); 
		if (intKey > max) 
			max = intKey
	}
	return max + 1
}

/**
 * Find the index of an object based on it attribute value. If not find, return ""
 * @param  {object} inOb
 * @param  {string|number} field
 * @param  {string|number} val
 * @return {number} key|""
 */
function findIndex(inOb, field, val) {
	for (key in inOb) {
		if (inOb[key][field] == val) {
			return key
		}
	}
	return ''
}

//*********************************************
// LAYOUT MENU FUNCTIONS
//*********************************************
/**
 * Get d3.force layout variables.
 */
function layoutMenuInit() {
	nodeCount = nodes.length + hiddenNodes.length
	gebi('nodesBox').innerHTML = nodeCount
	gebi('nodesPercShown').style.width = nodes.length * 100 / nodeCount + '%'
	gebi('nodesPercHidden').style.width = hiddenNodes.length * 100 / nodeCount + '%'
	gebi('gravityBox').value = force.gravity()
	gebi('thetaBox').value = force.theta()
	gebi('frictionBox').value = force.friction()
	gebi('linkStrengthBox').value = force.linkStrength()
	gebi('linkDistanceBox').value = force.linkDistance()
	gebi('chargeBox').value = force.charge()
}

/**
 * Apply changes in d3.force layout variables
 */
function layoutMenuApply() {
	force.gravity(gebi('gravityBox').value)
	force.theta(gebi('thetaBox').value)
	force.friction(gebi('frictionBox').value)
	force.linkStrength(gebi('linkStrengthBox').value)
	force.linkDistance(gebi('linkDistanceBox').value)
	force.charge(gebi('chargeBox').value)
	force.start()
}

//*********************************************
// FUNCTIONS FOR GRAPH FOLDING:
//*********************************************
/**
 * Hide one node, and change its parent's chargemultiple to 1.5
 * @param  {object} node
 */
function hideNode(node) {
	// helper function to hide links:
	function hideLink(link) {
		hiddenLinks.push(links.splice(links.indexOf(link), 1)[0])
	}
	// Pop the node of the nodes list and push it onto the hiddenNodes list:
	hiddenNodes.push(nodes.splice(nodes.indexOf(node), 1)[0])
	// Pop/push any connected Links:
	toHideLinks = links.filter(function (lin) {
		return node.name == lin.source.name || node.name == lin.target.name
	})
	toHideLinks.map(hideLink)
	// Make the parents big!
	linkedNames = toHideLinks.map(function (x) {
		return x.source.name
	}).concat(toHideLinks.map(function (y) {
		return y.target.name
	}))
	toGrow = nodes.filter(function (thisNode) {
		return linkedNames.indexOf(thisNode.name) != -1
	})
	toGrow.map(function (d) {
		d.chargeMultiple = 1.5
	})
}

/**
 * Find node in hiddenNodes, and reveal it.
 * @param  {object} node
 */
function showNode(node) {
	toInsert = hiddenNodes.splice(hiddenNodes.indexOf(node), 1)[0]
	nodes.push(toInsert)
}

/**
 * Find link in hiddenLinks, and reveal it.
 * @param  {object} link
 */
function showLink(link) {
	toInsert = hiddenLinks.splice(hiddenLinks.indexOf(link), 1)[0]
	links.push(toInsert)
}

/**
 * Update hidden nodes percentages
 */
function updateHiddenPerc() {
	gebi('nodesPercShown').style.width = nodes.length * 100 / nodeCount + '%'
	gebi('nodesPercHidden').style.width = hiddenNodes.length * 100 / nodeCount + '%'
}

/**
 * Fold leaves of tree
 */
function foldOneLevel() {
	function isChild(node) {
		// We can apply the property of node in D3: weight, indicate number of links associated with it.
		if (node.weight == 1)
			return true
		else
			return false
	}
	// Find all the children:
	toHide = nodes.filter(isChild)
	// Hide them:
	toHide.map(hideNode)
	updateHiddenPerc()
	redraw()
}

/**
 * Unfold leaves of tree.
 */
function unfoldOneLevel() {
	// Find the hidden links that are connected to visible nodes:
	function attachedToVizNode(link) {
		return nodes.some(function (d) {
			return d.name == link.source.name || d.name == link.target.name
		})
	}
	linksToReveal = hiddenLinks.filter(attachedToVizNode)
	// Find the nodes that are attached to the revealed links:
	function attachedToRevealed(node) {
		return linksToReveal.some(function (d) {
			return node.name == d.source.name || node.name == d.target.name
		})
	}
	// Size the parents of revealed elements correctly.
	nodesToResize = nodes.filter(attachedToRevealed)
	nodesToResize.map(function (d) {
		d.chargeMultiple = 1
	})
	// Actually do the revealing.
	nodesToReveal = hiddenNodes.filter(attachedToRevealed)
	linksToReveal.map(showLink)
	nodesToReveal.map(showNode)
	updateHiddenPerc()
	redraw()
	d3.selectAll('.node').attr('stroke-width', function (d) {
		return d.chargeMultiple * NODE_STROKE_WIDTH
	})
}

/**
 * Unfold all nodes
 */
function unfoldAll() {
	while (hiddenLinks.length != 0) {
		links.push(hiddenLinks.pop())
	}
	while (hiddenNodes.length != 0) {
		nodes.push(hiddenNodes.pop())
	}
	nodes.map(function (d) {
		d.chargeMultiple = 1
	})
	updateHiddenPerc()
	redraw()
}

/**
 * Unfold at selected nodes, reveal its child nodes and associated links.
 */
function unfoldAtSelected() {
	selNode = getSelectedNode()
	function attachedToSelected(link) {
		return selNode.name == link.source.name || selNode.name == link.target.name
	}
	linksToReveal = hiddenLinks.filter(attachedToSelected)
	// Find the nodes that are attached to the revealed links:
	function attachedToRevealed(node) {
		return linksToReveal.some(function (d) {
			return node.name == d.source.name || node.name == d.target.name
		})
	}
	nodesToReveal = hiddenNodes.filter(attachedToRevealed)
	// Size the parents of revealed elements correctly.
	nodesToResize = nodes.filter(attachedToRevealed)
	nodesToResize.map(function (d) {
		d.chargeMultiple = 1
	})
	// Actually do the revealing.
	linksToReveal.map(showLink)
	nodesToReveal.map(showNode)
	updateHiddenPerc()
	redraw()
}

/**
 * Fold at selected nodes, put its child nodes into hidden nodes, and their associated links.
 */
function foldAtSelected() {
	selNode = getSelectedNode()
	function attachedToSelected(link) {
		return selNode.name == link.source.name || selNode.name == link.target.name
	}
	linksToHide = links.filter(attachedToSelected)
	// Find the nodes that are attached to the revealed links:
	function attachedToRevealed(node) {
		return linksToHide.some(function (d) {
			return node.name == d.source.name || node.name == d.target.name
		})
	}
	attachedNodes = nodes.filter(attachedToRevealed)
	nodesToHide = attachedNodes.filter(function (node) {
		return node.weight == 1 && node.name != selNode.name
	})
	// Size the parent correctly.
	if (nodesToHide.length > 0) {
		selNode.chargeMultiple = 1
	}
	// Actually do the hiding.
	nodesToHide.map(hideNode)
	updateHiddenPerc()
	redraw()
}

/**
 * Fold Secondary system. Fold all nodes after triplex_meters. Also fold their associated links.
 */
function foldSecSys() {
	// filter out all links in secondary system, put them into hiddenLinks
	secLinks = links.filter(function (link) {
		if (link.objectType == 'parentChild') {
			hiddenLinks.push(link)
			nodes[link.target.index].chargeMultiple = 1.5
			return true;
		} else if (link.target.objectType == 'triplex_meter' && link.source.objectType == 'gridNode') {
			hiddenLinks.push(link)
			nodes[link.source.index].chargeMultiple = 1.5
			return true;
		} else if (link.target.objectType == 'triplex_meter' && link.source.objectType == 'triplex_meter') {
			hiddenLinks.push(link)
			nodes[link.source.index].chargeMultiple = 1.5
			return true
		} else if (link.target.objectType == 'triplex_meter' && link.source.objectType == 'triplex_node') {
			hiddenLinks.push(link)
			nodes[link.source.index].chargeMultiple = 1.5
			return true
		} else if (link.target.objectType == 'triplex_node' && link.source.objectType == 'gridNode') {
			hiddenLinks.push(link)
			nodes[link.target.index].chargeMultiple = 1.5
			return true
		} else return false;
	})
	// remove secLinks from links and its nodes from nodes 
	// TODO: bugs with handling secLinks
	for (var i = links.length - 1; i >= 0; i--) {
		if (links[i].objectType == 'parentChild') {
			links.splice(i, 1)
		} else if (links[i].target.objectType == 'triplex_meter' && links[i].source.objectType == 'gridNode') {
			links.splice(i, 1)
		} else if (links[i].target.objectType == 'triplex_meter' && links[i].source.objectType == 'triplex_meter') {
			links.splice(i, 1)
		} else if (links[i].target.objectType == 'triplex_meter' && links[i].source.objectType == 'triplex_node') {
			links.splice(i, 1)
		} else if (links[i].target.objectType == 'triplex_node' && links[i].source.objectType == 'gridNode') {
			links.splice(i, 1)
		}
	}
	// put nodes into hiddenNodes
	secLinks.filter(function (link) {
		if (!hiddenNodes.some(function (d) {
			return (d.index == link.target.index)
		})) {
			hiddenNodes.push(link.target);
		}

		if (!hiddenNodes.some(function (d) {
			return (d.index == link.source.index)
		}))
			if (link.source.objectType != 'gridNode')
				hiddenNodes.push(link.source);
	})
	// remove nodes in secondary system
	// TODO: bugs with handling hiddenNodes
	for (var i = nodes.length - 1; i >= 0; i--) {
		if (nodes[i].objectType == 'triplex_meter' || nodes[i].objectType == 'triplex_node' || nodes[i].objectType == 'ZIPload' || nodes[i].objectType == 'waterheater' || nodes[i].objectType == 'inverter' || nodes[i].objectType == 'solar' || nodes[i].objectType == 'house' || nodes.objectType == 'capacitor')
			nodes.splice(nodes[i].index, 1)
	}
	redraw()
}

//**************************************************
// TABLE EDITTING FUNCTIONS TODO: huge improvement, rename functions 
//************************************************** 
/**
 * Fit table according to window size.
 */
function fit_table() {
	var raw_height = $("#selBody").height() + $("#daButtons").height() + $("#selHead").height();
	var win_height = window.innerHeight * 0.8;
	$("#selected").css("height", win_height > raw_height ? raw_height : win_height)
}

$(window).resize(fit_table);

/**
 * Create table for selected node
 */
function create_table() {
	deselect();
	for (prop in treeData) {
		if (prop == "object" || prop == "module") {
			$("#objmod").html(prop)
			$("#value").html(treeData[prop])
		} else if (prop != 'from' && prop != 'to' && prop != 'parent' && prop != 'file') { // Avoid editing machine-written properties!
			var valueEl;
			if (prop == "configuration") {
				valueEl = $("<a>").html(treeData[prop]).attr("href", "#").click(function (e) {
					var myname = $(this).html()
					$("#searchTerm").val("\"name\":\"" + myname + "\"")
					findNext()
					var theButton = $.makeArray($("button")).filter(function (b) {
						return $(b).html().indexOf("Find") > -1
					})[0]
					var dispStatus = theButton.nextSibling.nextSibling.style.display
					if (dispStatus == "" || dispStatus == "none")
						dropPillAndStay(theButton, "Find")
					e.preventDefault()
					return false
				})
			} else
				valueEl = treeData[prop]
			$("#body").append($("<tr>")
				.append($("<td>").html(prop))
				.append($("<td>").html(valueEl)))
		}

	}
}

/**
 * Show selected node and its table.
 */
function selectNode() {
	create_table();
	$("#selected").show();
	$("#selected table").show()
	fit_table();
}

/**
 * Deselect node and its table.
 * @return {[type]}
 */
function deselect() {
	$("#objmod, #value, #body").html("")
	$("#selected").css("height", "auto");
	$("#editButtonRow").show()
	$("#otherButtons").hide();
	$("#selected table").hide()
	$("#selected").hide();
}

/**
 * Validate about edit fields. Check validation on selected components, and its function. 
 * 		If not valid, return true.
 * @param  {string} selector
 * @param  {function} testfunc
 * @param  {string} error_msg
 * @return {boolean} invalid
 */
function validation(selector, testfunc, error_msg) {
	var invalid = false;
	$.makeArray($(selector)).forEach(function (e) {
		if (testfunc(e)) {
			$(e).css("border", "1px solid red");
			if (!invalid)
				$(e).focus();
			invalid = true;
		}
	})
	if (invalid) {
		alert(error_msg);
	}
	return invalid;
}

/**
 * Validate blanks, if invalid return true
 * @param  {string} selector
 * @return {boolean} 
 */
function validate_blanks(selector) {
	return validation(selector, function (e) {
		return $(e).val().trim() == "";
	})
}

/**
 * Validate name, if invalid return true
 * @param  {string} selector
 * @return {boolean}
 */
function validate_name(selector) {
	return validation(selector, function (e) {
		var m = $(e).val().match(/[A-z0-9_]+/);
		return m == null || m != $(e).val();
	}, "Invalid field values.  Letters, numbers, underscores, no spaces.")
}

$(function () {
	var delete_prop_button = $("<button>")
		.addClass("deleteButton")
		.addClass("deleteProperty")
		.html("╳")

	$("#selected").hide();
	$("#editButton").click(function (e) {
		$("#editButtonRow").hide();
		$("#otherButtons").show();
		$("#body").html("")
		for (prop in treeData) {
			if (prop != "object" && prop != "module") {
				var tr = $("<tr>")
					.append($("<td>").addClass("propertyName").html(prop))
					.append($("<td>")
						.append($("<input>")
							.val(treeData[prop])
							.attr("name", prop)
							.attr("type", "text")))
				if (prop != "name")
					tr.prepend($("<td>")
						.append(delete_prop_button.clone()))
				else
					tr.prepend($("<td>"))
				$("#body").append(tr);
			}
		}
		console.log(treeData);
	})
	$("#cancelButton").click(function (e) {
		$("#editButtonRow").show();
		$("#otherButtons").hide();
		$("#body").html("");
		selectNode();
	})
	$("#saveObject").click(function (e) {
		if (validate_blanks("#body input"))
			return;
		if (validate_name(".newPropertyName"))
			return;

		function isNameAlreadyUsed(testValue) {
			// Helper function to make sure we don't make non-unique names.
			for (leaf in tree) {
				for (attrKey in tree[leaf]) {
					if (attrKey == 'name' && tree[leaf][attrKey] == testValue) {
						return true
					}
				}
			}
			return false
		}
		var propNames = $("#body td.propertyName");
		for (i = 0; i < propNames.length; i++) {
			var key = propNames[i].innerHTML;
			var newValue = $("#body input[name=" + key + "]").val();
			var oldValue = treeData[key];
			if (key == 'name') {
				// 1. If the name is already the name of something else, skip the renaming.
				if (isNameAlreadyUsed(newValue) && oldValue != newValue) {
					// cell.innerHTML = oldValue
					$("#body input[name=name]").val(oldValue);
					alert('Please choose a unique name.');
				} else {
					treeData[key] = newValue
					// cell.innerHTML = newValue
					// k.innerHTML = key
					// 2. If the name is unique, go through EVERY attribute in the tree and replace the old name with the new one.

					for (leaf in tree) {
						for (attrKey in tree[leaf]) {
							if (oldValue == tree[leaf][attrKey]) {
								console.log(tree[leaf]);
								tree[leaf][attrKey] = newValue
							}
						}
					}
					// 3. Go through the nodes and replace the name there too. UGH!
					nodeIndex = findIndex(nodes, 'name', oldValue)
					if (nodeIndex != "") {
						nodes[nodeIndex]['name'] = newValue
					}
				}
			} else {
				treeData[key] = newValue;
			}
		}
		Object.keys(treeData).filter(function (e) {
			return $.makeArray(propNames).map(function (x) {
				return x.innerHTML;
			}).indexOf(e) == -1;
		}).forEach(function (e) {
			if (e != "object" && e != "module")
				delete treeData[e];
		})
		$.makeArray($("#body input.newPropertyName")).map(function (e) {
			return e.value;
		}).forEach(function (e, i) {
			if (e.trim() != "")
				treeData[e] = $("#body input.newPropertyValue")[i].value;
		})
		$("#otherButtons").hide();
		$("#editButtonRow").show();
		selectNode();
	})
	$(document).on("click", ".deleteProperty", function (e) {
		$(this).parent().parent().remove();
	})
	$("#addAttribute").click(function (e) {
		if (validate_blanks(".newPropertyName, .newPropertyValue"))
			return;
		var new_name = $("<input>")
			.addClass("newPropertyName")
			.attr("type", "text");

		$("#body").append($("<tr>")
			.append($("<td>")
				.append(delete_prop_button.clone()))
			.append($("<td>")
				.append(new_name))
			.append($("<td>")
				.append($("<input>")
					.addClass("newPropertyValue")
					.attr("type", "text"))));
		fit_table();
		new_name.focus();
	})
	$("#deleteObject").click(function (e) {
		deleteObject(ti);
	})
})
