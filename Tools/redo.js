import { SvgPlus } from "../SvgPlus/4.js"


export function onSelect(wb){
    console.log(wb);
    wb.isPanLocked = false;
    wb.isZoomLocked = false;
    wb.readOnly = true;
    wb.cursor = "grab";
    wb.styleSelection = [];
    wb.redo();

}

export function getIcon(){
    let icon = new SvgPlus("svg")
    icon.innerHTML = `<path class="cls-1" d="M42.89,26.43l-5.11-8.19,48.11,10.9-41.87,26.82,2.95-12.96c-36.11,3.05-18.24,38.77-18.24,38.77C-3.3,46.75,24.64,29.43,42.89,26.43Z"/>`
   
    icon.props = {
        viewBox: "0 0 100 100"
    }

    return icon;
}

export function getName(){
    return "redo"
}