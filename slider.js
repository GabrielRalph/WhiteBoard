import { SvgPlus } from "./SvgPlus/4.js";
export class Slider extends SvgPlus {
    constructor(){
        super("svg");
        this.class = "slider"
        this.w = 40;
        this.h = 5;
        this.sw = 2;
        this.r_min = 1;
        this.r_max = 2;

        let {w, h, sw, r_max, r_min} = this;
        this.props = {
            styles: {
                width: "100%",
                height: "100%",
                cursor: "pointer",
            },
            viewBox: `0 0 ${w} ${h}`
        };
        this.createChild("path", {
            d: `M${sw},${h/2}L${w-r_max},${h/2}`,
            stroke: "gray",
            fill: "none",
            "stroke-linecap": "round",
            "stroke-width": sw,
            events: {
                click: (e) => this.selectAt(e)
            }
        })
        this.circle = this.createChild("circle", {
            cy: h/2
        })
        this.r = (r_min+r_max)/2;
        this.cx = r_max;
  
        let moving = false;
        this.addEventListener("mousedown", (e) => {
            this.mode = "grab"
            moving = true;
        })
        this.addEventListener("mousemove", (e) => {
            this.mode = e.buttons == 1 ? "grab" : "over";
            if (e.buttons) this.moveCursor(e);
        })
        this.addEventListener("mouseup", (e) => {
            this.mode = "over"
            if (moving) {
                moving = false;
                const event = new Event("change");
                this.dispatchEvent(event);
            }
        })
        this.addEventListener("mouseleave", (e) => {
            this.mode = null;
            if (moving) {
                moving = false;
                const event = new Event("change");
                this.dispatchEvent(event);
            }
        })
  
        let next = () => {
            this.draw();
            // if (this.offsetParent != null)
                window.requestAnimationFrame(next);
        }
        window.requestAnimationFrame(next);
  
    }
  
    /** @param {MouseEvent} e */
    selectAt(e){
        let [pos, size] = this.bbox;
        this.cx = this.w * (e.clientX - pos.x) / size.x;
        const event = new Event("change");
        this.dispatchEvent(event);
    }
  
    /** @param {MouseEvent} e */
    moveCursor(e) {
        let size = this.bbox[1].x;
        let dx = this.w * e.movementX / size;
        this.cx += dx;
        
    }
  
    draw(){
        if (this.mode === "over") {
            if (this.r < this.r_max) this.r += 0.05;
        } else if (this.mode == "grab") {
            if (this.r > this.r_min) this.r -= 0.15;
        } 
    }
  
    /** @param {number} cx */
    set r(r){
        this.circle.props = {r}
        this._r = r;
    }
    
    /** @return {number} */
    get r(){
        return this._r;
    }
  
    /** @param {number} cx */
    set cx(cx){
        if (cx < 2) cx = this.r_max;
        if (cx > 38) cx = this.w - this.r_max;
        this.circle.props = {cx}
        this._x = cx
    }
  
    /** @return {number} */
    get cx(){
        return this._x;
    }
  
    set mode(mode){
        switch (mode) {
            case "grab":
                this.styles = {cursor: "grabbing"};
                break;
            case "over":
                this.styles = {cursor: "pointer"}
                break;
            default:
                this.r = (this.r_max + this.r_min)/2;
        }
        this._mode = mode;
    }
  
    get mode(){
        return this._mode;
    }
  
  
    /** @param {number} value 0 <= value <= 1 */
    set value(value) {
        value = parseFloat(value);
        if (Number.isNaN(value)) value = 0;
        if (value < 0) value = 0;
        if (value > 1) value = 1;
        this.cx = value * (this.w - 2 * this.r_max) + this.r_max;
    }
  
    /** @return {number} */
    get value(){
        return (this.cx - this.r_max)/(this.w - 2 * this.r_max);
    }
  }
  
  