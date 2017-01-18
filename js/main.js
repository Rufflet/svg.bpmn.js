/*
svg 223 version
remastered
build 160120171014
*/

/*
TODO:
- перевести на объекты
- вынести общие фукнции во внешнее окружение (м.б. сделать плагины - поиск точки на окружности, на линии и т.д.)

*/
function new_window(P_URL){
 var p_height=screen.availHeight-50;
 var p_width=screen.availWidth-25;
 w=window.open(P_URL,"","toolbar=no,location=no,menubar=no,scrollbars,top=15,screenX=15,screenY=15,left=15,height="+p_height+",width="+p_width+",resizable");
 if(w.opener==null)w.opener=self;
 w.focus();
}

SVG.extend(SVG.G, {
  insideGbox: function(x, y) {
    var bbox = this.bbox()
      , scgtransf = scalegroup.transform() //TODO: заменить на parent или doc
      , thistransf = this.transform()
      , xx = (bbox.x + thistransf.x) * scgtransf.scaleX + scgtransf.x
      , yy = (bbox.y + thistransf.y) * scgtransf.scaleY + scgtransf.y
      , ww = bbox.w * scgtransf.scaleX
      , hh = bbox.h * scgtransf.scaleY

    //for visualisation
    /*console.log('bbox.x=' + bbox.x + ' bbox.y=' + bbox.y + ' bbox.w=' + bbox.w + ' bbox.h=' + bbox.h);
    console.log('scgtransf ',  scgtransf);
    console.log('thistransf ',  thistransf);
    console.log('point.x=' + x + ' point.y=' + y + ' xx=' + xx + ' yy=' + yy + ' ww=' + ww + ' hh=' + hh);
*/
    /*var circle = svg.circle(5).attr({ fill: 'pink' }).move(x-2.5, y-2.5)
    var brect = svg.rect(ww, hh).move(xx,yy).attr({ fill: 'none', stroke: "orange", "stroke-width": 1, "stroke-opacity"  : 0.7 })
    circle.animate(2500).attr({ opacity: 0})
    brect.animate(2500).stroke({ opacity: 0})*/

    return x > xx
        && y > yy
        && x < xx + ww
        && y < yy + hh
  }
})

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

//var svg = SVG($(".graph").get(0)).size("100%", "100%").spof();
var svg = SVG('baseLayer')

//var links = svg.group();
var markers = svg.group();

var scalegroup = svg.group().attr('id', 'scalegroup').size("100%", "100%");

//zero point
var zeropoint = svg.group().attr('id', 'zeropoint');
zeropoint.add(svg.rect(30,2).attr({ fill: '#cccccc' }).style('pointer-events:none;').move(-16, -2))
zeropoint.add(svg.rect(3,30).attr({ fill: '#cccccc' }).style('pointer-events:none;').move(-2, -16))
zeropoint.add(svg.plain('(0,0)').attr({ fill: '#cccccc' }).style('pointer-events:none;').addClass('noselect').move(-40, -20))
scalegroup.add(zeropoint)



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
/*var marker_top = svg.rect(20,10).attr({ fill: 'green', stroke: "#000", "stroke-width": 1 }).move(0, 0).hide(),
	marker_bottom = svg.rect(20,10).attr({ fill: 'green', stroke: "#000", "stroke-width": 1 }).move(0, 0).hide()
scalegroup.add(marker_top)
scalegroup.add(marker_bottom)*/

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
	xcoor = typeof xcoor !== 'undefined' ? xcoor : (200-scalegroup.x())/actualZoom;
	ycoor = typeof ycoor !== 'undefined' ? ycoor : (200-scalegroup.y())/actualZoom;
	id = typeof id !== 'undefined' ? id : -1;
	oraid = typeof oraid !== 'undefined' ? oraid : -1;
	parent = typeof parent !== 'undefined' ? parent : -1;


  //store all bpmnlines
  var connections = [];

	var circ_focus = svg.circle(60).attr({ fill: 'none', stroke: "#cd4436", "stroke-width": 4, "stroke-opacity"  : 0.7 }).move(-30,-30).hide();
	var circ_outer = svg.circle(60).attr({ fill: 'none', stroke: "#d9534f", "stroke-width": 2, "stroke-dasharray": 4, "stroke-opacity"  : 0.5 }).move(-30,-30).hide();
	var circ = svg.circle(50).move(-25,-25);
	var circ_inner = svg.circle(42).attr({ fill: '#f5f5f5', stroke: "#000", "stroke-width": 2 }).move(-21,-21);
	//var connection;

  //фон для меню
  var menu_backgrnd = svg.rect(25,80)
                         .attr({ fill: '#ececec', opacity: 0.7 })
                         .move(26,-37)
                         .hide()

  var draw = svg.plain('\ue801')
                .attr({cursor: 'pointer'})
                .font({family: 'fontello', size: 20})
                .move(32,-35)
                .hide()

  var settings = svg.plain('\ue802')
                    .attr({cursor: 'pointer'})
                    .font({family: 'fontello', size: 20})
                    .move(30,-10)
                    .hide()

  var del = svg.plain('\ue800')
               .attr({cursor: 'pointer'})
               .font({family: 'fontello', size: 20})
               .move(30,15)
               .hide()

  var inner_type = svg.plain('')
                      .font({family: 'fontello', size: 20})
                      .addClass('noselect')
                      .move(-9,6)

	if (subtype==1) {
		// иконка от innertype
		switch (innertype) {
		  case 'start_dropdown_1':
      inner_type.plain('')
			//$('#' + circ.attr('id')+'_inner_type').html('');
			break
		  case 'start_dropdown_2':
			$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-mail"></i>');
			break
		  case 'start_dropdown_3':
			$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-clock"></i>');
			break
		  case 'start_dropdown_4':
      inner_type.plain('\ue805')
      //$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-doc-text"></i>');
			break
		  case 'start_dropdown_5':
      inner_type.plain('\ue807')
			//$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-collapse"></i>');
			break
		  case 'start_dropdown_6':
			$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-target"></i>');
			break
		  case 'start_dropdown_7':
			$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-plus"></i>');
			break
		  default:
      inner_type.plain('')
			//$('#' + circ.attr('id')+'_inner_type').html('');
		};
	} else if (subtype==2) {
			// иконка от innertype
			switch (innertype) {
			  case 'inter_dropdown_1':
        inner_type.plain('')
				//$('#' + circ.attr('id')+'_inner_type').html('');
				break
			  case 'inter_dropdown_2':
        inner_type.plain('\ue803')
				//$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-mail"></i>');
				break
			  case 'inter_dropdown_3':
        inner_type.plain('\ue804')
				//$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-clock"></i>');
				break
			  case 'inter_dropdown_4':
        inner_type.plain('\ue814')
				//$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-mail-alt"></i>');
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
        inner_type.plain('')
				//$('#' + circ.attr('id')+'_inner_type').html('');
			};
	} else {
			// иконка от innertype
			switch (innertype) {
			  case 'end_dropdown_1':
        inner_type.plain('')
				//$('#' + circ.attr('id')+'_inner_type').html('');
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
        inner_type.plain('\ue807')
				//$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-collapse"></i>');
				break
			  case 'end_dropdown_8':
				$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-target"></i>');
				break
			  case 'end_dropdown_9':
				$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-circle"></i>');
				break
			  default:
        inner_type.plain('')
				//$('#' + circ.attr('id')+'_inner_type').html('');
			};
	};


  var inner_text = svg.text('')
                      .style('cursor:default;')
                      .addClass('noselect')
                      .move(-30,25)
                      .hide();

	if (innertext!='') {
    inner_text.show();
    //innertext = innertext.split('\n');
    inner_text.text(function(add) {
      $.each(innertext.split('\n'), function(k, val){
        add.tspan(val).newLine()
      });
    })
    var linesset = inner_text.lines()
    linesset.each(function(i, children) {
      this.dx(-this.length()/2+25)
    })
  }

	var circle = svg.group();
		circle.add(circ_focus);
		circle.add(circ_outer);
		circle.add(circ);
		circle.add(circ_inner);
    circle.add(menu_backgrnd);
		circle.add(draw);
		circle.add(del);
		circle.add(settings);
		circle.add(inner_type);
		circle.add(inner_text);

		if (!editable) {
			circle.attr('cursor','pointer')
		} else {
			circle.draggy(function (x, y, elem) {
        var res = {};
        res.x = x - (x % snapRange);
        res.y = y - (y % snapRange);
        scalegroup.each(function(i, children) {
          if (circle.attr('id')!=this.attr('id')) {
            if (Math.abs(this.x()-res.x)<10) res.x= this.x()
            if (Math.abs(this.y()-res.y)<10) res.y= this.y()
          }
        })
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

		//var x2 = (e.pageX - scalegroup.x())/actualZoom;
		//var y2 = (e.pageY - scalegroup.y())/actualZoom;

		line.remove();
    //if (!circle.insideGbox(x2, y2)) {
		if (!circle.insideGbox(e.pageX, e.pageY)) {
			scalegroup.each(function(i, children) {
        //if (this.insideGbox(x2, y2)) {
        if (this.data('isnode')==true && this.insideGbox(e.pageX, e.pageY)) {
					if (debuggable)	console.log('try to connect with ' + this.attr('id'));

					if (this.data('isnode')==true && this.data('type')!='pull') {
						//drawPolyline(circle.attr('id'), this.attr('id'));
            scalegroup.add( svg.bpmnline( { fromid: circle.attr('id'), toid: this.attr('id') } ) );
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
        var scgtransf = scalegroup.transform()
        var thistransf = circle.transform()
        var xx = thistransf.x * scgtransf.scaleX + scgtransf.x
        var yy = thistransf.y * scgtransf.scaleY + scgtransf.y
				if (this.insideGbox(xx, yy)) {
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
        var scgtransf = scalegroup.transform()
        var thistransf = circle.transform()
        var xx = thistransf.x * scgtransf.scaleX + scgtransf.x
        var yy = thistransf.y * scgtransf.scaleY + scgtransf.y
				if (this.insideGbox(xx, yy)) {
					if (debuggable)	console.log('end inside ' + this.attr('id'));
					circle.data('parent', this.attr('id'))
					found = true;
				} else {
					if (debuggable) console.log('end not inside ' + this.attr('id'));
					circle.data('parent', null)
				}
				this.first().hide();
			}
		});
		if (drgmove) {
      scalegroup.each(function(i, children) {
        if (this.data('idfrom')==circle.attr('id') || this.data('idto')==circle.attr('id')) {
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
						inner_type.plain('')
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
            inner_type.plain('\ue805')
            //$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-doc-text"></i>');
						circle.data({inner_type: e.target.id})
						break
					  case 'start_dropdown_5':
						//$('#' + circ.attr('id')+'_inner_type').html('<i class="icon-collapse"></i>');
            inner_type.plain('\ue807')
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
						//$('#' + circ.attr('id')+'_inner_type').html('');
            inner_type.plain('')
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
						inner_type.plain('')
						circle.data({inner_type: e.target.id})
						break
					  case 'inter_dropdown_2':
						inner_type.plain('\ue803')
						circle.data({inner_type: e.target.id})
						break
					  case 'inter_dropdown_3':
						inner_type.plain('\ue804')
						circle.data({inner_type: e.target.id})
						break
					  case 'inter_dropdown_4':
						inner_type.plain('\ue814')
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
						inner_type.plain('')
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
						inner_type.plain('')
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
						inner_type.plain('\ue807')
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
						inner_type.plain('')
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
		circ_inner.hide()
	} else if (subtype==2) {
		circ.attr({ fill: '#f5f5f5', stroke: "#3F48CC", "stroke-width": 2 })
		circ_inner.attr({ stroke: "#3F48CC" })
	} else {
		circ.attr({ fill: '#f5f5f5', stroke: "#ED1C24", "stroke-width": 4 })
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
					circ_inner.hide()
				} else if (subtype==2) {
					circ.attr({ fill: '#f5f5f5', stroke: "#3F48CC", "stroke-width": 2 })
					circ_inner.attr({ stroke: "#3F48CC" })
				} else {
					circ.attr({ fill: '#f5f5f5', stroke: "#ED1C24", "stroke-width": 4 })
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

			var xx = (circle.x()-35)*actualZoom - $('#input_textarea').width()/4 + scalegroup.x();
			var yy = (circle.y()-35)*actualZoom + circ_outer.height()*actualZoom + scalegroup.y();

			// var xx = pull.x()*actualZoom - $('#input_textarea').width()/2 + scalegroup.x();
			// var yy = pull.y()*actualZoom + rect_outer.height()*actualZoom/2 + scalegroup.y();

			$('#input_textarea').val(inner_text.text())
			$('#input_textarea').show()
			$('#input_textarea').css({'position':'absolute', 'left': xx, 'top': yy});
			$('#input_textarea').focus();

			document.addEventListener('mousedown', function(e){
				if (circle.insideGbox(e.pageX, e.pageY)) {
					if (debuggable) console.log("inside");
				} else {
					if (e.target.nodeName != 'A' && e.target.nodeName != 'TEXTAREA' ) {
						if (debuggable) console.log(e.target.nodeName);
						if (debuggable) console.log("click on " + e.target.nodeName + " is outside");

						if ( $('#input_textarea').is(":visible") ) {
							if (debuggable) console.log("visible");

							$('#input_textarea').hide()

              if ($('#input_textarea').val()!='') {
								inner_text.show();

                innertext = $('#input_textarea').val();

                inner_text.text(function(add) {
                  $.each(innertext.split('\n'), function(k, val){
                    add.tspan(val).newLine()
                  });
                })

                var linesset = inner_text.lines()
                if (debuggable) console.log("linesset", linesset);
                linesset.each(function(i, children) {
                  if (debuggable) console.log("this id " + this.attr('id') + " this.length " + this.length());
                  this.dx(-this.length()/2+25)
                })
                circle.data('inner_text', inner_text.text());
                if (debuggable) console.log("INNER TEXT " + inner_text.text());

							} else {
								inner_text.hide();
                inner_text.clear();
							}
						}
            menu_backgrnd.hide();
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
      circle.front();
			circ_outer.show().attr({ stroke: "green" });
      menu_backgrnd.show();
			draw.show();
			del.show();
			settings.show();
			if (debuggable) console.log("circle click");
			//event.stopPropagation();
			document.addEventListener('mousedown', function(e){
				var xx = (e.pageX - scalegroup.x())/actualZoom;
				var yy = (e.pageY - scalegroup.y())/actualZoom;

        if (circle.insideGbox(e.pageX, e.pageY)) {
					if (debuggable) console.log("inside");
					//document.removeEventListener('mousedown', arguments.callee);
				} else {
					if (e.target.nodeName != 'A' && e.target.nodeName != 'TEXTAREA' ) {
						if (debuggable) console.log("click on " + e.target.nodeName + " is outside");
            menu_backgrnd.hide();
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
					//var xx = (e.pageX - scalegroup.x())/actualZoom;
					//var yy = (e.pageY - scalegroup.y())/actualZoom;

					if (circle.insideGbox(e.pageX, e.pageY)) {
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
		//if (debuggable) console.log("draw click");
		line = svg.line(circle.cx(), circle.cy(), circle.cx(), circle.cy()).stroke({ width: 1 });

		document.addEventListener('mousemove', procDrawLine);
		document.addEventListener('click', stopDrawLine);
		e.stopPropagation();
	});

	del.click(function(e) {
    deleteBPMNline(circle.attr('id'));
		circle.remove();
		e.stopPropagation();
	});
};

function addTask(innertype, innertext, id, oraid, xcoor, ycoor, parent) {

	//set defaults if necessary
	innertype = typeof innertype !== 'undefined' ? innertype : 'task_dropdown_1';
	innertext = typeof innertext !== 'undefined' ? innertext : '';
	xcoor = typeof xcoor !== 'undefined' ? xcoor : (150-scalegroup.x())/actualZoom;
	ycoor = typeof ycoor !== 'undefined' ? ycoor : (150-scalegroup.y())/actualZoom;
	id = typeof id !== 'undefined' ? id : -1;
	oraid = typeof oraid !== 'undefined' ? oraid : -1;
	parent = typeof parent !== 'undefined' ? parent : -1;

	var rect_focus = svg.rect(110, 90).attr({ fill: 'none', stroke: "#cd4436", "stroke-width": 4, "stroke-opacity"  : 0.7 }).move(-55,-45).hide();
	var rect_outer = svg.rect(110, 90).attr({ fill: 'none', stroke: "#d9534f", "stroke-width": 2, "stroke-dasharray": 4, "stroke-opacity"  : 0.5 }).move(-55,-45).hide();
	var rect = svg.rect(100, 80).attr({ fill: '#f5f5f5', stroke: "#7092BE", "stroke-width": 2 }).move(-50,-40);

  //фон для меню
  var menu_backgrnd = svg.rect(25,80)
                         .attr({ fill: '#ececec', opacity: 0.7 })
                         .move(52,-47)
                         .hide();

  var draw = svg.plain('\ue801')
                .attr({cursor: 'pointer'})
                .font({family: 'fontello', size: 20})
                .move(57,-45)
                .hide();

  var settings = svg.plain('\ue802')
                    .attr({cursor: 'pointer'})
                    .font({family: 'fontello', size: 20})
                    .move(55,-20)
                    .hide();

  var del = svg.plain('\ue800')
               .attr({cursor: 'pointer'})
               .font({family: 'fontello', size: 20})
               .move(55,5)
               .hide();

  var inner_type = svg.plain('')
                      .font({family: 'fontello', size: 20})
                      .addClass('noselect')
                      .move(-50,58)

	switch (innertype) {
	  case 'task_dropdown_1':
    inner_type.plain('\ue811')
		break
	  case 'task_dropdown_2':
		$('#' + rect.attr('id')+'_inner_type').html('<i class="icon-right-hand"></i>');
		break
	  case 'task_dropdown_3':
    inner_type.plain('\ue812')
		break
	  case 'task_dropdown_4':
    inner_type.plain('\ue81b')
		break
	  case 'task_dropdown_5':
		$('#' + rect.attr('id')+'_inner_type').html('<i class="icon-table"></i>');
		break
	  case 'task_dropdown_6':
    inner_type.plain('\ue814')
		break
	  case 'task_dropdown_7':
    inner_type.plain('\ue803')
		break
	  case 'task_dropdown_8':
		inner_type.style('border', 'none');
		$('#' + rect.attr('id')+'_inner_type').html('');
		break
	  default:
		inner_type.plain('\ue811')
	};

  var inner_text = svg.text('')
                      .style('cursor:default;')
                      .addClass('noselect')
                      .move(-50,-45)
                      .hide();

  if (innertext!='') {
    inner_text.show();
    //innertext = innertext.split('\n');
    inner_text.text(function(add) {
      $.each(innertext.split('\n'), function(k, val){
        add.tspan(val).newLine()
      });
    })
    var linesset = inner_text.lines()
    linesset.each(function(i, children) {
      this.dx(-this.length()/2+50)
    })
  }

	if (debuggable) console.log(rect.attr('id'))

	var task = svg.group();
		task.add(rect_focus);
		task.add(rect_outer);
		task.add(rect);
    task.add(menu_backgrnd);
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

        scalegroup.each(function(i, children) {
          if (task.attr('id')!=this.attr('id')) {
            if (Math.abs(this.x()-res.x)<10) res.x= this.x()
            if (Math.abs(this.y()-res.y)<10) res.y= this.y()
          }
        })
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

		line.plot(x1, y1, x2, y2).attr({stroke: '#333333', 'stroke-dasharray': '2,2'});
	};

	function stopDrawLine(e){
		if (debuggable) console.log("stop");
		document.removeEventListener('mousemove', procDrawLine);
		document.removeEventListener('click', stopDrawLine);

		line.remove();
		if (!task.insideGbox(e.pageX, e.pageY)) {
			scalegroup.each(function(i, children) {
				//if (this.inside(x2, y2)) {
        if (this.data('isnode')==true && this.insideGbox(e.pageX, e.pageY)) {
					if (debuggable) console.log('try to connect with ' + this.attr('id'));
					if (this.data('isnode')==true && this.data('type')!='pull') {
            scalegroup.add( svg.bpmnline( { fromid: task.attr('id'), toid: this.attr('id') } ) );
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
        var scgtransf = scalegroup.transform()
        var thistransf = task.transform()
        var xx = thistransf.x * scgtransf.scaleX + scgtransf.x
        var yy = thistransf.y * scgtransf.scaleY + scgtransf.y
				if (this.insideGbox(xx, yy)) {
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
        var scgtransf = scalegroup.transform()
        var thistransf = task.transform()
        var xx = thistransf.x * scgtransf.scaleX + scgtransf.x
        var yy = thistransf.y * scgtransf.scaleY + scgtransf.y
				if (this.insideGbox(xx, yy)) {
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

		if (drgmove) {
      scalegroup.each(function(i, children) {
        if (this.data('idfrom')==task.attr('id') || this.data('idto')==task.attr('id')) {
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

	task.dblclick(function(e) {
		if (debuggable) console.log("task dbl");

		var xx = task.x()*actualZoom - $('#input_textarea').width()/4 + scalegroup.x()-45;
		var yy = task.y()*actualZoom + scalegroup.y();

    $('#input_textarea').val(inner_text.text())
		$('#input_textarea').show()
		$('#input_textarea').css({'position':'absolute', 'left': xx, 'top': yy});
		$('#input_textarea').focus();

		document.addEventListener('mousedown', function(e){
			//var xx = (e.pageX - scalegroup.x())/actualZoom;
			//var yy = (e.pageY - scalegroup.y())/actualZoom;

			if (task.insideGbox(e.pageX, e.pageY)) {
				if (debuggable) console.log("inside");
			} else {
				if (e.target.nodeName != 'A' && e.target.nodeName != 'TEXTAREA') {
					if (debuggable) console.log(e.target.nodeName);
					if (debuggable) console.log("outside");

					if ( $('#input_textarea').is(":visible") ) {
						if (debuggable) console.log("visible")

            $('#input_textarea').hide()

            if ($('#input_textarea').val()!='') {
							inner_text.show();

              innertext = $('#input_textarea').val();

              inner_text.text(function(add) {
                $.each(innertext.split('\n'), function(k, val){
                  add.tspan(val).newLine()
                });
              })

              var linesset = inner_text.lines()
              if (debuggable) console.log("linesset", linesset);
              linesset.each(function(i, children) {
                if (debuggable) console.log("this id " + this.attr('id') + " this.length " + this.length());
                this.dx(-this.length()/2+50)
              })
              task.data('inner_text', inner_text.text());
              if (debuggable) console.log("INNER TEXT " + inner_text.text());

						} else {
							inner_text.hide();
              inner_text.clear();
						}
					}

          menu_backgrnd.hide();
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
      task.front();
			rect_outer.show().attr({ stroke: "green" });

      menu_backgrnd.show();
			draw.show();
			del.show();
			settings.show();

			document.addEventListener('mousedown', function(e){
				var xx = (e.pageX - scalegroup.x())/actualZoom;
				var yy = (e.pageY - scalegroup.y())/actualZoom;

				if (task.insideGbox(e.pageX, e.pageY)) {
					if (debuggable) console.log("inside");
				} else {
					if (e.target.nodeName != 'A' && e.target.nodeName != 'TEXTAREA') {
						if (debuggable) console.log(e.target.nodeName);
						if (debuggable) console.log("outside");
            menu_backgrnd.hide();
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
					//var xx = (e.pageX - scalegroup.x())/actualZoom;
					//var yy = (e.pageY - scalegroup.y())/actualZoom;

					if (task.insideGbox(e.pageX, e.pageY)) {
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
					inner_type.plain('\ue811')
					task.data({inner_type: e.target.id})
					break
				  case 'task_dropdown_2':
					$('#' + rect.attr('id')+'_inner_type').html('<i class="icon-right-hand"></i>');
					task.data({inner_type: e.target.id})
					break
				  case 'task_dropdown_3':
					inner_type.plain('\ue812')
					task.data({inner_type: e.target.id})
					break
				  case 'task_dropdown_4':
					inner_type.plain('\ue81b')
					task.data({inner_type: e.target.id})
					break
				  case 'task_dropdown_5':
					$('#' + rect.attr('id')+'_inner_type').html('<i class="icon-table"></i>');
					task.data({inner_type: e.target.id})
					break
				  case 'task_dropdown_6':
					inner_type.plain('\ue814')
					task.data({inner_type: e.target.id})
					break
				  case 'task_dropdown_7':
					inner_type.plain('\ue803')
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
					inner_type.plain('\ue811')
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
    deleteBPMNline(task.attr('id'));
		task.remove();
		e.stopPropagation();
	});
};

function addDecision(innertype, innertext, id, oraid, xcoor, ycoor, parent) {

	//set defaults if necessary
	innertype = typeof innertype !== 'undefined' ? innertype : 'decision_dropdown_1';
	innertext = typeof innertext !== 'undefined' ? innertext : '';
	xcoor = typeof xcoor !== 'undefined' ? xcoor : (130-scalegroup.x())/actualZoom;
	ycoor = typeof ycoor !== 'undefined' ? ycoor : (150-scalegroup.y())/actualZoom;
	id = typeof id !== 'undefined' ? id : -1;
	oraid = typeof oraid !== 'undefined' ? oraid : -1;
	parent = typeof parent !== 'undefined' ? parent : -1;

	var romb_focus = svg.rect(60, 60).attr({ fill: 'none', stroke: "#cd4436", "stroke-width": 4, "stroke-opacity"  : 0.7 }).move(-30,-30).hide();
	var romb_outer = svg.rect(60, 60).attr({ fill: 'none', stroke: "#d9534f", "stroke-width": 2, "stroke-dasharray": 4, "stroke-opacity"  : 0.5 }).move(-30,-30).hide();
	var romb = svg.rect(50, 50).attr({ fill: '#f5f5f5', stroke: "#A349A4", "stroke-width": 2 }).move(-25,-25);
	var connection;

	romb_focus.rotate(45, romb.cx(), romb.cy())
	romb_outer.rotate(45, romb.cx(), romb.cy())
	romb.rotate(45)

  //фон для меню
  var menu_backgrnd = svg.rect(25,80)
                         .attr({ fill: '#ececec', opacity: 0.7 })
                         .move(32,-42)
                         .hide()

  var draw = svg.plain('\ue801')
                .attr({cursor: 'pointer'})
                .font({family: 'fontello', size: 20})
                .move(38,-40)
                .hide()

  var settings = svg.plain('\ue802')
                    .attr({cursor: 'pointer'})
                    .font({family: 'fontello', size: 20})
                    .move(35,-15)
                    .hide()

  var del = svg.plain('\ue800')
               .attr({cursor: 'pointer'})
               .font({family: 'fontello', size: 20})
               .move(35,10)
               .hide()


  var inner_type = svg.text('')
                     .font({family: 'fontello', size: 20})
                     .addClass('noselect')

	// текст от id
	switch (innertype) {
	  case 'decision_dropdown_1':
    inner_type.text('И').move(-8,-12)
		break
	  case 'decision_dropdown_2':
    inner_type.text('ИЛИ').move(-21,-12)
		break
	  case 'decision_dropdown_3':
    inner_type.text('Искл.\nИЛИ').font({size: 16}).move(-17,-20)
		break
	  default:
    inner_type.text('И').move(-8,-12)
	};


  var inner_text = svg.text('')
                      .style('cursor:default;')
                      .addClass('noselect')
                      .move(-35,30)
                      .hide()

  if (innertext!='') {
    inner_text.show();
    //innertext = innertext.split('\n');
    inner_text.text(function(add) {
      $.each(innertext.split('\n'), function(k, val){
        add.tspan(val).newLine()
      });
    })
    var linesset = inner_text.lines()
    linesset.each(function(i, children) {
      this.dx(-this.length()/2+30)
    })
  }

	var decision = svg.group();
		decision.add(romb_focus);
		decision.add(romb_outer);
		decision.add(romb);
    decision.add(menu_backgrnd);
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

        scalegroup.each(function(i, children) {
          if (decision.attr('id')!=this.attr('id')) {
            if (Math.abs(this.x()-res.x)<10) res.x= this.x()
            if (Math.abs(this.y()-res.y)<10) res.y= this.y()
          }
        })
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

		line.plot(x1, y1, x2, y2).attr({stroke: '#333333', 'stroke-dasharray': '2,2'});
	};

	function stopDrawLine(e){
		if (debuggable) console.log("stop");
		document.removeEventListener('mousemove', procDrawLine);
		document.removeEventListener('click', stopDrawLine);

		var x2 = (e.pageX - scalegroup.x())/actualZoom;
		var y2 = (e.pageY - scalegroup.y())/actualZoom;

		line.remove();
		if (!decision.insideGbox(e.pageX, e.pageY)) {
			scalegroup.each(function(i, children) {
				//if (this.inside(x2, y2)) {
        if (this.data('isnode')==true && this.insideGbox(e.pageX, e.pageY)) {
					if (debuggable) console.log('try to connect with ' + this.attr('id'));
					if (this.data('isnode') && this.data('type')!='pull') {
            scalegroup.add( svg.bpmnline( { fromid: decision.attr('id'), toid: this.attr('id') } ) );
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
        var scgtransf = scalegroup.transform()
        var thistransf = decision.transform()
        var xx = thistransf.x * scgtransf.scaleX + scgtransf.x
        var yy = thistransf.y * scgtransf.scaleY + scgtransf.y
				if (this.insideGbox(xx, yy)) {
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
        var scgtransf = scalegroup.transform()
        var thistransf = decision.transform()
        var xx = thistransf.x * scgtransf.scaleX + scgtransf.x
        var yy = thistransf.y * scgtransf.scaleY + scgtransf.y
				if (this.insideGbox(xx, yy)) {
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
		if (drgmove) {
      scalegroup.each(function(i, children) {
        if (this.data('idfrom')==decision.attr('id') || this.data('idto')==decision.attr('id')) {
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

	decision.dblclick(function(e) {
		if (debuggable) console.log("decision dbl");

		var xx = (decision.x()-30)*actualZoom - $('#input_textarea').width()/4 + scalegroup.x();
		var yy = (decision.y()-30)*actualZoom + romb_outer.height()*actualZoom/2 + scalegroup.y();

		// var xx = pull.x()*actualZoom - $('#input_textarea').width()/2 + scalegroup.x();
		// var yy = pull.y()*actualZoom + rect_outer.height()*actualZoom/2 + scalegroup.y();

		$('#input_textarea').val(inner_text.text())
		$('#input_textarea').show()
		$('#input_textarea').css({'position':'absolute', 'left': xx, 'top': yy});
		$('#input_textarea').focus();

		document.addEventListener('mousedown', function(e){
			if (decision.insideGbox(e.pageX, e.pageY)) {
				if (debuggable) console.log("inside");
			} else {
				if (e.target.nodeName != 'A' && e.target.nodeName != 'TEXTAREA') {
					if (debuggable) console.log(e.target.nodeName);
					if (debuggable) console.log("outside");

					if ( $('#input_textarea').is(":visible") ) {
						if (debuggable) console.log("visible");

            $('#input_textarea').hide()

            if ($('#input_textarea').val()!='') {
              inner_text.show();

              innertext = $('#input_textarea').val();

              inner_text.text(function(add) {
              $.each(innertext.split('\n'), function(k, val){
                add.tspan(val).newLine()
              });
              })

              var linesset = inner_text.lines()
              if (debuggable) console.log("linesset", linesset);
              linesset.each(function(i, children) {
              if (debuggable) console.log("this id " + this.attr('id') + " this.length " + this.length());
              this.dx(-this.length()/2+25)
              })
              decision.data('inner_text', inner_text.text());
              if (debuggable) console.log("INNER TEXT " + inner_text.text());

            } else {
              inner_text.hide();
              inner_text.clear();
            }
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
      menu_backgrnd.show();
			draw.show();
			del.show();
			settings.show();
			if (debuggable) console.log("click");

			document.addEventListener('mousedown', function(e){
				var xx = (e.pageX - scalegroup.x())/actualZoom;
				var yy = (e.pageY - scalegroup.y())/actualZoom;

				if (decision.insideGbox(e.pageX, e.pageY)) {
					if (debuggable) console.log("inside");
				} else {
					if (e.target.nodeName != 'A' && e.target.nodeName != 'TEXTAREA') {
						if (debuggable) console.log(e.target.nodeName);
						if (debuggable) console.log("outside");
            menu_backgrnd.hide();
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
					//var xx = (e.pageX - scalegroup.x())/actualZoom;
					//var yy = (e.pageY - scalegroup.y())/actualZoom;

					if (decision.insideGbox(e.pageX, e.pageY)) {
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
					inner_type.text('И').font({size: 20}).move(-8,-12)
					decision.data({inner_type: e.target.id})
					break
				  case 'decision_dropdown_2':
					inner_type.text('ИЛИ').font({size: 20}).move(-21,-12)
					decision.data({inner_type: e.target.id})
					break
				  case 'decision_dropdown_3':
					inner_type.text('Искл.\nИЛИ').font({size: 16}).move(-17,-20)
					decision.data({inner_type: e.target.id})
					break
				  case 'decision_dropdown_card':
					new_window('/pls/gis/ais_wf.p_scheme.p_obj_admin?v_model_id=' + l_model_id + '&v_id=' + decision.attr('id'))
					break
				  default:
					inner_type.text('И').font({size: 20}).move(-8,-12)
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
		deleteBPMNline(decision.attr('id'));
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

	var rect_outer = svg.rect(width + 10, height + 10).attr({ fill: 'none', stroke: "#d9534f", "stroke-width": 2, "stroke-dasharray": 4, "stroke-opacity"  : 0.5 }).move(-5,-5).hide();
	var rect = svg.rect(width, height).attr({ fill: '#fff', stroke: "#000", "stroke-width": 1 });

  var menu_backgrnd2 = svg.rect(25,25)
                         .attr({ fill: '#ececec', opacity: 0.7 })
                         .move(width - 4, height - 4)
                         .hide()
  //var menu_backgrnd2 = svg.rect(25,25).attr({ fill: '#ececec', opacity: 0.7 }).move(width - 4, height - 4).hide();
  var arrowg = svg.group();
  var arrow = svg.plain('\ue817')
                 .font({family: 'fontello', size: 20})
                 .attr({'cursor': 'se-resize'})


  arrowg.add(arrow).move(width, height + 16).hide();

	/*var arrow = svg.foreignObject(20,20).attr({id: rect.attr('id')+'_resize'});
	$('#' + rect.attr('id')+'_resize').html('<i class="icon-resize-full"></i>');
	arrow.attr({width: 20, height: 20, 'cursor': 'se-resize'}).move(width - 2, height - 2).hide();*/
  var inner_text_group = svg.group();
  var inner_text_rect = svg.rect(rect.height(), 45).attr({ fill: '#fff', stroke: "#000", "stroke-width": 1 }).rotate(-90, inner_text_group.x(), inner_text_group.y());
  var inner_text = svg.text('')
                      .style('cursor:default;')
                      .addClass('noselect')
                      .rotate(-90, inner_text_group.x(), inner_text_group.y())
                      .move(rect.height()/2,-5)
                      .hide();

  if (innertext!='') {
    inner_text.show();
    //innertext = innertext.split('\n');
    inner_text.text(function(add) {
      $.each(innertext.split('\n'), function(k, val){
        add.tspan(val).newLine()
      });
    })
    var linesset = inner_text.lines()
    linesset.each(function(i, children) {
      this.dx(-this.length()/2)
    })
  }

  inner_text_group.add(inner_text_rect)
  inner_text_group.add(inner_text)
  inner_text_group.move(0,rect.height())

	/*var inner_text = svg.foreignObject(0,0).attr({id: 'inner_text'})
	inner_text.appendChild("div", {id: rect.attr('id')+'_inner_text'})
	var n = inner_text.getChild(0)
	n.style.overflow = 'hidden'
	n.style.border = "solid black 1px"
	inner_text.attr({width: rect.height(), height: 45}).rotate(-90, rect.x(), rect.y()).move(-rect.height(),0).style('cursor:default; word-wrap: break-word; text-align: center;').hide();
	$('#' + rect.attr('id')+'_inner_text').html(innertext);*/
	if (innertext!='') inner_text.show();

  var menu_backgrnd = svg.rect(25,50).attr({ fill: '#ececec', opacity: 0.7 }).move(-26,0).hide();

  var settings = svg.plain('\ue802')
                    .attr({cursor: 'pointer'})
                    .font({family: 'fontello', size: 20})
                    .move(-23, 0)
                    .hide();

  var del = svg.plain('\ue800')
               .attr({cursor: 'pointer'})
               .font({family: 'fontello', size: 20})
               .move(-23, 25)
               .hide();

	var pull = svg.group();
	pull.add(rect_outer);
	pull.add(rect);
	pull.add(inner_text_group); //TODO заменить на группу с рамкой
  pull.add(menu_backgrnd2);
  pull.add(menu_backgrnd);
	pull.add(arrowg);
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

      /*scalegroup.each(function(i, children) {
        if (pull.attr('id')!=this.attr('id')) {
          if (Math.abs(this.x()-res.x)<10) res.x= this.x()
          if (Math.abs(this.y()-res.y)<10) res.y= this.y()
        }
      })*/
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

      //inner_text.attr({width: rect.height(), height: 30})
			//inner_text.move(-rect.height(),0)



      menu_backgrnd2.move(x2-4, y2-4);
      arrowg.move(x2, y2+16);

			//del.move(-23, rect.height()-20);
			//moveforward.move(x2+3, 0);
			//moveback.move(x2+3, 20);
		} else {
			rect_outer.show().attr({ stroke: "#d9534f" });
		}
	};

	function stopResizePull() {
    inner_text_rect.size(rect.height(),45)
    inner_text_group.move(0,rect.height())
    inner_text_group.show();
    inner_text.move(rect.height()/2,0)
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
	arrowg.mousedown(function() {
    inner_text_group.hide();
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
      menu_backgrnd.show()
      menu_backgrnd2.show()
			arrowg.show()
			del.show()
			settings.show()
			//moveforward.show();
			//moveback.show();

			document.addEventListener('mousedown', function(e){
				var xx = (e.pageX - scalegroup.x())/actualZoom;
				var yy = (e.pageY - scalegroup.y())/actualZoom;

				if (pull.insideGbox(e.pageX, e.pageY)) {
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
            menu_backgrnd.hide()
            menu_backgrnd2.hide()
            arrowg.hide();
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

			$('#input_textarea').val(inner_text.text())
			$('#input_textarea').show()
			$('#input_textarea').css({'position':'absolute', 'left': xx, 'top': yy});
			$('#input_textarea').focus();

			document.addEventListener('mousedown', function(e){
				var xx = (e.pageX - scalegroup.x())/actualZoom;
				var yy = (e.pageY - scalegroup.y())/actualZoom;

				//e.pageX/actualZoom - pull.x() - scalegroup.x()/actualZoom;

				if (pull.insideGbox(e.pageX, e.pageY)) {
					if (debuggable) console.log("inside");
				} else {
					if (e.target.nodeName != 'A') {
						if (debuggable) console.log(e.target.nodeName);
						if (debuggable) console.log("click on " + e.target.nodeName + " is outside");

						if ( $('#input_textarea').is(":visible") ) {
							if (debuggable) console.log("visible");

              $('#input_textarea').hide()

              if ($('#input_textarea').val()!='') {
								inner_text.show();

                innertext = $('#input_textarea').val();

                inner_text.text(function(add) {
                  $.each(innertext.split('\n'), function(k, val){
                    add.tspan(val).newLine()
                  });
                })

                var linesset = inner_text.lines()
                if (debuggable) console.log("linesset", linesset);
                linesset.each(function(i, children) {
                  if (debuggable) console.log("this id " + this.attr('id') + " this.length " + this.length());
                  this.dx(-this.length()/2)
                })
                pull.data('inner_text', inner_text.text());
                if (debuggable) console.log("INNER TEXT " + inner_text.text());

							} else {
								inner_text.hide();
                inner_text.clear();
							}
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

    function showPullNodes(toggler) {
      // show|hide nodes
			scalegroup.each(function(i, children) {
				if (this.data('parent')==pull.attr('id')) {
					(toggler) ? this.show() : this.hide()
				}
				if (this.data('parents')!=undefined && this.data('parents').split(',').indexOf(pull.attr('id'))!=-1) {
					if (debuggable) console.log('parents ' + this.data('parents') + ' ' + this.attr('id'));
					(toggler) ? this.show() : this.hide()
				}
			});
    }


		pull.on('dragstart', function(e) {
			$('.graph').off('mousedown')

			startx = this.x()
			starty = this.y()


		})

		var drgmove = false;
    var pullNodesVisible = true;

		pull.on('dragmove', function(e) {
      if (Math.abs(this.x()-startx)>10 || Math.abs(this.y()-starty)>10 || drgmove) {
        drgmove = true;
        if (debuggable) console.log('pull moved over 10 px! this.x='+this.x() + ' start.x=' + startx);

        if (pullNodesVisible) {
          pullNodesVisible = false
          showPullNodes(pullNodesVisible)
          pull.hide()
    			clonegroup.show()
        }

  			clonegroup.move(startx+movedx,starty+movedy)

  			movedx = e.detail.delta.movedX
  			movedy = e.detail.delta.movedY

        //draw red if inside other pull
  			scalegroup.each(function(i, children) {
  				if (this.data('type')=='pull') {
            if (this.insideGbox(e.detail.event.pageX, e.detail.event.pageY) && this.attr('id')!=pull.attr('id')) {
  						this.first().attr({ fill: 'red'});
  						this.attr({ 'cursor': 'not-allowed'});
  					} else {
  						this.first().attr({ fill: '#f5f5f5'});
  					}
  				}
  			});
      }
		})

		pull.on('dragend', function(e) {
      if (drgmove) {
        //draw red if inside other pull
  			scalegroup.each(function(i, children) {
  				if (this.data('type')=='pull' && this.attr('id')!=pull.attr('id') ) {
  					if (debuggable) console.log('eX=' + e.detail.event.pageX/actualZoom + ' eY=' + e.detail.event.pageY/actualZoom)
  					if (this.insideGbox(e.detail.event.pageX, e.detail.event.pageY)) {
  						if (debuggable) console.log('inside ' + this.attr('id'));
  						pull.move(startx,starty)
  						movedx = 0;
  						movedy = 0;
  						this.first().attr({ fill: '#f5f5f5'});
  					}
  					this.attr({ 'cursor': 'default'});
  				}
  			});

        if (!pullNodesVisible) {
          pullNodesVisible = true
          showPullNodes(pullNodesVisible)
          clonegroup.hide()
    			pull.show();
        }

        scalegroup.each(function(i, children) {
  				if (this.data('parent')==pull.attr('id')) {
  					this.dmove(movedx, movedy)
  				}
  			});

        scalegroup.each(function(i, children) {
          if (this.data('type')=='connection') {
            this.data('positionX', this.data('positionX')+movedx)
            this.data('positionY', this.data('positionY')+movedy)

            this.update(true);
          }
        })
        drgmove = false
      } else {
        pull.move(startx,starty)

      }

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

				if (inner_text.insideGbox(e.pageX, e.pageY)) {
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
	//$('#loader').show();
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
        path: this.data('path'),
				dash: this.data('dash')
			});
		}
	});


	var flowChart = {};
	flowChart.nodes = nodes;
	flowChart.links = links;

	var flowChartJson = JSON.stringify(flowChart);

	//$('#jsonOutput').text(flowChartJson);
  console.log(flowChartJson)

	var data_send= flowChartJson;//JSON.stringify(JSON.parse(data)) ;//проверка на целостность json
	data_send=encodeURI(data_send);
	//var model_id=5;//id схемы в оракле

	/*var result;
	$.ajax({
		url:'ais_wf.p_model_json.p_add',
		type:'POST',
		//data: {v_scheme:data_send,v_model_id:l_model_id,v_uniq_id:Math.random()},
		//contentType: "application/x-www-form-urlencoded;charset=windows-1251",
		contentType: "application/x-www-form-urlencoded;charset=UTF-8",
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



	setTimeout(function() { $("#loader").hide() }, 500);*/

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
    //url:'data.txt',
    url:'masdata.txt',
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

		//if (debuggable) var flowChartJson = $('#jsonOutput').text();
		//if (debuggable) console.log("flowChartJson " + flowChartJson);
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

		//if (debuggable)
    console.log("min x=" + minx + " y=" + miny);

		x_offset = minx;
		y_offset = miny;

		//if (debuggable)
    console.log("x_offset=" + x_offset + " y_offset=" + y_offset);
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
    $.each(nodes, function( index, elem ) {
      maxids.push(parseInt(elem.id.substr(elem.id.indexOf("G")+1)))
    });
    $.each(links, function( index, elem ) {
      maxids.push(parseInt(elem.id.substr(elem.id.indexOf("G")+1)))
    });

    //find max id
    SVG.did = Math.max.apply(null, maxids);
    console.log("SVG.did " + SVG.did);
    // SVG.did = 1000


		//drawing
		$.each(nodes, function( index, elem ) {
			if (elem.type === 'circle') {
				addCircle(elem.subtype, elem.inner_type, elem.inner_text, elem.id, elem.oraid, elem.positionX, elem.positionY, elem.parent)
				if (debuggable) console.log("loading " + elem.type + " with id=" + elem.id);
				if (elem.positionX > maxx) maxx = elem.positionX;
				if (elem.positionY > maxy) maxy = elem.positionY;
			} else if (elem.type === 'task') {
				addTask(elem.inner_type, elem.inner_text, elem.id, elem.oraid, elem.positionX, elem.positionY, elem.parent)
				if (debuggable) console.log("loading " + elem.type + " with id=" + elem.id);
				if (elem.positionX > maxx) maxx = elem.positionX;
				if (elem.positionY > maxy) maxy = elem.positionY;
			} else if (elem.type === 'decision') {
				addDecision(elem.inner_type, elem.inner_text, elem.id, elem.oraid, elem.positionX, elem.positionY, elem.parent)
				if (debuggable) console.log("loading " + elem.type + " with id=" + elem.id);
				if (elem.positionX > maxx) maxx = elem.positionX;
				if (elem.positionY > maxy) maxy = elem.positionY;
			} else if (elem.type === 'pull') {
				addPull(elem.inner_text, elem.id, elem.oraid, elem.positionX, elem.positionY, elem.width, elem.height, elem.zindex)
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
			//drawPolyline(elem.idfrom, elem.idto, elem.inner_text, elem.positionX-x_offset, elem.positionY-y_offset, elem.id, elem.pos_from, elem.pos_to, elem.dash)

      var prop = { fromid: elem.idfrom,
                     toid: elem.idto,
                innertext: elem.inner_text,
                positionx: elem.positionX,
                positiony: elem.positionY,
                       id: elem.id,
                     path: elem.path,
                     dashed: elem.dash };

      scalegroup.add( svg.bpmnline( prop ) );
      //scalegroup.add( svg.bpmnline(elem.idfrom, elem.idto, elem.inner_text, elem.positionX-x_offset, elem.positionY-y_offset, elem.id, elem.pos_from, elem.pos_to, elem.dash) );
      maxids.push(parseInt(elem.id.substr(elem.id.indexOf("G")+1)))
		});


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


function goBack() {
	if (debuggable) console.log('go back')

	steps.forEach(function(entry) {
		if (debuggable) console.log(entry);
	});

	var todel = steps.pop();

	delPolyline(todel.id);
	SVG.get(todel.id).remove();


};

var MAX_ZOOM_IN = 3.0;
var MAX_ZOOM_OUT = 0.5;
var zoomStep = 0.2;
var actualZoom = 1.0;
var MOVE_STEP = 100;
if (scalable) {
	svg.on('mousewheel', function(e) { // TODO: invert scroll, use native event (div on scroll)
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


//move to modeler.js
function paning(e) {
	if (!isPlacing) {
		console.log('paning')
		var stx = e.pageX
			, sty = e.pageY
			, mx, my
			, moveFunc = function (e) {
					console.log('paning mousemove')
					mx = (e.pageX - stx) / actualZoom
					my = (e.pageY - sty) / actualZoom
					//console.log('this ', this)
					scalegroup.dmove(mx, my) //todo change to parent or doc
					stx = e.pageX
					sty = e.pageY
			}
			,	upFunc = function (e) {
					console.log('paning mouseup ', this)
					this.style('cursor', 'default')
					this.off('mousemove', moveFunc)
					this.off('mouseup', upFunc)
			}

		svg.style('cursor', 'move')
		svg.on('mousemove', moveFunc)
		svg.on('mouseup', upFunc)
	}
}

svg.on('mousedown', paning)



function edgeOfView(rect, deg) {
  var twoPI = Math.PI*2;
  var theta = deg * Math.PI / 180;

  while (theta < -Math.PI) {
    theta += twoPI;
  }

  while (theta > Math.PI) {
    theta -= twoPI;
  }

  var rectAtan = Math.atan2(rect.height, rect.width);
  var tanTheta = Math.tan(theta);
  var region;

  if ((theta > -rectAtan) && (theta <= rectAtan)) {
      region = 1;
  } else if ((theta > rectAtan) && (theta <= (Math.PI - rectAtan))) {
      region = 2;
  } else if ((theta > (Math.PI - rectAtan)) || (theta <= -(Math.PI - rectAtan))) {
      region = 3;
  } else {
      region = 4;
  }

  var edgePoint = {x: rect.width/2, y: rect.height/2};
  var xFactor = 1;
  var yFactor = 1;

  switch (region) {
    case 1: yFactor = -1; break;
    case 2: yFactor = -1; break;
    case 3: xFactor = -1; break;
    case 4: xFactor = -1; break;
  }

  if ((region === 1) || (region === 3)) {
    edgePoint.x += xFactor * (rect.width / 2.);                                     // "Z0"
    edgePoint.y += yFactor * (rect.width / 2.) * tanTheta;
  } else {
    edgePoint.x += xFactor * (rect.height / (2. * tanTheta));                        // "Z1"
    edgePoint.y += yFactor * (rect.height /  2.);
  }

  return edgePoint;
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
