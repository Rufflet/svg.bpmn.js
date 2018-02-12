/*
svg 223 version
remastered
*/
function new_window(P_URL){
 var p_height=screen.availHeight-50;
 var p_width=screen.availWidth-25;
 w=window.open(P_URL,"","toolbar=no,location=no,menubar=no,scrollbars,top=15,screenX=15,screenY=15,left=15,height="+p_height+",width="+p_width+",resizable");
 if(w.opener==null)w.opener=self;
 w.focus();
}

var editable = true; //flag режима редактирования
var adminable = true; //flag режима администрирования
var is_preview = false; //flag режима предпросмотра
var debuggable = false; //debug flag
var scalable = true; //flag возможности масштабирования
var focused_node;
var passed_node;
var steps = []; // шаги для отмены
var snapRange = 1; //шаг сетки

var customclick; //flag кастомного события при клике на объект


//offset
x_offset = 0;
y_offset = 0;

var svg = SVG($(".graph").get(0)).size("100%", "100%").spof();
//var links = svg.group();
var markers = svg.group();

var scalegroup = svg.group().attr('id', 'scalegroup').size("100%", "100%");

//var connections = [];
var lines = [];

var marker = svg.marker(10, 10, function(add) {
  add.path().attr({
    d: "M 0 0 L 10 5 L 0 10 z"
  })
})
marker.attr({ refX: 10 });

function exportGraph() {

	var canvas = $(".graph").get(0);
	var img    = svg.toDataURL("image/png");
	document.write('<img src="'+img+'"/>');
}

//in out points .rect(110, 90).attr({ fill: '#f5f5f5', stroke: "#cd4436", "stroke-width": 4, "stroke-opacity"  : 0.7 })
var marker_top = svg.rect(20,10).attr({ fill: 'green', stroke: "#000", "stroke-width": 1 }).move(0, 0).hide(),
	marker_bottom = svg.rect(20,10).attr({ fill: 'green', stroke: "#000", "stroke-width": 1 }).move(0, 0).hide()

scalegroup.add(marker_top)
scalegroup.add(marker_bottom)

SVG.extend(SVG.Nested,SVG.Shape, {
  insideTbox: function(x, y) {
    var tbox = this.tbox()

    return x > tbox.x
        && y > tbox.y
        && x < tbox.x + tbox.width
        && y < tbox.y + tbox.height
  }
})

function addCircle(subtype, innertype, innertext, id, oraid, xcoor, ycoor, parent) {
  /*
    * addCircle
    * Draw Circle.
    * @name addCircle
    * @function
    * @param {Object} options An object containing any of the following fields:
    *
    *  - `container` (SVGElement): The connector elements container. Defaults to source parent.
    *  - `markers` (SVGElement): The marker elements container. Defaults to source parent.
    *  - `sourceAttach` (String): Connector attachment for source element: 'center' / 'perifery'. Defaults to 'center'
    *  - `targetAttach` (String): Connector attachment for target element: 'center' / 'perifery'. Defaults to 'center'
    *  - `type` (String): Connector type: 'straight' or 'curved'. Defaults to 'straight'
    *  - `marker` (String): Can be: an SVGElement / 'null' / 'default'. Defaults to 'null'
    *  - `color` (String): Connector color. Defaults to '#000000'.
    * @return {Object} An object containing the `x1`, `x2`, `y1` and `y2` coordinates.
  */


	//set defaults if necessary
	innertype = typeof innertype !== 'undefined' ? innertype : '';
	innertext = typeof innertext !== 'undefined' ? innertext : '';
	xcoor = typeof xcoor !== 'undefined' ? xcoor : (100-scalegroup.x())/actualZoom;
	ycoor = typeof ycoor !== 'undefined' ? ycoor : (50-scalegroup.y())/actualZoom;
	id = typeof id !== 'undefined' ? id : -1;
	oraid = typeof oraid !== 'undefined' ? oraid : -1;
	parent = typeof parent !== 'undefined' ? parent : -1;

  var circle = svg.nested()

  //store all bpmnlines
  var connections = [];

	var circ_focus = circle.circle(60).attr({ fill: '#f5f5f5', stroke: "#cd4436", "stroke-width": 4, "stroke-opacity"  : 0.7 }).move(-30,-30).hide();
	var circ_outer = circle.circle(60).attr({ fill: '#f5f5f5', stroke: "#d9534f", "stroke-width": 2, "stroke-dasharray": 4, "stroke-opacity"  : 0.5 }).move(-30,-30).hide();
	var circ = circle.circle(50).move(-25,-25);
	var circ_inner = circle.circle(42).attr({ fill: '#f5f5f5', stroke: "#000", "stroke-width": 2 }).move(-21,-21);
	//var connection;

  var settings = circle.text("set").attr({id: circ.attr('id')+'_settings'}).font({family: 'fontello', size: 20}).plain('\ue802').hide();

	//var settings = svg.foreignObject(20,20).attr({id: circ.attr('id')+'_settings'}).hide();
	//$('#' + circ.attr('id')+'_settings').html('<i class="icon-cog"></i>');
	settings.attr({width: 20, height: 20, cursor: 'pointer'}).move(30,-15);

  var draw = circle.text("draw").attr({id: circ.attr('id')+'_draw'}).font({family: 'fontello', size: 20}).plain('\ue801').hide();
	//var draw = svg.foreignObject(20,20).attr({id: circ.attr('id')+'_draw'}).hide();
	//$('#' + circ.attr('id')+'_draw').html('<i class="icon-level-down"></i>');
	draw.attr({width: 20, height: 20, cursor: 'pointer'}).move(30,5);

  var del = circle.text("del").attr({id: circ.attr('id')+'_del'}).font({family: 'fontello', size: 20}).plain('\ue800').hide();
	//var del = svg.foreignObject(20,20).attr({id: circ.attr('id')+'_del'}).hide();
	//$('#' + circ.attr('id')+'_del').html('<i class="icon-trash-empty"></i>');
	del.attr({width: 20, height: 20, cursor: 'pointer'}).move(30,30);

  var inner_type = circle.text("inner_type").attr({id: circ.attr('id')+'_inner_type'});
  //var inner_type = svg.foreignObject(20,20).attr({id: circ.attr('id')+'_inner_type'});
	inner_type.attr({width: 20, height: 20}).move(-10,-10);

	if (subtype==1) {
		// иконка от innertype
		switch (innertype) {
		  case 'start_dropdown_1':
			$('#' + circ.attr('id')+'_inner_type').html('');
			break
		  case 'start_dropdown_2':
			$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-mail"></i>');
			break
		  case 'start_dropdown_3':
			$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-clock"></i>');
			break
		  case 'start_dropdown_4':
			$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-doc-text"></i>');
			break
		  case 'start_dropdown_5':
			$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-collapse"></i>');
			break
		  case 'start_dropdown_6':
			$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-target"></i>');
			break
		  case 'start_dropdown_7':
			$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-plus"></i>');
			break
		  default:
			$('#' + circ.attr('id')+'_inner_type').html('');
		};
	} else if (subtype==2) {
			// иконка от innertype
			switch (innertype) {
			  case 'inter_dropdown_1':
				$('#' + circ.attr('id')+'_inner_type').html('');
				break
			  case 'inter_dropdown_2':
				$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-mail"></i>');
				break
			  case 'inter_dropdown_3':
				$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-clock"></i>');
				break
			  case 'inter_dropdown_4':
				$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-mail-alt"></i>');
				break
			  case 'inter_dropdown_5':
				$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-doc-text"></i>');
				break
			  case 'inter_dropdown_6':
				$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-right-big"></i>');
				break
			  case 'inter_dropdown_7':
				$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-flash"></i>');
				break
			  case 'inter_dropdown_8':
				$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-cancel"></i>');
				break
			  case 'inter_dropdown_9':
				$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-fast-bw"></i>');
				break
			  case 'inter_dropdown_10':
				$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-collapse"></i>');
				break
			  case 'inter_dropdown_11':
				$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-target"></i>');
				break
			  case 'inter_dropdown_12':
				$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-plus-outline"></i>');
				break
			  default:
				$('#' + circ.attr('id')+'_inner_type').html('');
			};
	} else {
			// иконка от innertype
			switch (innertype) {
			  case 'end_dropdown_1':
				$('#' + circ.attr('id')+'_inner_type').html('');
				break
			  case 'end_dropdown_2':
				$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-mail"></i>');
				break
			  case 'end_dropdown_3':
				$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-paper-plane"></i>');
				break
			  case 'end_dropdown_4':
				$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-flash"></i>');
				break
			  case 'end_dropdown_5':
				$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-cancel"></i>');
				break
			  case 'end_dropdown_6':
				$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-fast-bw"></i>');
				break
			  case 'end_dropdown_7':
				$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-collapse"></i>');
				break
			  case 'end_dropdown_8':
				$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-target"></i>');
				break
			  case 'end_dropdown_9':
				$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-circle"></i>');
				break
			  default:
				$('#' + circ.attr('id')+'_inner_type').html('');
			};
	};


  var inner_text = circle.text("inner_type").attr({id: circ.attr('id')+'_inner_text'});
	//var inner_text = svg.foreignObject(100,50).attr({id: circ.attr('id')+'_inner_text'});
	inner_text.attr({width: 100, height: 50}).move(-25,55).style('cursor:default; word-wrap: break-word; text-align: center;').hide();
	//$('#' + circ.attr('id')+'_inner_text').html(innertext);
	if (innertext!='') inner_text.show();



	// var circle = svg.group();
	// 	circle.add(circ_focus);
	// 	circle.add(circ_outer);
	// 	circle.add(circ);
	// 	circle.add(circ_inner);
	// 	circle.add(draw);
	// 	circle.add(del);
	// 	circle.add(settings);
	// 	circle.add(inner_type);
	// 	circle.add(inner_text);

		if (!editable) {
			circle.attr('cursor','pointer')
		} else {
			circle.draggy(function (x, y, elem) {
				var res = {};

				res.x = x - (x % snapRange);
				res.y = y - (y % snapRange);

				return res;
			});
		}
		circle.move(xcoor,ycoor);

	scalegroup.add(circle);

	circle.data({
	  isnode: 'true',
	  type: 'circle',
	  subtype: subtype,
	  inner_type: innertype,
	  inner_text: innertext,
	  oraid: oraid
	})

	if (debuggable) console.log(circle.attr('id'))
	if (id != -1 ) {
		circle.attr('id', id)
		if (debuggable) console.log(circle.attr('id'))
	} else {
		steps.push({ id: circle.attr('id'), type: 'circle' })
	}



	if (parent != -1 ) {
		circle.data('parent', parent)
		if (debuggable) console.log(circle.data('parent'))
	}



	if (editable) {
		circle.mouseover(function() {
			if (circ_outer.attr('stroke') != "green" ) {
				circ_outer.show()
			}
		})

		circle.mouseout(function() {
			if (circ_outer.attr('stroke') != "green" ) {
				circ_outer.hide()
			}
		})
	}

	var line;

	function procDrawLine(e){
		var x1 = circle.cx()*actualZoom + scalegroup.x();
		var y1 = circle.cy()*actualZoom + scalegroup.y();

		var x2 = e.pageX;
		var y2 = e.pageY;

		line.plot(x1, y1, x2, y2).attr({stroke: '#333333', 'stroke-dasharray': '2,2'});
	};

	function stopDrawLine(e){
		if (debuggable) console.log("stop");
		document.removeEventListener('mousemove', procDrawLine);
		document.removeEventListener('click', stopDrawLine);

		var x2 = (e.pageX - scalegroup.x())/actualZoom;
		var y2 = (e.pageY - scalegroup.y())/actualZoom;

		line.remove();
		if (!circle.insideTbox(x2, y2)) {
			scalegroup.each(function(i, children) {
				if (this.insideTbox(x2, y2)) {
					if (debuggable)	console.log('try to connect with ' + this.attr('id'));

					if (this.data('isnode')==true && this.data('type')!='pull') {
						//drawPolyline(circle.attr('id'), this.attr('id'));
            scalegroup.add( svg.bpmnline(circle.attr('id'), this.attr('id')) );
					} else {
						if (debuggable) console.log('data false');
						if (debuggable) console.log('type ' + this.data('type'));
					}
				} else {
					if (debuggable) console.log('this outside');
				}

			})
		}
	};

	circle.on('dragstart', function(e) {
		$('.graph').off('mousedown')
	})

	var drgmove = false;
	circle.on('dragmove', function(e) {
		drgmove = true;

		//check if node is over pull
		//if (debuggable) console.log('dragmove');
		scalegroup.each(function(i, children) {
			if (this.data('type')=='pull') {
				if (this.inside(circle.x(), circle.y())) {
					if (debuggable) console.log('hover inside ' + this.attr('id'));
					this.first().show();
				} else {
					if (debuggable) console.log('hover not inside ' + this.attr('id'));
					this.first().hide();
				}
			}
		});
	})

	circle.on('dragend', function(e) {
		//if (debuggable) console.log('dragend');
		//check if node is over pull
		var found = false;
		scalegroup.each(function(i, children) {
			if (this.data('type')=='pull' && !found) {
				if (this.inside(circle.x(), circle.y())) {
					if (debuggable)	console.log('inside ' + this.attr('id'));
					circle.data('parent', this.attr('id'))
					found = true;
				} else {
					if (debuggable) console.log('not inside ' + this.attr('id'));
					circle.data('parent', null)
				}
				this.first().hide();
			}
		});
		if (drgmove) {
      scalegroup.each(function(i, children) {
        if (this.data('node-from')==circle.attr('id') || this.data('node-to')==circle.attr('id')) {
          this.update(true);
        }
      })
    }

		drgmove = false;
		$('.graph').on('mousedown', function(e) {
			$( this ).css('cursor', 'move')
			paning(e);
		})
	})

	settings.click(function(e) {
		var xx = e.pageX - $('.graph').offset().left;
		var yy = e.pageY - $('.graph').offset().top;

		if (subtype==1) {
			$('#start_dropdown').show()
			$('#start_dropdown').css({'position':'absolute', 'left': xx, 'top': yy});
			$('#start_dropdown li a').click(function(e) {
				if (debuggable) console.log(e.target.text);
				if (debuggable) console.log(e.target.id);

				if (e.target.className!='inactive') {
					if (debuggable) console.log(e.target.className)
					// иконка от id
					switch (e.target.id) {
					  case 'start_dropdown_1':
						$('#' + circ.attr('id')+'_inner_type').html('');
						circle.data({inner_type: e.target.id})
						break
					  case 'start_dropdown_2':
						$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-mail"></i>');
						circle.data({inner_type: e.target.id})
						break
					  case 'start_dropdown_3':
						$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-clock"></i>');
						circle.data({inner_type: e.target.id})
						break
					  case 'start_dropdown_4':
						$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-doc-text"></i>');
						circle.data({inner_type: e.target.id})
						break
					  case 'start_dropdown_5':
						$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-collapse"></i>');
						circle.data({inner_type: e.target.id})
						break
					  case 'start_dropdown_6':
						$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-target"></i>');
						circle.data({inner_type: e.target.id})
						break
					  case 'start_dropdown_7':
						$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-plus"></i>');
						circle.data({inner_type: e.target.id})
						break
					  case 'start_dropdown_card':
						//new_window('/pls/gis/ais_wf.p_scheme.p_obj_admin?v_model_id=' + l_model_id + '&v_id=' + circle.attr('id'))
						new_window('/pls/gis/ais_wf.p_scheme.p_obj_admin?v_model_id=' + l_model_id + '&v_id=' + circle.attr('id'))
						break
					  default:
						$('#' + circ.attr('id')+'_inner_type').html('');
						circle.data({inner_type: e.target.id})
					};

					$('#start_dropdown li a').off();
					$('#start_dropdown').hide()
				}
			});
		} else if (subtype==2) {
			$('#inter_dropdown').show()
			$('#inter_dropdown').css({'position':'absolute', 'left': xx, 'top': yy});
			$('#inter_dropdown li a').click(function(e) {
				if (debuggable) console.log(e.target.text);
				if (debuggable) console.log(e.target.id);

				if (e.target.className!='inactive') {
					if (debuggable) console.log(e.target.className)
					// иконка от id
					switch (e.target.id) {
					  case 'inter_dropdown_1':
						$('#' + circ.attr('id')+'_inner_type').html('');
						circle.data({inner_type: e.target.id})
						break
					  case 'inter_dropdown_2':
						$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-mail"></i>');
						circle.data({inner_type: e.target.id})
						break
					  case 'inter_dropdown_3':
						$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-clock"></i>');
						circle.data({inner_type: e.target.id})
						break
					  case 'inter_dropdown_4':
						$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-mail-alt"></i>');
						circle.data({inner_type: e.target.id})
						break
					  case 'inter_dropdown_5':
						$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-doc-text"></i>');
						circle.data({inner_type: e.target.id})
						break
					  case 'inter_dropdown_6':
						$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-right-big"></i>');
						circle.data({inner_type: e.target.id})
						break
					  case 'inter_dropdown_7':
						$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-flash"></i>');
						circle.data({inner_type: e.target.id})
						break
					  case 'inter_dropdown_8':
						$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-cancel"></i>');
						circle.data({inner_type: e.target.id})
						break
					  case 'inter_dropdown_9':
						$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-fast-bw"></i>');
						circle.data({inner_type: e.target.id})
						break
					  case 'inter_dropdown_10':
						$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-collapse"></i>');
						circle.data({inner_type: e.target.id})
						break
					  case 'inter_dropdown_11':
						$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-target"></i>');
						circle.data({inner_type: e.target.id})
						break
					  case 'inter_dropdown_12':
						$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-plus-outline"></i>');
						circle.data({inner_type: e.target.id})
						break
					  case 'inter_dropdown_card':
						new_window('/pls/gis/ais_wf.p_scheme.p_obj_admin?v_model_id=' + l_model_id + '&v_id=' + circle.attr('id'))
						break
					  default:
						$('#' + circ.attr('id')+'_inner_type').html('');
						circle.data({inner_type: e.target.id})
					};

					$('#inter_dropdown li a').off();
					$('#inter_dropdown').hide()
				}
			});
		} else {
			$('#end_dropdown').show()
			$('#end_dropdown').css({'position':'absolute', 'left': xx, 'top': yy});
			$('#end_dropdown li a').click(function(e) {
				if (debuggable) console.log(e.target.text);
				if (debuggable) console.log(e.target.id);

				if (e.target.className!='inactive') {
					if (debuggable) console.log(e.target.className)
					// иконка от id
					switch (e.target.id) {
					  case 'end_dropdown_1':
						$('#' + circ.attr('id')+'_inner_type').html('');
						circle.data({inner_type: e.target.id})
						break
					  case 'end_dropdown_2':
						$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-mail"></i>');
						circle.data({inner_type: e.target.id})
						break
					  case 'end_dropdown_3':
						$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-paper-plane"></i>');
						circle.data({inner_type: e.target.id})
						break
					  case 'end_dropdown_4':
						$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-flash"></i>');
						circle.data({inner_type: e.target.id})
						break
					  case 'end_dropdown_5':
						$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-cancel"></i>');
						circle.data({inner_type: e.target.id})
						break
					  case 'end_dropdown_6':
						$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-fast-bw"></i>');
						circle.data({inner_type: e.target.id})
						break
					  case 'end_dropdown_7':
						$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-collapse"></i>');
						circle.data({inner_type: e.target.id})
						break
					  case 'end_dropdown_8':
						$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-target"></i>');
						circle.data({inner_type: e.target.id})
						break
					  case 'end_dropdown_9':
						$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-circle"></i>');
						circle.data({inner_type: e.target.id})
						break
					  case 'end_dropdown_card':
						new_window('/pls/gis/ais_wf.p_scheme.p_obj_admin?v_model_id=' + l_model_id + '&v_id=' + circle.attr('id'))
						break
					  default:
						$('#' + circ.attr('id')+'_inner_type').html('');
						circle.data({inner_type: e.target.id})
					};

					$('#end_dropdown li a').off();
					$('#end_dropdown').hide()
				}
			});
		};

		e.stopPropagation();
	});

	if (subtype==1) {
		circ.attr({ fill: '#f5f5f5', stroke: "#22B14C", "stroke-width": 2 })
		//circle.data({inner_type: 'start_dropdown_1'})
		circ_inner.hide()
	} else if (subtype==2) {
		circ.attr({ fill: '#f5f5f5', stroke: "#3F48CC", "stroke-width": 2 })
		circ_inner.attr({ stroke: "#3F48CC" })
		//circle.data({inner_type: 'inter_dropdown_1'})
	} else {
		circ.attr({ fill: '#f5f5f5', stroke: "#ED1C24", "stroke-width": 4 })
		//circle.data({inner_type: 'end_dropdown_1'})
		circ_inner.hide()
	};

	//changing style
	if (!adminable) {
		circ.attr({ stroke: "#7E7E7E" })
		circ_inner.attr({ stroke: "#7E7E7E" })

		passed_node.forEach(function(entry) {
			if (id == entry) {
				if (subtype==1) {
					circ.attr({ fill: '#f5f5f5', stroke: "#22B14C", "stroke-width": 2 })
					//circle.data({inner_type: 'start_dropdown_1'})
					circ_inner.hide()
				} else if (subtype==2) {
					circ.attr({ fill: '#f5f5f5', stroke: "#3F48CC", "stroke-width": 2 })
					circ_inner.attr({ stroke: "#3F48CC" })
					//circle.data({inner_type: 'inter_dropdown_1'})
				} else {
					circ.attr({ fill: '#f5f5f5', stroke: "#ED1C24", "stroke-width": 4 })
					//circle.data({inner_type: 'end_dropdown_1'})
					circ_inner.hide()
				};
			}
		});

		//focus (highlight) if nessesary
		focused_node.forEach(function(entry) {
			if (id == entry) {
				circ_focus.show()
			}
		});
	}

	circle.dblclick(function(e) {
		if (editable) {
			if (debuggable) console.log("circle dbl");

			var xx = circle.x()*actualZoom - $('#input_textarea').width()/4 + scalegroup.x();
			var yy = circle.y()*actualZoom + circ_outer.height()*actualZoom + scalegroup.y();

			// var xx = pull.x()*actualZoom - $('#input_textarea').width()/2 + scalegroup.x();
			// var yy = pull.y()*actualZoom + rect_outer.height()*actualZoom/2 + scalegroup.y();

			$('#input_textarea').val($('#' + circ.attr('id')+'_inner_text').html())
			$('#input_textarea').show()
			$('#input_textarea').css({'position':'absolute', 'left': xx, 'top': yy});
			$('#input_textarea').focus();

			document.addEventListener('mousedown', function(e){
				var xx = (e.pageX - scalegroup.x())/actualZoom;
				var yy = (e.pageY - scalegroup.y())/actualZoom;

				if (circle.inside(xx, yy)) {
					if (debuggable) console.log("inside");
				} else {
					if (e.target.nodeName != 'A') {
						if (debuggable) console.log(e.target.nodeName);
						if (debuggable) console.log("click on " + e.target.nodeName + " is outside");

						if ( $('#input_textarea').is(":visible") ) {
							if (debuggable) console.log("visible");
							$('#' + circ.attr('id')+'_inner_text').html($('#input_textarea').val());
							circle.data({inner_text: $('#input_textarea').val()});
							if ($('#input_textarea').val()!='') {
								inner_text.show();
							} else {
								inner_text.hide();
							}
							$('#input_textarea').hide()
						}

						draw.hide();
						del.hide();
						settings.hide();

						circ_outer.hide().attr({ stroke: "#d9534f" });
						document.removeEventListener('mousedown', arguments.callee);

					}
				}
			});
			e.stopPropagation();
		}
	});

	circle.on('click',function(e) {
		if (editable) {
			circ_outer.show().attr({ stroke: "green" });

			draw.show();
			del.show();
			settings.show();
			if (debuggable) console.log("circle click");
			//event.stopPropagation();
			document.addEventListener('mousedown', function(e){
				var xx = (e.pageX - scalegroup.x())/actualZoom;
				var yy = (e.pageY - scalegroup.y())/actualZoom;
        /*console.log(' b xx=' + e.pageX + ' b yy=' + e.pageY);
        console.log(' t xx=' + xx + ' t yy=' + yy);

        console.log('circle x=' + circle.x() + ' circle.y=' + circle.y());
        console.log('circ_outer bbox.x=' + circ_outer.bbox().x + ' bbox.y=' + circ_outer.bbox().y + ' bbox.w=' + circ_outer.bbox().w + ' bbox.h=' + circ_outer.bbox().h);
        console.log('circle bbox.x=' + circle.bbox().x + ' bbox.y=' + circle.bbox().y + ' bbox.w=' + circle.bbox().w + ' bbox.h=' + circle.bbox().h);

        console.log('circle tbox.x=' + circle.tbox().x + ' tbox.y=' + circle.tbox().y + ' tbox.w=' + circle.tbox().w + ' tbox.h=' + circle.tbox().h);
        var rect = svg.rect(circle.tbox().w, circle.tbox().h).move(circle.tbox().x,circle.tbox().y).attr({ fill: 'none', stroke: "#cd4436", "stroke-width": 4, "stroke-opacity"  : 0.7 })*/

				if (circle.insideTbox(xx, yy)) {
					if (debuggable) console.log("inside");
					//document.removeEventListener('mousedown', arguments.callee);
				} else {
					if (e.target.nodeName != 'A') {
						if (debuggable) console.log("click on " + e.target.nodeName + " is outside");
						draw.hide();
						del.hide();
						settings.hide();

						circ_outer.hide().attr({ stroke: "#d9534f" });

						$('#start_dropdown li a').off();
						$('#inter_dropdown li a').off();
						$('#end_dropdown li a').off();
						$('#start_dropdown').hide()
						$('#inter_dropdown').hide()
						$('#end_dropdown').hide()

						document.removeEventListener('mousedown', arguments.callee);
					}
				}
				});
		} else {
			if (typeof customclick === "function") {
				customclick(circle.attr('id'));
			} else {
				var xx = e.pageX /*- $('.graph').offset().left*/;
				var yy = e.pageY /*- $('.graph').offset().top*/;

				$('#preview_dropdown').show()
				$('#preview_dropdown').css({'position':'absolute', 'left': xx, 'top': yy});
				$('#preview_dropdown li a').click(function(e) {
					if (debuggable) console.log(e.target.text);
					if (debuggable) console.log(e.target.id);

					if (e.target.className!='inactive') {
						if (debuggable) console.log(e.target.className)
						// иконка от id
						switch (e.target.id) {
						  case 'preview_dropdown_card':
							if (adminable) {
								new_window('/pls/gis/ais_wf.p_scheme.p_obj_admin?v_model_id=' + l_model_id + '&v_id=' + circle.attr('id'))
							} else {
								new_window('/pls/gis/ais_wf.p_scheme.p_obj_see?v_proc_id=' + l_proc_id + '&v_id=' + circle.attr('id'))
							}
							break
						  default:
							new_window('/pls/gis/ais_wf.p_scheme.p_obj_see?v_proc_id=' + l_proc_id + '&v_id=' + circle.attr('id'))
						};

						$('#preview_dropdown li a').off();
						$('#preview_dropdown').hide()
					}
				});

				document.addEventListener('mousedown', function(e){
					var xx = (e.pageX - scalegroup.x())/actualZoom;
					var yy = (e.pageY - scalegroup.y())/actualZoom;

					if (circle.inside(xx, yy)) {
						if (debuggable) console.log("inside");
						//document.removeEventListener('mousedown', arguments.callee);
					} else {
						if (e.target.nodeName != 'A') {
							if (debuggable) console.log("click on " + e.target.nodeName + " is outside");

							$('#preview_dropdown li a').off();
							$('#preview_dropdown').hide()

							document.removeEventListener('mousedown', arguments.callee);
						}
					}
				});
			}
		}
	});

	draw.click(function(e) {
		//if (debuggable)
     console.log("draw click");
		line = svg.line(circle.cx(), circle.cy(), circle.cx(), circle.cy()).stroke({ width: 1 });

		document.addEventListener('mousemove', procDrawLine);
		document.addEventListener('click', stopDrawLine);
		e.stopPropagation();
	});

	del.click(function(e) {
		//delLine(circle.attr('id'));
		delPolyline(circle.attr('id'));
		circle.remove();
		e.stopPropagation();
	});
};

function addTask(innertype, innertext, id, oraid, xcoor, ycoor, parent) {

	//set defaults if necessary
	innertype = typeof innertype !== 'undefined' ? innertype : 'task_dropdown_1';
	innertext = typeof innertext !== 'undefined' ? innertext : '';
	xcoor = typeof xcoor !== 'undefined' ? xcoor : (100-scalegroup.x())/actualZoom;
	ycoor = typeof ycoor !== 'undefined' ? ycoor : (100-scalegroup.y())/actualZoom;
	id = typeof id !== 'undefined' ? id : -1;
	oraid = typeof oraid !== 'undefined' ? oraid : -1;
	parent = typeof parent !== 'undefined' ? parent : -1;

	var rect_focus = svg.rect(110, 90).attr({ fill: '#f5f5f5', stroke: "#cd4436", "stroke-width": 4, "stroke-opacity"  : 0.7 }).move(-5,-5).hide();
	var rect_outer = svg.rect(110, 90).attr({ fill: '#f5f5f5', stroke: "#d9534f", "stroke-width": 2, "stroke-dasharray": 4, "stroke-opacity"  : 0.5 }).move(-5,-5).hide();
	var rect = svg.rect(100, 80).attr({ fill: '#f5f5f5', stroke: "#7092BE", "stroke-width": 2 });

	var settings = svg.foreignObject(20,20).attr({id: rect.attr('id')+'_settings'}).hide();
	$('#' + rect.attr('id')+'_settings').html('<i class="icon-cog"></i>');
	settings.attr({width: 20, height: 20, cursor: 'pointer'}).move(105,-10);

	var draw = svg.foreignObject(20,20).attr({id: rect.attr('id')+'_draw'}).hide();
	$('#' + rect.attr('id')+'_draw').html('<i class="icon-level-down"></i>');
	draw.attr({width: 20, height: 20, cursor: 'pointer'}).move(105,5);

	var del = svg.foreignObject(20,20).attr({id: rect.attr('id')+'_del'}).hide();
	$('#' + rect.attr('id')+'_del').html('<i class="icon-trash-empty"></i>');
	del.attr({width: 20, height: 20, cursor: 'pointer'}).move(105,70);

	var inner_type = svg.foreignObject(20,20).attr({id: rect.attr('id')+'_inner_type'});
	inner_type.attr({width: 20, height: 20}).move(0,80);

	inner_type.style('border', '1px solid black');
	switch (innertype) {
	  case 'task_dropdown_1':
		$('#' + rect.attr('id')+'_inner_type').html('<i class="icon-user"></i>');
		break
	  case 'task_dropdown_2':
		$('#' + rect.attr('id')+'_inner_type').html('<i class="icon-right-hand"></i>');
		break
	  case 'task_dropdown_3':
		$('#' + rect.attr('id')+'_inner_type').html('<i class="icon-cog-alt"></i>');
		break
	  case 'task_dropdown_4':
		$('#' + rect.attr('id')+'_inner_type').html('<i class="icon-ccw"></i>');
		break
	  case 'task_dropdown_5':
		$('#' + rect.attr('id')+'_inner_type').html('<i class="icon-table"></i>');
		break
	  case 'task_dropdown_6':
		$('#' + rect.attr('id')+'_inner_type').html('<i class="icon-mail-alt"></i>');
		break
	  case 'task_dropdown_7':
		$('#' + rect.attr('id')+'_inner_type').html('<i class="icon-mail"></i>');
		break
	  case 'task_dropdown_8':
		inner_type.style('border', 'none');
		$('#' + rect.attr('id')+'_inner_type').html('');
		break
	  default:
		inner_type.style('border', 'none');
		$('#' + rect.attr('id')+'_inner_type').html('');
	};

	var inner_text = svg.foreignObject(100,80).attr({id: rect.attr('id')+'_inner_text'});
	inner_text.attr({width: 100, height: 80}).move(1,1).style('cursor:default; word-wrap: break-word; text-align: center;').hide();
	$('#' + rect.attr('id')+'_inner_text').html(innertext)
	if (innertext!='') inner_text.show()

	if (debuggable) console.log(rect.attr('id'))


	var task = svg.group();
		task.add(rect_focus);
		task.add(rect_outer);
		task.add(rect);
		task.add(settings);
		task.add(draw);
		task.add(del);
		task.add(inner_type);
		task.add(inner_text);

		if (!editable) {
			task.attr('cursor','pointer')
			inner_text.style('cursor:pointer;')
		} else {
			task.draggy(function (x, y, elem) {
				var res = {};

				res.x = x - (x % snapRange);
				res.y = y - (y % snapRange);

				return res;
			});
		}
		task.move(xcoor,ycoor);

	scalegroup.add(task);

	task.data({
	  isnode: 'true',
	  type: 'task',
	  inner_type: innertype,
	  inner_text: innertext,
	  oraid: oraid
	})

	if (debuggable) console.log(task.attr('id'))
	if (id != -1 ) {
		task.attr('id', id)
		if (debuggable) console.log(task.attr('id'))
	}

	if (parent != -1 ) {
		task.data('parent', parent)
		if (debuggable) console.log(task.data('parent'))
	}

	//focus (highlight) if nessesary
	/*focused_node.forEach(function(entry) {
		if (id == entry) {
			rect_focus.show()
		}
	});*/

	//changing style
	if (!adminable) {
		rect.attr({ stroke: "#7E7E7E" })

		passed_node.forEach(function(entry) {
			if (id == entry) {
				rect.attr({ stroke: "#7092BE" })
			}
		});

		//focus (highlight) if nessesary
		focused_node.forEach(function(entry) {
			if (id == entry) {
				rect_focus.show()
			}
		});
	}


	if (editable) {
		task.mouseover(function() {
			if (rect_outer.attr('stroke') != "green" ) {
				rect_outer.show()
			}
		});

		task.mouseout(function() {
			if (rect_outer.attr('stroke') != "green" ) {
				rect_outer.hide()
			}
		});
	}
	var line;

	function procDrawLine(e){
		var x1 = task.cx()*actualZoom + scalegroup.x();
		var y1 = task.cy()*actualZoom + scalegroup.y();

		var x2 = e.pageX;
		var y2 = e.pageY;


		// var x2 = e.pageX - $('.graph').offset().left;
		// var y2 = e.pageY - $('.graph').offset().top;
		line.plot(x1, y1, x2, y2);
	};

	function stopDrawLine(e){
		if (debuggable) console.log("stop");
		document.removeEventListener('mousemove', procDrawLine);
		document.removeEventListener('click', stopDrawLine);

		// var x2 = e.pageX - $('.graph').offset().left;
		// var y2 = e.pageY - $('.graph').offset().top;

		var x2 = (e.pageX - scalegroup.x())/actualZoom;
		var y2 = (e.pageY - scalegroup.y())/actualZoom;

		line.remove();
		if (!task.inside(x2, y2)) {
			scalegroup.each(function(i, children) {
				if (this.inside(x2, y2)) {
					if (debuggable) console.log('try to connect with ' + this.attr('id'));
					if (this.data('isnode')) {
						drawPolyline(task.attr('id'),this.attr('id'));
					} else {
						if (debuggable) console.log('data false');
					}
				} else {
					if (debuggable) console.log('this outside');
				}
			})
		}
	};

	task.on('dragstart', function(e) {
		$('.graph').off('mousedown')
	})
	var drgmove = false;
	task.on('dragmove', function(e) {
		drgmove = true;

		//check if node is over pull
		if (debuggable) console.log('dragmove');
		scalegroup.each(function(i, children) {
			if (this.data('type')=='pull') {
				if (this.inside(task.x(), task.y())) {
					if (debuggable) console.log('hover inside ' + this.attr('id'));
					this.first().show();
				} else {
					if (debuggable) console.log('hover not inside ' + this.attr('id'));
					this.first().hide();
				}
			}
		});
	})


	task.on('dragend', function(e) {
		if (debuggable) console.log('dragend');
		//check if node is over pull
		var found = false;
		scalegroup.each(function(i, children) {
			if (this.data('type')=='pull' && !found) {
				if (this.inside(task.x(), task.y())) {
					if (debuggable) console.log('inside ' + this.attr('id'));
					task.data('parent', this.attr('id'))
					found = true;
				} else {
					if (debuggable) console.log('not inside ' + this.attr('id'));
					task.data('parent', null)
				}
				this.first().hide();
			}
		});

		if (drgmove) updatePolyline(task.attr('id'))
		drgmove = false;
		$('.graph').on('mousedown', function(e) {
			$( this ).css('cursor', 'move')
			paning(e);
		})
	})

	task.dblclick(function(e) {
		if (debuggable) console.log("task dbl");

		var xx = task.x()*actualZoom - $('#input_textarea').width()/4 + scalegroup.x();
		var yy = task.y()*actualZoom + scalegroup.y();

		// var xx = pull.x()*actualZoom - $('#input_textarea').width()/2 + scalegroup.x();
		// var yy = pull.y()*actualZoom + rect_outer.height()*actualZoom/2 + scalegroup.y();



		$('#input_textarea').val($('#' + rect.attr('id')+'_inner_text').html())
		$('#input_textarea').show()
		$('#input_textarea').css({'position':'absolute', 'left': xx, 'top': yy});
		$('#input_textarea').focus();

		document.addEventListener('mousedown', function(e){
			var xx = (e.pageX - scalegroup.x())/actualZoom;
			var yy = (e.pageY - scalegroup.y())/actualZoom;

			if (task.inside(xx, yy)) {
				if (debuggable) console.log("inside");
			} else {
				if (e.target.nodeName != 'A') {
					if (debuggable) console.log(e.target.nodeName);
					if (debuggable) console.log("outside");

					if ( $('#input_textarea').is(":visible") ) {
						if (debuggable) console.log("visible")
						$('#' + rect.attr('id')+'_inner_text').html($('#input_textarea').val())
						task.data({inner_text: $('#input_textarea').val()})
						if ($('#input_textarea').val()!='') {
							inner_text.show()
						} else {
							inner_text.hide()
						}
						$('#input_textarea').hide()
					}

					draw.hide();
					del.hide();
					settings.hide();

					rect_outer.hide().attr({ stroke: "#d9534f" });

					$('#task_dropdown li a').off();
					$('#task_dropdown').hide()

					document.removeEventListener('mousedown', arguments.callee);

				}
			}
		});
		e.stopPropagation();
	});

	task.click(function(e) {
		if (editable) {
			if (debuggable) console.log("rect click");

			rect_outer.show().attr({ stroke: "green" });

			draw.show();
			del.show();
			settings.show();

			document.addEventListener('mousedown', function(e){
				var xx = (e.pageX - scalegroup.x())/actualZoom;
				var yy = (e.pageY - scalegroup.y())/actualZoom;

				if (task.inside(xx, yy)) {
					if (debuggable) console.log("inside");
				} else {
					if (e.target.nodeName != 'A') {
						if (debuggable) console.log(e.target.nodeName);
						if (debuggable) console.log("outside");

						draw.hide();
						del.hide();
						settings.hide();

						rect_outer.hide().attr({ stroke: "#d9534f" });

						$('#task_dropdown li a').off();
						$('#task_dropdown').hide()

						document.removeEventListener('mousedown', arguments.callee);

					}
				}
			});
		} else {
			if (typeof customclick === "function") {
				customclick(task.attr('id'));
			} else {
				var xx = e.pageX - $('.graph').offset().left;
				var yy = e.pageY - $('.graph').offset().top;

				$('#preview_dropdown').show()
				$('#preview_dropdown').css({'position':'absolute', 'left': xx, 'top': yy});
				$('#preview_dropdown li a').click(function(e) {
					if (debuggable) console.log(e.target.text);
					if (debuggable) console.log(e.target.id);

					if (e.target.className!='inactive') {
						if (debuggable) console.log(e.target.className)
						// иконка от id
						switch (e.target.id) {
						  case 'preview_dropdown_card':
							if (adminable) {
								new_window('/pls/gis/ais_wf.p_scheme.p_obj_admin?v_model_id=' + l_model_id + '&v_id=' + task.attr('id'))
							} else {
								new_window('/pls/gis/ais_wf.p_scheme.p_obj_see?v_proc_id=' + l_proc_id + '&v_id=' + task.attr('id'))
							}
							break
						  default:
							new_window('/pls/gis/ais_wf.p_scheme.p_obj_see?v_proc_id=' + l_proc_id + '&v_id=' + task.attr('id'))
						};

						$('#preview_dropdown li a').off();
						$('#preview_dropdown').hide()
					}
				});

				document.addEventListener('mousedown', function(e){
					var xx = (e.pageX - scalegroup.x())/actualZoom;
					var yy = (e.pageY - scalegroup.y())/actualZoom;

					if (task.inside(xx, yy)) {
						if (debuggable) console.log("inside");
						//document.removeEventListener('mousedown', arguments.callee);
					} else {
						if (e.target.nodeName != 'A') {
							if (debuggable) console.log("click on " + e.target.nodeName + " is outside");

							$('#preview_dropdown li a').off();
							$('#preview_dropdown').hide()

							document.removeEventListener('mousedown', arguments.callee);
						}
					}
				});
			}
		}
	});

	settings.click(function(e) {
		var xx = e.pageX - $('.graph').offset().left;
		var yy = e.pageY - $('.graph').offset().top;

		$('#task_dropdown').show()
		$('#task_dropdown').css({'position':'absolute', 'left': xx, 'top': yy});
		$('#task_dropdown li a').click(function(e) {
			if (debuggable) console.log(e.target.text);
			if (debuggable) console.log(e.target.id);

			if (e.target.className!='inactive') {
				if (debuggable) console.log(e.target.className)
				// иконка от id
				inner_type.style('border', '1px solid black');
				switch (e.target.id) {
				  case 'task_dropdown_1':
					$('#' + rect.attr('id')+'_inner_type').html('<i class="icon-user"></i>');
					task.data({inner_type: e.target.id})
					break
				  case 'task_dropdown_2':
					$('#' + rect.attr('id')+'_inner_type').html('<i class="icon-right-hand"></i>');
					task.data({inner_type: e.target.id})
					break
				  case 'task_dropdown_3':
					$('#' + rect.attr('id')+'_inner_type').html('<i class="icon-cog-alt"></i>');
					task.data({inner_type: e.target.id})
					break
				  case 'task_dropdown_4':
					$('#' + rect.attr('id')+'_inner_type').html('<i class="icon-ccw"></i>');
					task.data({inner_type: e.target.id})
					break
				  case 'task_dropdown_5':
					$('#' + rect.attr('id')+'_inner_type').html('<i class="icon-table"></i>');
					task.data({inner_type: e.target.id})
					break
				  case 'task_dropdown_6':
					$('#' + rect.attr('id')+'_inner_type').html('<i class="icon-mail-alt"></i>');
					task.data({inner_type: e.target.id})
					break
				  case 'task_dropdown_7':
					$('#' + rect.attr('id')+'_inner_type').html('<i class="icon-mail"></i>');
					task.data({inner_type: e.target.id})
					break
				  case 'task_dropdown_8':
					inner_type.style('border', 'none');
					$('#' + rect.attr('id')+'_inner_type').html('');
					task.data({inner_type: e.target.id})
					break
				  case 'task_dropdown_card':
					new_window('/pls/gis/ais_wf.p_scheme.p_obj_admin?v_model_id=' + l_model_id + '&v_id=' + task.attr('id'))
					break
				  default:
					inner_type.style('border', 'none');
					$('#' + rect.attr('id')+'_inner_type').html('');
					task.data({inner_type: e.target.id})
				};

				$('#task_dropdown li a').off();
				$('#task_dropdown').hide()
			}
		});
		e.stopPropagation();
	});

	draw.click(function(e) {
		line = svg.line(task.cx(), task.cy(), task.cx(), task.cy()).stroke({ width: 1 });
		document.addEventListener('mousemove', procDrawLine);
		document.addEventListener('click', stopDrawLine);
		e.stopPropagation();
	});

	del.click(function(e) {
		delPolyline(task.attr('id'));
		task.remove();
		e.stopPropagation();
	});
};

function addDecision(innertype, innertext, id, oraid, xcoor, ycoor, parent) {

	//set defaults if necessary
	innertype = typeof innertype !== 'undefined' ? innertype : 'decision_dropdown_1';
	innertext = typeof innertext !== 'undefined' ? innertext : '';
	xcoor = typeof xcoor !== 'undefined' ? xcoor : (100-scalegroup.x())/actualZoom;
	ycoor = typeof ycoor !== 'undefined' ? ycoor : (150-scalegroup.y())/actualZoom;
	id = typeof id !== 'undefined' ? id : -1;
	oraid = typeof oraid !== 'undefined' ? oraid : -1;
	parent = typeof parent !== 'undefined' ? parent : -1;

	var romb_focus = svg.rect(60, 60).attr({ fill: '#f5f5f5', stroke: "#cd4436", "stroke-width": 4, "stroke-opacity"  : 0.7 }).move(-5,-5).hide();
	var romb_outer = svg.rect(60, 60).attr({ fill: '#f5f5f5', stroke: "#d9534f", "stroke-width": 2, "stroke-dasharray": 4, "stroke-opacity"  : 0.5 }).move(-5,-5).hide();
	var romb = svg.rect(50, 50).attr({ fill: '#f5f5f5', stroke: "#A349A4", "stroke-width": 2 });;
	var connection;

	romb_focus.rotate(45, romb.cx(), romb.cy())
	romb_outer.rotate(45, romb.cx(), romb.cy())
	romb.rotate(45, romb.cx(), romb.cy())

	var settings = svg.foreignObject(20,20).attr({id: romb.attr('id')+'_settings'}).hide();
	$('#' + romb.attr('id')+'_settings').html('<i class="icon-cog"></i>');
	settings.attr({width: 20, height: 20, cursor: 'pointer'}).move(50,-20);

	var draw = svg.foreignObject(20,20).attr({id: romb.attr('id')+'_draw'}).hide();
	$('#' + romb.attr('id')+'_draw').html('<i class="icon-level-down"></i>');
	draw.attr({width: 20, height: 20, cursor: 'pointer'}).move(50,-5);

	var del = svg.foreignObject(20,20).attr({id: romb.attr('id')+'_del'}).hide();
	$('#' + romb.attr('id')+'_del').html('<i class="icon-trash-empty"></i>');
	del.attr({width: 20, height: 20, cursor: 'pointer'}).move(50,45);

	var inner_type = svg.foreignObject(20,20).attr({id: romb.attr('id')+'_inner_type'});
	inner_type.attr({width: 30, height: 20}).style('text-align: center;').move(10,15);

	// текст от id
	switch (innertype) {
	  case 'decision_dropdown_1':
		$('#' + romb.attr('id')+'_inner_type').html('И');
		break
	  case 'decision_dropdown_2':
		$('#' + romb.attr('id')+'_inner_type').html('ИЛИ');
		break
	  case 'decision_dropdown_3':
		$('#' + romb.attr('id')+'_inner_type').html('Искл. ИЛИ');
		break
	  default:
		$('#' + romb.attr('id')+'_inner_type').html('');
	};

	var inner_text = svg.foreignObject(100,50).attr({id: romb.attr('id')+'_inner_text'});
	inner_text.attr({width: 100, height: 50}).move(-25,60).style('cursor:default; word-wrap: break-word; text-align: center;').hide();
	$('#' + romb.attr('id')+'_inner_text').html(innertext)
	if (innertext!='') inner_text.show()

	var decision = svg.group();
		decision.add(romb_focus);
		decision.add(romb_outer);
		decision.add(romb);
		decision.add(settings);
		decision.add(draw);
		decision.add(del);
		decision.add(inner_type);
		decision.add(inner_text);

		if (!editable) {
			decision.attr('cursor','pointer')
		} else {
			decision.draggy(function (x, y, elem) {
				var res = {};

				res.x = x - (x % snapRange);
				res.y = y - (y % snapRange);

				return res;
			})
		}
		decision.move(xcoor,ycoor);

	scalegroup.add(decision);

	decision.data({
	  isnode: 'true',
	  type: 'decision',
	  inner_type: innertype,
	  inner_text: innertext,
	  oraid: oraid
	})

	if (debuggable) console.log(decision.attr('id'))
	if (id != -1 ) {
		decision.attr('id', id)
		if (debuggable) console.log(decision.attr('id'))
	}

	if (parent != -1 ) {
		decision.data('parent', parent)
		if (debuggable) console.log(decision.data('parent'))
	}

	//focus (highlight) if nessesary
	/*focused_node.forEach(function(entry) {
		if (id == entry) {
			romb_focus.show()
		}
	});*/

	if (!adminable) {
		romb.attr({ stroke: "#7E7E7E" })

		passed_node.forEach(function(entry) {
			if (id == entry) {
				romb.attr({ stroke: "#A349A4" })
			}
		});

		//focus (highlight) if nessesary
		focused_node.forEach(function(entry) {
			if (id == entry) {
				romb_focus.show()
			}
		});
	}

	if (editable) {
		decision.mouseover(function() {
			if (romb_outer.attr('stroke') != "green" ) {
				romb_outer.show()
			}
		});

		decision.mouseout(function() {
			if (romb_outer.attr('stroke') != "green" ) {
				romb_outer.hide()
			}
		});
	}
	var line;

	function procDrawLine(e){
		var x1 = decision.cx()*actualZoom + scalegroup.x();
		var y1 = decision.cy()*actualZoom + scalegroup.y();

		var x2 = e.pageX;
		var y2 = e.pageY;

		line.plot(x1, y1, x2, y2);
	};

	function stopDrawLine(e){
		if (debuggable) console.log("stop");
		document.removeEventListener('mousemove', procDrawLine);
		document.removeEventListener('click', stopDrawLine);

		var x2 = (e.pageX - scalegroup.x())/actualZoom;
		var y2 = (e.pageY - scalegroup.y())/actualZoom;

		line.remove();
		if (!decision.inside(x2, y2)) {
			scalegroup.each(function(i, children) {
				if (this.inside(x2, y2)) {
					if (debuggable) console.log('try to connect with ' + this.attr('id'));
					if (this.data('isnode')) {
						drawPolyline(decision.attr('id'),this.attr('id'));
					} else {
						if (debuggable) console.log('data false');
					}
				} else {
					if (debuggable) console.log('this outside');
				}
			})
		}
	};

	decision.on('dragstart', function(e) {
		$('.graph').off('mousedown')
	})

	var drgmove = false;
	decision.on('dragmove', function(e) {
		drgmove = true;

		//check if node is over pull
		if (debuggable) console.log('dragmove');
		scalegroup.each(function(i, children) {
			if (this.data('type')=='pull') {
				if (this.inside(decision.x(), decision.y())) {
					if (debuggable) console.log('hover inside ' + this.attr('id'));
					this.first().show();
				} else {
					if (debuggable) console.log('hover not inside ' + this.attr('id'));
					this.first().hide();
				}
			}
		});
	})

	decision.on('dragend', function(e) {
		//if (debuggable) console.log('dragend');
		//check if node is over pull
		var found = false;
		scalegroup.each(function(i, children) {
			if (this.data('type')=='pull' && !found) {
				if (this.inside(decision.x(), decision.y())) {
					if (debuggable) console.log('inside ' + this.attr('id'));
					decision.data('parent', this.attr('id'))
					found = true;
				} else {
					if (debuggable) console.log('not inside ' + this.attr('id'));
					decision.data('parent', null)
				}
				this.first().hide();
			}
		});
		if (drgmove) updatePolyline(decision.attr('id'))
		drgmove = false;
		$('.graph').on('mousedown', function(e) {
			$( this ).css('cursor', 'move')
			paning(e);
		})
	})

	decision.dblclick(function(e) {
		if (debuggable) console.log("decision dbl");

		var xx = decision.x()*actualZoom - $('#input_textarea').width()/4 + scalegroup.x();
		var yy = decision.y()*actualZoom + romb_outer.height()*actualZoom/2 + scalegroup.y();

		// var xx = pull.x()*actualZoom - $('#input_textarea').width()/2 + scalegroup.x();
		// var yy = pull.y()*actualZoom + rect_outer.height()*actualZoom/2 + scalegroup.y();

		$('#input_textarea').val($('#' + romb.attr('id')+'_inner_text').html())
		$('#input_textarea').show()
		$('#input_textarea').css({'position':'absolute', 'left': xx, 'top': yy});
		$('#input_textarea').focus();

		document.addEventListener('mousedown', function(e){
			var xx = (e.pageX - scalegroup.x())/actualZoom;
			var yy = (e.pageY - scalegroup.y())/actualZoom;

			if (decision.inside(xx, yy)) {
				if (debuggable) console.log("inside");
			} else {
				if (e.target.nodeName != 'A') {
					if (debuggable) console.log(e.target.nodeName);
					if (debuggable) console.log("outside");

					if ( $('#input_textarea').is(":visible") ) {
						if (debuggable) console.log("visible");
						$('#' + romb.attr('id')+'_inner_text').html($('#input_textarea').val());
						decision.data({inner_text: $('#input_textarea').val()})
						if ($('#input_textarea').val()!='') {
							inner_text.show();
						} else {
							inner_text.hide();
						}
						$('#input_textarea').hide()
					}

					draw.hide();
					del.hide();
					settings.hide();
					romb_outer.hide().attr({ stroke: "#d9534f" });

					document.removeEventListener('mousedown', arguments.callee);
				}
			}
		});
		e.stopPropagation();
	});

	decision.click(function(e) {
		if (editable) {
			romb_outer.show().attr({ stroke: "green" });

			draw.show();
			del.show();
			settings.show();
			if (debuggable) console.log("click");

			document.addEventListener('mousedown', function(e){
				var xx = (e.pageX - scalegroup.x())/actualZoom;
				var yy = (e.pageY - scalegroup.y())/actualZoom;

				if (decision.inside(xx, yy)) {
					if (debuggable) console.log("inside");
				} else {
					if (e.target.nodeName != 'A') {
						if (debuggable) console.log(e.target.nodeName);
						if (debuggable) console.log("outside");
						draw.hide();
						del.hide();
						settings.hide();
						romb_outer.hide().attr({ stroke: "#d9534f" });

						$('#decision_dropdown li a').off();
						$('#decision_dropdown').hide()

						document.removeEventListener('mousedown', arguments.callee);

					}
				}
			})
		} else {
			if (typeof customclick === "function") {
				customclick(decision.attr('id'));
			} else {
				var xx = e.pageX - $('.graph').offset().left;
				var yy = e.pageY - $('.graph').offset().top;

				$('#preview_dropdown').show()
				$('#preview_dropdown').css({'position':'absolute', 'left': xx, 'top': yy});
				$('#preview_dropdown li a').click(function(e) {
					if (debuggable) console.log(e.target.text);
					if (debuggable) console.log(e.target.id);

					if (e.target.className!='inactive') {
						if (debuggable) console.log(e.target.className)
						// иконка от id
						switch (e.target.id) {
						  case 'preview_dropdown_card':
							if (adminable) {
								new_window('/pls/gis/ais_wf.p_scheme.p_obj_admin?v_model_id=' + l_model_id + '&v_id=' + decision.attr('id'))
							} else {
								new_window('/pls/gis/ais_wf.p_scheme.p_obj_see?v_proc_id=' + l_proc_id + '&v_id=' + decision.attr('id'))
							}
							break
						  default:
							new_window('/pls/gis/ais_wf.p_scheme.p_obj_see?v_proc_id=' + l_proc_id + '&v_id=' + decision.attr('id'))
						};

						$('#preview_dropdown li a').off();
						$('#preview_dropdown').hide()
					}
				});

				document.addEventListener('mousedown', function(e){
					var xx = (e.pageX - scalegroup.x())/actualZoom;
					var yy = (e.pageY - scalegroup.y())/actualZoom;

					if (decision.inside(xx, yy)) {
						if (debuggable) console.log("inside");
						//document.removeEventListener('mousedown', arguments.callee);
					} else {
						if (e.target.nodeName != 'A') {
							if (debuggable) console.log("click on " + e.target.nodeName + " is outside");

							$('#preview_dropdown li a').off();
							$('#preview_dropdown').hide()

							document.removeEventListener('mousedown', arguments.callee);
						}
					}
				});
			}
		}
	});

	settings.click(function(e) {
		var xx = e.pageX - $('.graph').offset().left;
		var yy = e.pageY - $('.graph').offset().top;

		$('#decision_dropdown').show()
		$('#decision_dropdown').css({'position':'absolute', 'left': xx, 'top': yy});
		$('#decision_dropdown li a').click(function(e) {
			if (debuggable) console.log(e.target.text);
			if (debuggable) console.log(e.target.id);

			if (e.target.className!='inactive') {
				if (debuggable) console.log(e.target.className)
				// текст от id
				switch (e.target.id) {
				  case 'decision_dropdown_1':
					$('#' + romb.attr('id')+'_inner_type').html('И');
					decision.data({inner_type: e.target.id})
					break
				  case 'decision_dropdown_2':
					$('#' + romb.attr('id')+'_inner_type').html('ИЛИ');
					decision.data({inner_type: e.target.id})
					break
				  case 'decision_dropdown_3':
					$('#' + romb.attr('id')+'_inner_type').html('Искл. ИЛИ');
					decision.data({inner_type: e.target.id})
					break
				  case 'decision_dropdown_card':
					new_window('/pls/gis/ais_wf.p_scheme.p_obj_admin?v_model_id=' + l_model_id + '&v_id=' + decision.attr('id'))
					break
				  default:
					$('#' + romb.attr('id')+'_inner_type').html('');
					decision.data({inner_type: e.target.id})
				};

				$('#decision_dropdown li a').off();
				$('#decision_dropdown').hide()
			}
		});
		e.stopPropagation();
	});

	draw.click(function(e) {
		line = svg.line(decision.cx(), decision.cy(), decision.cx(), decision.cy()).stroke({ width: 1 });

		document.addEventListener('mousemove', procDrawLine);
		document.addEventListener('click', stopDrawLine);
		e.stopPropagation();
	});

	del.click(function(e) {
		delPolyline(decision.attr('id'));
		decision.remove();
		e.stopPropagation();
	});

};

function addPull(innertext, id, oraid, xcoor, ycoor, width, height, zndex)  {

	//set defaults if necessary
	innertext = typeof innertext !== 'undefined' ? innertext : 'Пул';
	xcoor = typeof xcoor !== 'undefined' ? xcoor : (100-scalegroup.x())/actualZoom;
	ycoor = typeof ycoor !== 'undefined' ? ycoor : (200-scalegroup.y())/actualZoom;
	id = typeof id !== 'undefined' ? id : -1;
	oraid = typeof oraid !== 'undefined' ? oraid : -1;
	width = typeof width !== 'undefined' ? width : 400;
	height = typeof height !== 'undefined' ? height : 200;
	zndex = typeof zndex !== 'undefined' ? zndex : 0;

	var rect_outer = svg.rect(width + 10, height + 10).attr({ fill: '#f5f5f5', stroke: "#d9534f", "stroke-width": 2, "stroke-dasharray": 4, "stroke-opacity"  : 0.5 }).move(-5,-5).hide();
	var rect = svg.rect(width, height).attr({ fill: '#fff', stroke: "#000", "stroke-width": 1 });

	var arrow = svg.foreignObject(20,20).attr({id: rect.attr('id')+'_resize'});
	$('#' + rect.attr('id')+'_resize').html('<i class="icon-resize-full"></i>');
	arrow.attr({width: 20, height: 20, 'cursor': 'se-resize'}).move(width - 2, height - 2).hide();

	var inner_text = svg.foreignObject(0,0).attr({id: 'inner_text'})
	inner_text.appendChild("div", {id: rect.attr('id')+'_inner_text'})
	var n = inner_text.getChild(0)
	n.style.overflow = 'hidden'
	n.style.border = "solid black 1px"
	inner_text.attr({width: rect.height(), height: 45}).rotate(-90, rect.x(), rect.y()).move(-rect.height(),0).style('cursor:default; word-wrap: break-word; text-align: center;').hide();
	$('#' + rect.attr('id')+'_inner_text').html(innertext);
	if (innertext!='') inner_text.show();

	var settings = svg.foreignObject(20,20).attr({id: rect.attr('id')+'_settings'}).hide();
	$('#' + rect.attr('id')+'_settings').html('<i class="icon-cog"></i>');
	settings.attr({width: 20, height: 20, cursor: 'pointer'}).move(-23, 0);

	var del = svg.foreignObject(20,20).attr({id: rect.attr('id')+'_del'});
	$('#' + rect.attr('id')+'_del').html('<i class="icon-trash-empty"></i>');
	del.attr({width: 20, height: 20, cursor: 'pointer'}).move(-23, height-20).hide();

	var pull = svg.group();
	pull.add(rect_outer);
	pull.add(rect);
	pull.add(inner_text);
	pull.add(arrow);
	pull.add(del);
	pull.add(settings);

	if (!editable) {
		pull.style('pointer-events:none;')
		inner_text.addClass('noselect').style('cursor:pointer; pointer-events:all;')
	} else {
		pull.draggy(function (x, y, elem) {
			var res = {};

			res.x = x - (x % snapRange);
			res.y = y - (y % snapRange);

			return res;
		});
	}

	pull.move(xcoor,ycoor);

	scalegroup.add(pull);

	if (debuggable) console.log(pull.attr('id'))
	if (id != -1 ) {
		pull.attr('id', id)
		if (debuggable) console.log(pull.attr('id'))
	}

	//Setting correct z-index
	pull.back();
	scalegroup.each(function(i, children) {
		if (this.data('type')=='pull') {
			pull.forward()
		}
	});

	pull.data({
	  isnode: 'false',
	  type: 'pull',
	  inner_text: innertext,
	  width: rect.width(),
	  height: rect.height(),
	  zindex: zndex,
	  nmaxx: 0,
	  nmaxy: 0
	})

	function resizePull(e) {
		if (debuggable) console.log("resizePull");

		//сетка для ресайза пула
		var res = {};
		res.x = e.pageX - (e.pageX % snapRange);
		res.y = e.pageY - (e.pageY % snapRange);

		var x2 = res.x/actualZoom /*- pull.x()*/ - scalegroup.x()/actualZoom;
		var y2 = res.y/actualZoom /*- pull.y() */- scalegroup.y()/actualZoom;

		if (debuggable) console.log("x2=" + x2 + " y2=" + y2)


		if (x2 < pull.data('nmaxx')) x2 = pull.data('nmaxx')+1
		if (y2 < pull.data('nmaxy')) y2 = pull.data('nmaxy')+1

		if (x2 > pull.data('nmaxx') && y2 > pull.data('nmaxy')) {
			//if (debuggable) console.log("x2=" + x2 + " y2=" + y2 + " nmaxx=" + pull.data('nmaxx')+ " nmaxy=" + pull.data('nmaxy'))
			x2-=pull.x()
			y2-=pull.y()
			rect_outer.show().attr({ stroke: "green" });
			rect.size(x2, y2);
			rect_outer.size(x2+10, y2+10);
			clone.size(x2+12, y2+12);
			inner_text.attr({width: rect.height(), height: 30})
			inner_text.move(-rect.height(),0)
			arrow.move(x2-2, y2-2);
			del.move(-23, rect.height()-20);
			//moveforward.move(x2+3, 0);
			//moveback.move(x2+3, 20);
		} else {
			rect_outer.show().attr({ stroke: "#d9534f" });
		}
	};

	function stopResizePull() {
		if (debuggable) console.log("stopResizePull");
		rect_outer.hide().attr({ stroke: "green" });
		document.removeEventListener('mousemove', resizePull);
		document.removeEventListener('mouseup', stopResizePull);
		pull.draggy(function (x, y, elem) {
			var res = {};

			res.x = x - (x % snapRange);
			res.y = y - (y % snapRange);

			return res;
		});

		pull.data({
		  width: rect.width(),
		  height: rect.height()
		})

		$('.graph').on('mousedown', function(e) {
			$( this ).css('cursor', 'move')
			paning(e);
		})

	};

	//resizing
	arrow.mousedown(function() {

		pull.data('nmaxx', 0)
		pull.data('nmaxy', 0)

		scalegroup.each(function(i, children) {
			if (this.data('parent')==pull.attr('id')) {
				if (this.x() > pull.data('nmaxx')) { pull.data('nmaxx', this.x() + this.get(1).width()) }
				if (this.y() > pull.data('nmaxy')) { pull.data('nmaxy', this.y() + this.get(1).height()) }

				if (debuggable) console.log('this x ' + this.x() + ' this y ' + this.y() + ' nmaxx='+ pull.data('nmaxx')+ " nmaxy=" + pull.data('nmaxy'))
			}
		});

		if (debuggable) console.log("arrow.mousedown");
		pull.fixed();
		$('.graph').off('mousedown')
		document.addEventListener('mousemove', resizePull);
		document.addEventListener('mouseup', stopResizePull);
	});

	if (editable) {
		pull.mouseover(function() {
			if (rect_outer.attr('stroke') != "green" ) {
				rect_outer.show()
			}
		})
		pull.mouseout(function() {
			if (rect_outer.attr('stroke') != "green" ) {
				rect_outer.hide()
			}
		})

		pull.click(function(e) {
			//e.stopPropagation();
			rect_outer.show().attr({ stroke: "green" });

			arrow.show()
			del.show()
			settings.show()
			//moveforward.show();
			//moveback.show();

			document.addEventListener('mousedown', function(e){
				var xx = (e.pageX - scalegroup.x())/actualZoom;
				var yy = (e.pageY - scalegroup.y())/actualZoom;

				if (pull.inside(xx, yy)) {
					if (debuggable) console.log("inside");
				} else {
					if (e.target.nodeName != 'A') {
						if (debuggable) console.log(e.target.nodeName);
						if (debuggable) console.log("click on " + e.target.nodeName + " is outside");

						/*if ( $('#input_textarea').is(":visible") ) {
							if (debuggable) console.log("visible");
							$('#' + rect.attr('id')+'_inner_text').html($('#input_textarea').val());
							pull.data({inner_text: $('#input_textarea').val()});
							$('#input_textarea').hide()
						} */
						rect_outer.hide().attr({ stroke: "#d9534f" });
						arrow.hide();
						del.hide();
						settings.hide();

						// circ_outer.hide().attr({ stroke: "#d9534f" });
						$('#pull_dropdown li a').off()
						$('#pull_dropdown').hide()

						document.removeEventListener('mousedown', arguments.callee);

					}
				}
			});

		});

		pull.dblclick(function(e) {
			//e.stopPropagation();
			if (debuggable) console.log("pull dbl");

			var xx = pull.x()*actualZoom - $('#input_textarea').width()/2 + scalegroup.x();
			var yy = pull.y()*actualZoom + rect_outer.height()*actualZoom/2 + scalegroup.y();

			$('#input_textarea').val($('#' + rect.attr('id')+'_inner_text').html())
			$('#input_textarea').show()
			$('#input_textarea').css({'position':'absolute', 'left': xx, 'top': yy});
			$('#input_textarea').focus();

			document.addEventListener('mousedown', function(e){
				var xx = (e.pageX - scalegroup.x())/actualZoom;
				var yy = (e.pageY - scalegroup.y())/actualZoom;

				//e.pageX/actualZoom - pull.x() - scalegroup.x()/actualZoom;

				if (pull.inside(xx, yy)) {
					if (debuggable) console.log("inside");
				} else {
					if (e.target.nodeName != 'A') {
						if (debuggable) console.log(e.target.nodeName);
						if (debuggable) console.log("click on " + e.target.nodeName + " is outside");

						if ( $('#input_textarea').is(":visible") ) {
							if (debuggable) console.log("visible");
							$('#' + rect.attr('id')+'_inner_text').html($('#input_textarea').val());
							pull.data({inner_text: $('#input_textarea').val()});
							if ($('#input_textarea').val()!='') {
								inner_text.show();
							} else {
								inner_text.hide();
							}
							$('#input_textarea').hide()
						}

						// draw.hide();
						// del.hide();
						// settings.hide();

						// circ_outer.hide().attr({ stroke: "#d9534f" });



						document.removeEventListener('mousedown', arguments.callee);

					}
				}
			});


			e.stopPropagation();
		});

		settings.click(function(e) {
			var xx = e.pageX - $('.graph').offset().left;
			var yy = e.pageY - $('.graph').offset().top;

			$('#pull_dropdown').show()
			$('#pull_dropdown').css({'position':'absolute', 'left': xx, 'top': yy});
			$('#pull_dropdown li a').click(function(e) {
				if (debuggable) console.log(e.target.text);
				if (debuggable) console.log(e.target.id);

				if (e.target.className!='inactive') {
					if (debuggable) console.log(e.target.className)
					// текст от id
					switch (e.target.id) {
					  case 'pull_dropdown_card':
						new_window('/pls/gis/ais_wf.p_scheme.p_obj_admin?v_model_id=' + l_model_id + '&v_id=' + pull.attr('id'))
						break
					  default:
						new_window('/pls/gis/ais_wf.p_scheme.p_obj_admin?v_model_id=' + l_model_id + '&v_id=' + pull.attr('id'))
					};

					$('#pull_dropdown li a').off();
					$('#pull_dropdown').hide()
				}
			});
			e.stopPropagation();
		});

		del.click(function(e) {
			pull.remove();
			e.stopPropagation();
		});

		var movedx = 0;
		var movedy = 0;


		var clonegroup = svg.group().attr('pointer-events', 'none');
		var clone = svg.rect(width + 12, height + 12).attr({ fill: 'none', stroke: "blue", "stroke-width": 2, "stroke-dasharray": 2, "stroke-opacity"  : 0.5, 'pointer-events' : 'none' });
		clonegroup.add(clone).back().hide();
		scalegroup.add(clonegroup);
		clonegroup.move(pull.x()-4,pull.y()-4)
		var startx;
		var starty;

		pull.on('dragstart', function(e) {
			$('.graph').off('mousedown')

			startx = this.x()
			starty = this.y()

			//hide nodes
			scalegroup.each(function(i, children) {
				if (this.data('parent')==pull.attr('id')) {
					//console.log('parent ' + this.data('parent') + ' ' + this.attr('id'));
					this.hide();
				}
				//this.data('parents').split(',').indexOf(pull.attr('id'))

				//var arr = this.data('parents');

				if (this.data('parents')!=undefined && this.data('parents').split(',').indexOf(pull.attr('id'))!=-1) {
					//console.log('parents ' + this.data('parents') + ' ' + this.attr('id'));
					this.hide();
				}
				/*
				if (this.data('parents')==pull.attr('id')) {
					console.log('parents ' + this.data('parents') + ' ' + this.attr('id'));
					this.hide();
				}

				$.inArray(pull.attr('id'), this.data('parents').split(','))

				var arr = this.data('parents').split(',');
				*/

			});



		})

		var drgmove = false;

		pull.on('dragmove', function(e) {
			drgmove = true;
			//if (debuggable) console.log('dragmove');
			pull.hide()
			clonegroup.show()
			clonegroup.move(startx+movedx,starty+movedy)

			movedx = e.detail.delta.movedX
			movedy = e.detail.delta.movedY

			//clone.move(movedx, movedy)
			/*
			$('.graph').offset().left;
			$('.graph').offset().top;
			*/

			// if (debuggable) console.log('pageX=' + (e.detail.event.pageX - scalegroup.x())/actualZoom + ' pageY=' + (e.detail.event.pageY - scalegroup.y())/actualZoom );

			//draw red if inside other pull
			scalegroup.each(function(i, children) {
				if (this.data('type')=='pull') {
					if (this.inside((e.detail.event.pageX - scalegroup.x())/actualZoom, (e.detail.event.pageY - scalegroup.y())/actualZoom) && this.attr('id')!=pull.attr('id')) {
						// if (debuggable) console.log('2 pageX=' + (e.detail.event.pageX - scalegroup.x())/actualZoom + ' pageY=' + (e.detail.event.pageY - scalegroup.y())/actualZoom + ' inside ' + this.attr('id'));
						this.first().attr({ fill: 'red'});
						this.attr({ 'cursor': 'not-allowed'});
					} else {
						this.first().attr({ fill: '#f5f5f5'});
					}

				}
			});
		})

		pull.on('dragend', function(e) {
			clonegroup.hide()
			pull.show();

			//draw red if inside other pull
			scalegroup.each(function(i, children) {
				if (this.data('type')=='pull' && this.attr('id')!=pull.attr('id') ) {
					if (debuggable) console.log('eX=' + e.detail.event.pageX/actualZoom + ' eY=' + e.detail.event.pageY/actualZoom)
					if (this.inside((e.detail.event.pageX - scalegroup.x())/actualZoom, (e.detail.event.pageY - scalegroup.y())/actualZoom)) {
						if (debuggable) console.log('inside ' + this.attr('id'));
						pull.move(startx,starty)
						movedx = 0;
						movedy = 0;
						this.first().attr({ fill: '#f5f5f5'});
					}
					this.attr({ 'cursor': 'default'});
				}
			});

			scalegroup.each(function(i, children) {
				if (this.data('parent')==pull.attr('id')) {
					this.show()
					if(this.data('type')!='connection') {
						this.dmove(movedx, movedy)
					}
					if (drgmove) updatePolyline(this.attr('id'))
				}

				if (this.data('parents')!=undefined && this.data('parents').split(',').indexOf(pull.attr('id'))!=-1) {
					//console.log('parents ' + this.data('parents') + ' ' + this.attr('id'));
					this.show();
				}
			});


			movedx = 0;
			movedy = 0;

			$('.graph').on('mousedown', function(e) {
				$( this ).css('cursor', 'move')
				paning(e);
			})
		})
	} else {
		inner_text.click(function(e) {
			var xx = e.pageX - $('.graph').offset().left;
			var yy = e.pageY - $('.graph').offset().top;

			$('#preview_dropdown').show()
			$('#preview_dropdown').css({'position':'absolute', 'left': xx, 'top': yy});
			$('#preview_dropdown li a').click(function(e) {
				if (debuggable) console.log(e.target.text);
				if (debuggable) console.log(e.target.id);

				if (e.target.className!='inactive') {
					if (debuggable) console.log(e.target.className)
					// иконка от id
					switch (e.target.id) {
					  case 'preview_dropdown_card':
						if (adminable) {
							new_window('/pls/gis/ais_wf.p_scheme.p_obj_admin?v_model_id=' + l_model_id + '&v_id=' + pull.attr('id'))
						} else {
							new_window('/pls/gis/ais_wf.p_scheme.p_obj_see?v_proc_id=' + l_proc_id + '&v_id=' + pull.attr('id'))
						}
						break
					  default:
						new_window('/pls/gis/ais_wf.p_scheme.p_obj_admin?v_model_id=' + l_model_id + '&v_id=' + pull.attr('id'))
					};

					$('#preview_dropdown li a').off();
					$('#preview_dropdown').hide()
				}
			});

			document.addEventListener('mousedown', function(e){
				var xx = (e.pageX - scalegroup.x())/actualZoom;
				var yy = (e.pageY - scalegroup.y())/actualZoom;

				if (inner_text.inside(xx, yy)) {
					if (debuggable) console.log("inside");
					//document.removeEventListener('mousedown', arguments.callee);
				} else {
					if (e.target.nodeName != 'A') {
						if (debuggable) console.log("click on " + e.target.nodeName + " is outside");

						$('#preview_dropdown li a').off();
						$('#preview_dropdown').hide()

						document.removeEventListener('mousedown', arguments.callee);
					}
				}
			});
		})
	}
};

var l_model_id;
var l_proc_id;

function saveGraph() {
	$('#loader').show();
	var nodes = []
	var links = []

	//nodes
	scalegroup.each(function(i, children) {
		if (this.data('isnode')) {
			if (debuggable) console.log('push ' + this.attr('id'));
			nodes.push({
				id: this.attr('id'),
				type: this.data('type'),
				subtype: this.data('subtype'),
				inner_type: this.data('inner_type'),
				inner_text: this.data('inner_text'),
				oraid: this.data('oraid'),
				positionX: this.x(),
				positionY: this.y(),
				width: this.data('width'),
				height: this.data('height'),
				zindex: this.data('zindex'),
				parent: this.data('parent')
			});
		}
	});

	//pulls
	scalegroup.each(function(i, children) {
		if (this.data('type')=='pull') {
			if (debuggable) console.log('push ' + this.attr('id'));
			nodes.push({
				id: this.attr('id'),
				type: this.data('type'),
				subtype: this.data('subtype'),
				inner_type: this.data('inner_type'),
				inner_text: this.data('inner_text'),
				oraid: this.data('oraid'),
				positionX: this.x(),
				positionY: this.y(),
				width: this.data('width'),
				height: this.data('height'),
				zindex: this.data('zindex')
			});
		}
	});


	//connections
	scalegroup.each(function(i, children) {
		if (this.data('type')=='connection') {
			if (debuggable) console.log('conn push ' + this.attr('id'));
			links.push({
				id: this.attr('id'),
				type: this.data('type'),
				inner_text: this.data('inner_text'),
				positionX: this.data('positionX'),
				positionY: this.data('positionY'),
				/*oraid: this.data('oraid'),*/
				idfrom: this.data('idfrom'),
				idto: this.data('idto'),
				pos_from: this.data('pos_from'),
				pos_to: this.data('pos_to'),
				dash: this.data('dash')
			});
		}
	});


	var flowChart = {};
	flowChart.nodes = nodes;
	flowChart.links = links;

	var flowChartJson = JSON.stringify(flowChart);

	$('#jsonOutput').text(flowChartJson);

	var data_send= flowChartJson;//JSON.stringify(JSON.parse(data)) ;//проверка на целостность json
	data_send=encodeURI(data_send);
	//var model_id=5;//id схемы в оракле

	var result;
	$.ajax({
		url:'ais_wf.p_model_json.p_add',
		type:'POST',
		data: {v_scheme:data_send,v_model_id:l_model_id,v_uniq_id:Math.random()},
		contentType: "application/x-www-form-urlencoded;charset=windows-1251",
		//contentType: "application/x-www-form-urlencoded;charset=UTF-8",
		async: false,
		response:'text',
		success:function (msg){result=msg}
	});
	result=result.replace("\n","")
	var arr=result.split(";");
	var n,v,status_save,text_error;
	for(var i=0;i< arr.length;i++){
		if (arr[i]!="" && arr[i].search(":")>0){
			n=arr[i].substr(0,arr[i].search(":"));
			v=arr[i].substr(arr[i].search(":")+1);
			if (n=="model_id")l_model_id=v;
			if (n=="status")status_save=v;
			if (n=="text_error")text_error=v;
		}
	}
	(status_save=="Ok") ? alert("Успешно, модель id=" + l_model_id) : alert("Ошибка. " + text_error);



	setTimeout(function() { $("#loader").hide() }, 500);

};

function loadGraph(model_id, is_edit, is_admin, proc_id){

	//set defaults if necessary
	model_id = typeof model_id !== 'undefined' ? model_id : 5; //id схемы в оракле
	is_edit = typeof is_edit !== 'undefined' ? is_edit : true;
	is_admin = typeof is_admin !== 'undefined' ? is_admin : true;
	proc_id = typeof proc_id !== 'undefined' ? proc_id : 0; //id процесса

	editable = is_edit;
	adminable = is_admin
	console.log('editable=' + editable + ' adminable=' + adminable + ' preview=' + is_preview)



	l_model_id = model_id;
	l_proc_id = proc_id;

	//max x and y to adjust svg size and correct start point to (0,0)
	var maxx=-9007199254740991;
	var maxy=-9007199254740991;
	var minx=9007199254740991;
	var miny=9007199254740991;
	var result;

	//del current nodes
		/*
	scalegroup.each(function(i, children) {
		if (this.data('isnode') || this.data('type')=='connection' || this.data('type')=='pull') {
			this.remove();
		}
	});*/


	$.ajax({
	  //url:'ais_wf.p_model_json.p_load',
    url:'data.txt',
    //type:'POST',
    type:'GET',
	  //data: {v_model_id:model_id,v_proc_id:proc_id,v_uniq_id:Math.random()},
	  async: false,
	  response:'text',
	  success:function (msg){
      //console.log("result " + msg);
      result=msg.trim()
    }
	});



	if (result=='no_data_found') {
		if (!editable) {
			$('.graph').html('Нет данных');
			$('.graph').height(20);
			console.log("!editable");
		}
		console.log("editable but no data");
		//return;
	} else {

		var data = JSON.stringify(JSON.parse(result), null, ' ');//проверка на целостность json

		//alert(result)
		//alert(data)

		if (debuggable) var flowChartJson = $('#jsonOutput').text();
		if (debuggable) console.log("flowChartJson " + flowChartJson);
		var flowChart = JSON.parse(data);
		var nodes = flowChart.nodes;
		var links = flowChart.links;
		if (debuggable) console.log("nodes " + nodes + " links " + links);

		/*fix for several focused nodes*/
		console.log("focus_id " + flowChart.focus_id);
		focused_node = flowChart.focus_id.split(':')
		console.log("focused_nodes " + focused_node);

		if (debuggable) {
			focused_node.forEach(function(entry) {
				console.log(entry);
			});
		}

		/*fix for several passed nodes*/
		console.log("passed_id " + flowChart.passed_id);
		passed_node = flowChart.passed_id.split(':')
		console.log("focused_nodes " + passed_node);

		//offseting
		$.each(nodes, function( index, elem ) {
			if (elem.positionX < minx) minx = elem.positionX;
			if (elem.positionY < miny) miny = elem.positionY;
		});

		if (debuggable) console.log("min x=" + minx + " y=" + miny);

		x_offset = minx;
		y_offset = miny;

		if (debuggable) console.log("x_offset=" + x_offset + " y_offset=" + y_offset);
		if (!editable) {
			x_offset -= 10;
			y_offset -= 10;
		} else {
			x_offset -= 100;
			y_offset -= 100;
		}

		if (debuggable) console.log("x_offset=" + x_offset + " y_offset=" + y_offset);

    //find max id
    var maxids = [];

		//drawing
		$.each(nodes, function( index, elem ) {
			if (elem.type === 'circle') {
				addCircle(elem.subtype, elem.inner_type, elem.inner_text, elem.id, elem.oraid, elem.positionX-x_offset, elem.positionY-y_offset, elem.parent)
				if (debuggable) console.log("loading " + elem.type + " with id=" + elem.id);
				if (elem.positionX > maxx) maxx = elem.positionX;
				if (elem.positionY > maxy) maxy = elem.positionY;
			} else if (elem.type === 'task') {
				addTask(elem.inner_type, elem.inner_text, elem.id, elem.oraid, elem.positionX-x_offset, elem.positionY-y_offset, elem.parent)
				if (debuggable) console.log("loading " + elem.type + " with id=" + elem.id);
				if (elem.positionX > maxx) maxx = elem.positionX;
				if (elem.positionY > maxy) maxy = elem.positionY;
			} else if (elem.type === 'decision') {
				addDecision(elem.inner_type, elem.inner_text, elem.id, elem.oraid, elem.positionX-x_offset, elem.positionY-y_offset, elem.parent)
				if (debuggable) console.log("loading " + elem.type + " with id=" + elem.id);
				if (elem.positionX > maxx) maxx = elem.positionX;
				if (elem.positionY > maxy) maxy = elem.positionY;
			} else if (elem.type === 'pull') {
				addPull(elem.inner_text, elem.id, elem.oraid, elem.positionX-x_offset, elem.positionY-y_offset, elem.width, elem.height, elem.zindex)
				if (debuggable) console.log("loading " + elem.type + " with id=" + elem.id);
				if (elem.positionX + elem.width > maxx) maxx = elem.positionX + elem.width;
				if (elem.positionY + elem.height > maxy) maxy = elem.positionY + elem.height;
				if (debuggable) console.log("pull x " + elem.positionX + " y " + elem.positionY + " w " + elem.width + " h " + elem.height);
				if (debuggable) console.log("pull max " + maxx + " & " + maxy);
			} else {
				if (debuggable) console.log("loading " + elem.type + " with id=" + elem.id);
			}
      maxids.push(parseInt(elem.id.substr(elem.id.indexOf("G")+1)))
		});

		$.each(links, function( index, elem ) {
			drawPolyline(elem.idfrom, elem.idto, elem.inner_text, elem.positionX-x_offset, elem.positionY-y_offset, elem.id, elem.pos_from, elem.pos_to, elem.dash)
      maxids.push(parseInt(elem.id.substr(elem.id.indexOf("G")+1)))
		});

    //find max id
    SVG.did = Math.max.apply(null, maxids);
    console.log("SVG.did " + SVG.did);
    // SVG.did = 1000

		if (debuggable) console.log("max x=" + maxx + " y=" + maxy);


		if (is_preview) {
			svg.viewbox(0, 0, maxx-x_offset+10, maxy-y_offset+10)
		}

		/*if (editable) {
			if (debuggable) console.log($('.graph').width() + ' ' + $('.graph').height());

			if ($('.graph').width() < maxx+100) svg.width(maxx+100)
			if ($('.graph').height() < maxy+100) svg.height(maxy+100)

			window.onresize = function(event) {
				if ($('.graph').width() < maxx+100) {
					svg.width(maxx+100)
				} else {
					if (debuggable) console.log($('.graph').width());
					svg.width('100%')
				}
				if ($('.graph').height() < maxy+100) {
					svg.height(maxy+100)
				} else {
					svg.height('100%')
				}
			};
		}
		else {
			svg.viewbox(0, 0, maxx+100, maxy+100)
		}*/
	}

	if (editable) {
		window.onbeforeunload = function (e) {
			e = e || window.event;

			// For IE and Firefox prior to version 4
			if (e) {
				e.returnValue = 'Вы действительно хотите закрыть окно?';
			}
			// For Safari
			return 'Вы действительно хотите закрыть окно?';
		};
	}

	if (!is_preview) {
		$('.graph').on('mousedown', function(e) {
			$( this ).css('cursor', 'move')
			paning(e);
		})
	}

};

function drawLine(idfrom, idto){
	var elementfrom = SVG.get(idfrom);
	var elementto = SVG.get(idto);

	var cnn = elementfrom.connectable({
		container: links,
		markers: markers
	}, elementto);
	cnn.setLineColor("#f0ad4e");

	connections.push({
		idfrom: cnn.source.attr('id'),
		idto: cnn.target.attr('id')

	});

	if (debuggable) console.log('source=' + cnn.source + " targ=" + cnn.target);
	if (debuggable) console.log('line id=' + cnn.line.attr('id'));
};

function delLine(nodeid) {
	if (debuggable) console.log("nodeid=" + nodeid)
	$.each(lines, function( index, elem ) {
		if (debuggable) console.log("before id=" + elem.lineid + " from=" + elem.idfrom + " to=" + elem.idto)
	});
	lines = $.grep(lines, function (elem, index) {
		if (elem.idfrom == nodeid || elem.idto == nodeid) {
			SVG.get(elem.lineid).remove();
			if (debuggable) console.log("index=" + index)
			return false;
		}
		return true; // keep the element in the array
	});

	$.each(lines, function( index, elem ) {
		if (elem.idfrom == nodeid || elem.idto == nodeid) {
			SVG.get(elem.lineid).remove();
			lines.splice(index,1)
			if (debuggable) console.log("index=" + index)
		}
	});

	$.each(lines, function( index, elem ) {
		if (debuggable) console.log("after id=" + elem.lineid + " from=" + elem.idfrom + " to=" + elem.idto)
	});
};


function goBack() {
	console.log('go back')

	steps.forEach(function(entry) {
		console.log(entry);
	});

	var todel = steps.pop();

	delPolyline(todel.id);
	SVG.get(todel.id).remove();


};

var MAX_ZOOM_IN = 2.0;
var MAX_ZOOM_OUT = 0.5;
var zoomStep = 0.2;
var actualZoom = 1.0;
var MOVE_STEP = 100;
if (scalable) {
	$('.graph').on('mousewheel', function(e) {
		 if (debuggable) console.log(e.deltaX, e.deltaY, e.deltaFactor);
		 if (e.deltaY>0 && actualZoom < MAX_ZOOM_IN) {
			actualZoom += zoomStep;
			scalegroup.scale(actualZoom, actualZoom)
			if (debuggable) console.log("zoomin to " + actualZoom)
		} else {

			if (actualZoom > MAX_ZOOM_OUT) {
				actualZoom -= zoomStep;
				scalegroup.scale(actualZoom, actualZoom)
				if (debuggable) console.log("zoomout to " + actualZoom)
			}

		}
	})
}



function paning(e) {

	var stx = e.pageX;
	var sty = e.pageY;
	var mx
	var my

	$('.graph').on('mousemove', function(e) {
		/*if (e.pageX>stx) { mx = 1}
		else if (e.pageX<stx) { mx = -1}
		else mx=0

		if (e.pageY>sty) { my = 1}
		else if (e.pageY<sty) { my = -1}
		else my=0*/


		mx = e.pageX - stx
		my = e.pageY - sty

		scalegroup.dmove(mx,my)
		stx = e.pageX;
		sty = e.pageY;
	})
	$('.graph').on('mouseup', function(e) {
		//console.log('up x=' +scalegroup.x() + ' y='+ scalegroup.y())
		$( this ).css('cursor', 'default')
		$( this ).off('mousemove')
	})
};





/*
SVG.on(window, 'mousedown', function(e) {
	console.log('mousedown');
	SVG.on(window, 'mousemove', function(e) {
		console.log('move');
	})
})

SVG.on(window, 'mouseup', function(e) {
	console.log('mouseup');
	SVG.off(window, 'mousemove', function(e) {
		console.log('move');
	})
})*/


// var MAX_ZOOM_IN = 2.0;
// var MAX_ZOOM_OUT = 0.2;
// var zoomStep = 0.2;
// var actualZoom = 1.0;
// var MOVE_STEP = 100;

// var circle = svg.circle(3)
// var circle = svg.circle(3)
// var text = svg.text('0,0').move(5,5)
// scalegroup.add(circle)
// scalegroup.add(text)
// scalegroup.draggy();

function zooming(opt) {
	if (opt==1) {
		actualZoom += zoomStep;
		scalegroup.scale(actualZoom, actualZoom)
		if (debuggable) console.log("zoomin to " + actualZoom)
	} else {
		actualZoom -= zoomStep;
		scalegroup.scale(actualZoom, actualZoom)
		if (debuggable) console.log("zoomout to " + actualZoom)
	}

};
