/*
TODO:
- proper naming: bpmnline => connection
- change circles -5px offset to variable
- разобраться с флагом dragging и edge_dragging
- изначально рисиовать максимально простые линии
	- если на одной прямой
	- убирать лишний бендпоинт при первой отрисовке
- move data to memory

*/

var edge_dragging = false,
		dragging = false,
		oversegment

function deleteBPMNline(nodeid) {
	scalegroup.each(function(i, children) {
        if (this.data('idfrom')==nodeid || this.data('idto')==nodeid) {
					this.remove()
				}

			})
}


SVG.Bpmnline = SVG.invent({
	create: function () {
		this.constructor.call(this, SVG.create('g'))
	}
  , inherit: SVG.Container
  ,	extend: {
		draw: function (prop) {
			/*
			* SVG.Bpmnline
			* Draws line|connection between BPMN-nodes.
			* @name Bpmnline
			* @function
			* @param {Object} options An object containing any of the following fields:
			*
			*  - `fromid` (SVGElement): The connector elements container. Defaults to source parent.
			*  - `toid` (SVGElement): The marker elements container. Defaults to source parent.
			*  - `innertext` (String): Connector attachment for source element: 'center' / 'perifery'. Defaults to 'center'
			*  - `positionx` (String): Connector attachment for target element: 'center' / 'perifery'. Defaults to 'center'
			*  - `positiony` (String): Connector type: 'straight' or 'curved'. Defaults to 'straight'
			*  - `id` (String): Can be: an SVGElement / 'null' / 'default'. Defaults to 'null'
				*  - `path` (String): Can be: an SVGElement / 'null' / 'default'. Defaults to 'null'
				*  - `dashed` (String): Can be: an SVGElement / 'null' / 'default'. Defaults to 'null'
			* @return {Object} An object.
		  */
			prop = (typeof prop !== "object") ? {} : prop;
			prop.fromid = prop.fromid || -1;
			prop.toid = prop.toid || -1;
			prop.innertext = prop.innertext || '';
			prop.positionx = prop.positionx || -1;
			prop.positiony = prop.positiony || -1;
			prop.id = prop.id || -1;
			prop.path = prop.path || -1;
			prop.dashed = prop.dashed || -1;

			if (debuggable) console.log('New connection')

			var element = this,

				//фон для меню
				menuBackgrnd = this.rect(25, 55)
					.attr({ fill: '#ececec', opacity: 0.7 })
					.hide(),

				//For highlighting
				shapeOuter = this.rect(1, 1)
					.attr({ 'fill-opacity': 0, stroke: "#d9534f", "stroke-width": 1, "stroke-dasharray": 4, "stroke-opacity": 0.5 })
					.hide(),

				settings = this.plain('\ue802')
					.attr({ cursor: 'pointer' })
					.font({ family: 'fontello', size: 20 })
					.hide(),

				del = this.plain('\ue800')
					.attr({ cursor: 'pointer' })
					.font({ family: 'fontello', size: 20 })
					.hide(),

				innerText = this.text('')
					.style('cursor:default;')
					.addClass('noselect'),

				connectionText = this.group().add(innerText);

			if (prop.innertext != '') {
				connectionText.move(prop.positionx, prop.positiony).show();

				innerText.text(function (add) {
					$.each(prop.innertext.split('\n'), function (k, val) {
						add.tspan(val).newLine()
					});
				})
				var linesset = innerText.lines()
				linesset.each(function (i, children) {
					this.dx(-this.length() / 2 + 25)
				})
				//TODO: new way for text splitin
			} else {
				connectionText.hide();
			}

			if (editable) {
				innerText.style('cursor:pointer;')
				connectionText.draggy();

				connectionText.on('dragstart', function (e) {
					shapeOuter.hide();
					svg.off('mousedown', paning)
				})

				connectionText.on('dragend', function () {
					//if (debuggable) console.log('connectionText dragend x=' + connectionText.x() + ' y=' + connectionText.y());
					element.data('positionX', connectionText.x());
					element.data('positionY', connectionText.y());
					svg.on('mousedown', paning)
				})
			}

			var bendpointId //current dragging bendpoint
			  , prevx, prevy, nextx, nexty
			  , parent = -1
			  ,	nodeFrom = SVG.get(prop.fromid)
			  , nodeTo = SVG.get(prop.toid)
			  , x_from = nodeFrom.x()
			  , y_from = nodeFrom.y()
			  , x_to = nodeTo.x()
			  , y_to = nodeTo.y()
			  , x2, y2, x3, y3, x4, y4

			this.data({
				isnode: 'false',
				type: 'connection',
				innerText: innerText.text(),
				positionX: prop.positionx,
				positionY: prop.positiony,
				//id: connection.attr('id'),
				//oraid: oraid,
				idfrom: prop.fromid,
				idto: prop.toid,
				path: prop.path,
				parents: parent
			})


			//TODO parent for what?
			if (nodeFrom.data('parent') != -1) {
				parent = nodeFrom.data('parent');
			}
			if (nodeTo.data('parent') != -1 && nodeTo.data('parent') != parent) {
				parent += ',' + nodeTo.data('parent');
			}
			if (debuggable) console.log('parents for line is ' + parent);

			
			//draggy snapping
			var snapping = function (x, y, elem) { //TODO move to modeler.js
				if (debuggable) console.log(bendpointId);
				var res = {};
				res.x = x - (x % snapRange);
				res.y = y - (y % snapRange);

				scalegroup.each(function (i, children) {//TODO change to parent or doc
					if (Math.abs(this.x() - res.x) < 10) res.x = this.x()
					if (Math.abs(this.y() - res.y) < 10) res.y = this.y()
				})

				bendPoints.each(function (i, children) {
					if (bendpointId != this.attr('id')) {
						if (Math.abs(this.x() - res.x) < 10) res.x = this.x()
						if (Math.abs(this.y() - res.y) < 10) res.y = this.y()
					}
				})
				return res;
			}

			//new way add first pair of coords
			var pathCoordArr = [],
				lineCoordArr = [],
				pathData = this.data('path') //TODO: likely to remove

			/*TODO: Логика построения линий*/
			//new way
			/*,	nodeFrom = SVG.get(prop.fromid)
			  , nodeTo = SVG.get(prop.toid)
			  , x_from = nodeFrom.x()
			  , y_from = nodeFrom.y()
			  , x_to = nodeTo.x()
			  , y_to = nodeTo.y()
			  , x2, y2, x3, y3, x4, y4*/

			if (this.data('path') == '-1') {
				//if (debuggable)
				console.log('this.data("path") is null: ' + this.data('path'))
				
				if (nodeFrom.x() == nodeTo.x()) { // If on the same line
					pathCoordArr.push(['M', nodeFrom.x(), nodeFrom.y()]);
					pathCoordArr.push(['L', nodeTo.x(), nodeTo.y()]);
				} else if (nodeFrom.y() == nodeTo.y()) { // If on the same line
					pathCoordArr.push(['M', nodeFrom.x(), nodeFrom.y()]);
					pathCoordArr.push(['L', nodeTo.x(), nodeTo.y()]);
				} else {
					pathCoordArr.push(['M', nodeFrom.x(), nodeFrom.y()]);
					pathCoordArr.push(['L', nodeFrom.x() + (nodeTo.x() - nodeFrom.x()) / 2, nodeFrom.y()]);
					pathCoordArr.push(['L', nodeFrom.x() + (nodeTo.x() - nodeFrom.x()) / 2, nodeTo.y()]);
					pathCoordArr.push(['L', nodeTo.x(), nodeTo.y()]);
				}
			} else {
				this.data('path').split(';').forEach(function (entry) {
					pathCoordArr.push(entry.split(','));
				});
				//if (debuggable)
				console.log('this.data("path") is NOT null ' + pathCoordArr)
			}
			

			this.data('path', pathCoordArr.join(';'))
			pathCoordArr.forEach(function (entry) {
				lineCoordArr.push([entry[1], entry[2]]);
			});

			var connection = this.group() //Group for path elements that make whole connection
			  , bendPoints = this.group().hide() //Group for storing bendpoints
			  , linep
			  , linen
			  , path1 = this.path().fill('none').stroke({ color: 'red', width: 1, opacity: 0 })
			  ,	path2 = this.path().fill('none').stroke({ color: 'blue', width: 1, opacity: 0 })
			  , circ_marker = this.circle(10).attr({ fill: 'red', stroke: "#000", "stroke-width": 2 }).hide()
			  , bendpoint = this.group().attr('cursor', 'pointer').hide()
			  , paths = [] //Array for storing connectionPieces
			
			//We will reuse that
			bendpoint.circle(20).attr({ fill: 'darkmagenta', opacity: 0.5 }).move(-10, -10)
			bendpoint.circle(10).attr({ fill: 'orange', stroke: "#000", "stroke-width": 1 }).move(-5, -5)

			/*pathCoordArr.forEach(function (entry, i) {
				if (i == 0) {
					lineCoordArr[0] = getRightCoords(nodeFrom,nodeTo,false)
					console.log('lineCoordArr[0]=' + lineCoordArr[0])

				} else if (i == pathCoordArr.length - 1) {
					connectionPiece.marker('end', marker)
					lineCoordArr[lineCoordArr.length - 1] = getRightCoords(nodeFrom,nodeTo,true)
					console.log('lineCoordArr[last]=' + lineCoordArr[lineCoordArr.length - 1])
				}
			})*/

			//If nodes are on same line
			if (pathCoordArr.length == 2) {
				lineCoordArr[0] = getRightCoords(nodeFrom,nodeTo)
				lineCoordArr[lineCoordArr.length - 1] = getRightCoords(nodeTo, nodeFrom)

				var connectionPiece = connection.path([['M', lineCoordArr[0][0], lineCoordArr[0][1]],
									  ['L', lineCoordArr[lineCoordArr.length - 1][0], lineCoordArr[lineCoordArr.length - 1][1]]])
					.fill('none')
					.stroke({ color: 'black', width: 1/*, opacity: 0.5*/ })
					.data({
						iter: i,
						from: lineCoordArr[0][0] + ',' + lineCoordArr[0][1],
						to: lineCoordArr[lineCoordArr.length - 1][0] + ',' + lineCoordArr[lineCoordArr.length - 1][1]
					})
					.marker('end', marker)
				
				paths.push(connectionPiece.attr('id'))
			
				
			} else {

			
				for (var i = 0; i < pathCoordArr.length; i++) {
					//if (debuggable) console.log('pathCoordArr[i]=' + pathCoordArr[i] + ' pathCoordArr[i+1]=' + pathCoordArr[i+1]);

					var xfrom,
						yfrom,
						xto,
						yto

					var connectionPiece = connection.path([['M', 0, 0], ['L', 0, 0]])

					if (i == 0) {
						var testCoords = getRightCoords(nodeFrom,nodeTo,false);

						/*xfrom = pathCoordArr[i][1],
						yfrom = pathCoordArr[i][2],
						xto = pathCoordArr[i + 1][1],
						yto = pathCoordArr[i + 1][2]*/

						/*var deltaX = xto - xfrom;
						var deltaY = yto - yfrom;
						var rad = Math.atan2(deltaY, deltaX); // In radians
						var deg = rad * (180 / Math.PI)
						console.log('deltaX=' + deltaX + ' deltaY=' + deltaY + ' rad=' + rad + ' deg=' + deg);
						if (nodeFrom.data('type') == 'event') {
							xfrom = nodeFrom.x() + (25 * Math.cos(rad))
							yfrom = nodeFrom.y() + (25 * Math.sin(rad))
						}
						else if (nodeFrom.data('type') == 'task') {
							var deg = rad * (180 / Math.PI) * (-1)
							var testobj = { width: 100, height: 80 };
							var testcoords = edgeOfView(testobj, deg)
							xfrom = nodeFrom.x() + testcoords.x - 50
							yfrom = nodeFrom.y() + testcoords.y - 40
						}
						else if (nodeFrom.data('type') == 'decision') {
							var deg = rad * (180 / Math.PI) * (-1)
							if (deg <= 135 && deg >= 45) {
								xfrom = nodeFrom.x()
								yfrom = nodeFrom.y() - 35
							} else if (deg >= -135 && deg <= -45) {
								xfrom = nodeFrom.x()
								yfrom = nodeFrom.y() + 35
							} else if (deg < 45 && deg > -45) {
								xfrom = nodeFrom.x() + 35
								yfrom = nodeFrom.y()
							} else {
								xfrom = nodeFrom.x() - 35
								yfrom = nodeFrom.y()
							}
						}

						lineCoordArr[0][0] = xfrom
						lineCoordArr[0][1] = yfrom*/
						lineCoordArr[0] = testCoords
						console.log('lineCoordArr[0]=' + lineCoordArr[0])

					} else /*if (i == pathCoordArr.length - 1)*/ {
						connectionPiece.marker('end', marker)
						var testCoords = getRightCoords(nodeFrom,nodeTo,true);


						/*var deltaX = xfrom - xto;
						var deltaY = yfrom - yto;
						var rad = Math.atan2(deltaY, deltaX); // In radians

						//if (debuggable) console.log('deltaX=' + deltaX + ' deltaY=' + deltaY + ' rad=' + rad + ' deg=' + deg);

						if (nodeTo.data('type') == 'event') {
							xto = nodeTo.x() + (25 * Math.cos(rad))
							yto = nodeTo.y() + (25 * Math.sin(rad))
						}
						else if (nodeTo.data('type') == 'task') {
							var deg = rad * (180 / Math.PI) * (-1)
							var testobj = { width: 100, height: 80 };
							var testcoords = edgeOfView(testobj, deg)
							xto = nodeTo.x() + testcoords.x - 50
							yto = nodeTo.y() + testcoords.y - 40
						}
						else if (nodeTo.data('type') == 'decision') {
							var deg = rad * (180 / Math.PI) * (-1)
							if (deg <= 135 && deg >= 45) {
								xto = nodeTo.x()
								yto = nodeTo.y() - 35
							} else if (deg >= -135 && deg <= -45) {
								xto = nodeTo.x()
								yto = nodeTo.y() + 35
							} else if (deg < 45 && deg > -45) {
								xto = nodeTo.x() + 35
								yto = nodeTo.y()
							} else {
								xto = nodeTo.x() - 35
								yto = nodeTo.y()
							}
						}

						lineCoordArr[lineCoordArr.length - 1][0] = xto
						lineCoordArr[lineCoordArr.length - 1][1] = yto
						*/
						lineCoordArr[lineCoordArr.length - 1] = testCoords
						console.log('lineCoordArr[last]=' + lineCoordArr[lineCoordArr.length - 1])
					}
					
					
					//var connectionPiece = svg.path([['M',pathCoordArr[i][1],pathCoordArr[i][2]],['L',pathCoordArr[i+1][1],pathCoordArr[i+1][2]]])
					connectionPiece.plot([['M', lineCoordArr[0][0], lineCoordArr[0][1]],
										['L', lineCoordArr[lineCoordArr.length - 1][0], lineCoordArr[lineCoordArr.length - 1][1]]])
						.fill('none')
						.stroke({ color: 'black', width: 1/*, opacity: 0.5*/ })
						.data({
							iter: i,
							from: lineCoordArr[0][0] + ',' + lineCoordArr[0][1],
							to: xto + ',' + yto
						})

					//connection.add(connectionPiece)

					paths.push(connectionPiece.attr('id'))
					if (i > 1) paths.splice(0, 1)

					// bendPoints.add(bendpoint.clone()
					// 	.data({
					// 		iter: i,
					// 		sidep: i == 0 ? 'none' : pathCoordArr[i - 1][1] + ',' + pathCoordArr[i - 1][2],
					// 		siden: pathCoordArr[i + 1][1] + ',' + pathCoordArr[i + 1][2],
					// 		paths: paths.join()
					// 	})
					// 	.move(pathCoordArr[i][1], pathCoordArr[i][2])
					// 	.show()
					// 	.draggy(snapping)
					// 	//.on('mousemove', function(e) { circ_marker.hide(); })
					// 	.on('mouseover', function (e) {
					// 		if (debuggable) console.log('bendpoint mouseover')
					// 		bendPoints.show()
					// 	})
					// 	.on('dragstart', function (e) {
					// 		if (debuggable) console.log('dragstart ' + e.detail.event)
					// 		bendpointId = this.attr('id')
					// 		svg.off('mousedown', paning)
					// 		//hide paths
					// 		this.data('paths').split(',').forEach(function (entry) {
					// 			SVG.get(entry).remove()
					// 		});
					// 		//console.log('dragstart ' + event.detail.event.x + ' ' + event.detail.event.y + ' ' + this.data('siden'));
					// 		polyline_backgrnd.hide()

					// 		var thistransf = this.transform(),
					// 			scgtransf = scalegroup.transform()
					// 		//var xx = (e.detail.event.pageX - scalegroup.x())/actualZoom
					// 		//var yy = (e.detail.event.pageY - scalegroup.y())/actualZoom
					// 		var xx = thistransf.x * scgtransf.scaleX + scgtransf.x
					// 		var yy = thistransf.y * scgtransf.scaleY + scgtransf.y

					// 		var sidep = this.data('sidep').split(',')
					// 		var siden = this.data('siden').split(',')

					// 		prevx = sidep[0] * scgtransf.scaleX + scgtransf.x
					// 		prevy = sidep[1] * scgtransf.scaleY + scgtransf.y

					// 		nextx = siden[0] * scgtransf.scaleX + scgtransf.x
					// 		nexty = siden[1] * scgtransf.scaleY + scgtransf.y

					// 		if (this.data('sidep') == 'none') {
					// 			linen = svg.line(xx + ',' + yy + ' ' + nextx + ',' + nexty).stroke({ width: 1 })//.back()
					// 		}
					// 		else {
					// 			linep = svg.line(xx + ',' + yy + ' ' + prevx + ',' + prevy).stroke({ width: 1 })//.back()
					// 			linen = svg.line(xx + ',' + yy + ' ' + nextx + ',' + nexty).stroke({ width: 1 })//.back()
					// 		}
					// 	})
					// 	.on('dragmove', function (e) {
					// 		var thistransf = this.transform(),
					// 			scgtransf = scalegroup.transform()
					// 		//var xx = (e.detail.event.pageX - scalegroup.x())/actualZoom
					// 		//var yy = (e.detail.event.pageY - scalegroup.y())/actualZoom
					// 		var xx = thistransf.x * scgtransf.scaleX + scgtransf.x
					// 		var yy = thistransf.y * scgtransf.scaleY + scgtransf.y

					// 		if (this.data('sidep') == 'none') {
					// 			linen.plot(xx + ',' + yy + ' ' + nextx + ',' + nexty)
					// 		}
					// 		else {
					// 			linep.plot(xx + ',' + yy + ' ' + prevx + ',' + prevy)
					// 			linen.plot(xx + ',' + yy + ' ' + nextx + ',' + nexty)
					// 		}
					// 	})
					// 	.on('dragend', function (e) {
					// 		svg.on('mousedown', paning)
							


					// 		if (linep) linep.remove();
					// 		linen.remove();
					// 		var t = this.ctm().extract()

					// 		//console.log('dragend for i=' + this.data('iter') + ' x=' + t.x + ' y=' + t.y)
					// 		//(bbox.x + thistransf.x) * scgtransf.scaleX + scgtransf.x
					// 		var thistransf = this.transform(),
					// 			scgtransf = scalegroup.transform()
					// 		//var xx = (e.detail.event.pageX - scalegroup.x())/actualZoom
					// 		//var yy = (e.detail.event.pageY - scalegroup.y())/actualZoom
					// 		var xx = thistransf.x * scgtransf.scaleX + scgtransf.x
					// 		var yy = thistransf.y * scgtransf.scaleY + scgtransf.y

					// 		this.hide();
					// 		/*var circle = svg.circle(10).attr({ fill: 'red' }).move(xx-2.5, yy-2.5)
					// 	circle.animate(2500).attr({ opacity: 0})*/

					// 		if (this.data('sidep') == 'none') {
					// 			linen.plot(xx + ',' + yy + ' ' + nextx + ',' + nexty)
					// 		}
					// 		else {
					// 			linep.plot(xx + ',' + yy + ' ' + prevx + ',' + prevy)
					// 			linen.plot(xx + ',' + yy + ' ' + nextx + ',' + nexty)
					// 		}

					// 		pathCoordArr[this.data('iter')][1] = thistransf.x
					// 		pathCoordArr[this.data('iter')][2] = thistransf.y

					// 		var iter = this.data('iter')
					// 		bendPoints.each(function (i, children) {
					// 			if (this.data('iter') == iter + 1) {
					// 				//console.log('edge_marker with i=' + this.data('iter') + ' is next node')
					// 				this.data('sidep', thistransf.x + ',' + thistransf.y)
					// 			}
					// 			if (this.data('iter') == iter - 1) {
					// 				//console.log('edge_marker with i=' + this.data('iter') + ' is prev node')
					// 				this.data('siden', thistransf.x + ',' + thistransf.y)
					// 			}
					// 		})
					// 		/*pathCoordArr.forEach(function(entry) {
					// 			console.log('entry ' + entry )
					// 		});*/
					// 		circ_marker.hide()

					// 		//check for several abreast
					// 		for (var i = 1; i < pathCoordArr.length - 1; i++) {
					// 			if (pathCoordArr[i][1] == pathCoordArr[i - 1][1] && pathCoordArr[i][1] == pathCoordArr[i + 1][1]) {
					// 				//console.log('bendpoint with x=' + pathCoordArr[i][1] + ' y=' + pathCoordArr[i][2] + ' should be deleted')
					// 				pathCoordArr.splice(i, 1)
					// 			} else if (pathCoordArr[i][2] == pathCoordArr[i - 1][2] && pathCoordArr[i][2] == pathCoordArr[i + 1][2]) {
					// 				//console.log('bendpoint with x=' + pathCoordArr[i][1] + ' y=' + pathCoordArr[i][2] + ' should be deleted')
					// 				pathCoordArr.splice(i, 1)
					// 			}
					// 		}
					// 		linep.remove()
					// 		linen.remove()
					// 		element.data('path', pathCoordArr.join(';')).update()


					// 	})
					// 	/*.click(function(e) {
					// 		   console.log('dblclick ')
					// 			this.remove();


					// 			pathCoordArr[this.data('iter')][1] = t.x  * t.scaleX
					// 			pathCoordArr[this.data('iter')][2] = t.y  * t.scaleY

					// 			var iter = this.data('iter')
					// 			bendPoints.each(function(i, children) {
					// 				if (this.data('iter') == iter+1) {
					// 					//console.log('edge_marker with i=' + this.data('iter') + ' is next node')
					// 					this.data('sidep', t.x + ',' + t.y)
					// 				}
					// 				if (this.data('iter') == iter-1) {
					// 					//console.log('edge_marker with i=' + this.data('iter') + ' is prev node')
					// 					this.data('siden', t.x + ',' + t.y)
					// 				}
					// 			})

					// 			circ_marker.hide()
					// 			element.data('path', pathCoordArr.join(';')).update()

					// 	   })*/
					// )

					// if (i == (pathCoordArr.length - 2)) {
					// 	bendPoints.add(bendpoint.clone()
					// 		.data({
					// 			iter: i + 1,
					// 			sidep: pathCoordArr[i][1] + ',' + pathCoordArr[i][2],
					// 			siden: 'none',
					// 			paths: paths.splice(-1, 1).join()
					// 		})
					// 		.move(pathCoordArr[i + 1][1], pathCoordArr[i + 1][2])
					// 		.show()
					// 		.draggy(snapping)
					// 		.on('mousemove', function (e) { circ_marker.hide(); })
					// 		.on('dragstart', function (e) {
					// 			svg.off('mousedown', paning)
					// 			//hide paths
					// 			this.data('paths').split(',').forEach(function (entry) {
					// 				SVG.get(entry).remove()
					// 			});
					// 			//console.log('dragstart ' + event.detail.event.x + ' ' + event.detail.event.y + ' ' + this.data('siden'));
					// 			linep = element.line(event.detail.event.x + ',' + event.detail.event.y + ' ' + this.data('sidep')).stroke({ width: 1 });
					// 		})
					// 		.on('dragmove', function (e) {
					// 			linep.plot(event.detail.event.x + ',' + event.detail.event.y + ' ' + this.data('sidep'));
					// 		})
					// 		.on('dragend', function (e) {
					// 			linep.remove();

					// 			var t = this.ctm().extract()

					// 			//console.log('dragend for i=' + this.data('iter') + ' x=' + t.x + ' y=' + t.y)
					// 			pathCoordArr[this.data('iter')][1] = t.x
					// 			pathCoordArr[this.data('iter')][2] = t.y

					// 			var iter = this.data('iter')
					// 			bendPoints.each(function (i, children) {
					// 				/*if (this.data('iter') == iter+1) {
					// 					//console.log('edge_marker with i=' + this.data('iter') + ' is next node')
					// 					this.data('sidep', t.x + ',' + t.y)
					// 				}*/
					// 				if (this.data('iter') == iter - 1) {
					// 					//console.log('edge_marker with i=' + this.data('iter') + ' is prev node')
					// 					this.data('siden', t.x + ',' + t.y)
					// 				}
					// 			})
					// 			element.data('path', pathCoordArr.join(';')).update()
					// 			//element.data('path', pathCoordArr)
					// 			//element.update()
					// 		})
					// 	)
					// 	/*bendPoints.add(circ_marker.clone()
					// 							.attr({ fill: 'purple', stroke: "#000", "stroke-width": 2 })
					// 							.move(pathCoordArr[i+1][1]-5,pathCoordArr[i+1][2]-5)
					// 						.show()
					// 						.draggy(snapping)
					// 						.on('dragstart', function(e) {
					// 								   $('.graph').off('mousedown')
					// 								   svg.off('mousedown', paning)
					// 								   console.log('dragstart');
					// 							 })
					// 						//.on('click', function() {  console.log('click' + this.attr('id')) })
					// 					)*/
					// }
				}
			}
			var polyline_backgrnd = this.polyline(lineCoordArr)
				.fill('none')
				.stroke({ color: 'white', width: 6 })

			var polyline = this.polyline(lineCoordArr)
				.fill('none')
				.stroke({ color: 'green', width: 20, opacity: 0 })
				.on('mouseover', function (e) {
					//console.log('polyline mouseover')
					circ_marker.show()
					bendPoints.show()
				})
				.on('dblclick', function (e) {
					if (debuggable) console.log('polyline dblclick');

					menuBackgrnd.hide()
					shapeOuter.hide()
					settings.hide()
					del.hide()
					document.removeEventListener('mousedown', arguments.callee);

					var xx = polyline.cx() * actualZoom - $('#input_textarea').width() / 2 + scalegroup.x();
					var yy = polyline.cy() * actualZoom + scalegroup.y();

					$('#input_textarea').val(innerText.text())
					$('#input_textarea').show()
					$('#input_textarea').css({ 'position': 'absolute', 'left': xx, 'top': yy });
					$('#input_textarea').focus()

					document.addEventListener('mousedown', function (e) {
						var xx = (e.pageX - scalegroup.x()) / actualZoom;
						var yy = (e.pageY - scalegroup.y()) / actualZoom;

						if (connection.inside(xx, yy)) {
							if (debuggable) console.log("inside");
						} else {
							if (e.target.nodeName != 'A') {
								if (debuggable) console.log(e.target.nodeName);
								if (debuggable) console.log("outside");

								if ($('#input_textarea').is(":visible")) {
									if (debuggable) console.log("visible");
									$('#input_textarea').hide()

									if ($('#input_textarea').val() != '') {
										innerText.style('cursor:pointer;')
										connectionText.show();
										connectionText.move(polyline.cx() /*+ $('.graph').offset().left*/ - $('#input_textarea').width() / 2, polyline.cy() /*+ $('.graph').offset().top*/);
										element.data('positionX', connectionText.x());
										element.data('positionY', connectionText.y());

										prop.innertext = $('#input_textarea').val();
										innerText.text(function (add) {
											$.each(prop.innertext.split('\n'), function (k, val) {
												add.tspan(val).newLine()
											});
										})
										var linesset = innerText.lines()
										linesset.each(function (i, children) {
											this.dx(-this.length() / 2 + 25)
										})

										element.data('innerText', innerText.text())
									} else {
										innerText.style('cursor:default;')
										innerText.clear();
										connectionText.hide();
									}
								}

								shapeOuter.hide();
								settings.hide()
								del.hide();

								$('#line_dropdown li a').off();
								$('#line_dropdown').hide()

								document.removeEventListener('mousedown', arguments.callee);
							}
						}
					});
				})
				.on('realclick', function (e) {
					if (debuggable) console.log('polyline realclick');
					var xx = (e.pageX - scalegroup.x()) / actualZoom;
					var yy = (e.pageY - scalegroup.y()) / actualZoom;
					//
					// if (circ_marker.inside(xx, yy)) {
					// 	console.log("inside");
					// }
					//
					element.front()

					// circ_marker_start.show()
					// circ_marker_end.show()


					menuBackgrnd.show()
					shapeOuter.show()
					settings.show()
					del.show()

					document.addEventListener('mousedown', function (e) {
						var xx = (e.pageX - scalegroup.x()) / actualZoom;
						var yy = (e.pageY - scalegroup.y()) / actualZoom;

						if (element.inside(xx, yy)) {
							//if (debuggable)
							if (debuggable) console.log("inside");
						} else {
							if (debuggable) console.log(e.target.nodeName);
							//if (debuggable)
							console.log("outside");
							menuBackgrnd.hide()
							shapeOuter.hide()
							settings.hide()
							del.hide()
							// circ_marker_start.hide()
							// circ_marker_end.hide()

							// $('#line_dropdown li a').off();
							// $('#line_dropdown').hide()


							document.removeEventListener('mousedown', arguments.callee);
						}
					})
				})
				.on('mouseup', function (e) {
					if (debuggable) console.log('polyline mouseup');
				})
				.on('mousedown', function (e) {
					if (debuggable) console.log('polyline mousedown');

					var movedFlag = false

					var xx = (e.pageX - scalegroup.x()) / actualZoom - 5,
						yy = (e.pageY - scalegroup.y()) / actualZoom - 5,
						intx = xx,
						inty = yy

					svg.off('mousedown', paning)

					dragging = true;
					edge_dragging = true;

					//circ_marker.move(xx,yy)
					polyline_backgrnd.hide()

					var length = oversegment.length(),
						point1 = oversegment.pointAt(0),
						point2 = oversegment.pointAt(length)
					//linep = element.line(circ_marker.cx() + ',' + circ_marker.cy() + ' ' + point1.x + ',' + point1.y).stroke({ width: 1 })
					//linen = element.line(circ_marker.cx() + ',' + circ_marker.cy() + ' ' + point2.x + ',' + point2.y).stroke({ width: 1 })
					linep = element.line(point1.x + ',' + point1.y + ' ' + point1.x + ',' + point1.y).stroke({ width: 1 })
					linen = element.line(point2.x + ',' + point2.y + ' ' + point2.x + ',' + point2.y).stroke({ width: 1 })

					//circ_marker.show()
					bendpointId = circ_marker.attr('id')
					svg.on('mousemove', function (e) {
						xx = (e.pageX - scalegroup.x()) / actualZoom,
							yy = (e.pageY - scalegroup.y()) / actualZoom
						//console.log('graph mousemove xx= ' + xx);

						var coord = snapping(xx, yy);

						circ_marker.move(coord.x - 5, coord.y - 5)
						if (Math.abs(xx - intx) > 10 || Math.abs(yy - inty) > 10 || movedFlag) {
							movedFlag = true
							oversegment.remove()
							linep.plot(circ_marker.cx() + ',' + circ_marker.cy() + ' ' + point1.x + ',' + point1.y);
							linen.plot(circ_marker.cx() + ',' + circ_marker.cy() + ' ' + point2.x + ',' + point2.y);
						}
					})

					/*$('.graph').on('mousemove', function (e) {
						xx = (e.pageX - scalegroup.x()) / actualZoom,
							yy = (e.pageY - scalegroup.y()) / actualZoom
						//console.log('graph mousemove xx= ' + xx);

						var coord = snapping(xx, yy);

						circ_marker.move(coord.x - 5, coord.y - 5)
						if (Math.abs(xx - intx) > 10 || Math.abs(yy - inty) > 10 || movedFlag) {
							movedFlag = true
							oversegment.remove()
							linep.plot(circ_marker.cx() + ',' + circ_marker.cy() + ' ' + point1.x + ',' + point1.y);
							linen.plot(circ_marker.cx() + ',' + circ_marker.cy() + ' ' + point2.x + ',' + point2.y);
						}
					})*/

					svg.on('mouseup', function (e) {
						$(this).off('mousemove')
						dragging = false;
						edge_dragging = false;


						if (movedFlag/*Math.abs(xx-intx)>10 || Math.abs(yy-inty)>10*/) {
							//console.log('before arr=' + pathCoordArr.join());
							var currindex = oversegment.data('iter')
							//line to nex x & y
							pathCoordArr.splice(currindex + 1, 0, ['L', circ_marker.cx(), circ_marker.cy()])
							//console.log('iter=' + oversegment.data('iter') + ' arr=' + pathCoordArr.join());
							$(this).off('mouseup')

							//check for several abreast
							for (var i = 1; i < pathCoordArr.length - 1; i++) {
								if (pathCoordArr[i][1] == pathCoordArr[i - 1][1] && pathCoordArr[i][1] == pathCoordArr[i + 1][1]) {
									//console.log('bendpoint with x=' + pathCoordArr[i][1] + ' y=' + pathCoordArr[i][2] + ' should be deleted')
									pathCoordArr.splice(i, 1)
								} else if (pathCoordArr[i][2] == pathCoordArr[i - 1][2] && pathCoordArr[i][2] == pathCoordArr[i + 1][2]) {
									//console.log('bendpoint with x=' + pathCoordArr[i][1] + ' y=' + pathCoordArr[i][2] + ' should be deleted')
									pathCoordArr.splice(i, 1)
								}
							}



							element.data('path', pathCoordArr.join(';')).update()
						} else {
							if (debuggable) console.log('not moved')
							polyline.fire('realclick')
							polyline_backgrnd.show()
							$(this).off('mouseup')

						}
					})
					element.click(null)
				})
				.on('mousemove', function (e) {
					if (debuggable) console.log('polyline mousemove')
					var currX = (e.pageX - scalegroup.x()) / actualZoom,
						currY = (e.pageY - scalegroup.y()) / actualZoom

					//if (!nodeFrom.insideGbox(e.pageX, e.pageY) && !nodeTo.insideGbox(e.pageX, e.pageY)) {
					//console.log('this outside');
					connection.each(function (i, children) {

						var length = this.length(),
							point1 = this.pointAt(0),
							point2 = this.pointAt(length)
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
							length2 = path2.length()

						if ((length1 + length2) - this.length() < 10) {
							if (!dragging) oversegment = this
							//oversegment = this - возможно здесь причина проблем


							/*console.log('each attr-id=' + this.attr('id'))
							console.log('path x=' + this.x())
							console.log('path1arr=' + path1arr + 'path2arr=' + path2arr)*/
							var point = this.pointAt(length1)
							circ_marker.show().move(point.x - 5, point.y - 5)


						}
					}) //connection.each end
					//}

				})
				.on('mouseout', function (e) {
					if (debuggable) console.log('polyline mouseout')
					if (!dragging) circ_marker.hide()
					bendPoints.hide()
				})


			var pBbox = polyline.bbox();
			//console.log('pBbox ', pBbox)
			shapeOuter.size(pBbox.width + 20, pBbox.height + 20).move(pBbox.x - 10, pBbox.y - 10)
			menuBackgrnd.move(pBbox.x + pBbox.width + 11, pBbox.y + pBbox.height - 20)
			settings.move(pBbox.x2 + 15, pBbox.y2)
			del.move(pBbox.x2 + 15, pBbox.y2 + 25)

			connection/*.data('type','connection')*/.front()
			circ_marker.front()
			polyline.front()
			bendPoints.data('type', 'bendpoints').front()


			connection.mouseover(function (e) {
				if (debuggable) console.log('this.mouseover dragging=' + dragging)
				bendPoints.show()
				//if(!dragging) circ_marker.show()
			});

								/*this.mouseout(function(e) {
									//bendPoints.hide();
									//console.log('this.mouseout dragging='  +dragging)
									//if(!edge_dragging) circ_marker.hide();

								});*/

			/*del.click(function (e) {
				element.remove()
			});*/

			/*settings.click(function (e) {
				var xx = e.pageX// - $('.graph').offset().left;
				var yy = e.pageY// - $('.graph').offset().top;

				$('#line_dropdown').show()
				$('#line_dropdown').css({ 'position': 'absolute', 'left': xx, 'top': yy });
				$('#line_dropdown li a').click(function (e) {
					if (debuggable) console.log(e.target.text);
					if (debuggable) console.log(e.target.id);

					if (e.target.className != 'inactive') {
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
			});*/

			//bendPoints.first().remove()
			//bendPoints.last().remove()
			return this

		},
        /*update: function() {
					var t1 = new SVG.PathArray(this.data('path'))
					console.log('update '  + t1)
					var ttt = svg.path(t1).fill('none').stroke({ color: 'blue', width: 15, opacity: 1})

				},*/
		update: function (initially) {
			this.clear();
			var prop = {
				fromid: this.data('idfrom'),
				toid: this.data('idto'),
				innertext: this.data('innerText'),
				positionx: this.data('positionX'),
				positiony: this.data('positionY'),
				id: this.data('id'),
				path: this.data('path'),
				dashed: this.data('dashed'),
			}

			if (initially) prop.path = -1 //this.data('path', null)
			/*
			this.data({
			  isnode: 'false',
			  type: 'connection',
			  innerText: innerText.text(),
			  positionX: prop.positionx,
			  positionY: prop.positiony,
			  //id: connection.attr('id'),
			  //oraid: oraid,
			  idfrom: prop.fromid,
			  idto: prop.toid,
				parents: parent
			})
			*/

			return this.draw(prop);
		}/*,
				remove: function(prop.fromid, prop.toid) {
					console.log('remove')
					this.clear()
				}*/
	},
	construct: {
		bpmnline: function (prop) {
			return this.put(new SVG.Bpmnline).draw(prop)
		}
	}
});
