const Interface = {
    "getName": {
        type: "function",
        required: true,
    },

    "getIcon": {
        type: "function",
        required: true,
    },

    "onSelect": {
        type: "function",
        required: false,
        default: () => () => {}
    },

    "onDeselect": {
        type: "function",
        required: false,
        default: () => () => {}
    },
    "clearSelectionOnSelect": {
        type: "function",
        required: false,
        default: () => () => true
    }
}

let tool_paths = [
    "./pan.js",
    "./draw.js",
    "./erasor.js",
    "./textbox.js",
    "./shapes.js",
    "./free-text.js",
    "./select.js",
    "./undo.js",
    "./redo.js",
    "./delete.js",
    "./elbow-path.js",
    "./line.js",
    "./capture.js",
]

async function getTools(){
    let tools = {}
    let importTool = async (tool_path) => {
        let toolModule = await import(tool_path);
        let toolModuleProxy = {};
        let valid = true;
        for (let key in Interface) {
            let prop = Interface[key];
            let value = toolModule[key];
            if (typeof value !== prop.type) {
                if (prop.required) {
                    console.warn(`The model at ${tool} does not have the required ${prop.type} ${key} specified in the interface.`)
                    valid = false;
                } else if (prop.default instanceof Function) {
                    value = prop.default()
                    
                }
            }
            toolModuleProxy[key] = value;
        }
        for (let key in toolModule) {
            if (!(key in Interface)) {
                toolModuleProxy[key] = toolModule[key]
            }
        }
        if (valid) {
            tools[toolModule.getName()] = toolModuleProxy;
        }
    }
    await Promise.all(tool_paths.map(p => importTool(p)))

    return tools;
}

const Tools = await getTools();
export {Tools}