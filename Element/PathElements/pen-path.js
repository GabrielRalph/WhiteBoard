import { Vector } from "../../SvgPlus/4.js";
import { fitCurve } from "./fit-curve.js";
import { PathElement } from "./path-elements.js";

function points2Dpath(points, simp = 0) {
    let dpath = points.length == 1 ? `M${points[0]}L${points[0]}` : `M${points.join("L")}`

    if (points.length > 5 && simp > 0) {
        try {
            let r = (n) => n.map(v => Math.round(v));
            let curves = fitCurve(points.map(v => [v.x, v.y]), simp);
            dpath = `M${curves.map(s => `${r(s[0])}C${r(s[1])},${r(s[2])}`).join(',')},${r(curves[curves.length-1][3])}`;
        } catch (e) {
            console.log(e);
        }
    }
    return dpath;
}

class PenPath extends PathElement {
    constructor(whiteboard){
        super(whiteboard);
        this.classList.add("pen-path")
        this.min_threshold = 0.2;
        this.ewa_smoothing = 0.2;
        this.ewa = null;
        this.points = []
        this.si = 0;
        this.curves = [];
    }

    isInside(point) {
        let isInside = this.path.isVectorInStroke(point);
        if (!isInside && this.isFilled) isInside = this.path.isVectorInFill(point);
        return isInside;
    }

    /** @param {Vector} v */
    addPoint(v) {
        let {ewa, ewa_smoothing, points, min_threshold} = this;

        if (ewa == null) ewa = v;
        v = v.mul(ewa_smoothing).add(ewa.mul(1-ewa_smoothing));
        
        let lastPoint = points[points.length-1];
        let delta = min_threshold * 2;
        if (lastPoint instanceof Vector) {
            delta = lastPoint.dist(v);
        }

        if (delta > min_threshold) {
            this.ewa = v;
            points.push(v);
            this.dPath = points2Dpath(points);
        }
    }

    endPath(){
        let {points} = this;
        let start = points[0];
        let end = points[points.length-1];

        // Check the distance from the start point to the end point
        // is greater than 3 times the stroke, if so join the ends 
        // and apply the stroke
        if (start.dist(end) < 3 * this.sw) {
            points.push(start);
            this.isFilled = true;
            this.path.styles = {
                fill: this.pFill
            }
        }

        // compute the dpath
        let dpath = points2Dpath(points, this.sw/2);
        this.dPath = dpath;
        this.points = [] // no longer needed
        // setTimeout(() => {

        this.dispatchCreationEvent();
            // this.dispatchDataChange();
        // }, 50)
        // this.dispatchCreationEvent();
    }

    setStyleSet(sset){
        super.setStyleSet(sset);
        this.path.props = {
            "fill-opacity": sset["fill-opacity"]
        }
        if (sset['marker-end'] || sset['marker-start']) {
            this.ewa_smoothing = 0.1;
        } else {
            this.ewa_smoothing = 0.18;
        }
        this.pFill = sset.fill;
        if (this.isFilled) {
            this.path.styles = {
                "fill": sset.fill
            }
        }
    }

    getData(){
        let d = super.getData();
        d.filled = this.isFilled == true
        return d;
    }

    setData(data){
        super.setData(data);
        this.isFilled = data.filled;
        if (data.filled) {
            this.path.styles = {fill: this.pFill}
        }
    }

    static get name(){
        return "pen-path"
    }

    static get observedStyles(){ return [
        "stroke",
        "fill",
        "stroke-opacity",
        "fill-opacity",
        "stroke-width",
        "marker-end",
        "dash-style",
        "marker-start"
    ]}
}


export default PenPath