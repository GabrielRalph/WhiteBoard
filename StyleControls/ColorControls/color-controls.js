import { SvgPlus } from "../../SvgPlus/4.js";
import { StyleControl, SCChangeEvent } from "../interface.js";
import { ColorPicker } from "./color-picker.js";
const Modes = {
    "stroke": `<path d="M66.05,26.5c4.04,0,7.45,3.41,7.45,7.45v32.1c0,4.04-3.41,7.45-7.45,7.45h-32.1c-4.04,0-7.45-3.41-7.45-7.45v-32.1c0-4.04,3.41-7.45,7.45-7.45h32.1M66.05,12.5h-32.1c-11.8,0-21.45,9.65-21.45,21.45v32.1c0,11.8,9.65,21.45,21.45,21.45h32.1c11.8,0,21.45-9.65,21.45-21.45v-32.1c0-11.8-9.65-21.45-21.45-21.45h0Z"/>`, 
    "fill": `<rect x="12.5" y="12.5" width="75" height="75" rx="21.45" ry="21.45"/>`, 
    "text": `<polygon points="49.24 83.21 71.26 83.21 71.26 76.72 58.8 73.99 58.8 28.03 71.65 28.03 75.55 35.6 82.73 35.6 82.75 16.79 49.24 16.79 19.41 16.79 19.43 35.6 26.62 35.6 30.51 28.03 43.36 28.03 43.36 73.99 30.9 76.72 30.9 83.21 49.24 83.21"/>`
}
const All = `<rect x="12.94" y="11.86" width="76.28" height="76.28" rx="21.45" ry="21.45"/>
<polygon  points="49.87 71.94 64.41 71.94 64.41 67.65 56.18 65.85 56.18 35.49 64.67 35.49 67.24 40.48 71.99 40.48 72 28.06 49.87 28.06 30.16 28.06 30.17 40.48 34.92 40.48 37.49 35.49 45.98 35.49 45.98 65.85 37.75 67.65 37.75 71.94 49.87 71.94"/>`


class ColorControls extends StyleControl {
    constructor(){
        super("div")
        this.colorPicker = this.createChild(ColorPicker, {
            events: {
                "change": (e) => {
                    this.onColor(e.user);
                }
            }
        });
        this.flattenValue = true;
        this.sicon = new SvgPlus("svg");
    }

    getIcon(){
        this.sicon.classList.add("i-color")
        return this.sicon;
    }

    get color(){return this.colorPicker.color}
    set color(color){this.colorPicker.color = color}
    get opacity(){return this.colorPicker.opacity}
    set opacity(opacity){this.colorPicker.opacity = opacity}

    onColor(isUser){
        if (isUser) {
            SCChangeEvent.dispatch(this);
        }
        this.sicon.styles = {
            "--selected-color": this.color,
            "--opacity": this.opacity
        }
    }

    getValue(){
        let name = this.name
        return {
            [name]: this.color,
            [name+"-opacity"]: this.opacity
        }
    }

    setStyleSet(sset) {
        if (this.name in sset)
            this.color = sset[this.name]
        if ((this.name + "-opacity") in sset)
            this.opacity = sset[this.name + "-opacity"]
    }

    static get keys(){
        return [this.name, this.name+"-opacity"]
    }
}

class StrokeColorControls extends ColorControls {
    constructor(){
        super();
        let i = new SvgPlus("svg");
        i.props = {styles: {"--selected-color": "red"}, viewBox: "0 0 100 100", content: Modes["stroke"]};
        this.sicon = i;
        this._color = "red";
    }

    static get name(){
        return "stroke"
    }
}

class FillColorControls extends ColorControls {
    constructor(){
        super();
        let i = new SvgPlus("svg");
        i.props = {
            viewBox: "0 0 100 100",
            content: Modes["fill"],
            styles: {"--selected-color": "white"}
        };
        this.sicon = i;
        this._color = "white";
    }

    static get name(){
        return "fill"
    }
}

class TextColorControls extends ColorControls {
    constructor(){
        super();
        let i = new SvgPlus("svg");
        i.props = {styles: {"--selected-color": "black"}, viewBox: "0 0 100 100", content: Modes["text"], };
        this.sicon = i;
        this._color = "black"
    }

    static get name(){
        return "text-color"
    }
}


export default [
    StrokeColorControls,
    FillColorControls,
    TextColorControls,
]
