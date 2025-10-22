import { EventHandler } from 'playcanvas';

type FunctionCallback = (...args: any[]) => any;
type EventRegistration = {eventName: string, callback: FunctionCallback, scope?: object};

class Events extends EventHandler {
    groups = new Map<string, EventRegistration[]>();
    functions = new Map<string, FunctionCallback>();

    // note that an event group is not activated by default.
    onGroup(groupName: string, events: string|string[], callback: FunctionCallback, scope?: object) {
        if (!this.groups.has(groupName)) this.groups.set(groupName, []);
        const register = this.groups.get(groupName);

        if (Array.isArray(events)) {
            events.forEach(eventName => register.push({ eventName, callback, scope }));
        } else {
            const eventName = events;
            register.push({ eventName, callback, scope });
        }
    }

    activateGroup(groupName: string) {
        this.groups.get(groupName).forEach(reg => this.on(reg.eventName, reg.callback, reg.scope));
    }

    deactivateGroup(groupName: string) {
        this.groups.get(groupName).forEach(reg => this.off(reg.eventName, reg.callback, reg.scope));
    }

    // declare an editor function
    function(name: string, fn: FunctionCallback) {
        if (this.functions.has(name)) {
            throw new Error(`error: function ${name} already exists`);
        }
        this.functions.set(name, fn);
    }

    // invoke an editor function
    invoke(name: string, ...args: any[]) {
        const fn = this.functions.get(name);
        if (!fn) {
            console.log(`error: function not found '${name}'`);
            return;
        }
        return fn(...args);
    }
}

export { Events };
