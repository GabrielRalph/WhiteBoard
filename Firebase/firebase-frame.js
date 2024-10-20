import {set, get, ref,update, push, child, getDB, getUID, onChildAdded, onChildRemoved, onChildChanged, onValue, callFunction, uploadFileToCloud} from "./firebase-basic.js"


let appRef = (path) => {
    console.log(this);
    
}



/** 
 * @typedef {(String|Array|Number|Object)} DataValue 
 * @typedef {('host'|'participant'|'both')} UserType
 * */


/**
 * @param {String} appName
 * @param {Object} app
 */
export class FirebaseFrame {
    constructor(reference) {
        this.appRef = (path) => {
            let r = ref(reference)
            if (typeof path === "string") r = child(r, path);
            return r;
        }
        this.listeners = new Set();
    }

    logPath() {
        console.log(this.appRef("hello"));
    }
    

    /** get, gets a value in the apps database at the path specified.
     * 
     * @param {String} path the path in the database you want to access if no 
     *                      path is provided then the app's root directory is fetched.
     * @return {Promise<DataValue>} returns a promise that resolves the value in the database.
     */
    async get(path){ return (await get(this.appRef(path))).val()}


    /** set, sets a value in the apps database at the path specified.
     * @param {String} path same as with get.
     * @return {Promise<void>} returns a promise that resolves nothing once setting has been completed.
     * 
     */
    async set(path, value) {await set(this.appRef(path), value)}

    /** push, gets a new push key for the path at the database
     * 
     * @param {String} path same as with get.
     * @return {String} returns the key to push a new value.
     */
    push(path) {
        let pr = push(this.appRef(path));
        return pr.key;
    }

    /** An onValue event will trigger once with the initial data stored at this location, and then trigger
     *  again each time the data changes. The value passed to the callback will be for the location at which
     *  path specifies. It won't trigger until the entire contents has been synchronized. If the location has
     *  no data, it will be triggered with a null value.
     * 
     * @param {String} path same as with get.
     * @param {(value: DataValue) => void} callback a function that will be called at the start 
     *                                                        and for every change made.
     */
    onValue(path, cb) {
        let close = null;
        if (cb instanceof Function) {
            close = onValue(this.appRef(path), (sc) => cb(sc.val()));
            this.listeners.add(close)
        } else {
            throw "The callback must be a function"
        }
        return () => {
            this.listeners.delete(close);
            close();
        };
    }

    /** An onChildAdded event will be triggered once for each initial child at this location, and it will be 
     *  triggered again every time a new child is added. The value passed into the callback will reflect
     *  the data for the relevant child. It is also passed a second parameter the key of the child added.
     *  For ordering purposes, it is passed a third argument which is a string containing the key of the
     *  previous sibling child by sort order, or null if it is the first child.
     * 
     * @param {String} path same as with get.
     * @param {(value: DataValue, key: String, previousKey: String) => void} callback 
     */
    onChildAdded(path, cb) {
        let close = null;
        if (cb instanceof Function) {
            close = onChildAdded(this.appRef(path), (sc, key) => cb(sc.val(), sc.key, key));
            this.listeners.add(close)
        } else {
            throw "The callback must be a function"
        }
        return () => {
            this.listeners.delete(close);
            close();
        };
    }

    /** An onChildRemoved event will be triggered once every time a child is removed. 
     *  The value passed into the callback will be the old data for the child that was removed.
     *  A child will get removed when it is set null. It is also passed a second parameter the 
     * key of the child removed.
     * 
     * @param {String} path same as with get.
     * @param {(value: DataValue, key: String) => void} callback
     */
    onChildRemoved(path, cb) {
        let close = null;
        if (cb instanceof Function) {
            close = onChildRemoved(this.appRef(path), (sc) => cb(sc.val(), sc.key));
            this.listeners.add()
        } else {
            throw "The callback must be a function"
        }
        return () => {
            this.listeners.delete(close);
            close();
        };
    }

    /** An onChildChanged event will be triggered initially and when the data stored in a child 
     * (or any of its descendants) changes. Note that a single child_changed event may represent 
     * multiple changes to the child. The value passed to the callback will contain the new child 
     * contents. It is also passed a second parameter the key of the child added. For ordering 
     * purposes, the callback is also passed a third argument which is a string containing the 
     * key of the previous sibling child by sort order, or null if it is the first child.
     * @param {String} path same as with get.
     * @param {(value: DataValue, key: String, previousKey: String) => void} callback
     */
    onChildChanged(path, cb) {
        let close = null;
        if (cb instanceof Function) {
            close = onChildChanged(this.appRef(path), (sc, key) => cb(sc.val(), sc.key, key));
            this.listeners.add(close)
        } else {
            throw "The callback must be a function"
        }
        return () => {
            this.listeners.delete(close);
            close();
        };
    }

    /** Ends all listeners and removes the app database */
    close(remove = true) {
        for (let listener of this.listeners) listener();
        if (remove) set(this.appRef(), null);
    }
  }