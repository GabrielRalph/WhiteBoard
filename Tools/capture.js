import { SvgPlus } from "../SvgPlus/4.js"


export function onSelect(wb){
    console.log(wb);
    wb.isPanLocked = false;
    wb.isZoomLocked = false;
    wb.readOnly = true;
    wb.cursor = "grab";
    wb.styleSelection = [];

    wb.screenShot();
}

export function getIcon(){
    let icon = new SvgPlus("svg")
    icon.innerHTML = `<path class="cls-1" d="M83.5,30.47h-10.89c-2.29,0-4.41-1.2-5.58-3.17l-2.85-4.77c-1.17-1.96-3.3-3.17-5.58-3.17h-12.49c-2.29,0-4.41,1.2-5.58,3.17l-2.85,4.77c-1.17,1.96-3.3,3.17-5.58,3.17h-11.93c-3.59,0-6.51,2.91-6.51,6.51v34.84c0,3.59,2.91,6.51,6.51,6.51h63.34c3.59,0,6.51-2.91,6.51-6.51v-34.84c0-3.59-2.91-6.51-6.51-6.51ZM51.83,68.73c-7.92,0-14.34-6.42-14.34-14.34s6.42-14.34,14.34-14.34,14.34,6.42,14.34,14.34-6.42,14.34-14.34,14.34Z"/>`
   
    icon.props = {
        viewBox: "0 0 100 100"
    }

    return icon;
}


export function getName(){
    return "capture"
}