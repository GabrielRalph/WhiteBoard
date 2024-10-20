<!-- - Copy Paste 3hr -->
- Frame 2hr
<!-- - Line Styles 2hr -->
<!-- - Straight Line 2hr -->
<!-- - exit/minimise toolbar 2hr -->
<!-- - Capture 2hr -->

- DATABASE (?)
- - Lock elements
- - delete you / all

<!-- - Ink Dropper 3hr -->
<!-- - Rotation 5hr -->


import { WhiteBoardElementBase } from "../interface.js"
import { Vector } from "../../SvgPlus/4.js";
import { DPath } from "../../SvgPlus/svg-path.js";
import { findPathIntersections } from "../../Utilites/intersection.js";
import { DASH_STYLES } from "../../Utilites/basic-shapes.js";

const cpoint_serialise = {
    "M": (cp) => ["M", cp.x, cp.y],
    "C": (cp) => ["C", cp.c1.x, cp.c1.y, cp.c2.x, cp.c2.y, cp.x, cp.y],
    "L": (cp) => ["L", cp.x, cp.y],
    "Z": (cp) => ["Z"],
}


export class PathElement extends WhiteBoardElementBase {
    constructor(whiteboard){
        super(whiteboard);
        this.path = this.createChild("path", {
            styles: {
                "stroke-linecap": "round", 
                fill: "none",
                "stroke-linejoin": "round",
            }
        });

        this.trans = [new Vector(), new Vector(1)]
    }

     /** * @param {string|DPath} */
    set dPath(dpath) {
        this._dpath = dpath;
        this.transformPath();
        // this.transDPath = dpath;
    }

    //  /** * @param {string|DPath} */
    // set transDPath(dpath){
    //     this._transDPath = dpath;
    //     this.d = dpath
    // }

    // /** * @return {string|DPath} */
    // get transDPath(){
    //     return this._transDPath;
    // }

    /** * @return {string|DPath} */
    get dPath(){
        return this._dpath;
    }

     /** * @param {string|DPath} */
    set d(value) {
        this.path.props = {d: value + ""};
    }

    get length(){
        return this.path.getTotalLength();
    }


    set dashStyle(dashType) {
        let style = dashType in DASH_STYLES ? DASH_STYLES[dashType](this.sw) : DASH_STYLES.solid(this.sw);
        this.path.styles = style;
    }


    isInside(point) {
        let isInside = this.path.isVectorInStroke(point);
        return isInside;
    }

    isIntersection(points) {
        let intersection = findPathIntersections(this.dPath, "M"+points.join("L"));
        let isIntrsection = intersection.length > 0;
        return isIntrsection;
    }


    fixTransformDelta(){
        this.trans = this.realTrans;
    }

    setDragDelta(delta) {
        this.realTrans[0] = this.startTrans[0].add(delta);
        this.transformPath()
    }

    setScaleDelta(origin, scale) {
        let [delta_0, scale_0] = this.startTrans;
        this.realTrans = [scale.mul(delta_0.sub(origin)).add(origin), scale_0.mul(scale)];
        this.transformPath();
    }


    transformPath(){
        let [delta, scale] = this.realTrans;
        let dpath = new DPath(this.dPath);
        if (!(delta.norm() < 1e-7 && scale.x == 1 && scale.y == 1)) {
            for (let cp of dpath) {
                cp.mul(scale);
                cp.add(delta);
            }
        }
        dpath = dpath.toString();
        this.d = dpath;
    }


    setTransform([position, size]) {
        this.realTrans = [position, size];
        this.startTrans = [position, size];
    }

    getTransform(){
        return this.realTrans;
    }

   
    setStyleSet(sset){
        this.path.props = {
            stroke: sset.stroke,
            "stroke-width": sset["stroke-width"],
            "marker-end": `url(#${sset['marker-end']})`,
            "marker-start": `url(#${sset['marker-start']})`,
            "stroke-opacity": sset["stroke-opacity"],
        }
        this.dashStyle = sset["dash-style"]
    }

    getData(){
        let dpath = new DPath(this.dPath);
        let value = [...dpath].map(cp => cpoint_serialise[cp.cmd_TYPE](cp));
        let d = {
            path: value,
        }
        return d;
    }

    setData(data){
        let dpath = data.path.map(cmd => `${cmd.shift()}${cmd.join(",")}`).join("");
        this.dPath = dpath;
    }


 
    static get name(){
        return "path-element"
    }

    static get observedStyles(){ return [
        "stroke",
        "stroke-opacity",
        "stroke-width",
        "marker-end",
        "marker-start",
        "dash-style",
    ]}
}