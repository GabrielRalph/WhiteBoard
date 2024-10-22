import { SvgPlus } from "../SvgPlus/4.js";
import { toCursor } from "../Utilites/basic-funcs.js";
// import { PenPath } from "../Shapes/whiteboard-shapes.js";

let styleSet = {
    "stroke": "rgb(25, 79, 131)",
    "stroke-width": 3,
    "stroke-opacity": 1,
    "marker-end": null,
    "marker-start": null,
    "dash-style": "solid",
    "fill": "rgb(48, 154, 255)",
    "fill-opacity": 1,
}


let currentPath = null
export function styleChange(e, wb) {
    wb.cursor = "crosshair"
    styleSet = wb.styleSet;
}

let init = false;
export function mousedown(e, wb) {
    let start_pos = wb.screenToSVG(e);
    currentPath = wb.createElement("straight-line")
    currentPath.addPoint(start_pos);
    let sset = wb.styleSet;
    currentPath.styleSet = sset;
    wb.disableTools = true;
    init = false;
    e.preventDefault();
}

let lastPoint = null;
export function mousemove(e, wb) {
    let pos = wb.screenToSVG(e);
    lastPoint = pos;
    if (currentPath) {
        currentPath.addPoint(pos, isShift);
        if (!init) {
            init = true;
            currentPath.dispatchLightCreationEvent()
        } else {
            currentPath.dispatchLightDataChange();
        }
        e.preventDefault();
    }
}


function release(e, wb){
    wb.disableTools = false;
    if (currentPath != null) {
        if (currentPath.length > 0) {
            currentPath.endPath()
            currentPath = null;
        } else {
            currentPath.remove();
        }
        e.preventDefault()
    }
}

export function mouseup(e, wb){
   release(e, wb)
}

export function mouseleave(e, wb){
    release(e, wb)
}

export function onSelect(wb){
    wb.styleSet = styleSet;
    wb.cursor = "crosshair"
    wb.isZoomLocked = false;
    wb.isPanLocked = true;
    wb.readOnly = true;
    wb.styleSelection = [
        "arrows",
        "stroke-width",
        "stroke",
        "fill",
        "dash-style"
    ]
}

let anchorAdded = false;
let isShift = false;
export function keydown(e, wb) {
    isShift = e.shiftKey
    if (!anchorAdded && currentPath != null && e.key == " " && lastPoint != null) {
        anchorAdded = true;
        currentPath.addAnchorPoint();
        e.preventDefault();
    }
}
export function keyup(e){
    isShift = e.shiftKey
    if (e.key == " ") anchorAdded = false;
}

export function getName(){
    return "line"
}

export function getIcon(){
    let i = new SvgPlus("svg");
    i.createChild("path", {"is-stroke": true, "stroke-width": "9", d: "M10,10L90,90"})
    // i.innerHTML = `<path d="M18.04,83.79c-2.49,0-4.5-2.01-4.5-4.5s2.01-4.5,4.5-4.5c28.67,0,29-10.84,29.46-25.85.44-14.58,1-32.72,34.46-32.72,2.49,0,4.5,2.01,4.5,4.5s-2.01,4.5-4.5,4.5c-24.74,0-25.03,9.55-25.47,24-.44,14.59-1.05,34.58-38.45,34.58Z"/>`
    i.props = {
        viewBox: "0 0 100 100"
    }
    return i;
}
