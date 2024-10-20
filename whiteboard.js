import { StyleControls } from "./StyleControls/style-control.js";
import { SvgPlus, Vector } from "./SvgPlus/4.js";
import { SvgView } from "./svg-view.js";
import { Tools } from "./Tools/tools.js"
import { Elements } from "./Element/whiteboard-elements.js";
import { WhiteBoardElementBase } from "./Element/interface.js";
import { SelectionBox, SelectTransform } from "../Utilites/selection.js";
import { objectDeepCopy, Svg2DataURL, dateNice } from "./Utilites/basic-funcs.js";
import {ElementChangeEvent } from "./Element/interface.js"

/**
 * @typedef {string|number|boolean} StyleValue
 */


const ToolsOrder = [
    "pan",
    "select",
    "spacer",
    "draw",
    "shape",
    "elbow-path",
    "line",
    "textbox",
    "free-text",
    "spacer",
    "undo",
    "redo",
    "capture",
    "erasor",
    "delete",
]
const Events = {
    "mousedown": true,
    "mouseup": true,
    "mousemove": true,
    "mouseleave": true,
    "dblclick": true,
    "click": true,
    "editText": true,
}


function getRoot(){
    let a = import.meta.url.split("/");
    a.pop();
    return a.join("/")
}


let styles = await (await fetch(getRoot() + "/styles.css")).text();

// Create an empty "constructed" stylesheet
const StyleSheet = new CSSStyleSheet();

// Apply a rule to the sheet
StyleSheet.replaceSync(styles);

console.log(StyleSheet);

let fonts = {
}
async function getFontDataURL(fname){
    if (!(fname in fonts)) {
        let font_path = getRoot() + `/fonts/${fname}.woff2`;
        let font_res = await fetch(font_path);
        let font_blob = await font_res.blob()
        let base64 = await new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result)
            };
            reader.readAsDataURL(font_blob);
        })
        fonts[fname] = base64;
    }
    return fonts[fname]
}
getFontDataURL("Anonymous-Pro");


class Minimise extends SvgPlus {
    constructor() {
      super("div")
      this.s = 30;
      this.class = "c-icon minimise";
      let svg = this.createChild("svg", {
          viewBox: "0 0 90 50"
      })
   
      this.p1 = svg.createChild("path", {"is-stroke": true, "stroke-width": 9, "stroke-linecap": "round"});
      this.p2 = svg.createChild("path", {"is-stroke": true, "stroke-width": 9, "stroke-linecap": "round"});
      this.t = 0;
    }

    async setIcon(type) {
        await this.waveTransition((t) => {this.t = t}, 300, type != "x")
    }

    set t(t) {
        let s = this.s
        let d1 = new Vector(s, s);
        let d2 = new Vector(-s, s);
        let c = new Vector(45, 10);
        let o1 = c.addH(-(1+t)*s/2)
        let o2 = c.addH((1+t)*s/2)
        this.p1.props = {d: `M${o1}l${d1}`}
        this.p2.props = {d: `M${o2}l${d2}`}
    }
}

let wbListeners = []
export function addwhiteBoardCreationListener(cb) {
    if (cb instanceof Function) {
        wbListeners.push(cb);
    }
    document.querySelectorAll("white-board").forEach(n => cb(n))
}

export class WhiteBoard extends SvgPlus {
    constructor(el = 'white-board') {
        super(el);
        let shadow = this.attachShadow({mode: "open"})
        shadow.adoptedStyleSheets = [StyleSheet];
        this.root = shadow;

        this.history = [[]];
        this.history_index = 0;
        this.History = {
            times: [],
            data: {},
            index: 0,
        };
        this.TheirHistory = {
            times: [],
            data: {},
        }
        this.styles = {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            "--tool-size": 0.25,
            "--c-dark": "#302e2e",
            "--c-darker": "#211f1f",
            "--c-light": "#555252"
        }
        if (el === "white-board") this.onconnect();

    
    }

    /** If set true prevents user from zooming
     * @param {boolean} val */
    set isZoomLocked(val){
        this.svgView.isZoomLocked = val
    }
    
    /** If set true prevents user from panning
     * @param {boolean} val */
    set isPanLocked(val) {
        this.svgView.isPanLocked = val
    }

    /** If set true prevents user from interacting with the toolbar
     * @param {boolean} val */
    set disableTools(val) {
        this.controls.toggleAttribute("disabled", val);
    }

    /** If set true prevents user executing commands and also 
     * prevents the user from interacting with the toolbar
     * @param {boolean} val */
    set disableCommands(val) {
        this.disableTools = !!val;
        this._disableCommands = !!val;
    }

    get disableCommands() {return this._disableCommands}

    set fullyDisabled(val) {
        this.styles = {"pointer-events": val ? "none" : null}
        this.minimiseIcon.styles = {"pointer-events": val ? "all" : null}
        this.disableCommands = val;
        this._fullyDisabled= val;
    }
    get fullyDisabled(){

    }

    /** If set true prevents user from interacting text
     * @param {boolean} val */
    set readOnly(val) {
        for (let textBox of this.mainLayer.querySelectorAll("textarea")) {
            textBox.toggleAttribute("readonly", val)
        }
    }
    
   /** Set the cursor seen on the whiteboard
     * @param {string} val */
    set cursor(val){
        this.styles = {
            "--cursor": val
        }
    }

    /** Get the style set from the style controllers
     * @return {Object.<string,StyleValue>} val */
    get styleSet(){
        let sset = {};
        for (let key in this.styleControls) {
            let value = this.styleControls[key].value;
            if (this.styleControls[key].flattenValue) {
                for (let k in value) {
                    sset[k] = value[k];
                }
            } else {
                sset[key] = value;
            }

        }
        return sset;
    }

    /** Set the style set to the style controllers
     * @return {Object.<string,StyleValue>} val */
    set styleSet(sset) {
        for (let key in this.styleControls) {
            this.styleControls[key].styleSet = sset;
        }
    }

    /** Selects which the style controllers are displayed
     * @param {[string]} arr a list of the style controller names
     */
    set styleSelection(arr) {
        this.styleControlWindow.innerHTML = "";
        this.stylesList.innerHTML = "";
        for (let styleName of arr) {
            if (styleName in this.styleControls) {
                let styleControl = this.styleControls[styleName];
                let icon = styleControl.icon
                icon.onclick = () => {
                    this.selectStyle(icon);
                }
                this.stylesList.appendChild(icon)
                icon.toggleAttribute("selected", false)
            }
        }
    }

    /** @deprecated */
    get shapes(){
        return [...this.mainLayer.querySelectorAll("[wb-element]")]
    }

    /** Gets the list of all elements on the whiteboard
     * @return {[WhiteBoardElementBase]} */
    get elements(){
        return [...this.mainLayer.querySelectorAll("[wb-element]")];
    }

    /** Returns true if there is a current selection
     * @return {boolean} */
    get isSelection(){
        return this.selectTransform != null;
    }

    /** Returns the current select transform or null if none
     * @return {SelectTransform}
     */
    get selectTransform(){
        let st = this._selectionTransform;
        return st instanceof Element ? st : null;
    }

    /** Returns the current selection
     * @return {[WhiteBoardElementBase]} */
    get selection(){
        return this.isSelection ? this.selectTransform.selection : [];
    }

    /* ~~~~~~~~~~~~~~~~~~ GENERAL METHODS ~~~~~~~~~~~~~~~~~~~~ 
       Some usefull methods
       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    /** Converts point in screen coordinates to those of the svg 
     * @param {Vector} point
     * @return {Vector} */
    screenToSVG(point) {
        return this.svgView.viewBoxX.screenToSVG(point);
    }

    /** Gets whiteboard element by its id
     * @param {string} id
     * @return {WhiteBoardElementBase} */
    getElement(id) {
        return this.mainLayer.querySelector(`#${id}`);
    }

     /** Clears the current selection  */
    clearSelection(){
        if (this.isSelection) {
            this._selectionTransform.remove();
            this._selectionTransform = null;
        }
    }

    /** updates the current selection  */
    updateSelection(){
        if (this.isSelection) {
            let onwb = {}
            this.elements.forEach(e => onwb[e.getId()] = true);
            let nonRemoved = this.selection.filter(e => e.getId() in onwb);
            if (nonRemoved.length > 0) {
                this.selectTransform.selection = nonRemoved;
            } else {
                this.clearSelection();
            }
        }
    }

    /** */
    async minimise(){
        if (this._manim) return;
        this._manim = true;
        let tools = this.toolIcons;
        let minHeight = this.minimiseIcon.bbox[1].y

        if (this.isMinimised) {
             let height = tools.scrollHeight;
            this.minimiseIcon.setIcon("x")
            this.fullyDisabled = false;
            this.selectTool("pan");
            await this.waveTransition((t) => {
                tools.styles = {
                    "overflow": "hidden",
                    height: (minHeight * (1-t) + height * t) + "px",
                }
            }, 300, true)
            this.isMinimised = false;
        } else {
            this.styleSelection = [];
            let height =  tools.bbox[1].y;
    
            this.fullyDisabled = true;
            this.minimiseIcon.setIcon("-")
            this.clearSelection();
            await this.waveTransition((t) => {
                tools.styles = {
                    "overflow": "hidden",
                    height: (minHeight * (1-t) + height * t) + "px",
                }
            }, 300, false)
            this.isMinimised = true;
        }
        this._manim = false;
    }
 
   
    /* ~~~~~~~~~~~~~~~~~~ CREATION METHODS ~~~~~~~~~~~~~~~~~~~~ 
       These methods can be called by tools to create elements 
       or selection boxes/transforms
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    /** Creates a select transform for the given element/s
     * @param {[WhiteBoardElementBase]|WhiteBoardElementBase} elements 
     * @return {SelectTransform} */ 
    createSelection(elements) {
        this.clearSelection();
        if (!(Array.isArray(elements) && elements.length == 0)) {
            this._selectionTransform = this.selectionLayer.createChild(SelectTransform, {}, elements);
        }
        return this.selectTransform;
    }

    /** Creates a selection box
     * @return {SelectTransform} */ 
    createSelectionBox(){
        return this.selectionLayer.createChild(SelectionBox);
    }

    /** Creates a whiteboard element specified by the name
     * @param {string} name
     * @return {WhiteBoardElementBase} */ 
    createElement(name, ...args) {
        let element = this.mainLayer.createChild(Elements[name], {}, this, ...args);
        return element;
    }


    /* ~~~~~~~~~~~~~~~~~~ SERIALISATION METHODS ~~~~~~~~~~~~~~~~~~~~ 
       These methods relate to the serialisation and deserialisation
       of the whiteboard and or individual elements
       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    serialise(){
        let json = {}
        for (let element of this.elements) {
            json[element.getId()] = element.serialise();
        }

        return json;
    }

    deserialise(json){
        this.mainLayer.innerHTML = "";
        for (let key in json) {
            let ejson = json[key];
            this.deserialiseElement(ejson, key)
        }
        this.reOrder();
    }

    deserialiseElement(json, id = null){
        let el = Elements[json.type].deserialise(this, json);
        if (id != null) {
            el.order = json.order;
            el.setId(id)
            this.mainLayer.appendChild(el);
            el._creationInitialised = true;
        }
        return el;
    }

    /* ~~~~~~~~~~~~~~~~~~~~~~ COMMANDS ~~~~~~~~~~~~~~~~~~~~~~~~ 
       These methods can be called by tools to evoke changes to
       the whiteboard or to perform interactions that a user may
       make such as selecting a tool.
       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    /** Deletes the specified element/s
     * @param {[WhiteBoardElementBase]|WhiteBoardElementBase} element */ 
    deleteElement(element){
        if (this.disableCommands) return; 

        let ts = (new Date()).getTime();
        if (Array.isArray(element)) {
            for (let s of element) {
                s.dispatchDeletionEvent(ts);
                s.remove()
            }
        } else {
            element.dispatchDeletionEvent(ts);
            element.remove();
        }

        this.updateSelection();
    }

    /** Deletes all elements */
    deleteAll(){
        if (this.disableCommands) return;

        this.deleteElement([...this.mainLayer.children]);
        this.updateSelection();
    }

    /** Undo's the previous changes (if redo set true, then redo's instead) */
    undo(redo = false){
        if (this.disableCommands) return;

        let {index, data, times} = this.History
        // check that the redo/undo command can be performed given the current index
        if ((redo && index < times.length) || (!redo && index > 0)) {

            // Get the (20ms) timestamp at the history index
            let ts = times[index-(redo ? 0 : 1)];

            // Get the changes at that timestamp and get the reverse
            // change if the mode is undo
            let changes = redo ? data[ts] : data[ts].map(c => this.getReverseChange(c, ts));

            // Apply the changes, if any return a true reorder flag
            // reorder the elements
            let reorder = changes.map(c => this.applyChange(c, ts)).reduce((c1, c2) => c1||c2);
            if (reorder) this.reOrder()

            // Increment the history index accordingly 
            this.History.index += redo ? 1 : -1;
            
            // Send changes to database listener
            changes.forEach(e => {
                let e2 = new ElementChangeEvent(e.elementId,
                    e.changeType, 
                    e.data,
                    (new Date()).getTime(),
                    false);
                this.onElementChangeDB(e2);
            })
        }

        this.updateSelection();
    }

    /** Redo's the undid changes */
    redo(){this.undo(true)}

    /** Changes the arrangement of the given element/s
     * @param {"top"|"up"|"down"|"bottom"}
     * @param {[WhiteBoardElementBase]|WhiteBoardElementBase} elements */
    arrange(mode, elements) {
        if (this.disableCommands) return;

        let moveElement = (e, dir) => {
            let changes = new Set()
            let nsib = e[dir ? "nextSibling" : "previousSibling"];
            if (nsib) {
                nsib.order += dir ? -1 : 1;
                nsib[dir ? "after" : "before"](e)
                e.order += dir ? 1 : -1;
                changes.add(e);
                changes.add(nsib);
            }
            return changes;
        }
        let changes = new Set()
        switch (mode) {
            case "down":
            case "up":
                for (let el of elements) {
                    changes = changes.union(moveElement(el, mode == "up"))
                }
                break;

            case "bottom":
            case "top":
                elements.sort((a, b) => a.order - b.order);
                let eid = {}
                elements.forEach(e => eid[e.getId()] = true);
                let others = this.elements.filter(e => !(e.getId() in eid)).sort((a, b) => a.order - b.order);
                let all = mode == "top" ? [...others, ...elements] : [...elements, ...others];
                for (let i = 0; i < all.length; i++) all[i].order = i;
                changes = all;

        }
        this.reOrder();
        let ts = (new Date()).getTime();
        for (let e of changes) {
            e.dispatchOrderEvent(ts)
        }
        this.updateSelection()
    }

    /** Selects the tool specified by its name
     * @param {string} key the name of the tool */
    selectTool(key){
        if (this.disableCommands) return;
        if (!(key in Tools)) return;

        if (this._selectedTool) {
            this._selectedTool.onDeselect(this);
        }

        for (let tool of this.toolIcons.children) {
            tool.toggleAttribute("selected", tool.key == key);
        }

        for (let sname in this.styleControls) {
            this.styleControls[sname].icon.toggleAttribute("selected", false)
        }

        this._selectedTool = Tools[key];
        if (this._selectedTool.clearSelectionOnSelect()) this.clearSelection();
        this._selectedTool.onSelect(this);
    }

    /** Selects the style controller specified by its icon
     * @param {Element} icon the icon of the style controller */
    selectStyle(icon) {
        if (this.disableCommands) return;
        
        this.styleControlWindow.innerHTML = "";
        if (icon.hasAttribute("selected")) {
            icon.toggleAttribute("selected", false);
        } else {
            for (let i of this.stylesList.children) {
                i.toggleAttribute("selected", icon.isSameNode(i))
            }
            this.styleControlWindow.appendChild(icon.styleControl);
        }
    }

    copySelection(event) {

        let setClipboard = (json) => {
            let text = JSON.stringify(json);
            navigator.clipboard.writeText(text)
            // event.clipboardData.setData("text/plain", text)
        }

        if (this.isSelection) {
            let st = this.selectTransform;
            let {pos, size} = st;
            if (pos instanceof Vector && size instanceof Vector) {
                let selection = [...this.selection];
                selection.sort((a, b) => a.order-b.order);
                let copyJSON = {
                    pos: [pos.x, pos.y],
                    size: [size.x, size.y],
                    elements: selection.map(e => e.serialise())
                }
                setClipboard(copyJSON);
            }
        }
    }

    cutSelection(event){
        this.copySelection(event);
        this.deleteElement(this.selection);
    }

    pasteSelection(event) {
        let text = event.clipboardData.getData("text/plain");

        let elements = []
        let pos = null;
        let size = null
        try {
            let json = JSON.parse(text);
            pos = new Vector(json.pos);
            size = new Vector(json.size);
            elements = json.elements.map(e => {
                return Elements[e.type].deserialise(this, e);
            });
        } catch (e) {console.log(e);}

        let ts = (new Date()).getTime();
        if (elements.length > 0) {
            let delta = this.lastMousePosition.sub(pos.add(size.div(2)))
            for (let e of elements) {
                e.setDragDelta(delta);
                e.fixTransformDelta();
                this.mainLayer.appendChild(e);
                e.dispatchCreationEvent(ts);
            }
        }

        if (!this._selectedTool.clearSelectionOnSelect()) {
            if (this.isSelection) this.clearSelection();
            this.createSelection(elements);
        }
    }

     /* ~~~~~~~~~~~~~~~~~~ DATABASE METHODS ~~~~~~~~~~~~~~~~~~~~ 
       These methods relate to database functionality
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    async lockElement(e){
        // await new Promise((resolve, reject) => {
        //     setTimeout(resolve, 1000*Math.random())
        // })
    }

    releaseElement(e) {

    }

    

    async lockElements(elements){
        let isLocked = elements.map(e => this.lockElement(e));
        let locked = await Promise.all(isLocked);
        console.log(locked);
        return elements.filter((e, i) => locked[i])
    }


    releaseElements(elements) {
        elements.map(e => this.releaseElement(e));
    }

    async onElementChangeDB(e) {
        // if creation
        //      if in selection -> send locked to db (? )
        //      else -> send not locked

        // deletion -> send update to db
        // data/style -> send update to db
    }


    pushChange(change) {
        let reorder = this.applyChange(change);
        if (reorder) this.reOrder();
        console.log(reorder);
        this.addTheirHistory(change);
    }
   
    /* ~~~~~~~~~~~~~~~~~~~~~~ PRIVATE ~~~~~~~~~~~~~~~~~~~~~~~~ 
       These methods should generally only be called by this class
       and should not be used by other tools.
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    //  ~~~~~~~~~~~~~~~~~~~~~~ HISTORY METHODS ~~~~~~~~~~~~~~~~~~~~~~~~ //
    onElementChange(e) {
        if (!e.light) {
            let ts = Math.round(e.ts / 20) + ""; // timestamps in 20ms intervals
            let i = this.History.index;
            let {times, data} = this.History;
            
            while (times.length > i)
                delete data[times.pop()]
    
            if (!(ts in this.History.data)) {
                data[ts] = [e]
                times.push(ts);
                this.History.index += 1;
            } else {
                data[ts].push(e)
            }
        }
        this.onElementChangeDB(e);
    }

    addTheirHistory(e) {
        let {times, data} = this.TheirHistory;
        let ts = Math.round(e.ts / 20) + ""; // timestamps in 20ms intervals
        // only push heavy changes
        if (!e.light) {
            if (!(ts in data)) {
                data[ts] = [e]
                times.push(ts);
            } else {
                data[ts].push(e)
            }
        }
    }

    reOrder(){
        let els = this.elements;
        els.sort((a, b) => a.order - b.order);
        els.forEach(e => this.mainLayer.appendChild(e));
    }

    getElementHistoryBefore(ts, id, H = this.History){
        let {data, times} = H;
        let changes = [];
        for (let i = times.length - 1; i >= 0; i--) {
            if (times[i] < ts) {
                for (let c of data[times[i]]) {
                    if (c.elementId == id) {
                        changes.push(c);
                    }
                }
            }
        }
        return changes;
    }

    getLastElementChange(ts, id, type) {
        let lastChange = null;
        for (let h of [this.History, this.TheirHistory]) {
            let elHistory = this.getElementHistoryBefore(ts, id, h);
            
            for (let c of elHistory) {
                if (type == c.changeType || c.changeType == "creation") {
                    lastChange = c;
                    break;
                }
            }
            if (lastChange != null) break;
        }

        if (type !== "creation" && lastChange.changeType === "creation") {
            lastChange = new ElementChangeEvent(id, type, lastChange.data[type], lastChange.ts, lastChange.light)
        }
        return lastChange;
    }

    getReverseChange(change, ts) {
        let {changeType, elementId, data} = change;
        let rchange = {
            ts: (new Date()).getTime(),
            type: changeType,
            id: elementId,
            data: objectDeepCopy(data),
        }
        switch (changeType) {
           
            case "creation":
                rchange.type = "deletion"
                break;

            case "deletion": 
                rchange.type = "creation";
                break; 
                
            case "order":
            case "data":
            case "styleSet":
            case "trans":
                let lastChange = this.getLastElementChange(ts, elementId, changeType);
                if (lastChange == null) {
                    console.warn(`could find the reverse ${changeType} change`)
                } else {
                    rchange.data = objectDeepCopy(lastChange.data);
                }
                break;

        }
        return new ElementChangeEvent(rchange.id, rchange.type, rchange.data, rchange.ts, false);
    }
    
    revokeChange(change, ts) {
        let reverseChange = this.getReverseChange(change, ts);
        return this.applyChange(reverseChange);
    }

    applyChange(change) {
        let reOrderFlag = false
        let {changeType, elementId, data} = change;
        if (changeType !== "creation" && !this.getElement(elementId)) {
            console.warn(`element ${elementId} no longer exists to perform ${changeType} change`);
            return false;
        }
        switch (changeType) {
           
            case "creation":
                // check to see if the element already exists
                let element = this.getElement(elementId);
                // if so delete that version of the element
                if (element) element.remove(); 

                this.deserialiseElement(objectDeepCopy(data), elementId);
                reOrderFlag = true;
                break; 

            case "deletion": 
                this.getElement(elementId).remove();
                break;

            case "order":
                console.log(data);
                this.getElement(elementId).order = data.order;
                reOrderFlag = true;
                break;

            case "data":
            case "styleSet":
            case "trans":
                this.getElement(elementId)[changeType] = objectDeepCopy(data);
                break;

        }
        return reOrderFlag;
    }

    //  ~~~~~~~~~~~~~~~~~~~~~~ KEYS ~~~~~~~~~~~~~~~~~~~~~~~~ //
    addKeyListeners(){
        let key_state = {

        }
        let text_mode = false;
        let text_element = null
        this.addEventListener("editText", async (e) => {
            text_mode = true;
            text_element = e.element;
            this.lockElement(e.element);
        })
        this.addEventListener("editTextDone", (e) => {
            text_mode = false;
            text_element = e.element;
            this.releaseElement(e.element);
        })

        let key_string = (e) => {
            let key_code = [e.key];
            if (e.ctrlKey || e.metaKey) key_code.unshift("cmd");
            if (e.shiftKey) key_code.unshift("shift")
            return key_code.join("-")
        }
        
        window.addEventListener("keydown", (e) => {
            // key_state[e.key] = true;
            e.keyString = key_string(e);
            
            if (!text_mode) {
                if (this._selectedTool["keydown"] instanceof Function) {
                    this._selectedTool["keydown"](e, this)
                }
                
                if (!e.defaultPrevented){
                    this.onKeyDown(e);
                }
            } else if (e.key == "Escape") {
                text_element.text.blur();
            }
        })
        
        window.addEventListener("keyup", (e) => {
            e.keyString = key_string(e);

            if (!text_mode) {
                if (this._selectedTool["keyup"] instanceof Function) {
                    this._selectedTool["keyup"](e, this)
                }

                if (!e.defaultPrevented) {
                    this.onKeyUp(e)
                }
            }
        })
        
    }

    addClipboardListeners(){
        this.props = {events: {
            "copy": (e) => {this.copySelection(e)},
            "paste": (e) => {this.pasteSelection(e)},
            "cut": (e) => {this.cutSelection(e)},
            "mousemove": (e) => {this.lastMousePosition = this.screenToSVG(e)}
        }}
    }

    onKeyUp(e){

    }

    // HOT KEYS
    onKeyDown(e){
        const keycmds = {
            "shift-cmd-z": (e) => {
                this.redo()
            },
            "cmd-z": (e) => {
                this.undo()
            },
            // "cmd-c": (e) => {
            //     this.copySelection(e)
            // },
            "p": (e) => {
                this.selectTool("draw")
            },
            "v": (e) => {
                this.selectTool("select")
            },
            "t": (e) => {
                this.selectTool("free-text")
            },
            "e": (e) => {
                this.selectTool("erasor")
            },
            "s": (e) => {
                this.selectTool("shape")
            },
            "b": (e) => {
                this.selectTool("textbox")
            }
        }

        if (e.keyString in keycmds) {
            keycmds[e.keyString](e)
            e.preventDefault();
        }
        
    }

    //  ~~~~~~~~~~~~~~~~~~~~~~ Connect Method ~~~~~~~~~~~~~~~~~~~~~~~~ //
    async makeFontStyles(){
        this.svgStyles = this.defs.createChild("style", {
            type: "text/css",
            content: `@font-face {
                font-family: 'Anonymous Pro';
                src: url('${await getFontDataURL("Anonymous-Pro")}')
            }`
        })
    }

    onconnect(){
        let main = new SvgPlus("main-board");
        this.root.appendChild(main);
        this.mainBoard = main;
        let svgView = main.createChild(SvgView);
        this.defs = svgView.createChild("defs");
        this.makeFontStyles();
        
        this.svgView = svgView;
        this.mainLayer = svgView.createChild("g", {
            events: {
                "e-change": (e) => this.onElementChange(e)
            }
        });
        this.tempLayer = svgView.createChild("g");
        this.selectionLayer = svgView.createChild("g");


        let controls = new SvgPlus("white-board-controls");
        this.root.appendChild(controls);
        this.controls = controls;
        let tools = controls.createChild("div", {class: "tools"})
        this.minimiseIcon = tools.createChild(Minimise, {
            events: {
                click: () => {
                    this.minimise();
                }
            }
        })
        for (let key of ToolsOrder) {

            let i = tools.createChild("div")
            if (key in Tools) {
                i.props = {
                    class: "c-icon",
                    events: {
                        click: () =>  this.selectTool(key)
                    }
                }
                i.key = key;
                i.appendChild(Tools[key].getIcon())
            } else {
                i.props = {class: "spacer"}
            }
        }
        this.toolIcons = tools;

        controls.onclick = (e) => {
            e.preventDefault();
        }
        let styles = controls.createChild("div", {class: "styles"})
        let styleControls = {}
        for (let key in StyleControls) {
            let s = new StyleControls[key]();
            s.initialise(this);
            styleControls[key] = s
            s.events = {
                "change": (e) => {
                    if (this._selectedTool["styleChange"] instanceof Function) {
                        this._selectedTool["styleChange"](e, this)
                    }
                },
                "c-change": (e) => {
                    if (this._selectedTool["styleClick"] instanceof Function) {
                        this._selectedTool["styleClick"](e, this)
                    }
                }
            }
        }
        this.styleControls = styleControls
        this.stylesList = styles;

        this.styleControlWindow = controls.createChild("div", {class: "control-window"})

        this.selectTool("pan");

        let events = {}
        for (let event in Events) {
            events[event] = (e) => {
                if (this._selectedTool[event] instanceof Function) {
                    this._selectedTool[event](e, this)
                }
            }
        }
        this.svgView.events = events;

        this.addKeyListeners();
        this.addClipboardListeners();

        for (let cb of wbListeners) cb(this); //call listeners
    }

    //  ~~~~~~~~~~~~~~~~~~~~~~ Screen Shot Method ~~~~~~~~~~~~~~~~~~~~~~~~ //
    async SVG2PNG(){
        // create image
        const {width, height} = this.svgView.getBoundingClientRect()
        let img = new Image(width, height);
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.src = Svg2DataURL(this.svgView.outerHTML);
        })

        // draw iamge in canvas
        const canvas = new SvgPlus("canvas");
        canvas.width = width*2;
        canvas.height = height*2;
        canvas.getContext("2d").drawImage(img, 0, 0, width*2, height*2);
        return canvas.toDataURL("image/png");
    }

    async SVG2SVG(){
        return Svg2DataURL(this.svgView.outerHTML);
    }

    async screenShot(mode = "png") {
        // convert textareas to svg text
        [...this.elements].forEach(e => {
            if (e.isTextElement) e.capture = true
        })

        // prepare the svg
        const {width, height} = this.svgView.getBoundingClientRect()
        this.selectionLayer.styles = {display: "none"};
        this.svgView.props = {
            xmlns: "http://www.w3.org/2000/svg",
            width: width,
            height: height
        }

        // create data URL
        const dataURL = await this["SVG2"+mode.toUpperCase()]();

        // create link and trigger download
        let link = this.createChild("a", {
            href: dataURL,
            download: `squidly-whiteboard ${dateNice()}`,
        })
        link.click();
        link.remove();

        // return svg to original state
        this.selectionLayer.styles = {display: null};
        [...this.elements].forEach(e => {
            if (e.isTextElement) e.capture = false
        })
    }
}



// SvgPlus.defineHTMLElement(WhiteBoard)