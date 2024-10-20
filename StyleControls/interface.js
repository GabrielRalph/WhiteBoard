
import { SvgPlus } from "../SvgPlus/4.js";
export class SCChangeEvent extends Event {
    constructor(sc, click = false, value, type){
        super(click ? "c-change" : "change");
        this.sc = sc;
        this.value = value;
        this.changeType = type;
    }

    static dispatch(styleControl, click = false, value = null, type = null) {
        styleControl.dispatchEvent(new SCChangeEvent(styleControl, click, value, type))
    }
}
export class StyleControl extends SvgPlus {
    getValue(){}

    setValue(value){}

    setStyleSet(sset){
        if (this.name in sset)
            this.value = sset[this.name]
    }

    dispatchChange(){
        SCChangeEvent.dispatch(this);
    }

    dispatchClickChange(value, type) {
        SCChangeEvent.dispatch(this, true, value, type);
    }

    getIcon(){}

    initialise(wb){}

    get value(){return this.getValue()}
    set value(value) {this.setValue(value)}
    set styleSet(value){this.setStyleSet(value)}

    get icon(){
        let i = this.getIcon();
        i.classList.add("c-icon");
        i.name = this.name;
        i.styleControl = this;
        return i;
    }

    get name(){
        return this["__+"].name
    }

    static get name(){
        return "hey"
    }

    static get keys(){
        return [this.name]
    }
}