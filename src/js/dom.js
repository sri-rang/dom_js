/* global window, dom_js, _*/
(function () {
    "use strict";

    window.dom_js = {};

    dom_js.create_element = function (tag, attributes, children, events_and_listeners) {
        var element;
        tag = tag.split(".");
        element = document.createElement(tag[0]);
        element.className = tag[1];
        dom_js.set_attributes(element, attributes);
        dom_js.append_children(element, children);
        dom_js.add_event_listeners(element, events_and_listeners);
        return element;
    };

    dom_js.add_event_listener = function (elements, events, listeners) {
        if (!_.isArray(elements)) elements = [elements];
        if (!_.isArray(events)) events = [events];
        if (!_.isArray(listeners)) listeners = [listeners];
        _.each(elements, function (element) {
            _.each(events, function (event) {
                _.each(listeners, function (listener) {
                    if (!element.addEventListener) element.attachEvent("on" + event, listener);
                    else element.addEventListener(event, listener, false);
                });
            });
        });
    };

    dom_js.remove_event_listener = function (elements, events, listeners) {
        if (!_.isArray(elements)) elements = [elements];
        if (!_.isArray(events)) events = [events];
        if (!_.isArray(listeners)) listeners = [listeners];
        _.each(elements, function (element) {
            _.each(events, function (event) {
                _.each(listeners, function (listener) {
                    if (!element.removeEventListener) element.detachEvent("on" + event, listener);
                    else element.removeEventListener(event, listener, false);
                });
            });
        });
    };

    dom_js.add_event_listeners = function (elements, events_and_listeners) {
        if (!_.isArray(elements)) elements = [elements];
        for (var event in events_and_listeners) {
            if (events_and_listeners.hasOwnProperty(event)) dom_js.add_event_listener(elements, event, events_and_listeners[event]);
        }
    };

    dom_js.remove_event_listeners = function (elements, eventsAndListeners) {
        if (!_.isArray(elements)) elements = [elements];
        for (var event in eventsAndListeners) {
            if (eventsAndListeners.hasOwnProperty(event)) dom_js.remove_event_listener(elements, event, eventsAndListeners[event]);
        }
    };

    dom_js.append_children = function (parent, children) { _.each(children, function (child) { dom_js.append_child(parent, child); }); };

    dom_js.append_child = function (parent, child) {
        if (typeof child === "string") child = document.createTextNode(child);
        parent.appendChild(child);
    };

    dom_js.remove_element = function (element) { if (element.parentNode) element.parentNode.removeChild(element); };

    dom_js.remove_elements = function (elements) { _.each(elements, function (element) { dom_js.remove_element(element); }); };

    dom_js.empty_element = function (element) { element.innerHTML = ""; };

    dom_js.set_attributes = function (element, attributes) {
        for (var key in attributes) if (attributes.hasOwnProperty(key)) element.setAttribute(key, attributes[key]);
    };

    dom_js.prevent_default = function (e) {
        if (e.preventDefault) e.preventDefault();
        else e.returnValue = false;
    };

    dom_js.stop_propagation = function (e) {
        if (e.stopPropagation) e.stopPropagation();
        else {
            e.cancelBubble = true;
            e.returnValue = false;
        }
    };

    dom_js.squash_event = function squash_event(e) {
        dom_js.prevent_default(e);
        dom_js.stop_propagation(e);
        return false;
    };

    dom_js.get_page_bounds = function () {
        var w = window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth,
            h = window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight;
        return {width: w, height: h};
    };

    dom_js.is_within_bounds = function (child, container) {
        var child_bounds = child.getBoundingClientRect(),
            container_bounds = container.getBoundingClientRect(),
            child_center_x = child_bounds.left + (child_bounds.width / 2),
            child_center_y = child_bounds.top + (child_bounds.height / 2);
        return ((child_bounds.left >= container_bounds.left && child_bounds.left <= container_bounds.right) && (child_bounds.top >= container_bounds.top && child_bounds.top <= container_bounds.bottom)) ||
            ((child_center_x >= container_bounds.left && child_center_x <= container_bounds.right) && (child_center_y >= container_bounds.top && child_center_y <= container_bounds.bottom));
    };

})();