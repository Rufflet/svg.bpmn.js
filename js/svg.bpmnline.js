/*
TODO:
- change circles -5px offset to variable
- разобраться с флагом dragging и edge_dragging
- изначально рисиовать максимально простые линии
	- если на одной прямой
	- убирать лишний бендпоинт при первой отрисовке


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
		create: function() {
	    this.constructor.call(this, SVG.create('g'))
	  },
    inherit: SVG.Container,
    extend: {
				draw: function( prop ) {
					/*
				    * SVG.Bpmnline
				    * Draw line between BPMN-nodes.
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

					if (debuggable) console.log('NEW')

					var _this = this,

					//фон для меню
		  		menu_backgrnd = this.rect(25,55)
															.attr({ fill: '#ececec', opacity: 0.7 })
															.hide(),

				 	//For highlighting
					rect_outer = this.rect(1, 1)
													 .attr({ 'fill-opacity': 0, stroke: "#d9534f", "stroke-width": 1, "stroke-dasharray": 4, "stroke-opacity"  : 0.5 })
													 .hide(),

					settings = this.plain('\ue802')
												 .attr({cursor: 'pointer'})
												 .font({family: 'fontello', size: 20})
												 .hide(),

					del = this.plain('\ue800')
									  .attr({cursor: 'pointer'})
									 	.font({family: 'fontello', size: 20})
									 	.hide(),

					inner_text = this.text('')
	 												 .style('cursor:default;')
													 .addClass('noselect'),

				  connection_text = this.group().add(inner_text);

				if (prop.innertext!='') {
					connection_text.move(prop.positionx, prop.positiony).show();

			    inner_text.text(function(add) {
			      $.each(prop.innertext.split('\n'), function(k, val){
			        add.tspan(val).newLine()
			      });
			    })
			    var linesset = inner_text.lines()
			    linesset.each(function(i, children) {
			      this.dx(-this.length()/2+25)
			    })
  			} else {
					connection_text.hide();
				}

				if (editable) {
					inner_text.style('cursor:pointer;')
					connection_text.draggy();

					connection_text.on('dragstart', function(e) {
						rect_outer.hide();
						$('.graph').off('mousedown')
					})

					connection_text.on('dragend', function() {
						//if (debuggable) console.log('connection_text dragend x=' + connection_text.x() + ' y=' + connection_text.y());
						_this.data('positionX', connection_text.x());
						_this.data('positionY', connection_text.y());

						$('.graph').on('mousedown', function(e) {
							$( this ).css('cursor', 'move')
							paning(e);
						})
					})
			  }
					var bendpointId //current dragging bendpoint

					var prevx
					var prevy
					var nextx
					var nexty

					var parent = -1,
							node_from = SVG.get(prop.fromid),
							node_to = SVG.get(prop.toid),
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

					if (node_from.data('parent')!=-1) {
					 parent = node_from.data('parent');
					}
					if (node_to.data('parent')!=-1 && node_to.data('parent')!=parent) {
					 parent += ',' + node_to.data('parent');
					}
					if (debuggable) console.log('parents for line is ' + parent);

					/*TODO: Логика построения линий*/
					//draggy snapping
					var snapping = function (x, y, elem) {
						if (debuggable) console.log(bendpointId);
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



					this.data({
					  isnode: 'false',
					  type: 'connection',
					  inner_text: inner_text.text(),
					  positionX: prop.positionx,
					  positionY: prop.positiony,
					  //id: connection.attr('id'),
					  //oraid: oraid,
					  idfrom: prop.fromid,
					  idto: prop.toid,
						path: prop.path,
						parents: parent
					})


					//new way add first pair of coords
					var pcoords = [],
							lcoords = [],
							patha = this.data('path')

					if (patha == '-1') {
						if (debuggable) console.log('patha is null - ' + patha)
						pcoords.push([ 'M', node_from.x(), node_from.y()]);
						pcoords.push([ 'L', x2, y2]);
						pcoords.push([ 'L', x3, y3]);
						pcoords.push([ 'L', node_to.x(), node_to.y()]);
					} else {
						patha.split(';').forEach(function(entry) {
							pcoords.push(entry.split(','));
						});
						if (debuggable) console.log('patha is NOT null ' + pcoords )
					}
					this.data('path', pcoords.join(';'))
					pcoords.forEach(function(entry) {
						lcoords.push([entry[1],entry[2]]);
					});

					var connection = this.group(),
							edge_markers = this.group().hide(),
							linep,
							linen;

					var path1 = this.path().fill('none').stroke({ color: 'red', width: 1, opacity: 0}),
							path2 = this.path().fill('none').stroke({ color: 'blue', width: 1, opacity: 0});
					var circ_marker = this.circle(10)
															.attr({ fill: 'red', stroke: "#000", "stroke-width": 2 })
															.hide()

					var bendpoint = this.group().attr('cursor','pointer').hide()
							bendpoint.add(this.circle(20).attr({ fill: 'darkmagenta', opacity: 0.5 }).move(-10,-10))
							bendpoint.add(this.circle(10).attr({ fill: 'orange', stroke: "#000", "stroke-width": 1 }).move(-5,-5))

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
							var deg = rad * (180 / Math.PI)

							if (node_from.data('type')=='circle') {
								xfrom = node_from.x() + (25 * Math.cos(rad))
								yfrom = node_from.y() + (25 * Math.sin(rad))
							}
							else if (node_from.data('type')=='task') {
								var deg = rad * (180 / Math.PI) * (-1)
								var testobj = {width:100, height:80};
								var testcoords = edgeOfView(testobj, deg)
								xfrom = node_from.x() + testcoords.x - 50
								yfrom = node_from.y() + testcoords.y - 40
							}
							else if (node_from.data('type')=='decision') {
								var deg = rad * (180 / Math.PI) * (-1)
								if (deg <= 135 && deg >= 45) {
									xfrom = node_from.x()
									yfrom = node_from.y() - 35
								} else if (deg >= -135 && deg <= -45)  {
									xfrom = node_from.x()
									yfrom = node_from.y() + 35
								} else if (deg < 45 && deg > -45)  {
									xfrom = node_from.x() + 35
									yfrom = node_from.y()
								} else {
									xfrom = node_from.x() - 35
									yfrom = node_from.y()
								}
							}

							lcoords[0][0] = xfrom
							lcoords[0][1] = yfrom

						} else if (i == pcoords.length-2) {
							pth.marker('end', marker)

							var deltaX = xfrom - xto;
							var deltaY = yfrom - yto;
							var rad = Math.atan2(deltaY, deltaX); // In radians

							//if (debuggable) console.log('deltaX=' + deltaX + ' deltaY=' + deltaY + ' rad=' + rad + ' deg=' + deg);

							if (node_to.data('type')=='circle') {
								xto = node_to.x() + (25 * Math.cos(rad))
								yto = node_to.y() + (25 * Math.sin(rad))
							}
							else if (node_to.data('type')=='task') {
								var deg = rad * (180 / Math.PI) * (-1)
								var testobj = {width:100, height:80};
								var testcoords = edgeOfView(testobj, deg)
								xto = node_to.x() + testcoords.x - 50
								yto = node_to.y() + testcoords.y - 40
							}
							else if (node_to.data('type')=='decision') {
								var deg = rad * (180 / Math.PI) * (-1)
								if (deg <= 135 && deg >= 45) {
									xto = node_to.x()
									yto = node_to.y() - 35
								} else if (deg >= -135 && deg <= -45)  {
									xto = node_to.x()
									yto = node_to.y() + 35
								} else if (deg < 45 && deg > -45)  {
									xto = node_to.x() + 35
									yto = node_to.y()
								} else {
									xto = node_to.x() - 35
									yto = node_to.y()
								}
							}

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
													if (debuggable) console.log('bendpoint mouseover')
													edge_markers.show()
												})
												.on('dragstart', function(e) {
													if (debuggable) console.log('dragstart ' + e.detail.event )
													bendpointId=this.attr('id')
													 $('.graph').off('mousedown')
													 //hide paths
													 this.data('paths').split(',').forEach(function(entry) {
														 SVG.get(entry).remove()
													 });
													 //console.log('dragstart ' + event.detail.event.x + ' ' + event.detail.event.y + ' ' + this.data('siden'));
													 polyline_backgrnd.hide()

													 var thistransf = this.transform(),
															 scgtransf = scalegroup.transform()
													 //var xx = (e.detail.event.pageX - scalegroup.x())/actualZoom
													 //var yy = (e.detail.event.pageY - scalegroup.y())/actualZoom
													 var xx = thistransf.x * scgtransf.scaleX + scgtransf.x
													 var yy = thistransf.y * scgtransf.scaleY + scgtransf.y

													 var sidep = this.data('sidep').split(',')
													 var siden = this.data('siden').split(',')

													 prevx = sidep[0] * scgtransf.scaleX + scgtransf.x
													 prevy = sidep[1] * scgtransf.scaleY + scgtransf.y

													 nextx = siden[0] * scgtransf.scaleX + scgtransf.x
													 nexty = siden[1] * scgtransf.scaleY + scgtransf.y

													 if (this.data('sidep') == 'none') {
														 	linen = svg.line(xx + ',' + yy + ' ' + nextx + ',' + nexty).stroke({ width: 1 })//.back()
													 }
													 else {
														 linep = svg.line(xx + ',' + yy + ' ' + prevx + ',' + prevy).stroke({ width: 1 })//.back()
														 linen = svg.line(xx + ',' + yy + ' ' + nextx + ',' + nexty).stroke({ width: 1 })//.back()
													 }
												 })
												 .on('dragmove', function(e) {
													 var thistransf = this.transform(),
															 scgtransf = scalegroup.transform()
													 //var xx = (e.detail.event.pageX - scalegroup.x())/actualZoom
													 //var yy = (e.detail.event.pageY - scalegroup.y())/actualZoom
													 var xx = thistransf.x * scgtransf.scaleX + scgtransf.x
													 var yy = thistransf.y * scgtransf.scaleY + scgtransf.y

													 if (this.data('sidep') == 'none') {
														 	linen.plot(xx + ',' + yy + ' ' + nextx + ',' + nexty)
													 }
													 else {
														 linep.plot(xx + ',' + yy + ' ' + prevx + ',' + prevy)
														 linen.plot(xx + ',' + yy + ' ' + nextx + ',' + nexty)
													 }
				 								 })
												 .on('dragend', function(e) {
														$('.graph').on('mousedown', function(e) {
															$( this ).css('cursor', 'move')
															paning(e);
														})


														if (linep) linep.remove();
														linen.remove();
														var t = this.ctm().extract()

														//console.log('dragend for i=' + this.data('iter') + ' x=' + t.x + ' y=' + t.y)
														//(bbox.x + thistransf.x) * scgtransf.scaleX + scgtransf.x
														var thistransf = this.transform(),
																scgtransf = scalegroup.transform()
														//var xx = (e.detail.event.pageX - scalegroup.x())/actualZoom
 										 				//var yy = (e.detail.event.pageY - scalegroup.y())/actualZoom
														var xx = thistransf.x * scgtransf.scaleX + scgtransf.x
 										 				var yy = thistransf.y * scgtransf.scaleY + scgtransf.y

														this.hide();
														/*var circle = svg.circle(10).attr({ fill: 'red' }).move(xx-2.5, yy-2.5)
												    circle.animate(2500).attr({ opacity: 0})*/

													 if (this.data('sidep') == 'none') {
 														 linen.plot(xx + ',' + yy + ' ' + nextx + ',' + nexty)
 													 }
 													 else {
														 linep.plot(xx + ',' + yy + ' ' + prevx + ',' + prevy)
														 linen.plot(xx + ',' + yy + ' ' + nextx + ',' + nexty)
 													 }

													pcoords[this.data('iter')][1] = thistransf.x
													pcoords[this.data('iter')][2] = thistransf.y

													var iter = this.data('iter')
													edge_markers.each(function(i, children) {
														if (this.data('iter') == iter+1) {
															//console.log('edge_marker with i=' + this.data('iter') + ' is next node')
															this.data('sidep', thistransf.x + ',' + thistransf.y)
														}
														if (this.data('iter') == iter-1) {
															//console.log('edge_marker with i=' + this.data('iter') + ' is prev node')
															this.data('siden', thistransf.x + ',' + thistransf.y)
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
													linep.remove()
													linen.remove()
													_this.data('path', pcoords.join(';')).update()


				 								 })
												 /*.click(function(e) {
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

 													 circ_marker.hide()
 													 _this.data('path', pcoords.join(';')).update()

 												})*/
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
					var polyline_backgrnd = this.polyline(lcoords)
																			.fill('none')
																			.stroke({ color: 'white', width: 6 })

					var polyline = this.polyline(lcoords)
							.fill('none')
							.stroke({ color: 'green', width: 20, opacity: 0})
							.on('mouseover', function(e) {
								//console.log('polyline mouseover')
								circ_marker.show()
								edge_markers.show()
							})
							.on('dblclick', function(e) {
								if (debuggable) console.log('polyline dblclick');

								menu_backgrnd.hide()
								rect_outer.hide()
								settings.hide()
								del.hide()
								document.removeEventListener('mousedown', arguments.callee);

								var xx = polyline.cx()*actualZoom - $('#input_textarea').width()/2 + scalegroup.x();
								var yy = polyline.cy()*actualZoom + scalegroup.y();

								$('#input_textarea').val(inner_text.text())
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
											$('#input_textarea').hide()

											if ($('#input_textarea').val()!='') {
												inner_text.style('cursor:pointer;')
												connection_text.show();
												connection_text.move(polyline.cx() + $('.graph').offset().left - $('#input_textarea').width()/2, polyline.cy() + $('.graph').offset().top);
												_this.data('positionX', connection_text.x());
												_this.data('positionY', connection_text.y());

												prop.innertext = $('#input_textarea').val();
										    inner_text.text(function(add) {
										      $.each(prop.innertext.split('\n'), function(k, val){
										        add.tspan(val).newLine()
										      });
										    })
										    var linesset = inner_text.lines()
										    linesset.each(function(i, children) {
										      this.dx(-this.length()/2+25)
										    })

												_this.data('inner_text', inner_text.text())
											} else {
												inner_text.style('cursor:default;')
				                inner_text.clear();
												connection_text.hide();
											}
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
							})
							.on('realclick', function(e) {
								if (debuggable) console.log('polyline realclick');
								var xx = (e.pageX - scalegroup.x())/actualZoom;
								var yy = (e.pageY - scalegroup.y())/actualZoom;
								//
								// if (circ_marker.inside(xx, yy)) {
								// 	console.log("inside");
								// }
								//
								_this.front()

								// circ_marker_start.show()
								// circ_marker_end.show()


								menu_backgrnd.show()
								rect_outer.show()
								settings.show()
								del.show()

								document.addEventListener('mousedown', function(e){
									var xx = (e.pageX - scalegroup.x())/actualZoom;
									var yy = (e.pageY - scalegroup.y())/actualZoom;

									if (_this.inside(xx, yy)) {
										//if (debuggable)
										if (debuggable) console.log("inside");
									} else {
											if (debuggable) console.log(e.target.nodeName);
											//if (debuggable)
											console.log("outside");
											menu_backgrnd.hide()
											rect_outer.hide()
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
							.on('mouseup', function(e) {
								if (debuggable) console.log('polyline mouseup');
							})
							.on('mousedown', function(e) {
								if (debuggable) console.log('polyline mousedown');

								var movedFlag = false

								var xx = (e.pageX - scalegroup.x())/actualZoom-5,
										yy = (e.pageY - scalegroup.y())/actualZoom-5,
										intx = xx,
										inty = yy

								$('.graph').off('mousedown')

								dragging = true;
								edge_dragging = true;

								//circ_marker.move(xx,yy)
								polyline_backgrnd.hide()

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
									xx = (e.pageX - scalegroup.x())/actualZoom,
									yy = (e.pageY - scalegroup.y())/actualZoom
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
										if (debuggable) console.log('not moved')
										polyline.fire('realclick')
										polyline_backgrnd.show()
										$( this ).off('mouseup')

									}
								})
								_this.click(null)
							})
							.on('mousemove', function(e) {
								if (debuggable) console.log('polyline mousemove')
								var currX = (e.pageX - scalegroup.x())/actualZoom,
										currY = (e.pageY - scalegroup.y())/actualZoom

								//if (!node_from.insideGbox(e.pageX, e.pageY) && !node_to.insideGbox(e.pageX, e.pageY)) {
  							 //console.log('this outside');
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
										if (!dragging) oversegment = this
										//oversegment = this - возможно здесь причина проблем


										/*console.log('each attr-id=' + this.attr('id'))
										console.log('path x=' + this.x())
										console.log('path1arr=' + path1arr + 'path2arr=' + path2arr)*/
										var point = this.pointAt(length1)
										circ_marker.show().move(point.x-5, point.y-5)


									}
								}) //connection.each end
							 //}

							 })
							 .on('mouseout', function(e) {
								 if (debuggable) console.log('polyline mouseout')
								 if (!dragging) circ_marker.hide()
							 	 edge_markers.hide()
							 })


					var pBbox = polyline.bbox();
 					//console.log('pBbox ', pBbox)
 					rect_outer.size(pBbox.width+20, pBbox.height+20).move(pBbox.x-10, pBbox.y-10)
 					menu_backgrnd.move(pBbox.x + pBbox.width+11, pBbox.y + pBbox.height-20)
 					settings.move(pBbox.x2 + 15, pBbox.y2)
 					del.move(pBbox.x2 + 15, pBbox.y2 + 25)

					connection/*.data('type','connection')*/.front()
					circ_marker.front()
					polyline.front()
					edge_markers.data('type','bendpoints').front()


					connection.mouseover(function(e) {
						if (debuggable) console.log('this.mouseover dragging='  +dragging)
						edge_markers.show()
						//if(!dragging) circ_marker.show()
					});

					/*this.mouseout(function(e) {
						//edge_markers.hide();
						//console.log('this.mouseout dragging='  +dragging)
						//if(!edge_dragging) circ_marker.hide();

					});*/

					del.click(function(e) {
						_this.remove()
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

					edge_markers.first().remove()
					edge_markers.last().remove()
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
							innertext: this.data('inner_text'),
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
						  inner_text: inner_text.text(),
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
        bpmnline: function( prop ) {
						return this.put(new SVG.Bpmnline).draw( prop )
		    }
    }
});
