import { SvgPlus } from "../../SvgPlus/4.js";
import { StyleControl, SCChangeEvent } from "../interface.js";

const arrows = {
    "arrow1": `<path d="M10.59,63.5l15.86-27.16,6.18,10.84c12.8-5.48,22.19-.78,30.58,3.41,8.86,4.43,16.5,8.25,28.25.85l3.74,5.93c-15.09,9.51-25.73,4.18-35.13-.51-7.71-3.86-14.5-7.25-23.94-3.54l5.9,10.35-31.45-.16Z"/>`,
    "arrow2": `<path d="M85.04,52.4c-11.75,7.4-19.4,3.58-28.25-.85-8.29-4.15-17.57-8.78-30.15-3.58l3.52-6.37c.94-1.7.32-3.83-1.37-4.77-1.12-.62-2.43-.56-3.47.04-.53.31-.98.76-1.3,1.33l-12.79,23.13,26.42.27c1.95.02,3.53-1.54,3.55-3.47.02-1.94-1.53-3.53-3.47-3.55l-8.37-.09.37-.22c9.43-3.71,16.22-.32,23.94,3.54,9.39,4.7,20.04,10.02,35.13.51l-3.74-5.93Z"/>`,
    "arrow3": `<path d="M85.06,48.86c-11.75,7.4-19.4,3.58-28.25-.85-6.63-3.32-13.9-6.94-22.98-5.6-2.26-2.9-5.78-4.77-9.74-4.77-6.83,0-12.36,5.53-12.36,12.36s5.53,12.36,12.36,12.36,12.36-5.53,12.36-12.36c0-.28-.02-.54-.04-.82,6.23-.42,11.49,2.21,17.26,5.1,9.39,4.7,20.04,10.02,35.13.51l-3.74-5.93Z"/>`
}



export default class ArrowHeads extends StyleControl{
    constructor(el = "arrow-selector"){
        super(el)
        this.flattenValue = true;
        this._state = {}
        let rows = {}
        for (let endType of ["start", "end"]) {
            this._state[endType] = null;
            let row = this.createChild("div", {class: "col"});
            rows[endType] = row;
            row.icons = {}
            for (let name in arrows) {
                let icon = row.createChild("svg", {
                    class: "c-icon",
                    viewBox: "0 0 100 100",
                    events: {
                        click: () => this.selectIcon(endType, name)
                    },
                    content: arrows[name],
                    styles: {
                        transform: `scaleX(${endType != "start" ? -1 : 1})`
                    }
                });
                row.icons[name] = icon;
            }
        }

        let main_icon = new SvgPlus("svg");
        main_icon.props = {
            viewBox: "0 0 100 100",
            content: `<path d="M85.38,16.98l-35.53-5.09,5.3,13.22c-13.98,7.55-16.45,19.28-18.65,29.75-2.32,11.06-4.33,20.61-19.28,25.86l2.65,7.55c19.21-6.75,22-20.04,24.46-31.77,2.02-9.63,3.81-18.11,13.82-23.91l5.06,12.62,22.17-28.23Z"/>`
        };
        this.main_icon = main_icon;
        this.rows = rows;

        this.setValue({"start": null, "end": null})
    }

    initialise(wb){
        wb.defs.createChild("marker", {
            id: "arrow1",
            viewBox: "0 0 10 10",
            refX: 5,
            refY: 5,
            markerWidth: 4,
            markerHeight: 4,
            orient: "auto-start-reverse",
            content: `<path fill = "context-stroke" d="M 0 0 L 10 5 L 0 10 z" />`
        })
        wb.defs.createChild("marker", {
            id: "arrow2",
            viewBox: "0 0 10 10",
            refX: 5,
            refY: 5,
            markerWidth: 4,
            markerHeight: 4,
            orient: "auto-start-reverse",
            content: `<path fill = "none" stroke-width = "2.5" stroke-linecap = "round" stroke = "context-stroke" d="M 1.25 1.25 L 7.53 5 L 1.25 8.75" />`
        })
        wb.defs.createChild("marker", {
            id: "arrow3",
            viewBox: "0 0 10 10",
            refX: 5,
            refY: 5,
            markerWidth: 4,
            markerHeight: 4,
            orient: "auto-start-reverse",
            content: `<circle fill = "context-stroke" cx = "5" cy = "5" r = "5" />`
        })
    }

    selectIcon(endType, name) {
        for (let key in this.rows[endType].icons) {
            let icon = this.rows[endType].icons[key]
            if (key == name) {
                icon.toggleAttribute("selected")
                this._state[endType] = icon.hasAttribute("selected") ? name : null
            } else {
                icon.toggleAttribute("selected", false)
            }
        }
        SCChangeEvent.dispatch(this);
    }


    getIcon(){
        return this.main_icon;
    }


    setStyleSet(sset) {
        this.value = sset;
    }
   

    setValue(value){
        let v = {}
        for (let key of ["start", "end"]) {
            let mkey = "marker-"+key;
            let ov = mkey in value ? value[mkey] : null
            let row = this.rows[key].icons;
            for (let name in row) {
                row[name].toggleAttribute("selected", ov == name)
            }
            v[key] = ov;
        }
        this._state = v;
    }

    getValue(){
       let value = {};
       for (let key in this._state) {
            value["marker-" + key] = this._state[key];
       }
       return value;
    }

    static get name(){
        return "arrows"
    }

    static get keys(){
        return ["marker-start", "marker-end"]
    }
}
