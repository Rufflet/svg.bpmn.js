// main canvas container
var svg = SVG('svg-canvas')

// group for markers ???
var markers = svg.group()

// viewport aka scalegroup
var viewport = svg.group().attr('id', 'viewport').addClass('viewport').size('100%', '100%')

//zero point
var zeropoint = svg.group().attr('id', 'zeropoint')
zeropoint.add(svg.rect(30,2).attr({ fill: '#cccccc' }).style('pointer-events:none;').move(-16, -2))
zeropoint.add(svg.rect(3,30).attr({ fill: '#cccccc' }).style('pointer-events:none;').move(-2, -16))
zeropoint.add(svg.plain('(0,0)').attr({ fill: '#cccccc' }).style('pointer-events:none;').addClass('noselect').move(-40, -20))
viewport.add(zeropoint)

