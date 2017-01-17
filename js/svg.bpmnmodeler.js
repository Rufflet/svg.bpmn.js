/*
Change scalegroup to another container

*/


var bpmnNodesCounter = 0;

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
function startDrawLine(e) {
    console.log("startDrawLine")
    drawLine = svg.line(0, 0, 0, 0)
                  .attr({
                      stroke: '#333333',
                      'stroke-width': '1',
                      'stroke-dasharray': '2,2'
                    })
}

function procDrawLine(e,elem) {
    // console.log(e.pageX)
    // console.log(elem.cx())
    //drawLine = svg.line(this.cx(), this.cy(), this.cx(), this.cy()).stroke({ width: 1 });
    
    var x1 = elem.cx()// * actualZoom + scalegroup.x()
    var y1 = elem.cy()// * actualZoom + scalegroup.y()

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
                //if (debuggable)
                console.log('try to connect with ' + this.attr('id'))

                if (this.data('is-node') == true && this.data('type') != 'pull') {
                    scalegroup.add(svg.bpmnline({ fromid: elem.attr('id'), toid: this.attr('id') }))
                } else {
                    //if (debuggable)
                    console.log('data false')
                    //if (debuggable)
                    console.log('type ' + this.data('type'))
                }
            } else {
                //if (debuggable)
                console.log('this outside')
            }

        })
    }
}










function getIconByType(selectedType,modelId,objId) {
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
