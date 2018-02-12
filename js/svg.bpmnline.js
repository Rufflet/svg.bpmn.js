var ttt1
function addBpmn() {
	ttt1 = svg.bpmnline('SvgjsSvg1014','SvgjsSvg1029');
	scalegroup.add(ttt1);
}


SVG.Bpmnline = SVG.invent({
		create: function() {
	    this.constructor.call(this, SVG.create('g'))
	  },
    inherit: SVG.Container,
    extend: {
				draw: function(fromid, toid) {
					console.log('NEW')
					var bendpointId //current dragging bendpoint



					this.data('node-from', fromid)
					this.data('node-to', toid)
					var _this = this;
					var node_from = SVG.get(fromid),
							node_to = SVG.get(toid),
							x_from = node_from.x(),
							y_from = node_from.y(),
							x_to = node_to.x(),
							y_to = node_to.y(),
							x2,
							y2,
							x3,
							y3,
							x4,
							y4;

					/*TODO: Логика построения линий*/
					//draggy snapping
					var snapping = function (x, y, elem) {
						console.log(bendpointId);
						var res = {};
						res.x = x - (x % snapRange);
						res.y = y - (y % snapRange);

						scalegroup.each(function(i, children) {
								if (Math.abs(this.x()-res.x)<10) res.x= this.x()
								if (Math.abs(this.y()-res.y)<10) res.y= this.y()
						})

						edge_markers.each(function(i, children) {
							if (bendpointId!=this.attr('id')) {
								if (Math.abs(this.x()-res.x)<10) res.x= this.x()
								if (Math.abs(this.y()-res.y)<10) res.y= this.y()
							}
						})

						return res;
					}

					x1 = x_from
					y1 = y_from

					x2 = x_from + (x_to - x_from)/2;
					y2 = y_from;

					x3 = x2
					y3 = y_to
					x4 = x3
					y4 = y3



					//new way add first pair of coords
					var pcoords = [],
							lcoords = [],
							patha = this.data('path')

					if (patha == null) {
						//console.log('patha is null - ' + patha)
						pcoords.push([ 'M', node_from.x(), node_from.y()]);
						pcoords.push([ 'L', x2, y2]);
						pcoords.push([ 'L', x3, y3]);
						pcoords.push([ 'L', node_to.x(), node_to.y()]);
					} else {
						patha.split(';').forEach(function(entry) {
							pcoords.push(entry.split(','));
						});
						//console.log('patha is NOT null ' + pcoords )
					}
					this.data('path', pcoords.join(';'))
					pcoords.forEach(function(entry) {
						lcoords.push([entry[1],entry[2]]);
					});

					var connection = this.group(),
							edge_markers = this.group().hide(),
							linep,
							linen;

					var path1 = this.path().fill('none').stroke({ color: 'red', width: 1, opacity: 1}),
							path2 = this.path().fill('none').stroke({ color: 'blue', width: 1, opacity: 1});
					var circ_marker = this.circle(10)
															.attr({ fill: 'red', stroke: "#000", "stroke-width": 2 })
															.hide()
															/*.draggy(snapping)
															.on('dragstart', function(e) {
																	$('.graph').off('mousedown')
																	oversegment.remove()
																	dragging = true;
																	edge_dragging = true;
																	console.log('dragstart');
																	var length = oversegment.length(),
																	point1 = oversegment.pointAt(0)
																	var point2 = oversegment.pointAt(length)
																	linep = _this.line(this.cx() + ',' + this.cy() + ' ' + point1.x + ',' + point1.y).stroke({ width: 1 });
																	linen = _this.line(this.cx() + ',' + this.cy() + ' ' + point2.x + ',' + point2.y).stroke({ width: 1 });
															})
															.on('dragmove', function(e) {
																	console.log('dragmove');
																	var length = oversegment.length()
																	var point1 = oversegment.pointAt(0)
																	var point2 = oversegment.pointAt(length)
																	linep.plot(this.cx() + ',' + this.cy() + ' ' + point1.x + ',' + point1.y);
																	linen.plot(this.cx() + ',' + this.cy() + ' ' + point2.x + ',' + point2.y);
															})
															.on('dragend', function(e) {
																	console.log('dragend');
																	dragging = false;
																	edge_dragging = false;
																	oversegment.animate(500).stroke({ width: 0, opacity: 0})

																	console.log('before arr=' + pcoords.join());

																	var currindex = oversegment.data('iter')
																	//line to nex x & y
																	pcoords.splice(currindex+1, 0, [ 'L', this.cx(), this.cy()])
																	//console.log('iter=' + oversegment.data('iter') + ' arr=' + pcoords.join());
																	_this.data('path', pcoords.join(';')).update()

															})*/



					var bendpoint = this.group().attr('cursor','pointer').hide()
					bendpoint.add(this.circle(20).attr({ fill: 'darkmagenta', opacity: 0.5 }).move(-10,-10))
					bendpoint.add(this.circle(10).attr({ fill: 'orange', stroke: "#000", "stroke-width": 1 }).move(-5,-5))



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
							//circ_marker.show()
						}
					}

					var overPath = function(e) {
						if(!dragging) {
							//console.log("overPath");
							console.log('mousemove');
							circ_marker.show()
							var xx = (e.pageX - scalegroup.x())/actualZoom,
									yy = (e.pageY - scalegroup.y())/actualZoom,
									length = this.length(),
									point1 = this.pointAt(0),
									point2 = this.pointAt(length)

							//console.log("point1X=" + point1.x + " point1Y=" + point1.y + " point2x=" + point2.x + " point2y=" + point2.y )
							isPointBetweenPoints(this.attr('id'),{x:xx, y:yy},point1,point2)
						}
					}


					var paths = []
					for (var i = 0; i < pcoords.length-1; i++) {
						//if (debuggable) console.log('pcoords[i]=' + pcoords[i] + ' pcoords[i+1]=' + pcoords[i+1]);

						var xfrom = pcoords[i][1],
								yfrom = pcoords[i][2],
								xto = pcoords[i+1][1],
								yto = pcoords[i+1][2]

						var pth = this.path([ ['M', xfrom, yfrom], ['L', xto, yto] ])

						if (i == 0) {
							var deltaX = xto - xfrom;
							var deltaY = yto - yfrom;
							var rad = Math.atan2(deltaY, deltaX); // In radians
							//var deg = rad * (180 / Math.PI)
							if (debuggable) console.log('deltaX=' + deltaX + ' deltaY=' + deltaY + ' rad=' + rad + ' deg=' + deg);
							xfrom = node_from.x() + (25 * Math.cos(rad))
							yfrom = node_from.y() + (25 * Math.sin(rad))

							lcoords[0][0] = xfrom
							lcoords[0][1] = yfrom

						} else if (i == pcoords.length-2) {
							pth.marker('end', marker)

							var deltaX = xfrom - xto;
							var deltaY = yfrom - yto;
							var rad = Math.atan2(deltaY, deltaX); // In radians
							//var deg = rad * (180 / Math.PI)
							if (debuggable) console.log('deltaX=' + deltaX + ' deltaY=' + deltaY + ' rad=' + rad + ' deg=' + deg);
							xto = node_to.x() + (25 * Math.cos(rad))
							yto = node_to.y() + (25 * Math.sin(rad))

							lcoords[lcoords.length-1][0] = xto
							lcoords[lcoords.length-1][1] = yto
						}

						//var pth = svg.path([['M',pcoords[i][1],pcoords[i][2]],['L',pcoords[i+1][1],pcoords[i+1][2]]])
						pth.plot([ ['M', xfrom, yfrom], ['L', xto, yto] ])
											  .fill('none')
												.stroke({ color: 'black', width: 1/*, opacity: 0.5*/})
												.data({
													iter: i,
													from: xfrom + ',' + yfrom,
													to: xto + ',' + yto
												})

						connection.add(pth)

						paths.push(pth.attr('id'))
						if (i > 1) paths.splice(0,1)

						edge_markers.add(bendpoint.clone()
												.data({
													iter: i,
													sidep: i == 0 ? 'none' : pcoords[i-1][1]+','+pcoords[i-1][2],
													siden: pcoords[i+1][1]+','+pcoords[i+1][2],
													paths: paths.join()
												})
												.move(pcoords[i][1],pcoords[i][2])
												.show()
												.draggy(snapping)
												//.on('mousemove', function(e) { circ_marker.hide(); })
												.on('mouseover', function(e) {
													console.log('bendpoint mouseover')
													edge_markers.show()
												})
												.on('dragstart', function(e) {
													console.log('dragstart ' + e.detail.event )
													bendpointId=this.attr('id')
													 $('.graph').off('mousedown')
													 //hide paths
													 this.data('paths').split(',').forEach(function(entry) {
														 SVG.get(entry).remove()
													 });
													 //console.log('dragstart ' + event.detail.event.x + ' ' + event.detail.event.y + ' ' + this.data('siden'));
													 if (this.data('sidep') == 'none') {
														 	linen = _this.line(event.detail.event.x + ',' + event.detail.event.y + ' ' + this.data('siden')).stroke({ width: 1 });
													 }
													 else {
														 linep = _this.line(event.detail.event.x + ',' + event.detail.event.y + ' ' + this.data('sidep')).stroke({ width: 1 }).back()
														 linen = _this.line(event.detail.event.x + ',' + event.detail.event.y + ' ' + this.data('siden')).stroke({ width: 1 }).back()
													 }
												 })
												 .on('dragmove', function(e) {
													 var xx = (e.detail.event.pageX - scalegroup.x())/actualZoom,
										 				yy = (e.detail.event.pageY - scalegroup.y())/actualZoom

													 if (this.data('sidep') == 'none') {
														 	//linen.plot(event.detail.event.x + ',' + event.detail.event.y + ' ' + this.data('siden'));
															linen.plot(xx + ',' + yy + ' ' + this.data('siden'));
													 }
													 else {
														 /*linep.plot(event.detail.event.x + ',' + event.detail.event.y + ' ' + this.data('sidep'));
														 linen.plot(event.detail.event.x + ',' + event.detail.event.y + ' ' + this.data('siden'));*/
														 //linep.plot(xx + ',' + yy + ' ' + this.data('sidep'));
														 //linen.plot(xx + ',' + yy + ' ' + this.data('siden'));

														 linep.plot(this.x() + ',' + this.y() + ' ' + this.data('sidep'));
														 linen.plot(this.x() + ',' + this.y() + ' ' + this.data('siden'));
													 }
				 								 })
												 .on('dragend', function(e) {
														if (linep) linep.remove();
														linen.remove();
														var t = this.ctm().extract()

														//console.log('dragend for i=' + this.data('iter') + ' x=' + t.x + ' y=' + t.y)
														pcoords[this.data('iter')][1] = t.x  * t.scaleX
														pcoords[this.data('iter')][2] = t.y  * t.scaleY

														var iter = this.data('iter')
														edge_markers.each(function(i, children) {
															if (this.data('iter') == iter+1) {
																//console.log('edge_marker with i=' + this.data('iter') + ' is next node')
																this.data('sidep', t.x + ',' + t.y)
															}
															if (this.data('iter') == iter-1) {
																//console.log('edge_marker with i=' + this.data('iter') + ' is prev node')
																this.data('siden', t.x + ',' + t.y)
															}
														})
														/*pcoords.forEach(function(entry) {
															console.log('entry ' + entry )
														});*/
														circ_marker.hide()

														//check for several abreast
														for (var i = 1; i < pcoords.length-1; i++) {
															if (pcoords[i][1] == pcoords[i-1][1] && pcoords[i][1] == pcoords[i+1][1]) {
																//console.log('bendpoint with x=' + pcoords[i][1] + ' y=' + pcoords[i][2] + ' should be deleted')
																pcoords.splice(i, 1)
															}	else if (pcoords[i][2] == pcoords[i-1][2] && pcoords[i][2] == pcoords[i+1][2]) {
																//console.log('bendpoint with x=' + pcoords[i][1] + ' y=' + pcoords[i][2] + ' should be deleted')
																pcoords.splice(i, 1)
															}
														}
														_this.data('path', pcoords.join(';')).update()
				 								 })
												 .click(function(e) {
 													console.log('dblclick ')
 													 this.remove();


 													 pcoords[this.data('iter')][1] = t.x  * t.scaleX
 													 pcoords[this.data('iter')][2] = t.y  * t.scaleY

 													 var iter = this.data('iter')
 													 edge_markers.each(function(i, children) {
 														 if (this.data('iter') == iter+1) {
 															 //console.log('edge_marker with i=' + this.data('iter') + ' is next node')
 															 this.data('sidep', t.x + ',' + t.y)
 														 }
 														 if (this.data('iter') == iter-1) {
 															 //console.log('edge_marker with i=' + this.data('iter') + ' is prev node')
 															 this.data('siden', t.x + ',' + t.y)
 														 }
 													 })
 													 /*pcoords.forEach(function(entry) {
 														 console.log('entry ' + entry )
 													 });*/
 													 circ_marker.hide()
 													 _this.data('path', pcoords.join(';')).update()

 												})
											 )

						 if (i == (pcoords.length-2)) {
							 edge_markers.add(bendpoint.clone()
													 .data({
														iter: i+1,
														sidep: pcoords[i][1]+','+pcoords[i][2],
														siden: 'none',
														paths: paths.splice(-1,1).join()
													})
					 								.move(pcoords[i+1][1],pcoords[i+1][2])
					 								.show()
					 								.draggy(snapping)
					 								.on('mousemove', function(e) { circ_marker.hide(); })
													.on('dragstart', function(e) {
														 $('.graph').off('mousedown')
														 //hide paths
														 this.data('paths').split(',').forEach(function(entry) {
															 SVG.get(entry).remove()
														 });
														 //console.log('dragstart ' + event.detail.event.x + ' ' + event.detail.event.y + ' ' + this.data('siden'));
												 		 linep = _this.line(event.detail.event.x + ',' + event.detail.event.y + ' ' + this.data('sidep')).stroke({ width: 1 });
													 })
													 .on('dragmove', function(e) {
														 linep.plot(event.detail.event.x + ',' + event.detail.event.y + ' ' + this.data('sidep'));
					 								 })
													 .on('dragend', function(e) {
															linep.remove();

															var t = this.ctm().extract()

															//console.log('dragend for i=' + this.data('iter') + ' x=' + t.x + ' y=' + t.y)
															pcoords[this.data('iter')][1] = t.x
															pcoords[this.data('iter')][2] = t.y

															var iter = this.data('iter')
															edge_markers.each(function(i, children) {
																/*if (this.data('iter') == iter+1) {
																	//console.log('edge_marker with i=' + this.data('iter') + ' is next node')
																	this.data('sidep', t.x + ',' + t.y)
																}*/
																if (this.data('iter') == iter-1) {
																	//console.log('edge_marker with i=' + this.data('iter') + ' is prev node')
																	this.data('siden', t.x + ',' + t.y)
																}
															})
															_this.data('path', pcoords.join(';')).update()
															//_this.data('path', pcoords)
															//_this.update()
					 								 })
												 )
							 /*edge_markers.add(circ_marker.clone()
					 							 .attr({ fill: 'purple', stroke: "#000", "stroke-width": 2 })
					 							 .move(pcoords[i+1][1]-5,pcoords[i+1][2]-5)
												 .show()
												 .draggy(snapping)
												 .on('dragstart', function(e) {
												 		$('.graph').off('mousedown')
												 		console.log('dragstart');
												 	})
												 //.on('click', function() {  console.log('click' + this.attr('id')) })
											 )*/
						 }
					}

					var polyline = this.polyline(lcoords)
							.fill('none')
							.stroke({ color: 'green', width: 20, opacity: 0.2})
							.on('mouseover', function(e) {
								console.log('polyline mouseover')
								circ_marker.show()
								edge_markers.show()
							})
							.on('realclick', function(e) {
								console.log('polyline click');
								console.log('polyline realclick');
							})
							.on('mouseup', function(e) {
								console.log('polyline mouseup');
							})
							.on('mousedown', function(e) {
								console.log('polyline mousedown');

								var movedFlag = false

								var xx = (e.pageX - scalegroup.x())/actualZoom-5,
										yy = (e.pageY - scalegroup.y())/actualZoom-5,
										intx = xx,
										inty = yy

								$('.graph').off('mousedown')

								dragging = true;
								edge_dragging = true;

								//circ_marker.move(xx,yy)

								var length = oversegment.length(),
										point1 = oversegment.pointAt(0),
										point2 = oversegment.pointAt(length)
								//linep = _this.line(circ_marker.cx() + ',' + circ_marker.cy() + ' ' + point1.x + ',' + point1.y).stroke({ width: 1 })
								//linen = _this.line(circ_marker.cx() + ',' + circ_marker.cy() + ' ' + point2.x + ',' + point2.y).stroke({ width: 1 })
								linep = _this.line(point1.x + ',' + point1.y + ' ' + point1.x + ',' + point1.y).stroke({ width: 1 })
								linen = _this.line(point2.x + ',' + point2.y + ' ' + point2.x + ',' + point2.y).stroke({ width: 1 })

								//circ_marker.show()
								bendpointId = circ_marker.attr('id')

								$('.graph').on('mousemove', function(e) {
									xx = (e.pageX - scalegroup.x())/actualZoom-5,
									yy = (e.pageY - scalegroup.y())/actualZoom-5
									//console.log('graph mousemove xx= ' + xx);

									var coord = snapping(xx, yy);

									circ_marker.move(coord.x-5,coord.y-5)
									if (Math.abs(xx-intx)>10 || Math.abs(yy-inty)>10 || movedFlag) {
										movedFlag = true
										oversegment.remove()
										linep.plot(circ_marker.cx() + ',' + circ_marker.cy() + ' ' + point1.x + ',' + point1.y);
										linen.plot(circ_marker.cx() + ',' + circ_marker.cy() + ' ' + point2.x + ',' + point2.y);
									}
								})

								$('.graph').on('mouseup', function(e) {
									$( this ).off('mousemove')
									dragging = false;
									edge_dragging = false;


									if (movedFlag/*Math.abs(xx-intx)>10 || Math.abs(yy-inty)>10*/) {
										//console.log('before arr=' + pcoords.join());
										var currindex = oversegment.data('iter')
										//line to nex x & y
										pcoords.splice(currindex+1, 0, [ 'L', circ_marker.cx(), circ_marker.cy()])
										//console.log('iter=' + oversegment.data('iter') + ' arr=' + pcoords.join());
										$( this ).off('mouseup')

										//check for several abreast
										for (var i = 1; i < pcoords.length-1; i++) {
											if (pcoords[i][1] == pcoords[i-1][1] && pcoords[i][1] == pcoords[i+1][1]) {
												//console.log('bendpoint with x=' + pcoords[i][1] + ' y=' + pcoords[i][2] + ' should be deleted')
												pcoords.splice(i, 1)
											}	else if (pcoords[i][2] == pcoords[i-1][2] && pcoords[i][2] == pcoords[i+1][2]) {
												//console.log('bendpoint with x=' + pcoords[i][1] + ' y=' + pcoords[i][2] + ' should be deleted')
												pcoords.splice(i, 1)
											}
										}



										_this.data('path', pcoords.join(';')).update()
									} else {
										console.log('ELSE')
										polyline.fire('realclick')
										$( this ).off('mouseup')

									}
								})
								_this.click(null)
							})
							.on('mousemove', function(e) {
								console.log('polyline mousemove')
								var currX = (e.pageX - scalegroup.x())/actualZoom,
										currY = (e.pageY - scalegroup.y())/actualZoom

								connection.each(function(i, children) {

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

									if ((length1 + length2) - this.length()<10) {
										oversegment = this
										/*console.log('each attr-id=' + this.attr('id'))
										console.log('path x=' + this.x())
										console.log('path1arr=' + path1arr + 'path2arr=' + path2arr)*/
										var point = this.pointAt(length1)
										circ_marker.show().move(point.x-5, point.y-5)


									}
								})
							 })
							 .on('mouseout', function(e) {
								 console.log('polyline mouseout')
								 if (!dragging) circ_marker.hide()
							 	 edge_markers.hide()
							 })

					 //For highlighting
 					var rect_outer = this.rect(1, 1).move(polyline.cx(), polyline.cy()).hide(),
 							settings = this.plain('\ue802').attr({id: polyline.attr('id')+'_settings'}).font({family: 'fontello', size: 20}),
 							del = this.plain('\ue800').attr({id: polyline.attr('id')+'_del'}).font({family: 'fontello', size: 20})

 					settings.attr({width: 20, height: 20, cursor: 'pointer'}).move(polyline.cx(),polyline.cy()-15).hide();
 					del.attr({width: 20, height: 20, 'cursor':'pointer'}).move(polyline.cx(),polyline.cy()).hide();


					connection.data('type','connection').front()
					circ_marker.front()
					polyline.front()
					edge_markers.data('type','bendpoints').front()



				/*	this.click(function(e) {
						//if (debuggable)
						console.log("bpmnline click")
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

							if (_this.inside(xx, yy)) {
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
					});*/

					connection.mouseover(function(e) {
						console.log('this.mouseover dragging='  +dragging)
						edge_markers.show()
						//if(!dragging) circ_marker.show()
					});

					/*this.mouseout(function(e) {
						//edge_markers.hide();
						//console.log('this.mouseout dragging='  +dragging)
						//if(!edge_dragging) circ_marker.hide();

					});*/
					return this

				},
        /*update: function() {
					var t1 = new SVG.PathArray(this.data('path'))
					console.log('update '  + t1)
					var ttt = svg.path(t1).fill('none').stroke({ color: 'blue', width: 15, opacity: 1})

				},*/
				update: function (initially) {
            this.clear();
						if (initially) this.data('path', null)
						return this.draw(	this.data('node-from'),this.data('node-to'));
        }/*,
				remove: function(fromid, toid) {
					console.log('remove')
					this.clear()
				}*/
    },
    construct: {
        bpmnline: function(fromid, toid) {
						return this.put(new SVG.Bpmnline).draw(fromid, toid)
		    }
    }
});
