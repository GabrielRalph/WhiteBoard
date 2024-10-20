import { SvgPlus } from "../../SvgPlus/4.js";
import { StyleControl, SCChangeEvent } from "../interface.js";
import { DASH_STYLES } from "../../Utilites/basic-shapes.js";

export default class DashStyles extends StyleControl{
    constructor(el = "div"){
        super(el)

        this.class = "col";
        let icons = {};
        for (let key in DASH_STYLES) {
            let i = this.createChild("svg", {
                viewBox: "0 0 20 6",
                class: "c-icon landscape", 
                events: {
                    click: () => this.selectIcon(key)
                }
            })
            i.createChild("path", {"is-stroke": true, d: "M1,3L19,3", styles: DASH_STYLES[key](1)})
            icons[key] = i;
        }
        this.icons = icons;

        let main = this.createChild("svg", {viewBox: "0 0 9 9"})
        main.createChild("path", {"is-stroke": true, d: "M1,3L8,3", styles: DASH_STYLES["solid"](1)})
        main.createChild("path", {"is-stroke": true, d: "M1,7L8,7", styles: DASH_STYLES["square-dot"](1)})
        this.main_icon = main;
    }

    

    selectIcon(key, isUser = true) {
        if (key in this.icons) {
            for  (let k in this.icons) this.icons[k].toggleAttribute("selected", false);
            this.icons[key].toggleAttribute("selected", true);
            this._value = key
           
            if (isUser) this.dispatchChange();
        }
    }


    getIcon(){
        return this.main_icon;
    }


  

    setValue(value){
       this.selectIcon(value, false)
    }

    getValue(){
        return this._value;
    }

    static get name(){
        return "dash-style"
    }
}
