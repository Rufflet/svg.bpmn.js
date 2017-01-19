/*bpmn nodes library*/
/*
TODO:
- плавающее размещение объектов на канве
- вынести цвета в настройки
- вынести разбивку innertext в функцию
- more vanillaJS

- innertype в отдельную функцию !reuse your code!
*/

SVG.Bpmnnode = SVG.invent({
    create: function() {
        this.constructor.call(this, SVG.create('g'))
    },
    inherit: SVG.G,
    extend: {
        draw: function( prop ) {
            /*
                * SVG.Bpmnnode
                * Draw BPMN-nodes.
                * @name Bpmnnode
                * @function
                * @param {Object} options An object containing any of the following fields:

                subtype, innertype, innertext, id, oraid, xcoor, ycoor, parent

                *
                *  - `subtype` (SVGElement): The connector elements container. Defaults to source parent.
                *  - `innertype` (SVGElement): The marker elements container. Defaults to source parent.
                *  - `innertext` (String): Connector attachment for source element: 'center' / 'perifery'. Defaults to 'center'
                *  - `id` (String): Connector attachment for target element: 'center' / 'perifery'. Defaults to 'center'
                *  - `oraid` (String): Connector type: 'straight' or 'curved'. Defaults to 'straight'
                *  - `positionx` (String): Can be: an SVGElement / 'null' / 'default'. Defaults to 'null'
                *  - `positiony` (String): Can be: an SVGElement / 'null' / 'default'. Defaults to 'null'
                *  - `parent` (String): Connector color. Defaults to '#000000'.
                * @return {Object} An object.
                */
            //this.constructor.call(this, SVG.create('g'))
            //set defaults if necessary
            prop = (typeof prop !== "object") ? {} : prop;
            prop.type = prop.type || ''; //event, activity, gateway
            prop.subtype = prop.subtype || ''; //start, intermediate, end
            prop.innertype = prop.innertype || '';
            prop.innertext = prop.innertext || 'test test test\n sete';
            prop.positionx = prop.positiony || (200-scalegroup.x())/actualZoom;
            prop.positiony = prop.positiony || (200-scalegroup.y())/actualZoom;
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
                if (debuggable) console.log(this.data('parent'))
            }

            if (debuggable) console.log('Drawing node with type ' + prop.type)
            
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
                    
                    if (debuggable) console.log("click");
                    
                    if (!isPlacing) {
                        //TODO: move this func somewhere
                        document.addEventListener('mousedown', function (e) {
                            var xx = (e.pageX - scalegroup.x()) / actualZoom,
                                yy = (e.pageY - scalegroup.y()) / actualZoom


                            console.log('Parent is ' + element.parent('#scalegroup'))

                            if (element.insideGbox(e.pageX, e.pageY)) {
                                if (debuggable) console.log("inside")
                                //document.removeEventListener('mousedown', arguments.callee);
                            } else {
                                if (e.target.nodeName != 'A' && e.target.nodeName != 'TEXTAREA') {
                                    if (debuggable) console.log("click on " + e.target.nodeName + " is outside")
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
                    }
                } else {
                    console.log('else')
                    if (typeof customclick === "function") {
                        customclick(this.attr('id'));
                    } else {
                        var xx = e.pageX /*- $('.graph').offset().left*/
                        var yy = e.pageY /*- $('.graph').offset().top*/

                        $('#preview_dropdown').show()
                        $('#preview_dropdown').css({ 'position': 'absolute', 'left': xx, 'top': yy })
                        $('#preview_dropdown li a').click(function (e) {
                            if (debuggable) console.log(e.target.text)
                            if (debuggable) console.log(e.target.id)

                            if (e.target.className != 'inactive') {
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

                                $('#preview_dropdown li a').off()
                                $('#preview_dropdown').hide()
                            }
                        });
                        
                        document.addEventListener('mousedown', function (e) {
                            //var xx = (e.pageX - scalegroup.x())/actualZoom
                            //var yy = (e.pageY - scalegroup.y())/actualZoom

                            if (element.insideGbox(e.pageX, e.pageY)) {
                                if (debuggable) console.log("inside")
                                //document.removeEventListener('mousedown', arguments.callee);
                            } else {
                                if (e.target.nodeName != 'A') {
                                    if (debuggable) console.log("click on " + e.target.nodeName + " is outside")

                                    $('#preview_dropdown li a').off()
                                    $('#preview_dropdown').hide()

                                    document.removeEventListener('mousedown', arguments.callee)
                                }
                            }
                        })
                    }
                }
            })

            this.dblclick(function(e) {
                if (editable) {
                    if (debuggable) console.log("dblclick")

                    var xx = (this.x()-35)*actualZoom - $('#input_textarea').width()/4 + scalegroup.x()
                    var yy = (this.y()-35)*actualZoom + shapeOuter.height()*actualZoom + scalegroup.y()

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

            //Draggin listeners
            this.on('dragstart', function(e) {
                //$('.graph').off('mousedown')
                svg.off('mousedown', paning)
            })
            
            var drgmove = false
            this.on('dragmove', function(e) {
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

            this.on('dragend', function (e) {
                if (!isPlacing) {
                //if (debuggable) console.log('dragend');
                //check if node is over pull
                var found = false;
                scalegroup.each(function (i, children) {
                    if (this.data('type') == 'pull' && !found) {
                        var scgtransf = scalegroup.transform()
                        var thistransf = element.transform()
                        var xx = thistransf.x * scgtransf.scaleX + scgtransf.x
                        var yy = thistransf.y * scgtransf.scaleY + scgtransf.y
                        if (this.insideGbox(xx, yy)) {
                            if (debuggable) console.log('end inside ' + this.attr('id'));
                            element.data('parent', this.attr('id'))
                            found = true;
                        } else {
                            if (debuggable) console.log('end not inside ' + this.attr('id'));
                            element.data('parent', null)
                        }
                        this.first().hide();
                    }
                });
                if (drgmove) {
                    scalegroup.each(function (i, children) {
                        if (this.data('idfrom') == element.attr('id') || this.data('idto') == element.attr('id')) {
                            this.update(true);
                        }
                    })
                }

                drgmove = false;
                svg.on('mousedown', paning)
                }
            })

            



            return this














        },
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
        },
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

            if (initially) prop.path = -1

            return this.draw(prop);
        }
    },
    construct: {
        bpmnnode: function( prop ) {
            return this.put(new SVG.Bpmnnode).draw( prop ).updateText() //TODO: разобраться с выравниванием текста
            
        }
    }
});