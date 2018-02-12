//120218
SVG.bpmnElement = SVG.invent({
  // Initialize node
  create: function() {
    this.constructor.call(this, SVG.create('g'))
  }
  // Inherit from
, inherit: SVG.G
, extend: {
  draw: function( prop ) {

      //set defaults if necessary
      prop = (typeof prop !== "object") ? {} : prop;
      prop.type = prop.type || 'event'; //event, activity, gateway
      prop.subtype = prop.subtype || 'start'; //start, intermediate, end
      prop.innertype = prop.innertype || '';
      prop.innertext = prop.innertext || 'test test test\n sete';
      prop.positionx = prop.positiony || 200;
      prop.positiony = prop.positiony || 200;
      prop.id = prop.id || prop.subtype + '-' + prop.type + '-' + bpmnNodesCounter++;
      prop.oraid = prop.oraid || -1;
      prop.parent = prop.parent || -1;

      this.data({
          'is-node': 'true'
          , type: prop.type //likely to remove
          //, subtype: prop.subtype //likely to remove
          //, 'inner-type': prop.innertype //likely to remove
          , 'element-id': prop.id //prop.subtype + '-' + prop.type + '-' + bpmnNodesCounter++
          //, 'inner-text': prop.innertext //likely to remove
          
      })

      if (prop.parent != -1 ) {
          this.data('parent', prop.parent)
      }
      
      //main variables here
      var element = this
      , shapeFocused //for focused state
      , shapeOuter //for highlited state
      , shape //main shape
      , shapeInner //inner shape

      //stuff for icons's here
      , menuBackgrnd = this.rect(25,80)
                          .attr({ fill: '#ececec', opacity: 0.7 })
                          .hide()

      , draw = this.plain('\ue801')
                  .attr({cursor: 'pointer'})
                  .font({family: 'fontello', size: 20})
                  .hide()

      , settings = this.plain('\ue802')
                      .attr({cursor: 'pointer'})
                      .font({family: 'fontello', size: 20})
                      .hide()

      , del = this.plain('\ue800')
                  .attr({cursor: 'pointer'})
                  .font({family: 'fontello', size: 20})
                  .hide()

      , innerType = this.plain('')
                      .font({family: 'fontello', size: 20})
                      .addClass('noselect')

      , innerText = this.text('')
                      .attr('id', prop.id+'-innertext')
                      .style('cursor:default;')
                      .addClass('noselect')
                      .hide()

      //Now we're ready to draw the shape
      if (prop.type == 'event') {
          shapeFocused = this.circle(nodeOptions.sizes.event+10)
                          .attr({ fill: 'none', stroke: "#cd4436", "stroke-width": 4, "stroke-opacity": 0.7 })
                          .move(-shapeFocused/2, -shapeFocused/2)
                          .hide()


          shapeOuter = this.circle(nodeOptions.sizes.event+10)
                          .attr({ fill: 'none', stroke: "#d9534f", "stroke-width": 2, "stroke-dasharray": 4, "stroke-opacity": 0.5 })
                          .move(-shapeOuter/2, -shapeOuter/2)
                          .hide()


          shape = this.circle(nodeOptions.sizes.event)
                      .move(-shape/2, -shape/2)

          shapeInner = this.circle(42)
                          .attr({ fill: '#f5f5f5', stroke: "#000", "stroke-width": 2 })
                          .move(-21, -21)

          menuBackgrnd.move(26,-37)
          draw.move(32,-35)
          settings.move(30,-10)
          del.move(30,15)
          innerType.front().move(-9,6)
          innerText.move(-30,25)

          if (prop.innertext!='') {
              innerText.show();
              innerText.text(prop.innertext);
          }
          
          if (prop.subtype=='start') {
              // Set style for node
              shape.attr({ fill: '#f5f5f5', stroke: "#22B14C", "stroke-width": 2 })
              shapeInner.hide()
              // Set BPMN icon for node
              switch (prop.innertype) {
                  case 'start_dropdown_1':
                      innerType.plain('')
                      break
                  case 'start_dropdown_2':
                      innerType.plain('')
                      //TODO $('#' + circ.attr('id') + '_innerType').html('<i class="icon-mail"></i>');
                      break
                  case 'start_dropdown_3':
                      innerType.plain('')
                      //TODO $('#' + circ.attr('id') + '_innerType').html('<i class="icon-clock"></i>');
                      break
                  case 'start_dropdown_4':
                      innerType.plain('\ue805')
                      break
                  case 'start_dropdown_5':
                      innerType.plain('\ue807')
                      break
                  case 'start_dropdown_6':
                      innerType.plain('')
                      //TODO $('#' + circ.attr('id') + '_innerType').html('<i class="icon-target"></i>');
                      break
                  case 'start_dropdown_7':
                      innerType.plain('')
                      //TODO $('#' + circ.attr('id') + '_innerType').html('<i class="icon-plus"></i>');
                      break
                  default:
                      innerType.plain('')
              }
          } else if (prop.subtype=='intermediate') {
              // Set style for node
              shape.attr({ fill: '#f5f5f5', stroke: "#3F48CC", "stroke-width": 2 })
              shapeInner.attr({ stroke: "#3F48CC" })
              // Set BPMN icon for node
              switch (prop.innertype) {
                  case 'inter_dropdown_1':
                      innerType.plain('')
                      break
                  case 'inter_dropdown_2':
                      innerType.plain('\ue803')
                      break
                  case 'inter_dropdown_3':
                      innerType.plain('\ue804')
                      break
                  case 'inter_dropdown_4':
                      innerType.plain('\ue814')
                      break
                  case 'inter_dropdown_5':
                      innerType.plain('')
                      //TODO $('#' + circ.attr('id') + '_innerType').html('<i class="icon-doc-text"></i>');
                      break
                  case 'inter_dropdown_6':
                      innerType.plain('')
                      //TODO $('#' + circ.attr('id') + '_innerType').html('<i class="icon-right-big"></i>');
                      break
                  case 'inter_dropdown_7':
                      innerType.plain('')
                      //TODO $('#' + circ.attr('id') + '_innerType').html('<i class="icon-flash"></i>');
                      break
                  case 'inter_dropdown_8':
                      innerType.plain('')
                      //TODO $('#' + circ.attr('id') + '_innerType').html('<i class="icon-cancel"></i>');
                      break
                  case 'inter_dropdown_9':
                      innerType.plain('')
                      //TODO $('#' + circ.attr('id') + '_innerType').html('<i class="icon-fast-bw"></i>');
                      break
                  case 'inter_dropdown_10':
                      innerType.plain('')
                      //TODO $('#' + circ.attr('id') + '_innerType').html('<i class="icon-collapse"></i>');
                      break
                  case 'inter_dropdown_11':
                      innerType.plain('')
                      //TODO $('#' + circ.attr('id') + '_innerType').html('<i class="icon-target"></i>');
                      break
                  case 'inter_dropdown_12':
                      innerType.plain('')
                      //TODO $('#' + circ.attr('id') + '_innerType').html('<i class="icon-plus-outline"></i>');
                      break
                  default:
                      innerType.plain('')
              }
          } else {
              // Set style for node
              shape.attr({ fill: '#f5f5f5', stroke: "#ED1C24", "stroke-width": 4 })
              shapeInner.hide()
              // Set BPMN icon for node
              switch (prop.innertype) {
                  case 'end_dropdown_1':
                      innerType.plain('')
                      break
                  case 'end_dropdown_2':
                      innerType.plain('')
                      //TODO $('#' + circ.attr('id') + '_innerType').html('<i class="icon-mail"></i>');
                      break
                  case 'end_dropdown_3':
                      innerType.plain('')
                      //TODO $('#' + circ.attr('id') + '_innerType').html('<i class="icon-paper-plane"></i>');
                      break
                  case 'end_dropdown_4':
                      innerType.plain('')
                      //TODO $('#' + circ.attr('id') + '_innerType').html('<i class="icon-flash"></i>');
                      break
                  case 'end_dropdown_5':
                      innerType.plain('')
                      //TODO $('#' + circ.attr('id') + '_innerType').html('<i class="icon-cancel"></i>');
                      break
                  case 'end_dropdown_6':
                      innerType.plain('')
                      //TODO $('#' + circ.attr('id') + '_innerType').html('<i class="icon-fast-bw"></i>');
                      break
                  case 'end_dropdown_7':
                      innerType.plain('\ue807')
                      //$('#' + circ.attr('id')+'_innerType').html('<i class="icon-collapse"></i>');
                      break
                  case 'end_dropdown_8':
                      innerType.plain('')
                      //TODO $('#' + circ.attr('id') + '_innerType').html('<i class="icon-target"></i>');
                      break
                  case 'end_dropdown_9':
                      innerType.plain('')
                      //TODO $('#' + circ.attr('id') + '_innerType').html('<i class="icon-circle"></i>');
                      break
                  default:
                      innerType.plain('')
              }
          }

          //var node = this.group()
          if (!editable) {
              this.attr('cursor','pointer')
          } else {
              this.draggy(function (x, y, elem) {
                  var res = {};
                  res.x = x - (x % snapRange);
                  res.y = y - (y % snapRange);
                  // scalegroup.each(function(i, children) {
                  //     if (element.attr('id')!=this.attr('id')) {
                  //         if (Math.abs(this.x()-res.x)<10) res.x= this.x()
                  //         if (Math.abs(this.y()-res.y)<10) res.y= this.y()
                  //     }
                  // })
                  return res;
              });
          }


      } else if (prop.type == 'activity') {
          
      } else if (prop.type == 'gateway') {
          
      }

      //Common for all shape types

      if (editable) {
          this.mouseover(function() {
              if (shapeOuter.attr('stroke') != nodeOptions.colors.selected ) 
                  shapeOuter.show()
          })
          this.mouseout(function() {
              if (shapeOuter.attr('stroke') != nodeOptions.colors.selected )
                  shapeOuter.hide()
          })
      }

      this.on('click', function (e) {
          console.log("click");
          if (editable) {
              this.front()
              shapeOuter.attr({ stroke: nodeOptions.colors.selected }).show()
              menuBackgrnd.show()
              draw.show()
              del.show()
              settings.show()

              //TODO: move this func somewhere
              document.addEventListener('mousedown', function (e) {
                  var xx = e.pageX
                      yy = e.pageY

                  console.log('Parent is ' + element.parent())

                  if (element.insideGbox(e.pageX, e.pageY)) {
                      console.log("inside")
                      //document.removeEventListener('mousedown', arguments.callee);
                  } else {
                      if (e.target.nodeName != 'A' && e.target.nodeName != 'TEXTAREA') {
                          console.log("click on " + e.target.nodeName + " is outside")
                          menuBackgrnd.hide()
                          draw.hide()
                          del.hide()
                          settings.hide()

                          shapeOuter.hide().attr({ stroke: nodeOptions.colors.hovered })

                          $('#start_dropdown li a').off()
                          $('#inter_dropdown li a').off()
                          $('#end_dropdown li a').off()
                          $('#start_dropdown').hide()
                          $('#inter_dropdown').hide()
                          $('#end_dropdown').hide()

                          document.removeEventListener('mousedown', arguments.callee)
                      }
                  }
              })
              
          } else {
              console.log('else')
              // call custom func here 
          }
      })

      this.dblclick(function(e) {
          if (editable) {
              if (debuggable) console.log("dblclick")

              var xx = (this.x()-35) - $('#input_textarea').width()/4
              var yy = (this.y()-35) + shapeOuter.height()

              // var xx = pull.x()*actualZoom - $('#input_textarea').width()/2 + scalegroup.x()
              // var yy = pull.y()*actualZoom + rect_outer.height()*actualZoom/2 + scalegroup.y()

              $('#input_textarea').val(innerText.text())
              $('#input_textarea').show()
              $('#input_textarea').css({'position':'absolute', 'left': xx, 'top': yy})
              $('#input_textarea').focus()

              document.addEventListener('mousedown', function (e) {
                  if (element.insideGbox(e.pageX, e.pageY)) {
                      if (debuggable) console.log("inside")
                  } else {
                      if (e.target.nodeName != 'A' && e.target.nodeName != 'TEXTAREA') {
                          if (debuggable) console.log(e.target.nodeName)
                          if (debuggable) console.log("click on " + e.target.nodeName + " is outside")

                          if ($('#input_textarea').is(":visible")) {
                              if (debuggable) console.log("visible")

                              $('#input_textarea').hide()

                              if ($('#input_textarea').val() != '') {
                                  innerText.show()
                                  //prop.innertext = $('#input_textarea').val();
                                  //element.updateText($('#input_textarea').val())
                                  element.updateText(document.getElementById('input_textarea').value)
                              } else {
                                  innerText.hide()
                                  innerText.clear()
                              }
                          }
                          menuBackgrnd.hide()
                          draw.hide()
                          del.hide()
                          settings.hide()

                          shapeOuter.hide().attr({ stroke: nodeOptions.colors.hovered })
                          document.removeEventListener('mousedown', arguments.callee)

                      }
                  }
              });
              e.stopPropagation()
          }
      })
      
      settings.click(function (e) {
        
          var xx = e.pageX// - $('.graph').offset().left,
          , yy = e.pageY// - $('.graph').offset().top

          if (prop.subtype == 'start') {
              $('#' + prop.subtype + '_dropdown').css({ 'position': 'absolute', 'left': xx, 'top': yy }).show()
              $('#' + prop.subtype + '_dropdown li a').click(function (e) {
                  if (e.target.className != 'inactive') {
                      var icon = getIconByType(e.target.id, l_model_id, element.data('element-id'))
                      if (icon != 'card' ) innerType.plain(icon)
                  
                      //circle.data({ inner_type: e.target.id })

                      $('#' + prop.subtype + '_dropdown li a').off();
                      $('#' + prop.subtype + '_dropdown').hide()
                  }
              })
          }
      })

      draw.click(function (e) {
          startDrawLine()
          document.addEventListener('mousemove', procWrap = function (e) { procDrawLine(e, element) }, false)
          document.addEventListener('click', stopWrap = function (e) { stopDrawLine(e, element) }, false)
          e.stopPropagation()
      })

      del.click(function (e) {
          element.remove()
          e.stopPropagation()
      })
      
      return this.transform({x:prop.positionx, y:prop.positiony})
  },
  //For proper node text placing
  updateText: function (innerTextStrings) {
      var innerText = SVG.get(this.data('element-id')+'-innertext')
      innerTextStrings = typeof innerTextStrings !== 'undefined' ? innerTextStrings.split('\n') : innerText.text().split('\n')
      innerText.text(function (add) {
          for (i = 0; i < innerTextStrings.length; i++) {
              add.tspan(innerTextStrings[i]).newLine()
          }
      })
      innerText.lines().each(function (i, children) {
          this.dx(-this.length() / 2 + nodeOptions.sizes.event/2)
      })

      return this
  }
}
  // Add parent method
, construct: {
    // Create element
    bpmnElement: function( prop ) {
        return this.put(new SVG.bpmnElement).draw()
                  
    }
  }
})
