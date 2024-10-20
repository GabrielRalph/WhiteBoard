import {SvgPlus, Vector} from "../../SvgPlus/4.js"


const { abs, min, max, round } = Math;

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from https://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1/3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1/3);
  }
  let a = 1;
  return {r, g, b, a};
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const l = Math.max(r, g, b);
    const s = l - Math.min(r, g, b);
    const h = s
      ? l === r
        ? (g - b) / s
        : l === g
        ? 2 + (b - r) / s
        : 4 + (r - g) / s
      : 0;
    return {
      h: (60 * h < 0 ? 60 * h + 360 : 60 * h) / 360,
      s: (100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0))/100,
      l: ((100 * (2 * l - s)) / 2)/100,
    };
  };

function hueToRgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1/6) return p + (q - p) * 6 * t;
  if (t < 1/2) return q;
  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;
}

function addColors(fg, bg) {
    let r = {};
    r.a = 1 - (1 - fg.a) * (1 - bg.a); 

    if (r.a == 0) {
        r.r = 0;
        r.g = 0;
        r.b = 0;
    } else {
        r.r = fg.r * fg.a / r.a + bg.r * bg.a * (1 - fg.a) / r.a;
        r.g = fg.g * fg.a / r.a + bg.g * bg.a * (1 - fg.a) / r.a; 
        r.b = fg.b * fg.a / r.a + bg.b * bg.a * (1 - fg.a) / r.a; 
    }    


    return r;
}

function colorLurp(c1, c2, t) {
    let c1a = {};
    let c2a = {}
    for (let key in c1) {
        c1a[key] = key == "a" ? c1[key] * t : c1[key];
        c2a[key] = key == "a" ? c2[key] * (1 - t) : c2[key];
    }

    return addColors(c1a, c2a);
}


function colorToRgb(color) {
    if (typeof color === "object") {
        return color
    } else if (Array.isArray(color)) {
        return {r: color[0], g: color[1], b: color[2]}
    } else {
        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        context.fillStyle = color;
        context.fillRect(0,0,1,1);
        let [r, g, b] = context.getImageData(0,0,1,1).data;
        return {r, g, b}
    }
}
// function color2hsl(color) {
//     return rgbToHsl(getColor(color))
// }

class ColorIcon extends SvgPlus {
    constructor(cp, x, y, color, slash = false) {
        super("g");
        this.corner = new Vector(x * cp.s, y *cp.s);
        this.size = new Vector(cp.s - cp.bs * 2);
        this.cp = cp;
        let props = {
            width: this.size.x,
            height: this.size.x,
            rx: cp.br,
            ry: cp.br,
            x: x * cp.s,
            y: y * cp.s
        };
        if (typeof color === "object") {
            props['fill'] =`rgb(${color.r*255}, ${color.g*255}, ${color.b*255})`;
        } else {
            props['fill'] = color;
        }
       
        this.rect = this.createChild("rect", props);

        if (slash) {
            props.stroke = "black"
            this.rect.props = {fill: "white"};
            this.slash = true;
            props["stroke-width"] = cp.bs*2
            this.createChild("path", {
                stroke: "red",
                "stroke-width": 2 * cp.bs,
                d: `M${x * cp.s},${(y+1) * cp.s - 2*cp.bs}l${cp.s - 2*cp.bs},${2*cp.bs - cp.s}`,
                "clip-path": "url(#cmask)"
            })
        } 
    }

    set opacity(val){
        if (!this.slash) {
            this.rect.props = {
                "fill-opacity": val
            }
        }
    }

    set selected(color) {
        if (this.selectionOutline) this.selectionOutline.remove();
        if (color) {
            let  {br, bs} = this.cp;
            let w = 3 * bs;
            this.selectionOutline = this.createChild("rect", {
                x: this.corner.x + w/2 - bs,
                y: this.corner.y + w/2 - bs,
                width: this.size.x - w + 2*bs,
                height: this.size.y - w + 2*bs,
                rx: br - w/2 + bs,
                ry: br - w/2 + bs,
                fill: "none",
                stroke: color,
                "stroke-width": w
            })
        }
    }
}


export class ColorPicker extends SvgPlus {
    constructor(){
        super("color-picker");
        this.styles = {display: "flex"}

        let s = 5;
        let bs = 0.2;
        let br = 1.2;
        let h = 8;
        let w = 8;


        this.s = s;
        this.bs = bs;
        this.br = br;
        this.w = w;
        this.h = h;
    

        let svg = this.createChild("svg", {viewBox: `-${br} -${br} ${s*(w+1)+br *2} ${s*(h + 2) + br*2}`});
        svg.styles = {width: "100%"}
        svg.createChild("defs", {content: `<clipPath id="cmask">
            <rect x="${w*s}" y="${(h+1)*s}" width="${s-bs*2}" height="${s-bs*2}" rx = "${br}" ry = "${br}"/>
        </clipPath>`})

        let g1 = svg.createChild("g");
        let g2 = svg.createChild("g");
        this.g3 = svg.createChild("g");
        this.g1 = g1;
        this.g2 = g2;

        this.opacity_i = 0;
        this.opacity = 1;
        this.renderHues();
        g2.children[0].select();
    }

    dChange(isUser) {
        if (isUser !== null){
            let event = new Event("change");
            event.color = this.color;
            event.user = isUser;
            this.dispatchEvent(event);
        }
    }


    selectHue(icon, isUser = true) {
        if (this._lastHue instanceof Element) this._lastHue.selected = null;
        if (!SvgPlus.is(icon, ColorIcon)) {
            icon = this.getIconFromHue(icon);
        }
        let cf = hslToRgb(icon.hue, 1, 0.4);
        icon.selected = `rgba(${cf.r*255}, ${cf.g*255}, ${cf.b*255}, ${cf.a})`;
        this.renderHue(icon.hue);
        this._lastHue = icon;

        this.dChange(isUser);
    }


    selectColor(icon, isUser = true) {
        if (this._lastColor instanceof Element) this._lastColor.selected = null;
        if (icon instanceof Element) {
            let col =255 * ((icon.row / (this.h - 1)) * 0.4);
            let cf = hslToRgb(icon.hue, 1, 0.5);
            icon.selected = `rgba(${col}, ${col}, ${col}, ${1})`;
            this._lastColor = icon;

            this._selectedColor = icon.color;
            this.renderOpacity()

            this.dChange(isUser);
        }
    }

    set color(color){
        let {r, g, b} = colorToRgb(color);
        let {h} = rgbToHsl(r,g,b);
        let hue = this.getClosestHue(h);
        this.selectHue(hue, null);
        let icon = this.getIconFromRGB(r, g, b);
        this.selectColor(icon, false);
    }

    get color(){
        return this._selectedColor;
    }

    renderOpacity(hue){
        let {w, h, g3} = this;
        g3.innerHTML = "";

        for (let c = 0; c < w + 1; c++) {
            let icon = g3.createChild(ColorIcon, {}, this, c, h + 1, this.color, c == w);
            let opacity = 1 - c/(w);
            icon.opacity = opacity;
            icon.onclick = () => {
                this.opacity = opacity;
                if (this._lastOpacity) this._lastOpacity.selected= null;
                let event = new Event("change");
                this.opacity_i = c;
                icon.selected = "black";
                this._lastOpacity = icon;
                event.color = this.color;
                this.dispatchEvent(event);
            }
            if (this.opacity_i == c) {
                icon.selected = "black";
                this._lastOpacity = icon;
            }
            
        }
    }

    get hues() {
        let hfun = (hue) => Math.pow(hue, 1.5) * 0.98
        let nhues = this.w + this.h + 1;
        
        return [...Array(nhues).keys()].map(i => hfun(i/nhues))
    }

    getClosestHue(hue){
        let hue_dif = this.hues.map(h => [h, Math.abs(h-hue)])
        hue_dif.sort((a, b) => a[1] - b[1]);
        return hue_dif[0][0]
    }
    getIconFromRGB(r, g, b) {
        let diff = [...this.g1.children].map(i => [i, ((i.r - r)**2 + (i.g - g)**2 + (i.b - b)**2)**(0.5)])
        diff.sort((a, b) => a[1] - b[1]);
        return diff[0][0];
    }
    getIconFromHue(hue) {
        let dif = [...this.g2.children].map(i => [i, Math.abs(i.hue - hue)])
        dif.sort((a, b) => a[1] - b[1]);
        return dif[0][0]
    }

    renderHues(){
        let {g2, h, w} = this;

        const hues = this.hues;
        let makeIcon = (hue, r, c) => {
            let cf = hslToRgb(hue, 1, 0.5);
            let icon = g2.createChild(ColorIcon, {}, this, c, r, cf);
            icon.hue = hue;
            icon.select = () => {this.selectHue(icon)}
            icon.onclick = (e) => {
                icon.select()
            }
        }


        g2.innerHTML = "";
        let r = h;
        for (let c = 0; c < w; c++) {
            makeIcon(hues[c], r, c)
        }
        
        let c = w;
        r = h;
        makeIcon(hues[w], r, c);
        
        for (r = 0; r < h; r++) {
            makeIcon(hues[w+1+(h-r-1)], r, c);
        }
    }

    renderHue(hue, isUser) {
        let selr = 0;
        let selc = 0;
        if (this._lastColor instanceof Element) {
            selr = this._lastColor.row;
            selc = this._lastColor.col;
        }
        let {g1, h, w} = this;
        g1.innerHTML = "";
        let i = 0;
        let c11 = hslToRgb(hue, 1, 0.5);
        let c12 = {r: 1, g:1, b:1, a: 1};

        let c21 = {r: 0, g: 0, b: 0, a: 0};
        let c22 = {r: 0, g: 0, b: 0, a: 1};
        for (let r = 0; r < h; r++) {
            for (let c = 0; c < w; c++) {
                let ca = colorLurp(c12, c11, 1-Math.cos(c/(w-1) * Math.PI/2));
                let cb = colorLurp(c21, c22, 0.15 + 0.85*(1-r/(h-1)) );
                let cf = addColors(cb, ca);
                cf = addColors(cf, c12);

                if (r == h - 1 && c == w - 1) cf = {r: 0, g: 0, b: 0}

                // let cf = cb;
                let icon = g1.createChild(ColorIcon, {}, this, c, r, cf);
                icon.row = r;
                icon.col = c;
                icon.color = `rgb(${round(cf.r*255)}, ${round(cf.g*255)}, ${round(cf.b*255)})`
                icon.hue = hue;
                icon.r = cf.r*255;
                icon.g = cf.g*255;
                icon.b = cf.b*255;
                icon.onclick = () => {
                    this.selectColor(icon);
                }
                
                if (r == selr && c == selc) {
                    this.selectColor(icon, null);
                }
                i+=4;
            }
        }
    }
}