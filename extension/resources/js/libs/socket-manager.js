String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

class SocketManager {
    constructor(hosts) {
        this.hosts = [];
        this.handles = {};
        this.states = ['connect', 'event', 'disconnect'];
        this.init(hosts);
    }

    onConnect() {
        console.log("Connected");
    }

    onEvent(data) {
        console.log("Event:", data);
    }

    onDisconnect() {
        console.log("Disconnected");
    }

    init(hosts) {
        console.log("Initializing hosts");
        hosts.forEach(function(host) {
            this.hosts.push(host);
        }, this);
        console.log(`Hosts: ${this.hosts}`);
    }

    connectHost(host) {
        var handle = io(host);
        this.states.forEach(function(state) {
            var f = `on${state.capitalize()}`;
            if (this[f] === undefined) {
                console.error(`"${state}" missing handler function of ${f}`);
            }
            handle.on(state, this[f]);
        }, this);
        console.log(`${host} states registered`);
        var count = Object.keys(this.handles).length;
        this.handles[host] = handle;
    }

    connectAll() {
        console.log("Connecting hosts");
        this.hosts.forEach(function(host) {
            this.connectHost(host);
        }, this);
    }

    disconnectHos(host) {
        if (!this.handles.hasOwnProperty(host)) {
            console.error(`Missing handle for ${host}`);
            return;
        }
        var handle = this.handles[host];
        handle.disconnect();
        delete this.handles[host];
    }

    disconnectAll() {
        console.log("Disconnecting hosts");
        for (var key in this.handles) {
            this.disconnectHost(key);
        }
    }

    emitHost(host, label, data) {
        if (!this.handles.hasOwnProperty(host)) {
            console.error(`Missing handle for ${host}`);
            return;
        }
        var handle = this.handles[host];
        handle.emit(label, data);
    }

    emitAll(label, data) {
        console.log("Emitting across handles");
        for (var key in this.handles) {
            this.emitHost(key, label, data);
        }
    }

    addHostListener(host, label, func) {
        if (!this.handles.hasOwnProperty(host)) {
            console.error(`Missing handle for ${host}`);
            return;
        }
        this.handles[host].on(label, func);
    }

    addListener(label, func) {
        console.log("Adding listener to all handles");
        for (var key in this.handles) {
            this.addHostListener(key, label, func);
        }
    }
};