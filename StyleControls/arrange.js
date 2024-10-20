import { SvgPlus } from "../SvgPlus/4.js";
import { StyleControl, SCChangeEvent } from "./interface.js";
// import { Slider } from "../../slider.js";
const Icons = {
    bottom: `<path d="M88.86,22.41c0-3.04-2.46-5.5-5.5-5.5s-5.5,2.46-5.5,5.5v36.26h-5.47l10.97,19,10.97-19h-5.47V22.41Z"/>
    <path d="M65.86,62.74l-4.88-2.82-13.99,8.08c-2.81,1.62-6.33,2.51-9.92,2.51-3.09,0-5.89-.67-8.08-1.94l-14.97-8.64-3.88,2.24c-4.14,2.39-4.59,6-1,8.07l21.87,12.62c3.58,2.07,9.84,1.81,13.98-.58l19.88-11.48c4.14-2.39,4.59-6,1-8.07Z"/>
    <path d="M65.86,44.97l-4.88-2.82-13.99,8.08c-2.81,1.62-6.33,2.51-9.92,2.51-3.09,0-5.89-.67-8.08-1.94l-14.97-8.64-3.88,2.24c-4.14,2.39-4.59,6-1,8.07l21.87,12.62c3.58,2.07,9.84,1.81,13.98-.58l19.88-11.48c4.14-2.39,4.59-6,1-8.07Z"/>
    <path d="M31,47.32l-21.87-12.62c-3.58-2.07-3.13-5.68,1-8.07l19.88-11.48c4.14-2.39,10.39-2.65,13.98-.58l21.87,12.62c3.58,2.07,3.13,5.68-1,8.07l-19.88,11.48c-4.14,2.39-10.39,2.65-13.98.58Z"/>`,

    down: `<path d="M65.76,62.74l-4.88-2.82-13.99,8.08c-2.81,1.62-6.33,2.51-9.92,2.51-3.09,0-5.89-.67-8.08-1.94l-14.97-8.64-3.88,2.24c-4.14,2.39-4.59,6-1,8.07l21.87,12.62c3.58,2.07,9.84,1.81,13.98-.58l19.88-11.48c4.14-2.39,4.59-6,1-8.07Z"/>
    <path d="M65.76,44.97l-4.88-2.82-13.99,8.08c-2.81,1.62-6.33,2.51-9.92,2.51-3.09,0-5.89-.67-8.08-1.94l-14.97-8.64-3.88,2.24c-4.14,2.39-4.59,6-1,8.07l21.87,12.62c3.58,2.07,9.84,1.81,13.98-.58l19.88-11.48c4.14-2.39,4.59-6,1-8.07Z"/>
    <path d="M30.9,47.32l-21.87-12.62c-3.58-2.07-3.13-5.68,1-8.07l19.88-11.48c4.14-2.39,10.39-2.65,13.98-.58l21.87,12.62c3.58,2.07,3.13,5.68-1,8.07l-19.88,11.48c-4.14,2.39-10.39,2.65-13.98.58Z"/>
    <path d="M88.55,20.28c0-3.04-2.46-5.5-5.5-5.5s-5.5,2.46-5.5,5.5v14.56h-5.47l10.97,19,10.97-19h-5.47v-14.56Z"/>`,
    main: `<path d="M78.36,62.74l-4.88-2.82-13.99,8.08c-2.81,1.62-6.33,2.51-9.92,2.51-3.09,0-5.89-.67-8.08-1.94l-14.97-8.64-3.88,2.24c-4.14,2.39-4.59,6-1,8.07l21.87,12.62c3.58,2.07,9.84,1.81,13.98-.58l19.88-11.48c4.14-2.39,4.59-6,1-8.07Z"/>
    <path d="M78.36,44.97l-4.88-2.82-13.99,8.08c-2.81,1.62-6.33,2.51-9.92,2.51-3.09,0-5.89-.67-8.08-1.94l-14.97-8.64-3.88,2.24c-4.14,2.39-4.59,6-1,8.07l21.87,12.62c3.58,2.07,9.84,1.81,13.98-.58l19.88-11.48c4.14-2.39,4.59-6,1-8.07Z"/>
    <path d="M43.5,47.32l-21.87-12.62c-3.58-2.07-3.13-5.68,1-8.07l19.88-11.48c4.14-2.39,10.39-2.65,13.98-.58l21.87,12.62c3.58,2.07,3.13,5.68-1,8.07l-19.88,11.48c-4.14,2.39-10.39,2.65-13.98.58Z"/>`,
    top: `<path d="M65.86,62.74l-4.88-2.82-13.99,8.08c-2.81,1.62-6.33,2.51-9.92,2.51-3.09,0-5.89-.67-8.08-1.94l-14.97-8.64-3.88,2.24c-4.14,2.39-4.59,6-1,8.07l21.87,12.62c3.58,2.07,9.84,1.81,13.98-.58l19.88-11.48c4.14-2.39,4.59-6,1-8.07Z"/>
    <path d="M65.86,44.97l-4.88-2.82-13.99,8.08c-2.81,1.62-6.33,2.51-9.92,2.51-3.09,0-5.89-.67-8.08-1.94l-14.97-8.64-3.88,2.24c-4.14,2.39-4.59,6-1,8.07l21.87,12.62c3.58,2.07,9.84,1.81,13.98-.58l19.88-11.48c4.14-2.39,4.59-6,1-8.07Z"/>
    <path d="M31,47.32l-21.87-12.62c-3.58-2.07-3.13-5.68,1-8.07l19.88-11.48c4.14-2.39,10.39-2.65,13.98-.58l21.87,12.62c3.58,2.07,3.13,5.68-1,8.07l-19.88,11.48c-4.14,2.39-10.39,2.65-13.98.58Z"/>
    <path d="M77.86,70.42c0,3.04,2.46,5.5,5.5,5.5s5.5-2.46,5.5-5.5v-36.26h5.47l-10.97-19-10.97,19h5.47v36.26Z"/>`,
    up: `<path d="M65.76,62.74l-4.88-2.82-13.99,8.08c-2.81,1.62-6.33,2.51-9.92,2.51-3.09,0-5.89-.67-8.08-1.94l-14.97-8.64-3.88,2.24c-4.14,2.39-4.59,6-1,8.07l21.87,12.62c3.58,2.07,9.84,1.81,13.98-.58l19.88-11.48c4.14-2.39,4.59-6,1-8.07Z"/>
    <path d="M65.76,44.97l-4.88-2.82-13.99,8.08c-2.81,1.62-6.33,2.51-9.92,2.51-3.09,0-5.89-.67-8.08-1.94l-14.97-8.64-3.88,2.24c-4.14,2.39-4.59,6-1,8.07l21.87,12.62c3.58,2.07,9.84,1.81,13.98-.58l19.88-11.48c4.14-2.39,4.59-6,1-8.07Z"/>
    <path d="M30.9,47.32l-21.87-12.62c-3.58-2.07-3.13-5.68,1-8.07l19.88-11.48c4.14-2.39,10.39-2.65,13.98-.58l21.87,12.62c3.58,2.07,3.13,5.68-1,8.07l-19.88,11.48c-4.14,2.39-10.39,2.65-13.98.58Z"/>
    <path d="M72.08,57.53h5.47v14.56c0,3.04,2.46,5.5,5.5,5.5s5.5-2.46,5.5-5.5v-14.56h5.47l-10.97-19-10.97,19Z"/>`
}

export default class Arrange extends StyleControl{
    constructor(el = "color-controls"){
        super(el)
        
        for (let name of ["top", "up", "down", "bottom"]) {
            let i = this.makeIcon(name, true);
            i.onclick = () => {this.select(name, true)}
        }
        this._selectedIcon = this.makeIcon("main");
     

    }

    select(name, isUser) {
        this._value = name;
        if (isUser) this.dispatchClickChange(name, "arrange");
    }

    makeIcon(name, append = false) {
       let i = new SvgPlus("svg");
       i.props = {
            viewBox: "0 0 100 100",
            class: "c-icon",
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
    }

    getValue(){
    }

    static get name(){
        return "arrange"
    }
}