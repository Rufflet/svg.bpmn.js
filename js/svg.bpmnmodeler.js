/*
TODO: Change scalegroup to another container (viewport)

*/


var bpmnNodesCounter = 0,
    isPlacing = false //for placing aka floatingAdd TODO: change proc name

function getBpmnNodesCounter(){
    return bpmnNodesCounter++
}


//Object with node options
var nodeOptions = {};

nodeOptions.colors = {}
nodeOptions.colors.hovered = '#d9534f'
nodeOptions.colors.selected = 'blue'


nodeOptions.sizes = {}
nodeOptions.sizes.event = 50
nodeOptions.colors.activity = 100

var drawLine
function startDrawLine() {
    console.log("startDrawLine")
    drawLine = svg.line(0, 0, 0, 0).attr({ stroke: '#333333', 'stroke-width': '1', 'stroke-dasharray': '2,2' })
}

function procDrawLine(e,elem) {
    //console.log(e)
    //console.log(elem.cx())
    //drawLine = svg.line(this.cx(), this.cy(), this.cx(), this.cy()).stroke({ width: 1 });
    
    var scgtransf = scalegroup.transform()
    var x1 = elem.x() * actualZoom + scgtransf.x
    var y1 = elem.y() * actualZoom + scgtransf.y
    
    var x2 = e.pageX
    var y2 = e.pageY

    drawLine.plot(x1, y1, x2, y2)
}

function stopDrawLine(e,elem) {
    
    console.log("stopDrawLine")
    //console.log(elem)
    document.removeEventListener('mousemove', procWrap, false)
    document.removeEventListener('click', stopWrap, false)
    
    drawLine.remove()
    //var circle = svg.circle(5).attr({ fill: 'pink' }).move(e.pageX-2.5, e.pageY-2.5)
    if (!elem.insideGbox(e.pageX, e.pageY)) {
        scalegroup.each(function (i, children) {
            if (this.data('is-node') == true && this.insideGbox(e.pageX, e.pageY)) {
                //if (debuggable) console.log('try to connect with ' + this.attr('id'))

                if (this.data('is-node') == true && this.data('type') != 'pull') {
                    scalegroup.add(svg.bpmnline({ fromid: elem.attr('id'), toid: this.attr('id') }))
                } else {
                    //if (debuggable) console.log('data false')
                    //if (debuggable) console.log('type ' + this.data('type'))
                }
            } else {
                //if (debuggable) console.log('this outside')
            }

        })
    }
}

function getIconByType(selectedType, modelId, objId) {
    //console.log(selectedType,modelId,objId)
    switch (selectedType) {
        case 'start_dropdown_1':
            return ''
            break
        case 'start_dropdown_2':
            return 'icon-mail'
            break
        case 'start_dropdown_3':
            return 'icon-clock'
            break
        case 'start_dropdown_4':
            return '\ue805'
            break
        case 'start_dropdown_5':
            return '\ue807'
            break
        case 'start_dropdown_6':
            return 'icon-target'
            break
        case 'start_dropdown_7':
            return 'icon-plus'
            break
        case 'start_dropdown_card':
            new_window('/pls/gis/ais_wf.p_scheme.p_obj_admin?v_model_id=' + modelId + '&v_id=' + objId)
            return 'card'
            break
        default:
            return ''
    }
}


//nodes floating adding
function floatingAdd(e) {
    var newObj = scalegroup.bpmnnode({ type: 'event', subtype: 'start' })
      , scgtransf = scalegroup.transform()
      , moFunc = function (e) {
            console.log('window mousemove')
            newObj.move((e.pageX-scgtransf.x)/ actualZoom, (e.pageY-scgtransf.y)/ actualZoom)
		}
	  , downFunc = function (e) {
            console.log('window mousedown')
            e.stopPropagation();
            SVG.off(window, 'mousemove', moFunc)
            SVG.off(window, 'mousedown', downFunc)
            //svg.off('mousedown', paning)
            
            isPlacing = false

		}
    
    isPlacing = true    
    newObj.move(e.pageX, e.pageY)
    
    svg.off('mousedown', paning)
    //svg.off('mousemove', moveFunc) //TODO also turn off this listener
	//svg.off('mouseup', null) //TODO change null to func

    SVG.on(window, 'mousemove', moFunc)
    SVG.on(window, 'mousedown', downFunc)
    
   /* SVG.on(window, 'mousemove', function (e) {
        console.log('window mousemove')
        newObj.move((e.pageX-scgtransf.x)/ actualZoom, (e.pageY-scgtransf.y)/ actualZoom)
        
    })
    SVG.on(window, 'mousedown', function (e) {
        console.log('window mousedown')
        SVG.off(window, 'mousemove', null)
        //SVG.off(window, 'mousedown', null)
        //svg.on('mousedown', paning)
        
    })*/


    /*svg.mousemove(function(e) {
        newObj.move(e.pageX,e.pageY)    
    })
    svg.mousedown(function (e) {
        this.mousemove(null)
        paning(e);
    })
    */

}