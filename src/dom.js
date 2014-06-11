(function () {
    "use strict";

    var namespaces = { svg: "http://www.w3.org/2000/svg" },
        dom_js = {};

    window.dom_js = dom_js;

    dom_js.key_codes = {
        escape: 27,
        enter: 13,
        tab: 9,
        delete: 46,
        backspace: 8,
        left: 37,
        up: 38,
        right: 39,
        down: 40
    };

    /**
     * create element
     * @param name
     * @param [attributes]
     * @param [children]
     * @param [events_and_listeners]
     * @returns {*}
     */
    dom_js.create_element = function (name, attributes, children, events_and_listeners) {
        var element;
        name = parse_name(name);
        if (name.namespace) {
            element = document.createElementNS(name.namespace, name.tag);
            element.namespace = name.namespace;
        }
        else element = document.createElement(name.tag);
        if (name.class_name) name.class_name.split(" ").forEach(function (n) { element.classList.add(n); });
        if (name.id) element.id = name.id;
        dom_js.set_attributes(element, attributes);
        dom_js.append_children(element, children);
        dom_js.add_event_listeners(element, events_and_listeners);
        return element;
    };

    dom_js.add_event_listener = function (elements, events, listeners) {
        if (!Array.isArray(elements)) elements = [elements];
        if (!Array.isArray(events)) events = [events];
        if (!Array.isArray(listeners)) listeners = [listeners];
        elements.forEach(function (element) {
            events.forEach(function (event) {
                listeners.forEach(function (listener) {
                    if (!element.addEventListener) element.attachEvent("on" + event, listener);
                    else element.addEventListener(event, listener, false);
                });
            });
        });
    };

    dom_js.remove_event_listener = function (elements, events, listeners) {
        if (!Array.isArray(elements)) elements = [elements];
        if (!Array.isArray(events)) events = [events];
        if (!Array.isArray(listeners)) listeners = [listeners];
        elements.forEach(function (element) {
            events.forEach(function (event) {
                listeners.forEach(function (listener) {
                    if (!element.removeEventListener) element.detachEvent("on" + event, listener);
                    else element.removeEventListener(event, listener, false);
                });
            });
        });
    };

    /**
     * add `events_and_listeners` to `elements`
     * @param elements
     * @param events_and_listeners
     */
    dom_js.add_event_listeners = function (elements, events_and_listeners) {
        if (!Array.isArray(elements)) elements = [elements];
        for (var event in events_and_listeners) {
            if (events_and_listeners.hasOwnProperty(event)) dom_js.add_event_listener(elements, event, events_and_listeners[event]);
        }
    };

    /**
     * remove `events_and_listeners` from `elements`
     * @param elements
     * @param events_and_listeners
     */
    dom_js.remove_event_listeners = function (elements, events_and_listeners) {
        if (!Array.isArray(elements)) elements = [elements];
        for (var event in events_and_listeners) {
            if (events_and_listeners.hasOwnProperty(event)) dom_js.remove_event_listener(elements, event, events_and_listeners[event]);
        }
    };

    /**
     * append `children` to `parent`
     * @param parent
     * @param children
     */
    dom_js.append_children = function (parent, children) {
        if (Array.isArray(children)) children.forEach(function (child) { dom_js.append_child(parent, child); });
    };

    /**
     * append `child` to `parent`
     * @param parent
     * @param child
     */
    dom_js.append_child = function (parent, child) {
        if (typeof child === "string") {
            if (parent.namespace === namespaces.svg) child = document.createTextNode(child, true);
            else child = document.createTextNode(child);
        }
        parent.appendChild(child);
    };

    /**
     * remove `element`
     * @param element
     */
    dom_js.remove_element = function (element) { if (element && element.parentNode) element.parentNode.removeChild(element); };

    /**
     * remove `elements`
     * @param elements
     */
    dom_js.remove_elements = function (elements) { if (Array.isArray(elements)) elements.forEach(function (element) { dom_js.remove_element(element); }); };

    /**
     * empty `element`
     * @param element
     */
    dom_js.empty_element = function (element) {
        while (element.firstChild) element.removeChild(element.firstChild);
    };

    /**
     * set `attributes` to `element`
     * @param element
     * @param attributes
     */
    dom_js.set_attributes = function (element, attributes) {
        for (var key in attributes) if (attributes.hasOwnProperty(key)) element.setAttribute(key, attributes[key]);
    };

    /**
     * prevent default for `event`
     * @param event
     */
    dom_js.prevent_default = function (event) {
        if (event.preventDefault) event.preventDefault();
        else event.returnValue = false;
    };

    /**
     * stop propagation of `event`
     * @param event
     */
    dom_js.stop_propagation = function (event) {
        if (event.stopPropagation) event.stopPropagation();
        else {
            event.cancelBubble = true;
            event.returnValue = false;
        }
    };

    /**
     * squash `event`
     * @param event
     * @returns {boolean}
     */
    dom_js.squash_event = function squash_event(event) {
        dom_js.prevent_default(event);
        dom_js.stop_propagation(event);
        return false;
    };

    /**
     * get bounds for page
     * @returns {{width: (Number|number), height: (Number|number)}}
     */
    dom_js.get_page_bounds = function () {
        var w = window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth,
            h = window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight;
        return {width: w, height: h};
    };

    /**
     * get bounds for `element`
     * @param element
     * @returns {{x: (*|n.x|Number), y: (*|n.y|Number), width: Number, height: Number, top: Number, left: Number, bottom: Number, right: Number}}
     */
    dom_js.get_bounds = function (element) {
        var native_bounds = element.getBoundingClientRect(),
            bounds = {
                x: native_bounds.x,
                y: native_bounds.y,
                width: native_bounds.width,
                height: native_bounds.height,
                top: native_bounds.top,
                left: native_bounds.left,
                bottom: native_bounds.bottom,
                right: native_bounds.right
            };
        if (!bounds.height) bounds.height = bounds.bottom - bounds.top;
        if (!bounds.width) bounds.width = bounds.right - bounds.left;
        if (!bounds.x) bounds.x = bounds.left;
        if (!bounds.y) bounds.y = bounds.top;
        return bounds;
    };

    /**
     * is `child` within bounds of `container`
     * @param child
     * @param container
     * @returns {boolean}
     */
    dom_js.is_within_bounds = function (child, container) {
        var child_bounds = dom_js.get_bounds(child),
            container_bounds = dom_js.get_bounds(container),
            child_center_x = child_bounds.left + (child_bounds.width / 2),
            child_center_y = child_bounds.top + (child_bounds.height / 2);
        return ((child_bounds.left >= container_bounds.left && child_bounds.left <= container_bounds.right) &&
            (child_bounds.top >= container_bounds.top && child_bounds.top <= container_bounds.bottom)) ||
            ((child_center_x >= container_bounds.left && child_center_x <= container_bounds.right) &&
                (child_center_y >= container_bounds.top && child_center_y <= container_bounds.bottom));
    };

    /**
     * is the mouse `event` a right click?
     * stolen from: http://stackoverflow.com/a/2405835/156225
     */
    dom_js.is_right_click = function (event) {
        // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        if ("which" in event) return event.which === 3;
        // IE, Opera
        else if ("button" in event) return event.button === 2;
    };

    /**
     * is object `o` a node?
     * stolen from: http://stackoverflow.com/a/384380/156225
     */
    dom_js.is_node = function (o) {
        return (typeof Node === "object" ? o instanceof Node : o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string");
    };

    /**
     * is object `o` an html element?
     * stolen from: http://stackoverflow.com/a/384380/156225
     */
    dom_js.is_html_element = function (o) {
        return (typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string");
    };

    function parse_name(arg) {
        var split, arg_copy = arg,
            namespace, tag, class_name, id;
        if (arg_copy.indexOf(":") > -1) {
            split = arg_copy.split(":");
            namespace = split[0];
            arg_copy = split[1];
        }
        if (arg_copy.indexOf("#") > -1) {
            split = arg_copy.split("#");
            tag = split[0];
            arg_copy = split[1];
        }
        if (arg_copy.indexOf(".") > -1) {
            split = arg_copy.split(".");
            if (tag) id = split[0];
            else tag = split[0];
            class_name = split[1];
        }
        if (!tag) tag = arg_copy;
        if (!tag) throw new Error("failed to create element for: " + arg);
        return {
            namespace: namespaces[namespace],
            tag: tag,
            class_name: class_name,
            id: id
        };
    }

})();
