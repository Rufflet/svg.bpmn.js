SVG.extend(SVG.G, {
  insideGbox: function(x, y) {
    var bbox = this.bbox()
      , parent = this.parent()
      , scgtransf = parent.transform()
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
   /*  var circle = svg.circle(5).attr({ fill: 'pink' }).move(x-2.5, y-2.5)
    var brect = svg.rect(ww, hh).move(xx,yy).attr({ fill: 'none', stroke: "orange", "stroke-width": 1, "stroke-opacity"  : 0.7 })
    circle.animate(2500).attr({ opacity: 0})
    brect.animate(2500).stroke({ opacity: 0}) */

    return x > xx
        && y > yy
        && x < xx + ww
        && y < yy + hh
  }
})