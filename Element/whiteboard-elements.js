import { SvgPlus } from "../SvgPlus/4.js";

let shape_paths = [
    "./text-shapes.js",
    "./basic-shape.js",
    "./PathElements/pen-path.js",
    "./PathElements/straight-line.js",
    "./PathElements/elbow-path.js",
]

async function getShapes() {
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

    await Promise.all(shape_paths.map(mpath => importModule(mpath)))
    
    return modules;
}

const Elements = await getShapes();

export {Elements}