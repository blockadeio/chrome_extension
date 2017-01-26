class BlockadeSocketManager extends SocketManager {
    onOutput(data) {
        console.log(data);
    }

    constructor(hosts) {
        super(hosts);
        super.connectAll();
        this.listeners = [];

        /**
         * This will automatically associate any method (not constructor) defined
         * in this SocketManager class with all of the active web socket connections.
         * It's assumed that all methods start with "on" and emit back to the
         * method name that follows that.
         *
         * Ex. onOutput => Label: output, Func: onOutput
         */
        var methods = Object.getOwnPropertyNames(this.__proto__);
        for (var idx in methods) {
            var proto = methods[idx];
            if (proto === "constructor") continue;
            var label = proto.substring(2).toLowerCase();
            super.addListener(label, this[proto]);
        }
    }
}