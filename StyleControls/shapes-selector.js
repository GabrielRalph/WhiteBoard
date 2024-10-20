import { SvgPlus, Vector } from "../SvgPlus/4.js";
import { StyleControl, SCChangeEvent } from "./interface.js";
import { BasicShapes } from "../Utilites/basic-shapes.js"


export default class ShapeSelctor extends StyleControl{
    constructor(el = "shape-selector"){
        super(el)
        
        let icons = {}
        for (let shapeName in BasicShapes) {
            let icon = this.createChild("svg", {
                class: "c-icon",
                viewBox: "0 0 100 100",
                events: {
                    click: () => this.selectIcon(shapeName)
                }
            });
            let shape = icon.createChild(BasicShapes[shapeName]);
          
            icons[shapeName] = icon;
        }

        let main_icon = new SvgPlus("svg");
        main_icon.props = {viewBox: "0 0 100 100"};
        this.main_icon = main_icon;
        this.icons = icons;

        this.selectIcon("ellipse")
    }

    selectIcon(name, user = true) {
        if (name in BasicShapes) {
            for (let key in this.icons) {
                this.icons[key].toggleAttribute("selected", key == name)
            }
    
            this.main_icon.innerHTML = "";
            let shape = this.main_icon.createChild(BasicShapes[name]);
    
            this._value = name;
            if (user) {
                SCChangeEvent.dispatch(this);
            }
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
        return "shape"
    }
}
