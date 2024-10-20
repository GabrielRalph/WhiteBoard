

let controls_paths = [
    "./ColorControls/color-controls.js",
    "./StrokeControls/stroke-controls.js",
    "./StrokeControls/dash.js",
    "./TextControls/text-controls.js",
    "./shapes-selector.js",
    "./arrange.js",
    "./StrokeControls/arrow-heads.js"
]
async function importList(importList) {
    let modules = {}
    let importModule = async (mpath) => {
        let mod = (await import(mpath)).default;
        if (Array.isArray(mod)){
            for (let mod_item of mod) {
                modules[mod_item.name] = mod_item;
            }
        }else {
            modules[mod.name] = mod;
        }
    }

    await Promise.all(importList.map(mpath => importModule(mpath)))
    
    return modules;
}
const StyleControls = await importList(controls_paths)

function observedStylesToStyleSelection(oss) {
    let k2sc = {}
    for (let scn in StyleControls) {
        for (let key of StyleControls[scn].keys) {
            k2sc[key] = scn;
        }
    }
    let ss = new Set();
    for (let os of oss) {
        ss.add(k2sc[os])
    }
    return ss;
}

export {StyleControls, observedStylesToStyleSelection}
