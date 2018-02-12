/*
TODO: change circles -5px offset to variable

*/

var edge_dragging = false,
		dragging = false,
		oversegment


function drawPolyline(fromid, toid, innertext, positionX, positionY, id, posfrom, posto, dashed) {

	//set defaults if necessary
	fromid = typeof fromid !== 'undefined' ? fromid : -1;
	toid = typeof toid !== 'undefined' ? toid : -1;
	innertext = typeof innertext !== 'undefined' ? innertext : '';
	positionX = typeof positionX !== 'undefined' ? positionX : -1;
	positionY = typeof positionY !== 'undefined' ? positionY : -1;
	id = typeof id !== 'undefined' ? id : -1;
	posfrom = typeof posfrom !== 'undefined' ? posfrom : 'default';
	posto = typeof posto !== 'undefined' ? posto : 'default';
	dashed = typeof dashed !== 'undefined' ? dashed : -1;

	var f_deltax = 0,
		f_deltay = 0,
		t_deltax = 0,
		t_deltay = 0,
		f_delta = 0,
		t_delta = 0;
	var parent = -1;
	var node_from = SVG.get(fromid);
	var node_to = SVG.get(toid);
	if (debuggable)	console.log('node from w=' + node_from.get(2).width() + ' h=' +node_from.get(2).height());
	if (debuggable)	console.log('node to w=' + node_to.get(2).width() + ' h=' +node_to.get(2).height());

	/*if (node_from.x() > node_to.x()) {
		if (node_from.data('type')=='decision') {
			if (debuggable) console.log('node from type ' + node_from.data('type'));
			f_delta = - 10; //minus
		}
		if (node_to.data('type')=='decision') {
			if (debuggable) console.log('node to type ' + node_to.data('type'));
			t_delta = 10; //plus
		}

		switch (posfrom) {
		  case 'default':
			f_deltax = 0 + f_delta
			f_deltay = node_from.get(2).height() / 2
			break
		  case 'top':
			f_deltax = node_from.get(2).width() / 2
			f_deltay = 0 + f_delta
			break
		  case 'bottom':
			f_deltax = node_from.get(2).width() / 2
			f_deltay = node_from.get(2).height()
			break
		  default:
			f_deltax = 0 + f_delta
			f_deltay = node_from.get(2).height() / 2
		};
		switch (posto) {
		  case 'default':
			t_deltax = node_to.get(2).width() + t_delta;
			t_deltay = node_to.get(2).height() / 2;
			break
		  case 'top':
			t_deltax = node_to.get(2).width() / 2
			t_deltay = 0 - t_delta
			break
		  case 'bottom':
			t_deltax = node_to.get(2).width() / 2
			t_deltay = node_to.get(2).height() + t_delta
			break
		  default:
			t_deltax = node_to.get(2).width() + t_delta;
			t_deltay = node_to.get(2).height() / 2;
		};
	} else {
		if (node_from.data('type')=='decision') {
			if (debuggable) console.log('node from type ' + node_from.data('type'));
			f_delta = 10; //minus
		}
		if (node_to.data('type')=='decision') {
			if (debuggable) console.log('node to type ' + node_to.data('type'));
			t_delta = -10; //plus
		}

		switch (posfrom) {
		  case 'default':
			f_deltax = node_from.get(2).width() + f_delta
			f_deltay = node_from.get(2).height() / 2
			break
		  case 'top':
			f_deltax = node_from.get(2).width() / 2
			f_deltay = 0 - f_delta
			break
		  case 'bottom':
			f_deltax = node_from.get(2).width() / 2
			f_deltay = node_from.get(2).height() + f_delta
			break
		  default:
			f_deltax = node_from.get(2).width() + f_delta
			f_deltay = node_from.get(2).height() / 2
		};

		switch (posto) {
		  case 'default':
			t_deltax = 0 + t_delta;
			t_deltay = node_to.get(2).height() / 2;
			break
		  case 'top':
			t_deltax = node_to.get(2).width() / 2
			t_deltay = 0 + t_delta
			break
		  case 'bottom':
			t_deltax = node_to.get(2).width() / 2
			t_deltay = node_to.get(2).height() - t_delta
			break
		  default:
			t_deltax = 0 + t_delta;
			t_deltay = node_to.get(2).height() / 2;
		};
	}*/

	var x_from = node_from.x() + f_deltax,
		y_from = node_from.y() + f_deltay,
		x_to = node_to.x() + t_deltax,
		y_to = node_to.y() + t_deltay,
		x2,
		y2,
		x3,
		y3,
		x4,
		y4;



	x1 = x_from
	y1 = y_from

	x2 = x_from + (x_to - x_from)/2;
	y2 = y_from;

	x3 = x2
	y3 = y_to
	x4 = x3
	y4 = y3

	//if (debuggable) console.log('pos_from ' + current_con.data('pos_from') + ' pos_to ' + current_con.data('pos_to'))

	/*if (posfrom=='top') {
		y1 -= node_from.get(2).height() / 2
		x2 = x_from + (x_to - x_from)/2;
		y2 = y1;
	} else if (posfrom=='bottom') {
		y1 += node_from.get(2).height() / 2
		x2 = x_from + (x_to - x_from)/2;
		y2 = y1;
	}
	if (posto=='top') {
		y3 -= node_to.get(2).height() / 2
		x4 = x_to
		y4 = y3
	} else if (posto=='bottom') {
		y3 += node_to.get(2).height() / 2
		x4 = x_to
		y4 = y3
	}*/

	//new way add first pair of coords
	var coords = [];
	var pcoords = [];
	coords.push([ node_from.x() + f_deltax, node_from.y() + f_deltay]);
	coords.push([ node_to.x() + t_deltax, node_to.y() + t_deltay]);

	pcoords.push([ 'M', node_from.x() + f_deltax, node_from.y() + f_deltay]);
	pcoords.push([ 'L', x2, y2]);

//	pcoords.push([ 'M', x2, y2]);
	pcoords.push([ 'L', x3, y3]);

	//pcoords.push([ 'M', x4, y4]);
	pcoords.push([ 'L', node_to.x() + t_deltax, node_to.y() + t_deltay]);
	//pcoords.push([ 'z']);

	var connection = svg.group(),
			edge_markers = svg.group().hide(),
			linep,
			linen;

	var circ_marker = svg.circle(10)
											.attr({ fill: 'red', stroke: "#000", "stroke-width": 2, cursor: 'pointer' })
											.move(-5,-5)
											.hide()
											.draggy()
											//.on('mousemove', function(e) { circ_marker.hide(); })
											.on('dragstart', function(e) {
													$('.graph').off('mousedown')
													edge_dragging = true;
													console.log('dragstart');
													var length = oversegment.length(),
													point1 = oversegment.pointAt(0)
													var point2 = oversegment.pointAt(length)
													linep = svg.line(event.detail.event.x + ',' + event.detail.event.y + ' ' + point1.x + ',' + point1.y).stroke({ width: 1 });
													linen = svg.line(event.detail.event.x + ',' + event.detail.event.y + ' ' + point2.x + ',' + point2.y).stroke({ width: 1 });
											})
											.on('dragmove', function(e) {
													console.log('dragmove');
													var length = oversegment.length()
													var point1 = oversegment.pointAt(0)
													var point2 = oversegment.pointAt(length)
													linep.plot(event.detail.event.x + ',' + event.detail.event.y + ' ' + point1.x + ',' + point1.y);
													linen.plot(event.detail.event.x + ',' + event.detail.event.y + ' ' + point2.x + ',' + point2.y);
											})
											.on('dragend', function(e) {
													console.log('dragend');
													edge_dragging = false;
													oversegment.animate(500).stroke({ width: 0, opacity: 0})

													// linep.remove();
													// linen.remove();
													console.log('before arr=' + pcoords.join());

													var currindex = oversegment.data('iter')
													//line to nex x & y
													pcoords.splice(currindex+1, 0, [ 'L', this.cx(), this.cy()])
													//pcoords[currindex+1][1] = this.x()
													//pcoords[currindex+1][2] = this.y()


													//pcoords.splice(currindex+2, 0, [ 'L', this.x(), this.y()]);
													console.log('iter=' + oversegment.data('iter') + ' arr=' + pcoords.join());

													// pcoords.forEach(function(entry) {
													// 	console.log('entry ' + entry )
													// });

													var ttt = svg.path(pcoords).fill('none').stroke({ color: 'blue', width: 15, opacity: 0.3})
													//ttt.animate(5000).stroke({ width: 0, opacity: 0})

													/*oversegment.data({
													iter: i,
													from: pcoords[i][1]+','+pcoords[i][2],
													to: pcoords[i+1][1]+','+pcoords[i+1][2]
													})*/


													/*

													var t = this.ctm().extract()
													//  this.data('sidep')
													//  this.data('siden')

													//pcoords[this.data('iter')][0] = t.x
													//pcoords[this.data('iter')][1] = t.y
													console.log('dragend for i=' + this.data('iter') + ' x=' + t.x + ' y=' + t.y)
													pcoords[this.data('iter')][1] = t.x
													pcoords[this.data('iter')][2] = t.y

													var iter = this.data('iter')
													edge_markers.each(function(i, children) {

													if (this.data('iter') == iter+1) {
													console.log('edge_marker with i=' + this.data('iter') + ' is next node')
													this.data('sidep', t.x + ',' + t.y)
													}
													if (this.data('iter') == iter-1) {
													console.log('edge_marker with i=' + this.data('iter') + ' is prev node')
													this.data('siden', t.x + ',' + t.y)
													}
													})

													pcoords.forEach(function(entry) {
													console.log('entry ' + entry )
													});
													var ttt = svg.path(pcoords).fill('none').stroke({ color: 'blue', width: 15, opacity: 1})
													ttt.animate(500).stroke({ width: 0, opacity: 0})*/
											})


var bendpoint = svg.group().attr('cursor','pointer').hide()
bendpoint.add(svg.circle(20).attr({ fill: 'darkmagenta', opacity: 0.5 }).move(-10,-10))
bendpoint.add(svg.circle(10).attr({ fill: 'orange', stroke: "#000", "stroke-width": 1 }).move(-5,-5))

//var polyline = svg.polyline(x_from+','+y_from+' '+x1+','+y1+' '+x2+','+y2+' '+x3+','+y3+' '+x4+','+y4+' '+x_to+','+y_to).fill('none').stroke({ width: 2 })

var path1 = svg.path().fill('none').stroke({ color: 'red', width: 0, opacity: 0});
var path2 = svg.path().fill('none').stroke({ color: 'blue', width: 0, opacity: 0});

function isPointBetweenPoints(id, currPoint, point1, point2) {
	//console.log("isPointBetweenPoints currX=" + currPoint.x + " currY=" + currPoint.y + " point1x=" + point1.x + " point1y=" + point1.y + " point2x=" + point2.x + " point2y=" + point2.y )
	var currX = currPoint.x,
			currY = currPoint.y,
			p1X = point1.x,
			p1y = point1.y,
			p2X = point2.x,
			p2y = point2.y,
			path1arr = new SVG.PathArray([
				['M', p1X, p1y]
			, ['L', currX, currY]
			]),
			path2arr = new SVG.PathArray([
				['M', p2X, p2y]
			, ['L', currX, currY]
			])

	path1.plot(path1arr)
	path2.plot(path2arr);

	var length1 = path1.length(),
			length2 = path2.length(),
			currline = SVG.get(id)

	oversegment = currline

	if ((length1 + length2) - currline.length()<10) {
		var point = currline.pointAt(length1)
		circ_marker.move(point.x-5, point.y-5)
		circ_marker.show()
	}
}

var overPath = function(e) {
	//console.log("overPath");
	var xx = (e.pageX - scalegroup.x())/actualZoom,
			yy = (e.pageY - scalegroup.y())/actualZoom,
			length = this.length(),
			point1 = this.pointAt(0),
			point2 = this.pointAt(length)

	//console.log("point1X=" + point1.x + " point1Y=" + point1.y + " point2x=" + point2.x + " point2y=" + point2.y )
	isPointBetweenPoints(this.attr('id'),{x:xx, y:yy},point1,point2)

}


	for (var i = 0; i < pcoords.length-1; i++) {
		if (debuggable) console.log('pcoords[i]=' + pcoords[i] + ' pcoords[i+1]=' + pcoords[i+1]);
		var pth = svg.path([['M',pcoords[i][1],pcoords[i][2]],['L',pcoords[i+1][1],pcoords[i+1][2]]])
								.fill('none')
								.stroke({ color: 'pink', width: 20, opacity: 0.5})
								.data({
									iter: i,
									from: pcoords[i][1]+','+pcoords[i][2],
									to: pcoords[i+1][1]+','+pcoords[i+1][2]
								})
								//.on('mouseover', function() {  circ_marker.show(); })
								.on('mousemove', overPath)
								.on('mouseout', function() {  if(!edge_dragging) circ_marker.hide() })

		connection.add(pth)

		edge_markers.add(bendpoint.clone()
								.data({
									iter: i,
									sidep: i == 0 ? 'none' : pcoords[i-1][1]+','+pcoords[i-1][2],
									siden: pcoords[i+1][1]+','+pcoords[i+1][2]
								})
								.move(pcoords[i][1],pcoords[i][2])
								.show()
								.draggy()
								.on('mousemove', function(e) { circ_marker.hide(); })
								.on('dragstart', function(e) {
									 $('.graph').off('mousedown')
									 //console.log('dragstart ' + event.detail.event.x + ' ' + event.detail.event.y + ' ' + this.data('siden'));
									 if (this.data('sidep') == 'none') {
										 	linen = svg.line(event.detail.event.x + ',' + event.detail.event.y + ' ' + this.data('siden')).stroke({ width: 1 });
									 }
									 else {
										 linep = svg.line(event.detail.event.x + ',' + event.detail.event.y + ' ' + this.data('sidep')).stroke({ width: 1 });
										 linen = svg.line(event.detail.event.x + ',' + event.detail.event.y + ' ' + this.data('siden')).stroke({ width: 1 });
									 }
								 })
								 .on('dragmove', function(e) {
									 if (this.data('sidep') == 'none') {
										 	linen.plot(event.detail.event.x + ',' + event.detail.event.y + ' ' + this.data('siden'));
									 }
									 else {
										 linep.plot(event.detail.event.x + ',' + event.detail.event.y + ' ' + this.data('sidep'));
										 linen.plot(event.detail.event.x + ',' + event.detail.event.y + ' ' + this.data('siden'));
									 }
 								 })
								 .on('dragend', function(e) {

										linep.remove();
										linen.remove();
										var t = this.ctm().extract()

										console.log('dragend for i=' + this.data('iter') + ' x=' + t.x + ' y=' + t.y)
										pcoords[this.data('iter')][1] = t.x
										pcoords[this.data('iter')][2] = t.y

										var iter = this.data('iter')
										edge_markers.each(function(i, children) {
											if (this.data('iter') == iter+1) {
												console.log('edge_marker with i=' + this.data('iter') + ' is next node')
												this.data('sidep', t.x + ',' + t.y)
											}
											if (this.data('iter') == iter-1) {
												console.log('edge_marker with i=' + this.data('iter') + ' is prev node')
												this.data('siden', t.x + ',' + t.y)
											}
										})

										pcoords.forEach(function(entry) {
											console.log('entry ' + entry )
										});

										var ttt = svg.path(pcoords).fill('none').stroke({ color: 'blue', width: 15, opacity: 1})
										ttt.animate(500).stroke({ width: 0, opacity: 0})
 								 })
							 )


		/*Add markers to the edges of path segments*/
		/*edge_markers.add(circ_marker.clone()
							 .attr({ fill: 'purple', stroke: "#000", "stroke-width": 2 })
							 .move(pcoords[i][1]-5,pcoords[i][2]-5)
							 .show()
							 .draggy()
							 .on('dragstart', function(e) {
							 		$('.graph').off('mousedown')
							 		console.log('dragstart');
							 	})
							 //.on('click', function() {  console.log('click' + this.attr('id')) })
						 )*/

		 if (i == (pcoords.length-2)) {
			 edge_markers.add(bendpoint.clone()
									 .data({
										sidep: pcoords[i-1][1]+','+pcoords[i-1][2],
										siden: 'none'
									})
	 								.move(pcoords[i+1][1],pcoords[i+1][2])
	 								.show()
	 								.draggy()
	 								.on('mousemove', function(e) { circ_marker.hide(); })
	 								.on('dragstart', function(e) {
	 									 $('.graph').off('mousedown')
	 									 console.log('dragstart');
	 								 }))
			 /*edge_markers.add(circ_marker.clone()
	 							 .attr({ fill: 'purple', stroke: "#000", "stroke-width": 2 })
	 							 .move(pcoords[i+1][1]-5,pcoords[i+1][2]-5)
								 .show()
								 .draggy()
								 .on('dragstart', function(e) {
								 		$('.graph').off('mousedown')
								 		console.log('dragstart');
								 	})
								 //.on('click', function() {  console.log('click' + this.attr('id')) })
							 )*/
		 }
	}

	/*if (debuggable) console.log('node from ' + node_from.x() + ',' +node_from.y());
	if (debuggable) console.log('node to ' + node_to.x()+','+node_to.y());
	if (debuggable) console.log('points ' + x1+','+y1+' '+x2+','+y2+' '+x3+','+y3+' '+x4+','+y4)*/



	// circ_marker.click(function(e) {
	// 	console.log("circ_marker click");
	//
	// })
	/*circ_marker.draggy();
	circ_marker.on('dragstart', function(e) {
		$('.graph').off('mousedown')
		console.log('dragstart');
	})

	var drgmove = false;
	circ_marker.on('dragmove', function(e) {
		drgmove = true;
		console.log('dragmove');

	})

	circ_marker.on('dragend', function(e) {
		console.log('dragend');
		drgmove = false;
		$('.graph').on('mousedown', function(e) {
			$( this ).css('cursor', 'move')
			paning(e);
		})
	})*/

	//var circ_marker_start = svg.circle(10).attr({ fill: 'green', stroke: "#000", "stroke-width": 2 }).move(x_from-5,y_from-5).hide(),
	//	circ_marker_end = svg.circle(10).attr({ fill: 'orange', stroke: "#000", "stroke-width": 2 }).move(x_to-5,y_to-5).hide()


	var polyline = svg.polyline(x_from+','+y_from+' '+x1+','+y1+' '+x2+','+y2+' '+x3+','+y3+' '+x4+','+y4+' '+x_to+','+y_to).fill('none').stroke({ width: 2 })
	if (editable) {
		polyline.attr('cursor', 'pointer');
	}

	//var polyline1 = svg.polyline(x1+','+y1+' '+x2+','+y2+' '+x3+','+y3+' '+x4+','+y4).fill('none').stroke({ width: 5 }).attr({'stroke-opacity': 0, 'stroke-width': '15px', 'cursor': 'pointer'});
	var marker = svg.marker(10, 10, function(add) {
	  add.path().attr({
			d: "M 0 0 L 10 5 L 0 10 z"
		})
	})
	polyline.marker('end', marker)
	marker.size(5,5)
	marker.attr({
		refX: 10
	});

	//changing style if dashed
	if (dashed == 1) {
		polyline.attr('stroke-dasharray', '5,3')
	}

	//changing style
	if (!adminable) {

		polyline.stroke('#7F7F7F')
		marker.fill('#7F7F7F').stroke('#7F7F7F')

		if (passed_node.indexOf(fromid)!=-1 && passed_node.indexOf(toid)!=-1) {
			polyline.stroke('#7092BE')
			marker.fill('#7092BE').stroke('#7092BE')
		//	alert('from ' + fromid + ' to ' + toid + ' is passed')
		}
	}

	var inner_text = svg.text(innertext).attr({id: polyline.attr('id')+'_inner_text'});
	inner_text.attr({width: 100, height: 50}).style('word-wrap: break-word; text-align: center;').hide();
	//$('#' + polyline.attr('id')+'_inner_text').html(innertext);

	if (innertext!='') {
		inner_text.show().style('cursor:default;').addClass('noselect')
		if (editable) {
			inner_text.style('cursor:pointer;')
		}
	}

	if (positionX == -1 ) {
		positionX = polyline.cx() + $('.graph').offset().left - $('#input_textarea').width()/2;
	}
	if (positionY == -1 ) {
		positionY = polyline.cy() + $('.graph').offset().top;
	}

	var connection_text = svg.group();
		connection_text.add(inner_text);
			connection_text.move(positionX, positionY);

	if (editable) {
		connection_text.draggy();

		connection_text.on('dragstart', function(e) {
			rect_outer.hide();
			$('.graph').off('mousedown')
		})

		connection_text.on('dragend', function() {
			//if (debuggable) console.log('connection_text dragend x=' + connection_text.x() + ' y=' + connection_text.y());
			connection.data('positionX', connection_text.x());
			connection.data('positionY', connection_text.y());

			$('.graph').on('mousedown', function(e) {
				$( this ).css('cursor', 'move')
				paning(e);
			})

			rect_outer.size(connection.bbox().width+6, connection.bbox().height+6).attr({ 'fill-opacity': 0, stroke: "#d9534f", "stroke-width": 1, "stroke-dasharray": 4, "stroke-opacity"  : 0.5 }).move(connection.bbox().x-3, connection.bbox().y-3)
		})
	}

	//For highlighting
	var rect_outer = svg.rect(1, 1).move(polyline.cx(), polyline.cy()).hide();// = svg.rect(polyline.bbox().width+6, polyline.bbox().height+6).attr({ 'fill-opacity': 0, stroke: "#d9534f", "stroke-width": 1, "stroke-dasharray": 4, "stroke-opacity"  : 0.5 }).move(polyline.bbox().x-3, polyline.bbox().y-3).hide();
	var settings = svg.plain('\ue802').attr({id: polyline.attr('id')+'_settings'}).font({family: 'fontello', size: 20});
	// $('#' + polyline.attr('id')+'_settings').html('<i class="icon-cog"></i>');
	settings.attr({width: 20, height: 20, cursor: 'pointer'}).move(polyline.cx(),polyline.cy()-15).hide();

  var del = svg.plain('\ue800').attr({id: polyline.attr('id')+'_del'}).font({family: 'fontello', size: 20});
	// $('#' + polyline.attr('id')+'_del').html('<i class="icon-trash-empty"></i>');
	del.attr({width: 20, height: 20, 'cursor':'pointer'}).move(polyline.cx(),polyline.cy()).hide();


//	var connection = svg.group();
		connection.add(rect_outer);
		connection.add(polyline);

		//connection.add(polyline_bkgrnd);
		//connection.add(circ_markers);
		connection.add(edge_markers);

		// connection.add(circ_marker_start);
		// connection.add(circ_marker_end);
		connection.add(settings);
		connection.add(del);
		connection.add(connection_text);
		connection.add(circ_marker);


	rect_outer.size(connection.bbox().width+6, connection.bbox().height+6).attr({ 'fill-opacity': 0, stroke: "#d9534f", "stroke-width": 1, "stroke-dasharray": 4, "stroke-opacity"  : 0.5 }).move(connection.bbox().x-3, connection.bbox().y-3)

	if (node_from.data('parent')!=-1) {
	 parent = node_from.data('parent');
	}
	if (node_to.data('parent')!=-1 && node_to.data('parent')!=parent) {
	 parent += ',' + node_to.data('parent');
	}
	if (debuggable) console.log('parents for line is ' + parent);


	scalegroup.add(connection);

	if (id != -1 ) {
		connection.attr('id', id)
		if (debuggable) console.log(connection.attr('id'))
	}

	connection.data({
	  isnode: 'false',
	  type: 'connection',
	  inner_text: $('#' + polyline.attr('id')+'_inner_text').html(),
	  positionX: positionX,
	  positionY: positionY,
	  id: connection.attr('id'),
	  /*oraid: oraid,*/
	  idfrom: fromid,
	  idto: toid,
	  pos_from: posfrom,
	  pos_to: posto,
	  dash: dashed,
	  parents: parent
	})

	connections.push({
		//connid: polyline.attr('id'),
		connid: connection.attr('id'),
		idfrom: fromid,
		idto: toid
	});



	if (editable) {
		//EVENTS
		/*
		circ_marker_start.draggy();
		circ_marker_end.draggy();

		circ_marker_start.on('dragstart', function(e) {
			$('.graph').off('mousedown')
			marker_top.front().backward()
			marker_bottom.front().backward()
			//circ_marker_start.front()

		})

		circ_marker_end.on('dragstart', function(e) {
			$('.graph').off('mousedown')
			marker_top.front().backward()
			marker_bottom.front().backward()
			//circ_marker_end.front()

		})

		var drgmove = false

		circ_marker_start.on('dragmove', function(e) {
			drgmove = true;

			//if (debuggable) console.log('dragmove');
			var xx = (e.detail.event.pageX - scalegroup.x())/actualZoom,
				yy = (e.detail.event.pageY - scalegroup.y())/actualZoom

			//��������� ��� ����� ������ ���� ��������� ������ (����, ���, ����, �����)
			scalegroup.each(function(i, children) {
				if (this.inside(xx, yy)) {
					//if (debuggable) console.log('is over ' + this.attr('id'));

					//if (this.data('isnode')==true && this.data('type')!='pull') {
					if (this.attr('id')==fromid) {
						//if (debuggable) console.log('is over node ' + this.attr('id'));

						marker_top.move(this.cx()-10, this.y()).show(),
						marker_bottom.move(this.cx()-10, this.y()+this.get(2).height()-10).show()

						// if (marker_top.inside(xx, yy)) {
						// 	console.log('TOP');
						// }
						// if (marker_bottom.inside(xx, yy)) {
						// 	console.log('BOTTOM');
						// }
					} else {
						//if (debuggable) console.log('data false type ' + this.data('type'));
					}
				} else {
					//if (debuggable) console.log('is outside');
				}
			});
		})

		circ_marker_end.on('dragmove', function(e) {
			drgmove = true;

			//if (debuggable) console.log('dragmove');
			var xx = (e.detail.event.pageX - scalegroup.x())/actualZoom,
				yy = (e.detail.event.pageY - scalegroup.y())/actualZoom

			//��������� ��� ����� ������ ���� ��������� ������ (����, ���, ����, �����)
			scalegroup.each(function(i, children) {
				if (this.inside(xx, yy)) {
					//if (debuggable) console.log('is over ' + this.attr('id'));

					//if (this.data('isnode')==true && this.data('type')!='pull') {
					if (this.attr('id')==toid) {
						//if (debuggable) console.log('is over node ' + this.attr('id'));

						marker_top.move(this.cx()-10, this.y()).show(),
						marker_bottom.move(this.cx()-10, this.y()+this.get(2).height()-10).show()

						// if (marker_top.inside(xx, yy)) {
						// 	console.log('TOP');
						// }
						// if (marker_bottom.inside(xx, yy)) {
						// 	console.log('BOTTOM');
						// }
					} else {
						//if (debuggable) console.log('data false type ' + this.data('type'));
					}
				} else {
					//if (debuggable) console.log('is outside');
				}
			});
		})

		circ_marker_start.on('dragend', function(e) {
			//if (debuggable) console.log('dragend');

			var xx = (e.detail.event.pageX - scalegroup.x())/actualZoom,
				yy = (e.detail.event.pageY - scalegroup.y())/actualZoom

			//��������� ��� ����� ������ ���� ��������� ������ (����, ���, ����, �����)
			scalegroup.each(function(i, children) {
				if (this.inside(xx, yy)) {
					//if (debuggable) console.log('is over ' + this.attr('id'));
					//if (this.data('isnode')==true && this.data('type')!='pull') {
					if (this.attr('id')==fromid) {
						//if (debuggable) console.log('is over node ' + this.attr('id'));

						marker_top.move(this.cx()-10, this.y()).show(),
						marker_bottom.move(this.cx()-10, this.y()+this.get(2).height()-10).show()

						if (marker_top.inside(xx, yy)) {
							//if (debuggable) console.log('to TOP');
							connection.data('pos_from', 'top')
						} else if (marker_bottom.inside(xx, yy)) {
							//if (debuggable) console.log('to BOTTOM');
							connection.data('pos_from', 'bottom')
						} else {
							connection.data('pos_from', 'default')
						}
					} else {
						//if (debuggable) console.log('data false type ' + this.data('type'));
					}
				} else {
					//if (debuggable) console.log('is outside');
					marker_top.hide(),
					marker_bottom.hide()
				}
			});

			//if (drgmove)
			updatePolyline(fromid)

			drgmove = false;
			$('.graph').on('mousedown', function(e) {
				$( this ).css('cursor', 'move')
				paning(e);
			})
		})

		circ_marker_end.on('dragend', function(e) {
			//if (debuggable) console.log('dragend');

			var xx = (e.detail.event.pageX - scalegroup.x())/actualZoom,
				yy = (e.detail.event.pageY - scalegroup.y())/actualZoom

			//��������� ��� ����� ������ ���� ��������� ������ (����, ���, ����, �����)
			scalegroup.each(function(i, children) {
				if (this.inside(xx, yy)) {
					//if (debuggable) console.log('is over ' + this.attr('id'));
					//if (this.data('isnode')==true && this.data('type')!='pull') {
					if (this.attr('id')==toid) {
						//if (debuggable) console.log('is over node ' + this.attr('id'));

						marker_top.move(this.cx()-10, this.y()).show(),
						marker_bottom.move(this.cx()-10, this.y()+this.get(2).height()-10).show()

						if (marker_top.inside(xx, yy)) {
							//if (debuggable) console.log('to TOP');
							connection.data('pos_to', 'top')
						} else if (marker_bottom.inside(xx, yy)) {
							//if (debuggable) console.log('to BOTTOM');
							connection.data('pos_to', 'bottom')
						} else {
							connection.data('pos_to', 'default')
						}
					} else {
						//if (debuggable) console.log('data false type ' + this.data('type'));
					}
				} else {
					//if (debuggable) console.log('is outside');
					marker_top.hide(),
					marker_bottom.hide()
				}
			});

			//if (drgmove)
			updatePolyline(toid)

			drgmove = false;
			$('.graph').on('mousedown', function(e) {
				$( this ).css('cursor', 'move')
				paning(e);
			})
		})*/

		connection.mouseover(function(e) {
			edge_markers.show()
			circ_marker.show();
		});

		connection.mouseout(function(e) {
			//edge_markers.hide();
			if(!edge_dragging) circ_marker.hide();

		});





		/*polyline_bkgrnd.mousemove(function(e) {
			var xx = (e.pageX - scalegroup.x())/actualZoom;
			var yy = (e.pageY - scalegroup.y())/actualZoom;
			//console.log("mouseover")
			//circ_markers.add(circ_marker.clone().move(250, 250))
			//circ_markers.show()
			circ_marker.show();

			//var patharr = this.array();


			var length = this.length()

			var point1 = this.pointAt(0)
			var point2 = this.pointAt(length)

			//console.log("point1X=" + point1.x + " point1Y=" + point1.y + " point2x=" + point2.x + " point2y=" + point2.y )

			if ( pcoords.length > 2) {
				console.log("if pcoords.length=" + pcoords.length);
				// for (var i = 0; i < pcoords.length; i++) {
				// 	console.log('pcoords[i]=' + pcoords[i] + ' pcoords[i+1]=' + pcoords[i+1]);
				// 	var path1 = svg.path([pcoords[i],pcoords[i=1]]).fill('none').stroke({ color: 'pink', width: 3, opacity: 1});
				// }
				// pcoords.forEach(function(entry) {
				// 	console.log("entry=" + entry);
				//
				// });





			} else {
				console.log("else pcoords.length=" + pcoords.length);
				isPointBetweenPoints({x:xx, y:yy},point1,point2)

			}
			//pcoords.length();


			//isPointBetweenPoints({x:xx, y:yy},point1,point2)
		});*/



		connection.click(function(e) {
			//if (debuggable)
			console.log("connection click")
			var xx = (e.pageX - scalegroup.x())/actualZoom;
			var yy = (e.pageY - scalegroup.y())/actualZoom;

			if (circ_marker.inside(xx, yy)) {
				console.log("inside");
			}


			// circ_marker_start.show()
			// circ_marker_end.show()
			rect_outer.show()
			settings.show()
			del.show()

			document.addEventListener('mousedown', function(e){
				var xx = (e.pageX - scalegroup.x())/actualZoom;
				var yy = (e.pageY - scalegroup.y())/actualZoom;

				if (connection.inside(xx, yy)) {
					//if (debuggable) console.log("inside");
				} else {
						if (debuggable) console.log(e.target.nodeName);
						//if (debuggable) console.log("outside");

						rect_outer.hide()
						settings.hide()
						del.hide()
						// circ_marker_start.hide()
						// circ_marker_end.hide()

						// $('#line_dropdown li a').off();
						// $('#line_dropdown').hide()


						document.removeEventListener('mousedown', arguments.callee);
				}
			});

			e.stopPropagation();
		});

		connection.dblclick(function(e) {
			if (debuggable) console.log("connection dbl");

			//var xx = polyline.cx() + $('.graph').offset().left - $('#input_textarea').width()/2;
			//var yy = polyline.cy() + $('.graph').offset().top;

			var xx = polyline.cx()*actualZoom - $('#input_textarea').width()/2 + scalegroup.x();
			var yy = polyline.cy()*actualZoom + scalegroup.y();

			/*if (debuggable) console.log("task size " + task.x() + ' ' + task.y() + ' ' + task.height());
			if (debuggable) console.log("rect size " + rect.x() + ' ' + rect.y() + ' ' + rect.height() + ' ' + rect.width());
			if (debuggable) console.log("xx " + xx + ' yy ' + yy);*/

			$('#input_textarea').val($('#' + polyline.attr('id')+'_inner_text').html())
			$('#input_textarea').show()
			$('#input_textarea').css({'position':'absolute', 'left': xx, 'top': yy});
			$('#input_textarea').focus()

			document.addEventListener('mousedown', function(e){
				var xx = (e.pageX - scalegroup.x())/actualZoom;
				var yy = (e.pageY - scalegroup.y())/actualZoom;

			if (connection.inside(xx, yy)) {
				if (debuggable) console.log("inside");
			} else {
				if (e.target.nodeName != 'A') {
					if (debuggable) console.log(e.target.nodeName);
					if (debuggable) console.log("outside");

					if ( $('#input_textarea').is(":visible") ) {
						if (debuggable) console.log("visible");
						connection_text.move(polyline.cx() + $('.graph').offset().left - $('#input_textarea').width()/2, polyline.cy() + $('.graph').offset().top);
						$('#' + polyline.attr('id')+'_inner_text').html($('#input_textarea').val());
						connection.data('inner_text', $('#input_textarea').val())
						if ($('#input_textarea').val()!='') {
							inner_text.style('cursor:pointer;').show();
						} else {
							inner_text.style('cursor:default;').hide();
						}
						$('#input_textarea').hide()
					}

					rect_outer.hide();
					settings.hide()
					del.hide();

					$('#line_dropdown li a').off();
					$('#line_dropdown').hide()


					document.removeEventListener('mousedown', arguments.callee);

				}
			}
			});


			e.stopPropagation();
		});
	}
	del.click(function(e) {
		//delLine(circle.attr('id'));
		delPolyline(0, connection.attr('id'));
		e.stopPropagation();
	});

	settings.click(function(e) {
		var xx = e.pageX - $('.graph').offset().left;
		var yy = e.pageY - $('.graph').offset().top;

		$('#line_dropdown').show()
		$('#line_dropdown').css({'position':'absolute', 'left': xx, 'top': yy});
		$('#line_dropdown li a').click(function(e) {
			if (debuggable) console.log(e.target.text);
			if (debuggable) console.log(e.target.id);

			if (e.target.className!='inactive') {
				if (debuggable) console.log(e.target.className)
				switch (e.target.id) {
				  case 'line_dropdown_1':
					polyline.attr('stroke-dasharray', null)
					connection.data('dash', -1)
					break
				  case 'line_dropdown_2':
					polyline.attr('stroke-dasharray', '5,3')
					connection.data('dash', 1)
					break
				  case 'line_dropdown_card':
					//new_window('/pls/gis/ais_wf.p_scheme.p_obj_admin?v_model_id=' + l_model_id + '&v_id=' + task.attr('id'))
					break
				  default:
					polyline.attr('stroke-dasharray', null)
				};

				$('#line_dropdown li a').off();
				$('#line_dropdown').hide()
			}
		});
		e.stopPropagation();
	});

	/*polyline.dblclick(function(e) {
		delPolyline(0, polyline.attr('id'))
		e.stopPropagation();
	});*/
};

function updateLine(id, arr) {

}




























function updatePolyline(nodeid) {
	//if (debuggable) console.log('update polyline');
	var f_deltax,
		f_deltay,
		t_deltax,
		t_deltay,
		f_delta = 0,
		t_delta = 0

	$.each(connections, function( index, elem ) {
		f_delta = 0
		t_delta = 0

		if (elem.idfrom == nodeid || elem.idto == nodeid) {

			var node_from = SVG.get(elem.idfrom),
				node_to = SVG.get(elem.idto),
				current_con = SVG.get(elem.connid)

			if (node_from.x() > node_to.x()) {
				if (node_from.data('type')=='decision') {
					if (debuggable) console.log('node from type ' + node_from.data('type'));
					f_delta = - 10; //minus
				}
				if (node_to.data('type')=='decision') {
					if (debuggable) console.log('node to type ' + node_to.data('type'));
					t_delta = 10; //plus
				}

				switch (current_con.data('pos_from')) {
				  case 'default':
					f_deltax = 0 + f_delta
					f_deltay = node_from.get(2).height() / 2
					break
				  case 'top':
					f_deltax = node_from.get(2).width() / 2
					f_deltay = 0 + f_delta
					break
				  case 'bottom':
					f_deltax = node_from.get(2).width() / 2
					f_deltay = node_from.get(2).height()
					break
				  default:
					f_deltax = 0 + f_delta
					f_deltay = node_from.get(2).height() / 2
				};
				switch (current_con.data('pos_to')) {
				  case 'default':
					t_deltax = node_to.get(2).width() + t_delta;
					t_deltay = node_to.get(2).height() / 2;
					break
				  case 'top':
					t_deltax = node_to.get(2).width() / 2
					t_deltay = 0 - t_delta
					break
				  case 'bottom':
					t_deltax = node_to.get(2).width() / 2
					t_deltay = node_to.get(2).height() + t_delta
					break
				  default:
					t_deltax = node_to.get(2).width() + t_delta;
					t_deltay = node_to.get(2).height() / 2;
				};
			} else {
				if (node_from.data('type')=='decision') {
					if (debuggable) console.log('node from type ' + node_from.data('type'));
					f_delta = 10; //minus
				}
				if (node_to.data('type')=='decision') {
					if (debuggable) console.log('node to type ' + node_to.data('type'));
					t_delta = -10; //plus
				}

				switch (current_con.data('pos_from')) {
				  case 'default':
					f_deltax = node_from.get(2).width() + f_delta
					f_deltay = node_from.get(2).height() / 2
					break
				  case 'top':
					f_deltax = node_from.get(2).width() / 2
					f_deltay = 0 - f_delta
					break
				  case 'bottom':
					f_deltax = node_from.get(2).width() / 2
					f_deltay = node_from.get(2).height() + f_delta
					break
				  default:
					f_deltax = node_from.get(2).width() + f_delta
					f_deltay = node_from.get(2).height() / 2
				};

				switch (current_con.data('pos_to')) {
				  case 'default':
					t_deltax = 0 + t_delta;
					t_deltay = node_to.get(2).height() / 2;
					break
				  case 'top':
					t_deltax = node_to.get(2).width() / 2
					t_deltay = 0 + t_delta
					break
				  case 'bottom':
					t_deltax = node_to.get(2).width() / 2
					t_deltay = node_to.get(2).height() - t_delta
					break
				  default:
					t_deltax = 0 + t_delta;
					t_deltay = node_to.get(2).height() / 2;
				};
			}
			//console.log('parents ' + node_from.doc(SVG.G).doc(SVG.G) + ' & ' + node_to.doc(SVG.G).doc(SVG.G));
			var x_from = node_from.x() + f_deltax,
				y_from = node_from.y() + f_deltay,
				x_to = node_to.x() + t_deltax,
				y_to = node_to.y() + t_deltay,
				x2,
				y2,
				x3,
				y3,
				x4,
				y4

			x1 = x_from
			y1 = y_from

			x2 = x_from + (x_to - x_from)/2;
			y2 = y_from;

			x3 = x2
			y3 = y_to
			x4 = x3
			y4 = y3

			if (debuggable) console.log('pos_from ' + current_con.data('pos_from') + ' pos_to ' + current_con.data('pos_to'))

			if (current_con.data('pos_from')=='top') {
				y1 -= node_from.get(2).height() / 2
				x2 = x_from + (x_to - x_from)/2;
				y2 = y1;
			} else if (current_con.data('pos_from')=='bottom') {
				y1 += node_from.get(2).height() / 2
				x2 = x_from + (x_to - x_from)/2;
				y2 = y1;
			}
			if (current_con.data('pos_to')=='top') {
				y3 -= node_to.get(2).height() / 2
				x4 = x_to
				y4 = y3
			} else if (current_con.data('pos_to')=='bottom') {
				y3 += node_to.get(2).height() / 2
				x4 = x_to
				y4 = y3
			}


			//if (debuggable)  console.log('points ' + x_from+','+y_from+' '+x2+','+y2+' '+x3+','+y3+' '+x4+','+y4)

			var plotarr = [[x_from,y_from],[x1,y1],[x2,y2],[x3,y3],[x4,y4],[x_to,y_to]]

			//if (debuggable) console.log('arr ' + plotarr)
			current_con.get(1).plot(plotarr);
			current_con.get(2).plot(plotarr);
			//svg.polyline(x1+','+y1+' '+x2+','+y2+' '+x3+','+y3+' '+x4+','+y4).fill('none').stroke({ width: 2 })
			if (debuggable) console.log("index=" + index)

			//update inner text positions
			var plln = current_con.get(2)

			//set start and end markers positions
			current_con.get(3).move(x_from-5,y_from-5)
			current_con.get(4).move(x_to-5,y_to-5)

			var positionX = plln.cx() - $('#input_textarea').width()/2,
				positionY = plln.cy()

			current_con.last().move(positionX, positionY);

			current_con.data('positionX', positionX);
			current_con.data('positionY', positionY);

			//update del icon
			current_con.get(5).move(plln.cx(),plln.cy());
			current_con.get(6).move(plln.cx(),plln.cy()-15);


			//update rect outer
			current_con.get(0).size(1, 1)
			current_con.get(0).move(positionX-3, positionY-3)
			current_con.get(0).move(current_con.bbox().x-3, current_con.bbox().y-3)
			current_con.get(0).size(current_con.bbox().width+6, current_con.bbox().height+6)
		}
	});

};

function delPolyline(nodeid, lineid) {
	nodeid = typeof nodeid !== 'undefined' ? nodeid : 0;
	lineid = typeof lineid !== 'undefined' ? lineid : 0;

	//if (debuggable) console.log("nodeid=" + nodeid)
	//if (debuggable) console.log("lineid=" + lineid)

	if (nodeid != 0) {
		if (debuggable) console.log("nodeid=" + nodeid)
		$.each(connections, function( index, elem ) {
			if (debuggable) console.log("before id=" + elem.connid + " from=" + elem.idfrom + " to=" + elem.idto)
		});
		connections = $.grep(connections, function (elem, index) {
			if (elem.idfrom == nodeid || elem.idto == nodeid) {
				SVG.get(elem.connid).remove();
				if (debuggable) console.log("index=" + index)
				return false;
			}
			return true; // keep the element in the array
		});


		/*$.each(connections, function( index, elem ) {
			if (elem.idfrom == nodeid || elem.idto == nodeid) {
				SVG.get(elem.connid).remove();
				connections.splice(index,1)
				if (debuggable) console.log("index=" + index)
			}
		});
		$.each(connections, function( index, elem ) {
			if (debuggable) console.log("after id=" + elem.connid + " from=" + elem.idfrom + " to=" + elem.idto)
		});*/
	} else {
		connections = $.grep(connections, function (elem, index) {
			if (elem.connid == lineid ) {
				SVG.get(lineid).remove();
				if (debuggable) console.log("index=" + index)
				return false;
			}
			return true; // keep the element in the array
		});


		/*$.each(connections, function( index, elem ) {
			if (elem.connid == lineid ) {
				SVG.get(lineid).remove();
				connections.splice(index,1)
				if (debuggable) console.log("index=" + index)
			}
		});*/
	}

};



function drawPolyline_new(fromid, toid, innertext, positionX, positionY, id, oraid) {

	//set defaults if necessary
	fromid = typeof fromid !== 'undefined' ? fromid : -1;
	toid = typeof toid !== 'undefined' ? toid : -1;
	innertext = typeof innertext !== 'undefined' ? innertext : '';
	positionX = typeof positionX !== 'undefined' ? positionX : -1;
	positionY = typeof positionY !== 'undefined' ? positionY : -1;
	id = typeof id !== 'undefined' ? id : -1;
	oraid = typeof oraid !== 'undefined' ? oraid : -1;


	var f_deltax,
		f_deltay,
		t_deltax,
		t_deltay,
		f_delta = 0,
		t_delta = 0;

	var node_from = SVG.get(fromid);
	var node_to = SVG.get(toid);
	if (debuggable) console.log('node from w=' + node_from.get(2).width() + ' h=' +node_from.get(2).height());
	if (debuggable) console.log('node to w=' + node_to.get(2).width() + ' h=' +node_to.get(2).height());

	var direction_delta = 70; //������� (��������) ��� ����������� ����������� �����
	console.log('node_from.x=' + node_from.x() + ' node_to.x=' + node_to.x());

	//get values to speed up
	var x_from = node_from.x();
	var y_from = node_from.y();
	var x_to = node_to.x();
	var y_to = node_to.y();

	var variant = 0;

	if (x_from > x_to) {
		if (y_from < y_to) {
			console.log('y_from < y_to');
			if (node_from.data('type')=='decision') {
				if (debuggable) console.log('node from type ' + node_from.data('type'));
				f_delta = - 10; //minus
			}
			if (node_to.data('type')=='decision') {
				if (debuggable) console.log('node to type ' + node_to.data('type'));
				t_delta = 10; //plus
			}

			f_deltax = node_from.get(2).width() / 2 + f_delta;
			f_deltay = node_from.get(2).height() + f_delta;
			t_deltax = node_to.get(2).width() / 2 + t_delta;
			t_deltay = 0 + t_delta;
			variant = 1;
		} else {
			console.log('y_from > y_to');
			if (node_from.data('type')=='decision') {
				if (debuggable) console.log('node from type ' + node_from.data('type'));
				f_delta = - 10; //minus
			}
			if (node_to.data('type')=='decision') {
				if (debuggable) console.log('node to type ' + node_to.data('type'));
				t_delta = 10; //plus
			}

			f_deltax = node_from.get(2).width() / 2 + f_delta;
			f_deltay = 0 + f_delta;
			t_deltax = node_to.get(2).width() / 2 + t_delta;
			t_deltay = node_to.get(2).height(); + t_delta;
			variant = 2;
		}
	}

	if (Math.abs(x_from - x_to) < direction_delta) {
		if (y_from < y_to) {
			console.log('y_from < y_to');
			if (node_from.data('type')=='decision') {
				if (debuggable) console.log('node from type ' + node_from.data('type'));
				f_delta = - 10; //minus
			}
			if (node_to.data('type')=='decision') {
				if (debuggable) console.log('node to type ' + node_to.data('type'));
				t_delta = 10; //plus
			}

			f_deltax = node_from.get(2).width() / 2 + f_delta;
			f_deltay = node_from.get(2).height() + f_delta;
			t_deltax = node_to.get(2).width() / 2 + t_delta;
			t_deltay = 0 + t_delta;
			variant = 1;
		} else {
			console.log('y_from > y_to');
			if (node_from.data('type')=='decision') {
				if (debuggable) console.log('node from type ' + node_from.data('type'));
				f_delta = - 10; //minus
			}
			if (node_to.data('type')=='decision') {
				if (debuggable) console.log('node to type ' + node_to.data('type'));
				t_delta = 10; //plus
			}

			f_deltax = node_from.get(2).width() / 2 + f_delta;
			f_deltay = 0 + f_delta;
			t_deltax = node_to.get(2).width() / 2 + t_delta;
			t_deltay = node_to.get(2).height(); + t_delta;
			variant = 2;
		}

	} else {
		console.log('else');
		if (node_from.x() > node_to.x()) {
			if (node_from.data('type')=='decision') {
				if (debuggable) console.log('node from type ' + node_from.data('type'));
				f_delta = - 10; //minus
			}
			if (node_to.data('type')=='decision') {
				if (debuggable) console.log('node to type ' + node_to.data('type'));
				t_delta = 10; //plus
			}

			f_deltax = 0 + f_delta;
			f_deltay = node_from.get(2).height() / 2;
			t_deltax = node_to.get(2).width() + t_delta;
			t_deltay = node_to.get(2).height() / 2;
		} else	{
			if (node_from.data('type')=='decision') {
				if (debuggable) console.log('node from type ' + node_from.data('type'));
				f_delta = 10; //minus
			}
			if (node_to.data('type')=='decision') {
				if (debuggable) console.log('node to type ' + node_to.data('type'));
				t_delta = -10; //plus
			}

			f_deltax = node_from.get(2).width() + f_delta;
			f_deltay = node_from.get(2).height() / 2;
			t_deltax = 0 + t_delta;
			t_deltay = node_to.get(2).height() / 2;
		}
	}

	//adding deltas
	x_from += f_deltax;
	y_from += f_deltay;
	x_to += t_deltax;
	y_to += t_deltay;

	var x1 = x_from;
	var y1 = y_from;


	//new method
	if (variant == 1 || variant == 2) {
		console.log('variant ' + variant);
		var x2 = x_from
		var y2 =  y_from + (y_to - y_from)/2;
		var x3 = x_to;
		var y3 = y2;
	} else {
		console.log('variant ' + variant);
		var x2 = x_from + (x_to - x_from)/2;
		var y2 = y_from;
		var x3 = x2;
		var y3 = y_to;
	}

	var x4 = x_to;
	var y4 = y_to;


	/*if (debuggable) console.log('node from ' + node_from.x() + ',' +node_from.y());
	if (debuggable) console.log('node to ' + node_to.x()+','+node_to.y());
	if (debuggable) console.log('points ' + x1+','+y1+' '+x2+','+y2+' '+x3+','+y3+' '+x4+','+y4)*/

	var polyline = svg.polyline(x1+','+y1+' '+x2+','+y2+' '+x3+','+y3+' '+x4+','+y4).fill('none').stroke({ width: 2 }).attr('cursor', 'pointer');
	var marker = svg.marker(10, 10, function(add) {
	  add.path().attr({
			d: "M 0 0 L 10 5 L 0 10 z"
		})
	})
	polyline.marker('end', marker)
	marker.size(5,5)
	marker.attr({
		refX: 10
	});

	var inner_text = svg.foreignObject(100,50).attr({id: polyline.attr('id')+'_inner_text'});
	inner_text.attr({width: 100, height: 50}).style('word-wrap: break-word; text-align: center;').hide();
	$('#' + polyline.attr('id')+'_inner_text').html(innertext);
	if (innertext!='') inner_text.style('cursor:pointer;').show();

	if (positionX == -1 ) {
		positionX = polyline.cx() + $('.graph').offset().left - $('#input_textarea').width()/2;
	}
	if (positionY == -1 ) {
		positionY = polyline.cy() + $('.graph').offset().top;
	}

	var connection_text = svg.group();
		connection_text.add(inner_text);
		connection_text.draggy();
		connection_text.move(positionX, positionY);

	//connection.data('positionX', positionX);
	//connection.data('positionY', positionY);

	connection_text.on('dragstart', function(e) {
		rect_outer.hide();
		$('.graph').off('mousedown')
	})

	connection_text.on('dragend', function() {
		//if (debuggable) console.log('connection_text dragend x=' + connection_text.x() + ' y=' + connection_text.y());
		connection.data('positionX', connection_text.x());
		connection.data('positionY', connection_text.y());

		$('.graph').on('mousedown', function(e) {
			$( this ).css('cursor', 'move')
			paning(e);
		})

		rect_outer.size(connection.bbox().width+6, connection.bbox().height+6).attr({ 'fill-opacity': 0, stroke: "#d9534f", "stroke-width": 1, "stroke-dasharray": 4, "stroke-opacity"  : 0.5 }).move(connection.bbox().x-3, connection.bbox().y-3)
	})

	//For highlighting
	var rect_outer = svg.rect(1, 1).move(polyline.cx, polyline.cy).hide();// = svg.rect(polyline.bbox().width+6, polyline.bbox().height+6).attr({ 'fill-opacity': 0, stroke: "#d9534f", "stroke-width": 1, "stroke-dasharray": 4, "stroke-opacity"  : 0.5 }).move(polyline.bbox().x-3, polyline.bbox().y-3).hide();

	var del = svg.foreignObject(20,20).attr({id: polyline.attr('id')+'_del'});
	$('#' + polyline.attr('id')+'_del').html('<i class="icon-trash-empty"></i>');
	del.attr({width: 20, height: 20, 'cursor':'pointer'}).move(polyline.cx(),polyline.cy()).hide();


	var connection = svg.group();
		connection.add(rect_outer);
		connection.add(polyline);
		connection.add(del);
		connection.add(connection_text);

	rect_outer.size(connection.bbox().width+6, connection.bbox().height+6).attr({ 'fill-opacity': 0, stroke: "#d9534f", "stroke-width": 1, "stroke-dasharray": 4, "stroke-opacity"  : 0.5 }).move(connection.bbox().x-3, connection.bbox().y-3)

	scalegroup.add(connection);

	if (id != -1 ) {
		connection.attr('id', id)
		if (debuggable) console.log(connection.attr('id'))
	}

	connection.data({
	  isnode: 'false',
	  type: 'connection',
	  inner_text: $('#' + polyline.attr('id')+'_inner_text').html(),
	  positionX: positionX,
	  positionY: positionY,
	  id: connection.attr('id'),
	  oraid: oraid,
	  idfrom: fromid,
	  idto: toid
	})

	connections.push({
		//connid: polyline.attr('id'),
		connid: connection.attr('id'),
		idfrom: fromid,
		idto: toid
	});

	//EVENTS
	connection.click(function(e) {
		//if (debuggable)
		console.log("connection click");

		rect_outer.show();
		del.show();

		document.addEventListener('mousedown', function(e){
			var xx = (e.pageX - scalegroup.x())/actualZoom;
			var yy = (e.pageY - scalegroup.y())/actualZoom;

			if (connection.inside(xx, yy)) {
				//if (debuggable) console.log("inside");
			} else {
					if (debuggable) console.log(e.target.nodeName);
					//if (debuggable) console.log("outside");

					rect_outer.hide();
					del.hide();

					$('#line_dropdown li a').off();
					$('#line_dropdown').hide()

					document.removeEventListener('mousedown', arguments.callee);
			}
		});

		e.stopPropagation();
	});

	connection.dblclick(function(e) {
		if (debuggable) console.log("connection dbl");

		//var xx = polyline.cx() + $('.graph').offset().left - $('#input_textarea').width()/2;
		//var yy = polyline.cy() + $('.graph').offset().top;

		var xx = polyline.cx()*actualZoom - $('#input_textarea').width()/2 + scalegroup.x();
		var yy = polyline.cy()*actualZoom + scalegroup.y();

		/*if (debuggable) console.log("task size " + task.x() + ' ' + task.y() + ' ' + task.height());
		if (debuggable) console.log("rect size " + rect.x() + ' ' + rect.y() + ' ' + rect.height() + ' ' + rect.width());
		if (debuggable) console.log("xx " + xx + ' yy ' + yy);*/

		$('#input_textarea').val($('#' + polyline.attr('id')+'_inner_text').html())
		$('#input_textarea').show()
		$('#input_textarea').css({'position':'absolute', 'left': xx, 'top': yy});
		$('#input_textarea').focus()

		document.addEventListener('mousedown', function(e){
			var xx = (e.pageX - scalegroup.x())/actualZoom;
			var yy = (e.pageY - scalegroup.y())/actualZoom;

		if (connection.inside(xx, yy)) {
			if (debuggable) console.log("inside");
		} else {
			if (e.target.nodeName != 'A') {
				if (debuggable) console.log(e.target.nodeName);
				if (debuggable) console.log("outside");

				if ( $('#input_textarea').is(":visible") ) {
					if (debuggable) console.log("visible");
					connection_text.move(polyline.cx() + $('.graph').offset().left - $('#input_textarea').width()/2, polyline.cy() + $('.graph').offset().top);
					$('#' + polyline.attr('id')+'_inner_text').html($('#input_textarea').val());
					connection.data('inner_text', $('#input_textarea').val())
					if ($('#input_textarea').val()!='') {
						inner_text.style('cursor:pointer;').show();
					} else {
						inner_text.style('cursor:default;').hide();
					}
					$('#input_textarea').hide()
				}

				rect_outer.hide();
				del.hide();

				$('#line_dropdown li a').off();
				$('#line_dropdown').hide()

				document.removeEventListener('mousedown', arguments.callee);

			}
		}
		});


		e.stopPropagation();
	});

	del.click(function(e) {
		//delLine(circle.attr('id'));
		delPolyline(0, connection.attr('id'));
		e.stopPropagation();
	});

	/*polyline.dblclick(function(e) {
		delPolyline(0, polyline.attr('id'))
		e.stopPropagation();
	});*/
};
