import { SvgPlus } from "../SvgPlus/4.js"


export function onSelect(wb){
    console.log(wb);
    wb.isPanLocked = false;
    wb.isZoomLocked = false;
    wb.readOnly = true;
    wb.cursor = "grab";
    wb.styleSelection = [];
    wb.undo();

}

export function getIcon(){
    let icon = new SvgPlus("svg")
    icon.innerHTML = `<path class="cls-1" d="M57.11,26.43l5.11-8.19L14.11,29.13l41.87,26.82-2.95-12.96c36.11,3.05,18.24,38.77,18.24,38.77,32.03-35.02,4.09-52.33-14.16-55.34Z"/>`
   
    icon.props = {
        viewBox: "0 0 100 100"
    }

    return icon;
}

export function getName(){
    return "undo"
}