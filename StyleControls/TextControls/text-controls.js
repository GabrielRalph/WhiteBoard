import { SvgPlus } from "../../SvgPlus/4.js";
import { StyleControl, SCChangeEvent } from "../interface.js";
// import { Slider } from "../../slider.js";
const Icons = {
    fontSize: `<polygon points="61.4 78.37 80.21 78.37 80.21 72.83 69.57 70.5 69.57 31.23 80.55 31.23 83.87 37.69 90.02 37.69 90.03 21.63 61.4 21.63 35.91 21.63 35.93 37.69 42.07 37.69 45.4 31.23 56.38 31.23 56.38 70.5 45.73 72.83 45.73 78.37 61.4 78.37"/>
    <polygon points="23.75 78.37 33.92 78.37 33.92 75.37 28.17 74.11 28.17 52.88 34.1 52.88 35.9 56.38 39.22 56.38 39.23 47.69 23.75 47.69 9.97 47.69 9.98 56.38 13.3 56.38 15.1 52.88 21.04 52.88 21.04 74.11 15.28 75.37 15.28 78.37 23.75 78.37"/>`,

    center: `<path class="cls-1" d="M82.58,34.38h-45.16c-4.14,0-7.5-3.36-7.5-7.5s3.36-7.5,7.5-7.5h45.16c4.14,0,7.5,3.36,7.5,7.5s-3.36,7.5-7.5,7.5Z"/>
    <path class="cls-1" d="M73.35,100.62h-26.7c-4.14,0-7.5-3.36-7.5-7.5s3.36-7.5,7.5-7.5h26.7c4.14,0,7.5,3.36,7.5,7.5s-3.36,7.5-7.5,7.5Z"/>
    <path class="cls-1" d="M91.82,67.5H28.18c-4.14,0-7.5-3.36-7.5-7.5s3.36-7.5,7.5-7.5h63.63c4.14,0,7.5,3.36,7.5,7.5s-3.36,7.5-7.5,7.5Z"/>`,
    justify: `<path class="cls-1" d="M91.82,34.38H28.18c-4.14,0-7.5-3.36-7.5-7.5s3.36-7.5,7.5-7.5h63.63c4.14,0,7.5,3.36,7.5,7.5s-3.36,7.5-7.5,7.5Z"/>
    <path class="cls-1" d="M91.82,100.62H28.18c-4.14,0-7.5-3.36-7.5-7.5s3.36-7.5,7.5-7.5h63.63c4.14,0,7.5,3.36,7.5,7.5s-3.36,7.5-7.5,7.5Z"/>
    <path class="cls-1" d="M91.82,67.5H28.18c-4.14,0-7.5-3.36-7.5-7.5s3.36-7.5,7.5-7.5h63.63c4.14,0,7.5,3.36,7.5,7.5s-3.36,7.5-7.5,7.5Z"/>`,
    left: `<path class="cls-1" d="M72.7,33.58H27.53c-4.14,0-7.5-3.36-7.5-7.5s3.36-7.5,7.5-7.5h45.16c4.14,0,7.5,3.36,7.5,7.5s-3.36,7.5-7.5,7.5Z"/>
    <path class="cls-1" d="M54.23,99.82h-26.7c-4.14,0-7.5-3.36-7.5-7.5s3.36-7.5,7.5-7.5h26.7c4.14,0,7.5,3.36,7.5,7.5s-3.36,7.5-7.5,7.5Z"/>
  <path class="cls-1" d="M91.17,66.7H27.53c-4.14,0-7.5-3.36-7.5-7.5s3.36-7.5,7.5-7.5h63.63c4.14,0,7.5,3.36,7.5,7.5s-3.36,7.5-7.5,7.5Z"/>`
}

class TextSize extends StyleControl{
    constructor(el = "color-controls"){
        super(el)
      
        this.input = this.createChild("input", {
            type: "number",
            events: {
                "input": () => {
                    SCChangeEvent.dispatch(this);
                }
            }
        })
        this.value = 18;

    }


    getIcon(){
        let i = new SvgPlus("svg");
        i.props = {viewBox: "0 0 100 100", content: Icons.fontSize};
        return i;
    }


    setValue(value){
        value = parseFloat(value);
        if (!Number.isNaN(value)) {
            this.input.value = value;
        }
    }

    getValue(){
       let fs = this.input.value;
       if (fs < 1) fs = 1;
       return fs;
    }

    static get name(){
        return "font-size"
    }
}


class TextAlign extends StyleControl{
    constructor(el = "color-controls"){
        super(el)
        
        for (let name of ["left", "center", "right"]) {
            let i = this.makeIcon(name, true);
            i.onclick = () => {this.select(name, true)}
        }
        this._selectedIcon = this.makeIcon("left");
        this.select("left", false);

    }

    select(name, isUser) {
        for (let icon of this.children) {
            icon.toggleAttribute("selected", name == icon.name);
        }
        this._selectedIcon.innerHTML = this.makeIcon(name).innerHTML;
        this._selectedIcon.styles = {
            transform: `scaleX(${name == "right" ? -1 : 1})`
        }
        this._value = name;
        if (isUser) this.dispatchChange();
    }

    makeIcon(name, append = false) {
       let i = new SvgPlus("svg");
       i.props = {
            viewBox: "0 0 120 120",
            class: "c-icon",
            style: {
                transform: `scaleX(${name == "right" ? -1 : 1})`
            },
            content: Icons[name === "right" ? "left" : name]
       }
       i.name = name;
       if (append) this.appendChild(i);
       return i;
    }


    getIcon(){
        return this._selectedIcon
    }


    setValue(value){
        this.select(value, false);
    }

    getValue(){
       return this._value;
    }

    static get name(){
        return "text-align"
    }
}
export default [TextSize, TextAlign]