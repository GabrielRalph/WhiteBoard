import { SvgPlus } from "../SvgPlus/4.js"


export function onSelect(wb){
    console.log(wb);
    wb.isPanLocked = false;
    wb.isZoomLocked = false;
    wb.readOnly = true;
    wb.cursor = "grab";
    wb.styleSelection = [];

    if (wb.isSelection) {
        wb.deleteElement(wb.selection)
    } else {
        wb.deleteAll();
    }
}

export function getIcon(){
    let icon = new SvgPlus("svg")
    icon.innerHTML = `<path  d="M68.04,18.67h-5.55c-1.46-4.86-6.8-8.27-13.59-8.27s-12.13,3.41-13.59,8.27h-5.55c-2.63,0-4.75,2.29-4.75,5.12s2.13,5.12,4.75,5.12h38.28c2.63,0,4.75-2.29,4.75-5.12s-2.13-5.12-4.75-5.12Z"/>
    <path  d="M70.93,37.45H26.36c-3.95,0-6.87,3.95-5.98,8.08l8.04,37.69c.64,3,3.12,5.13,5.98,5.13h28.5c2.86,0,5.34-2.13,5.98-5.13l8.04-37.69c.88-4.14-2.04-8.08-5.98-8.08ZM39.98,80.54c-.15.02-.31.02-.46.02-2.42,0-4.49-1.98-4.73-4.63l-2.21-24.75c-.25-2.81,1.66-5.31,4.28-5.58,2.63-.26,4.94,1.79,5.19,4.6l2.21,24.75c.25,2.81-1.66,5.31-4.28,5.58ZM62.5,75.94c-.24,2.65-2.31,4.63-4.73,4.63-.15,0-.31,0-.46-.02-2.61-.27-4.53-2.77-4.28-5.58l2.21-24.75c.25-2.81,2.57-4.87,5.19-4.6,2.61.27,4.53,2.77,4.28,5.58l-2.21,24.75Z"/>`
   
    icon.props = {
        viewBox: "0 0 100 100"
    }

    return icon;
}

export function clearSelectionOnSelect(){
    return false;
}

export function getName(){
    return "delete"
}