const VERSION = 'v0.0.6';

function fullScreen(elem) {
    elem.style.position = 'absolute';
    elem.style.top = '0';
    elem.style.left = '0';
    elem.style.right = '0';
    elem.style.bottom = '0';
}
function topRight(elem) {
    elem.style.position = 'absolute';
    elem.style.top = '0';
    elem.style.right = '0';
}
function center(elem) {
    elem.style.display = 'flex';
    elem.style.justifyContent = 'center';
    elem.style.alignItems = 'center';
}
function vert(elem) {
    elem.style.display = 'flex';
    elem.style.gap = '1rem';
    elem.style.flexDirection = 'column';
}
function horiz(elem) {
    elem.style.display = 'flex';
    elem.style.flexDirection = 'row';
    elem.style.gap = '0.5rem';
    elem.style.alignItems = 'center';
}
function rel(elem) {
    elem.style.position = 'relative';
}
function title(elem) {
    elem.style.fontSize = '1.5rem';
    elem.style.fontWeight = 'bold';
    elem.style.padding = '0.5rem 1rem';
}
function pointer(elem) {
    elem.style.cursor = 'pointer';
}
function bucState(elem, text) {
    const str = text.toLowerCase();
    if (str.match(/(?<!un)cursed/) || str.includes('unholy')) {
        elem.classList.add('cursed');
    }
    else if (str.includes('blessed')) {
        elem.classList.add('blessed');
    }
}

const createAccel = (accel) => {
    const accelElem = document.createElement('div');
    if (accel > 0) {
        accelElem.classList.add('accel');
        accelElem.innerHTML = String.fromCharCode(accel);
    }
    return accelElem;
};
function MenuButton(item, prepend = true, tileMap, disable = false) {
    const btn = document.createElement('button');
    btn.disabled = item.identifier === 0 || disable;
    btn.style.position = 'relative';
    horiz(btn);
    bucState(btn, item.str);
    btn.onclick = () => window.nethackJS.sendInput(item.accelerator || `${item.identifier}`);
    if (item.active) {
        btn.classList.add('active');
    }
    const label = document.createElement('span');
    label.innerHTML = item.str;
    if ((item.count || 0) > 0) {
        const count = document.createElement('span');
        count.innerHTML += ` x${item.count}`;
        topRight(count);
        count.style.top = '-5px';
        count.style.background = '#333';
        count.style.borderRadius = '100%';
        // Make it fit and rounder
        count.style.padding = '0.25rem 0';
        count.style.paddingRight = '0.5rem';
        btn.appendChild(count);
    }
    if (prepend) {
        btn.appendChild(createAccel(item.accelerator));
    }
    if (item.tile && tileMap?.currentTileSet && !tileMap?.isRogueLevel()) {
        const img = tileMap.currentTileSet.createBackgroundImage(item.tile);
        btn.appendChild(img);
    }
    btn.appendChild(label);
    if (!prepend) {
        btn.appendChild(createAccel(item.accelerator));
    }
    return btn;
}

class Menu {
    constructor(prompt, tileMap) {
        this.prompt = prompt;
        this.tileMap = tileMap;
        this.elem = document.createElement('div');
        vert(this.elem);
        this.label = this.createLabel();
        this.elem.appendChild(this.label);
    }
    updateMenu(items, count) {
        if (this.menuContainer) {
            this.elem.removeChild(this.menuContainer);
        }
        this.menuContainer = document.createElement('div');
        vert(this.menuContainer);
        this.createMenu(items, this.menuContainer, count === 0);
        this.elem.appendChild(this.menuContainer);
    }
    createLabel() {
        const label = document.createElement('div');
        label.innerHTML = this.prompt;
        return label;
    }
    createMenu(items, container, disable) {
        items.forEach((i) => {
            if (i.identifier !== 0) {
                container.appendChild(MenuButton(i, true, this.tileMap, disable));
            }
            else if (i.str !== '') {
                container.appendChild(MenuButton(i, false, this.tileMap, disable));
            }
        });
        return container;
    }
}

class Dialog {
    constructor(text = '', escape = true) {
        const overlay = document.createElement('div');
        overlay.style.zIndex = '1';
        overlay.classList.add('dialog-overlay');
        fullScreen(overlay);
        document.body.appendChild(overlay);
        this.elem = document.createElement('pre');
        if (text !== '') {
            this.elem.innerHTML = escape ? this.escapeHtml(text) : text;
        }
        vert(this.elem);
        this.elem.classList.add('dialog');
        setTimeout(() => {
            this.elem.classList.add('open');
        }, 100);
    }
    /// https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript
    escapeHtml(unsafe) {
        return unsafe
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }
    static removeAll() {
        document.querySelectorAll(`.dialog`).forEach((elem) => {
            elem.classList.remove('open');
            setTimeout(() => {
                elem.remove();
                document.querySelectorAll('.dialog-overlay').forEach((e) => e.remove());
            }, 200);
        });
    }
}

const CANCEL_KEY = ['Escape'];

class Line {
    constructor(question, autocomplete) {
        this.autocomplete = autocomplete;
        this.possibleItems = [];
        this.onLineEnter = (line) => { };
        this.elem = document.createElement('div');
        vert(this.elem);
        const container = document.createElement('div');
        horiz(container);
        this.elem.appendChild(container);
        container.appendChild(document.createTextNode(question));
        this.possibleItems = autocomplete;
        const input = document.createElement('input');
        this.input = input;
        container.appendChild(input);
        input.onkeydown = (e) => {
            if (e.key === 'Tab') {
                //prevent losing focus
                e.preventDefault();
            }
        };
        input.onkeyup = (e) => {
            // From BrowserHack
            if (e.key === 'Enter') {
                e.preventDefault();
                this.onLineEnter(input.value);
            }
            else if (this.autocomplete.length) {
                this.updatePossibleItems();
                if (e.key === 'Backspace') {
                    input.value = input.value.substring(0, input.selectionStart || 0);
                }
                else {
                    // we may press a, then press b before releasing a
                    // thus for the string "ab" we will receive two keyup events
                    // do not clear the selection
                    if (this.possibleItems.length == 1 && input.selectionStart == input.selectionEnd) {
                        this.suggestInput(this.possibleItems[0]);
                    }
                }
            }
        };
        this.list = document.createElement('div');
        vert(this.list);
        const autocompleteLen = this.autocomplete.length;
        if (autocompleteLen) {
            if (autocompleteLen > 1) {
                this.elem.appendChild(this.list);
                this.updateList();
            }
            else {
                this.suggestInput(this.autocomplete[0]);
            }
        }
    }
    suggestInput(value) {
        const search = this.input.value;
        this.input.value = value;
        this.input.setSelectionRange(search.length, value.length);
    }
    updatePossibleItems() {
        const possibleItems = [];
        const search = this.input.value;
        this.autocomplete.forEach(function (str) {
            if (str.indexOf(search) == 0)
                possibleItems.push(str);
        });
        this.possibleItems = possibleItems.filter((x) => x.length > 1); // filter out #, ?
        this.updateList();
    }
    updateList() {
        Array.from(this.list.children).forEach((e) => this.list.removeChild(e));
        this.possibleItems.forEach((item) => {
            const node = document.createElement('div');
            node.innerHTML = item;
            this.list.appendChild(node);
        });
    }
    onInput(e) {
        if (CANCEL_KEY.includes(e.key)) {
            this.onLineEnter('');
        }
    }
    focus() {
        this.input.focus();
    }
}

class TextArea {
    constructor(value) {
        this.onSubmit = (value) => { };
        this.elem = document.createElement('div');
        this.elem.style.width = '75vw';
        vert(this.elem);
        this.elem.appendChild(document.createTextNode('Ctrl+Enter to confirm'));
        this.input = document.createElement('textarea');
        this.input.value = value;
        this.input.rows = Math.max(value.split('\n').length, 10) + 5;
        this.elem.appendChild(this.input);
        this.input.onkeydown = (e) => {
            if (e.key === 'Tab') {
                //prevent losing focus
                e.preventDefault();
            }
        };
        this.input.onkeyup = (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                this.onSubmit(this.input.value);
            }
        };
    }
    onInput(e) {
        if (CANCEL_KEY.includes(e.key)) {
            this.onSubmit(null);
        }
    }
    focus() {
        this.input.focus();
    }
}

class Screen {
    constructor() {
        this.elem = document.createElement('div');
        fullScreen(this.elem);
        center(this.elem);
    }
    createButton(text, onClick = () => { }) {
        const btn = document.createElement('button');
        btn.innerHTML = text;
        btn.onclick = onClick;
        return btn;
    }
    onResize() { }
    onMenu(prompt, count, items) { }
    onDialog(text, escape = true) {
        const dialog = new Dialog(text, escape);
        this.elem.appendChild(dialog.elem);
    }
    onLine(question, autocomplete) {
        const line = new Line(question, autocomplete);
        this.createDialog(line.elem);
        line.onLineEnter = (line) => {
            window.nethackJS.sendLine(line);
            this.inputHandler = undefined;
        };
        this.inputHandler = line;
        line.focus();
    }
    onTextArea(value) {
        const textarea = new TextArea(value);
        this.createDialog(textarea.elem);
        textarea.onSubmit = (value) => {
            window.nethackJS.sendLine(value);
            this.inputHandler = undefined;
        };
        this.inputHandler = textarea;
        textarea.focus();
    }
    createDialog(elem) {
        const dialog = new Dialog();
        dialog.elem.appendChild(elem);
        this.elem.appendChild(dialog.elem);
    }
    onCloseDialog() {
        Dialog.removeAll();
        // Only dialogs might handle inputs, so if all are closed nothing should handle it
        this.inputHandler = undefined;
    }
    onSettingsChange(setting) { }
}

class StartScreen extends Screen {
    constructor() {
        super();
        this.menu = new Menu('Test');
        this.menu.label.style.marginBottom = '2rem';
        title(this.menu.label);
        this.elem.appendChild(this.menu.elem);
        const version = document.querySelector('#version');
        version.innerHTML = VERSION;
        version.href = `https://github.com/sakkaku-dev/nethack-web/releases/tag/${VERSION}`;
        console.log('Running version', VERSION);
    }
    onDialog(text) {
        super.onDialog(text, false);
    }
    onMenu(prompt, count, items) {
        this.menu.label.innerHTML = prompt;
        this.menu.updateMenu(items, count);
    }
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

function isFunction(value) {
    return typeof value === 'function';
}

function createErrorClass(createImpl) {
    var _super = function (instance) {
        Error.call(instance);
        instance.stack = new Error().stack;
    };
    var ctorFunc = createImpl(_super);
    ctorFunc.prototype = Object.create(Error.prototype);
    ctorFunc.prototype.constructor = ctorFunc;
    return ctorFunc;
}

var UnsubscriptionError = createErrorClass(function (_super) {
    return function UnsubscriptionErrorImpl(errors) {
        _super(this);
        this.message = errors
            ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ')
            : '';
        this.name = 'UnsubscriptionError';
        this.errors = errors;
    };
});

function arrRemove(arr, item) {
    if (arr) {
        var index = arr.indexOf(item);
        0 <= index && arr.splice(index, 1);
    }
}

var Subscription = (function () {
    function Subscription(initialTeardown) {
        this.initialTeardown = initialTeardown;
        this.closed = false;
        this._parentage = null;
        this._finalizers = null;
    }
    Subscription.prototype.unsubscribe = function () {
        var e_1, _a, e_2, _b;
        var errors;
        if (!this.closed) {
            this.closed = true;
            var _parentage = this._parentage;
            if (_parentage) {
                this._parentage = null;
                if (Array.isArray(_parentage)) {
                    try {
                        for (var _parentage_1 = __values(_parentage), _parentage_1_1 = _parentage_1.next(); !_parentage_1_1.done; _parentage_1_1 = _parentage_1.next()) {
                            var parent_1 = _parentage_1_1.value;
                            parent_1.remove(this);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_parentage_1_1 && !_parentage_1_1.done && (_a = _parentage_1.return)) _a.call(_parentage_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
                else {
                    _parentage.remove(this);
                }
            }
            var initialFinalizer = this.initialTeardown;
            if (isFunction(initialFinalizer)) {
                try {
                    initialFinalizer();
                }
                catch (e) {
                    errors = e instanceof UnsubscriptionError ? e.errors : [e];
                }
            }
            var _finalizers = this._finalizers;
            if (_finalizers) {
                this._finalizers = null;
                try {
                    for (var _finalizers_1 = __values(_finalizers), _finalizers_1_1 = _finalizers_1.next(); !_finalizers_1_1.done; _finalizers_1_1 = _finalizers_1.next()) {
                        var finalizer = _finalizers_1_1.value;
                        try {
                            execFinalizer(finalizer);
                        }
                        catch (err) {
                            errors = errors !== null && errors !== void 0 ? errors : [];
                            if (err instanceof UnsubscriptionError) {
                                errors = __spreadArray(__spreadArray([], __read(errors)), __read(err.errors));
                            }
                            else {
                                errors.push(err);
                            }
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_finalizers_1_1 && !_finalizers_1_1.done && (_b = _finalizers_1.return)) _b.call(_finalizers_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            if (errors) {
                throw new UnsubscriptionError(errors);
            }
        }
    };
    Subscription.prototype.add = function (teardown) {
        var _a;
        if (teardown && teardown !== this) {
            if (this.closed) {
                execFinalizer(teardown);
            }
            else {
                if (teardown instanceof Subscription) {
                    if (teardown.closed || teardown._hasParent(this)) {
                        return;
                    }
                    teardown._addParent(this);
                }
                (this._finalizers = (_a = this._finalizers) !== null && _a !== void 0 ? _a : []).push(teardown);
            }
        }
    };
    Subscription.prototype._hasParent = function (parent) {
        var _parentage = this._parentage;
        return _parentage === parent || (Array.isArray(_parentage) && _parentage.includes(parent));
    };
    Subscription.prototype._addParent = function (parent) {
        var _parentage = this._parentage;
        this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
    };
    Subscription.prototype._removeParent = function (parent) {
        var _parentage = this._parentage;
        if (_parentage === parent) {
            this._parentage = null;
        }
        else if (Array.isArray(_parentage)) {
            arrRemove(_parentage, parent);
        }
    };
    Subscription.prototype.remove = function (teardown) {
        var _finalizers = this._finalizers;
        _finalizers && arrRemove(_finalizers, teardown);
        if (teardown instanceof Subscription) {
            teardown._removeParent(this);
        }
    };
    Subscription.EMPTY = (function () {
        var empty = new Subscription();
        empty.closed = true;
        return empty;
    })();
    return Subscription;
}());
var EMPTY_SUBSCRIPTION = Subscription.EMPTY;
function isSubscription(value) {
    return (value instanceof Subscription ||
        (value && 'closed' in value && isFunction(value.remove) && isFunction(value.add) && isFunction(value.unsubscribe)));
}
function execFinalizer(finalizer) {
    if (isFunction(finalizer)) {
        finalizer();
    }
    else {
        finalizer.unsubscribe();
    }
}

var config = {
    onUnhandledError: null,
    onStoppedNotification: null,
    Promise: undefined,
    useDeprecatedSynchronousErrorHandling: false,
    useDeprecatedNextContext: false,
};

var timeoutProvider = {
    setTimeout: function (handler, timeout) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var delegate = timeoutProvider.delegate;
        if (delegate === null || delegate === void 0 ? void 0 : delegate.setTimeout) {
            return delegate.setTimeout.apply(delegate, __spreadArray([handler, timeout], __read(args)));
        }
        return setTimeout.apply(void 0, __spreadArray([handler, timeout], __read(args)));
    },
    clearTimeout: function (handle) {
        var delegate = timeoutProvider.delegate;
        return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearTimeout) || clearTimeout)(handle);
    },
    delegate: undefined,
};

function reportUnhandledError(err) {
    timeoutProvider.setTimeout(function () {
        {
            throw err;
        }
    });
}

function noop() { }

function errorContext(cb) {
    {
        cb();
    }
}

var Subscriber = (function (_super) {
    __extends(Subscriber, _super);
    function Subscriber(destination) {
        var _this = _super.call(this) || this;
        _this.isStopped = false;
        if (destination) {
            _this.destination = destination;
            if (isSubscription(destination)) {
                destination.add(_this);
            }
        }
        else {
            _this.destination = EMPTY_OBSERVER;
        }
        return _this;
    }
    Subscriber.create = function (next, error, complete) {
        return new SafeSubscriber(next, error, complete);
    };
    Subscriber.prototype.next = function (value) {
        if (this.isStopped) ;
        else {
            this._next(value);
        }
    };
    Subscriber.prototype.error = function (err) {
        if (this.isStopped) ;
        else {
            this.isStopped = true;
            this._error(err);
        }
    };
    Subscriber.prototype.complete = function () {
        if (this.isStopped) ;
        else {
            this.isStopped = true;
            this._complete();
        }
    };
    Subscriber.prototype.unsubscribe = function () {
        if (!this.closed) {
            this.isStopped = true;
            _super.prototype.unsubscribe.call(this);
            this.destination = null;
        }
    };
    Subscriber.prototype._next = function (value) {
        this.destination.next(value);
    };
    Subscriber.prototype._error = function (err) {
        try {
            this.destination.error(err);
        }
        finally {
            this.unsubscribe();
        }
    };
    Subscriber.prototype._complete = function () {
        try {
            this.destination.complete();
        }
        finally {
            this.unsubscribe();
        }
    };
    return Subscriber;
}(Subscription));
var _bind = Function.prototype.bind;
function bind(fn, thisArg) {
    return _bind.call(fn, thisArg);
}
var ConsumerObserver = (function () {
    function ConsumerObserver(partialObserver) {
        this.partialObserver = partialObserver;
    }
    ConsumerObserver.prototype.next = function (value) {
        var partialObserver = this.partialObserver;
        if (partialObserver.next) {
            try {
                partialObserver.next(value);
            }
            catch (error) {
                handleUnhandledError(error);
            }
        }
    };
    ConsumerObserver.prototype.error = function (err) {
        var partialObserver = this.partialObserver;
        if (partialObserver.error) {
            try {
                partialObserver.error(err);
            }
            catch (error) {
                handleUnhandledError(error);
            }
        }
        else {
            handleUnhandledError(err);
        }
    };
    ConsumerObserver.prototype.complete = function () {
        var partialObserver = this.partialObserver;
        if (partialObserver.complete) {
            try {
                partialObserver.complete();
            }
            catch (error) {
                handleUnhandledError(error);
            }
        }
    };
    return ConsumerObserver;
}());
var SafeSubscriber = (function (_super) {
    __extends(SafeSubscriber, _super);
    function SafeSubscriber(observerOrNext, error, complete) {
        var _this = _super.call(this) || this;
        var partialObserver;
        if (isFunction(observerOrNext) || !observerOrNext) {
            partialObserver = {
                next: (observerOrNext !== null && observerOrNext !== void 0 ? observerOrNext : undefined),
                error: error !== null && error !== void 0 ? error : undefined,
                complete: complete !== null && complete !== void 0 ? complete : undefined,
            };
        }
        else {
            var context_1;
            if (_this && config.useDeprecatedNextContext) {
                context_1 = Object.create(observerOrNext);
                context_1.unsubscribe = function () { return _this.unsubscribe(); };
                partialObserver = {
                    next: observerOrNext.next && bind(observerOrNext.next, context_1),
                    error: observerOrNext.error && bind(observerOrNext.error, context_1),
                    complete: observerOrNext.complete && bind(observerOrNext.complete, context_1),
                };
            }
            else {
                partialObserver = observerOrNext;
            }
        }
        _this.destination = new ConsumerObserver(partialObserver);
        return _this;
    }
    return SafeSubscriber;
}(Subscriber));
function handleUnhandledError(error) {
    {
        reportUnhandledError(error);
    }
}
function defaultErrorHandler(err) {
    throw err;
}
var EMPTY_OBSERVER = {
    closed: true,
    next: noop,
    error: defaultErrorHandler,
    complete: noop,
};

var observable = (function () { return (typeof Symbol === 'function' && Symbol.observable) || '@@observable'; })();

function identity(x) {
    return x;
}

function pipeFromArray(fns) {
    if (fns.length === 0) {
        return identity;
    }
    if (fns.length === 1) {
        return fns[0];
    }
    return function piped(input) {
        return fns.reduce(function (prev, fn) { return fn(prev); }, input);
    };
}

var Observable = (function () {
    function Observable(subscribe) {
        if (subscribe) {
            this._subscribe = subscribe;
        }
    }
    Observable.prototype.lift = function (operator) {
        var observable = new Observable();
        observable.source = this;
        observable.operator = operator;
        return observable;
    };
    Observable.prototype.subscribe = function (observerOrNext, error, complete) {
        var _this = this;
        var subscriber = isSubscriber(observerOrNext) ? observerOrNext : new SafeSubscriber(observerOrNext, error, complete);
        errorContext(function () {
            var _a = _this, operator = _a.operator, source = _a.source;
            subscriber.add(operator
                ?
                    operator.call(subscriber, source)
                : source
                    ?
                        _this._subscribe(subscriber)
                    :
                        _this._trySubscribe(subscriber));
        });
        return subscriber;
    };
    Observable.prototype._trySubscribe = function (sink) {
        try {
            return this._subscribe(sink);
        }
        catch (err) {
            sink.error(err);
        }
    };
    Observable.prototype.forEach = function (next, promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var subscriber = new SafeSubscriber({
                next: function (value) {
                    try {
                        next(value);
                    }
                    catch (err) {
                        reject(err);
                        subscriber.unsubscribe();
                    }
                },
                error: reject,
                complete: resolve,
            });
            _this.subscribe(subscriber);
        });
    };
    Observable.prototype._subscribe = function (subscriber) {
        var _a;
        return (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber);
    };
    Observable.prototype[observable] = function () {
        return this;
    };
    Observable.prototype.pipe = function () {
        var operations = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            operations[_i] = arguments[_i];
        }
        return pipeFromArray(operations)(this);
    };
    Observable.prototype.toPromise = function (promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var value;
            _this.subscribe(function (x) { return (value = x); }, function (err) { return reject(err); }, function () { return resolve(value); });
        });
    };
    Observable.create = function (subscribe) {
        return new Observable(subscribe);
    };
    return Observable;
}());
function getPromiseCtor(promiseCtor) {
    var _a;
    return (_a = promiseCtor !== null && promiseCtor !== void 0 ? promiseCtor : config.Promise) !== null && _a !== void 0 ? _a : Promise;
}
function isObserver(value) {
    return value && isFunction(value.next) && isFunction(value.error) && isFunction(value.complete);
}
function isSubscriber(value) {
    return (value && value instanceof Subscriber) || (isObserver(value) && isSubscription(value));
}

function hasLift(source) {
    return isFunction(source === null || source === void 0 ? void 0 : source.lift);
}
function operate(init) {
    return function (source) {
        if (hasLift(source)) {
            return source.lift(function (liftedSource) {
                try {
                    return init(liftedSource, this);
                }
                catch (err) {
                    this.error(err);
                }
            });
        }
        throw new TypeError('Unable to lift unknown Observable type');
    };
}

function createOperatorSubscriber(destination, onNext, onComplete, onError, onFinalize) {
    return new OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize);
}
var OperatorSubscriber = (function (_super) {
    __extends(OperatorSubscriber, _super);
    function OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize, shouldUnsubscribe) {
        var _this = _super.call(this, destination) || this;
        _this.onFinalize = onFinalize;
        _this.shouldUnsubscribe = shouldUnsubscribe;
        _this._next = onNext
            ? function (value) {
                try {
                    onNext(value);
                }
                catch (err) {
                    destination.error(err);
                }
            }
            : _super.prototype._next;
        _this._error = onError
            ? function (err) {
                try {
                    onError(err);
                }
                catch (err) {
                    destination.error(err);
                }
                finally {
                    this.unsubscribe();
                }
            }
            : _super.prototype._error;
        _this._complete = onComplete
            ? function () {
                try {
                    onComplete();
                }
                catch (err) {
                    destination.error(err);
                }
                finally {
                    this.unsubscribe();
                }
            }
            : _super.prototype._complete;
        return _this;
    }
    OperatorSubscriber.prototype.unsubscribe = function () {
        var _a;
        if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
            var closed_1 = this.closed;
            _super.prototype.unsubscribe.call(this);
            !closed_1 && ((_a = this.onFinalize) === null || _a === void 0 ? void 0 : _a.call(this));
        }
    };
    return OperatorSubscriber;
}(Subscriber));

var ObjectUnsubscribedError = createErrorClass(function (_super) {
    return function ObjectUnsubscribedErrorImpl() {
        _super(this);
        this.name = 'ObjectUnsubscribedError';
        this.message = 'object unsubscribed';
    };
});

var Subject = (function (_super) {
    __extends(Subject, _super);
    function Subject() {
        var _this = _super.call(this) || this;
        _this.closed = false;
        _this.currentObservers = null;
        _this.observers = [];
        _this.isStopped = false;
        _this.hasError = false;
        _this.thrownError = null;
        return _this;
    }
    Subject.prototype.lift = function (operator) {
        var subject = new AnonymousSubject(this, this);
        subject.operator = operator;
        return subject;
    };
    Subject.prototype._throwIfClosed = function () {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
    };
    Subject.prototype.next = function (value) {
        var _this = this;
        errorContext(function () {
            var e_1, _a;
            _this._throwIfClosed();
            if (!_this.isStopped) {
                if (!_this.currentObservers) {
                    _this.currentObservers = Array.from(_this.observers);
                }
                try {
                    for (var _b = __values(_this.currentObservers), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var observer = _c.value;
                        observer.next(value);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        });
    };
    Subject.prototype.error = function (err) {
        var _this = this;
        errorContext(function () {
            _this._throwIfClosed();
            if (!_this.isStopped) {
                _this.hasError = _this.isStopped = true;
                _this.thrownError = err;
                var observers = _this.observers;
                while (observers.length) {
                    observers.shift().error(err);
                }
            }
        });
    };
    Subject.prototype.complete = function () {
        var _this = this;
        errorContext(function () {
            _this._throwIfClosed();
            if (!_this.isStopped) {
                _this.isStopped = true;
                var observers = _this.observers;
                while (observers.length) {
                    observers.shift().complete();
                }
            }
        });
    };
    Subject.prototype.unsubscribe = function () {
        this.isStopped = this.closed = true;
        this.observers = this.currentObservers = null;
    };
    Object.defineProperty(Subject.prototype, "observed", {
        get: function () {
            var _a;
            return ((_a = this.observers) === null || _a === void 0 ? void 0 : _a.length) > 0;
        },
        enumerable: false,
        configurable: true
    });
    Subject.prototype._trySubscribe = function (subscriber) {
        this._throwIfClosed();
        return _super.prototype._trySubscribe.call(this, subscriber);
    };
    Subject.prototype._subscribe = function (subscriber) {
        this._throwIfClosed();
        this._checkFinalizedStatuses(subscriber);
        return this._innerSubscribe(subscriber);
    };
    Subject.prototype._innerSubscribe = function (subscriber) {
        var _this = this;
        var _a = this, hasError = _a.hasError, isStopped = _a.isStopped, observers = _a.observers;
        if (hasError || isStopped) {
            return EMPTY_SUBSCRIPTION;
        }
        this.currentObservers = null;
        observers.push(subscriber);
        return new Subscription(function () {
            _this.currentObservers = null;
            arrRemove(observers, subscriber);
        });
    };
    Subject.prototype._checkFinalizedStatuses = function (subscriber) {
        var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, isStopped = _a.isStopped;
        if (hasError) {
            subscriber.error(thrownError);
        }
        else if (isStopped) {
            subscriber.complete();
        }
    };
    Subject.prototype.asObservable = function () {
        var observable = new Observable();
        observable.source = this;
        return observable;
    };
    Subject.create = function (destination, source) {
        return new AnonymousSubject(destination, source);
    };
    return Subject;
}(Observable));
var AnonymousSubject = (function (_super) {
    __extends(AnonymousSubject, _super);
    function AnonymousSubject(destination, source) {
        var _this = _super.call(this) || this;
        _this.destination = destination;
        _this.source = source;
        return _this;
    }
    AnonymousSubject.prototype.next = function (value) {
        var _a, _b;
        (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.next) === null || _b === void 0 ? void 0 : _b.call(_a, value);
    };
    AnonymousSubject.prototype.error = function (err) {
        var _a, _b;
        (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.call(_a, err);
    };
    AnonymousSubject.prototype.complete = function () {
        var _a, _b;
        (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.complete) === null || _b === void 0 ? void 0 : _b.call(_a);
    };
    AnonymousSubject.prototype._subscribe = function (subscriber) {
        var _a, _b;
        return (_b = (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber)) !== null && _b !== void 0 ? _b : EMPTY_SUBSCRIPTION;
    };
    return AnonymousSubject;
}(Subject));

var dateTimestampProvider = {
    now: function () {
        return (dateTimestampProvider.delegate || Date).now();
    },
    delegate: undefined,
};

var Action = (function (_super) {
    __extends(Action, _super);
    function Action(scheduler, work) {
        return _super.call(this) || this;
    }
    Action.prototype.schedule = function (state, delay) {
        return this;
    };
    return Action;
}(Subscription));

var intervalProvider = {
    setInterval: function (handler, timeout) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var delegate = intervalProvider.delegate;
        if (delegate === null || delegate === void 0 ? void 0 : delegate.setInterval) {
            return delegate.setInterval.apply(delegate, __spreadArray([handler, timeout], __read(args)));
        }
        return setInterval.apply(void 0, __spreadArray([handler, timeout], __read(args)));
    },
    clearInterval: function (handle) {
        var delegate = intervalProvider.delegate;
        return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearInterval) || clearInterval)(handle);
    },
    delegate: undefined,
};

var AsyncAction = (function (_super) {
    __extends(AsyncAction, _super);
    function AsyncAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        _this.pending = false;
        return _this;
    }
    AsyncAction.prototype.schedule = function (state, delay) {
        var _a;
        if (delay === void 0) { delay = 0; }
        if (this.closed) {
            return this;
        }
        this.state = state;
        var id = this.id;
        var scheduler = this.scheduler;
        if (id != null) {
            this.id = this.recycleAsyncId(scheduler, id, delay);
        }
        this.pending = true;
        this.delay = delay;
        this.id = (_a = this.id) !== null && _a !== void 0 ? _a : this.requestAsyncId(scheduler, this.id, delay);
        return this;
    };
    AsyncAction.prototype.requestAsyncId = function (scheduler, _id, delay) {
        if (delay === void 0) { delay = 0; }
        return intervalProvider.setInterval(scheduler.flush.bind(scheduler, this), delay);
    };
    AsyncAction.prototype.recycleAsyncId = function (_scheduler, id, delay) {
        if (delay === void 0) { delay = 0; }
        if (delay != null && this.delay === delay && this.pending === false) {
            return id;
        }
        if (id != null) {
            intervalProvider.clearInterval(id);
        }
        return undefined;
    };
    AsyncAction.prototype.execute = function (state, delay) {
        if (this.closed) {
            return new Error('executing a cancelled action');
        }
        this.pending = false;
        var error = this._execute(state, delay);
        if (error) {
            return error;
        }
        else if (this.pending === false && this.id != null) {
            this.id = this.recycleAsyncId(this.scheduler, this.id, null);
        }
    };
    AsyncAction.prototype._execute = function (state, _delay) {
        var errored = false;
        var errorValue;
        try {
            this.work(state);
        }
        catch (e) {
            errored = true;
            errorValue = e ? e : new Error('Scheduled action threw falsy error');
        }
        if (errored) {
            this.unsubscribe();
            return errorValue;
        }
    };
    AsyncAction.prototype.unsubscribe = function () {
        if (!this.closed) {
            var _a = this, id = _a.id, scheduler = _a.scheduler;
            var actions = scheduler.actions;
            this.work = this.state = this.scheduler = null;
            this.pending = false;
            arrRemove(actions, this);
            if (id != null) {
                this.id = this.recycleAsyncId(scheduler, id, null);
            }
            this.delay = null;
            _super.prototype.unsubscribe.call(this);
        }
    };
    return AsyncAction;
}(Action));

var Scheduler = (function () {
    function Scheduler(schedulerActionCtor, now) {
        if (now === void 0) { now = Scheduler.now; }
        this.schedulerActionCtor = schedulerActionCtor;
        this.now = now;
    }
    Scheduler.prototype.schedule = function (work, delay, state) {
        if (delay === void 0) { delay = 0; }
        return new this.schedulerActionCtor(this, work).schedule(state, delay);
    };
    Scheduler.now = dateTimestampProvider.now;
    return Scheduler;
}());

var AsyncScheduler = (function (_super) {
    __extends(AsyncScheduler, _super);
    function AsyncScheduler(SchedulerAction, now) {
        if (now === void 0) { now = Scheduler.now; }
        var _this = _super.call(this, SchedulerAction, now) || this;
        _this.actions = [];
        _this._active = false;
        return _this;
    }
    AsyncScheduler.prototype.flush = function (action) {
        var actions = this.actions;
        if (this._active) {
            actions.push(action);
            return;
        }
        var error;
        this._active = true;
        do {
            if ((error = action.execute(action.state, action.delay))) {
                break;
            }
        } while ((action = actions.shift()));
        this._active = false;
        if (error) {
            while ((action = actions.shift())) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    return AsyncScheduler;
}(Scheduler));

var asyncScheduler = new AsyncScheduler(AsyncAction);

function debounceTime(dueTime, scheduler) {
    if (scheduler === void 0) { scheduler = asyncScheduler; }
    return operate(function (source, subscriber) {
        var activeTask = null;
        var lastValue = null;
        var lastTime = null;
        var emit = function () {
            if (activeTask) {
                activeTask.unsubscribe();
                activeTask = null;
                var value = lastValue;
                lastValue = null;
                subscriber.next(value);
            }
        };
        function emitWhenIdle() {
            var targetTime = lastTime + dueTime;
            var now = scheduler.now();
            if (now < targetTime) {
                activeTask = this.schedule(undefined, targetTime - now);
                subscriber.add(activeTask);
                return;
            }
            emit();
        }
        source.subscribe(createOperatorSubscriber(subscriber, function (value) {
            lastValue = value;
            lastTime = scheduler.now();
            if (!activeTask) {
                activeTask = scheduler.schedule(emitWhenIdle, dueTime);
                subscriber.add(activeTask);
            }
        }, function () {
            emit();
            subscriber.complete();
        }, undefined, function () {
            lastValue = activeTask = null;
        }));
    });
}

class Console {
    constructor(root) {
        this.elem = document.createElement('pre');
        this.elem.id = 'output';
        root.appendChild(this.elem);
        this.elem.onclick = (e) => {
            if (e.ctrlKey)
                return;
            if (this.elem.style.height) {
                this.elem.style.height = '';
                setTimeout(() => this.scrollBottom(), 200); // Wait until transition finished
            }
            else {
                this.elem.style.height = '30rem';
            }
        };
    }
    // See Dialog
    // https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript
    escapeHtml(unsafe) {
        return unsafe
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }
    appendLine(line) {
        const text = document.createElement('span');
        horiz(text);
        const linkStyleUpdate = (active, child) => {
            const style = active ? 'underline' : 'none';
            [...text.children].forEach((x) => {
                const c = x;
                if (child) {
                    if (child === c) {
                        c.style.textDecoration = style;
                    }
                    else {
                        c.style.textDecoration = 'none';
                    }
                }
                else {
                    c.style.textDecoration = style;
                }
            });
        };
        text.onkeydown = (e) => linkStyleUpdate(e.ctrlKey);
        text.onmouseover = (e) => linkStyleUpdate(e.ctrlKey);
        text.onmouseout = (e) => linkStyleUpdate(false);
        text.onclick = (e) => {
            if (!e.ctrlKey)
                return;
            this.openWikiLink(line);
        };
        line.split(' ').forEach((part) => {
            const el = document.createElement('span');
            el.innerHTML = this.escapeHtml(part);
            el.onmousemove = (e) => linkStyleUpdate(e.ctrlKey, el);
            el.onclick = (e) => {
                if (!e.ctrlKey)
                    return;
                e.preventDefault();
                e.stopPropagation();
                this.openWikiLink(part);
            };
            text.appendChild(el);
        });
        this.elem.appendChild(text);
        this.scrollBottom();
    }
    openWikiLink(text) {
        const keyword = text.replaceAll(' ', '_');
        window.open(`https://nethackwiki.com/${keyword}`, '_blank')?.focus();
    }
    append(elem) {
        this.elem.appendChild(elem);
        this.scrollBottom();
    }
    scrollBottom() {
        this.elem.scrollTo(0, this.elem.scrollHeight);
    }
}

class Inventory {
    constructor(root, tileMap) {
        this.tileMap = tileMap;
        this.expanded = false;
        this.items = [];
        this.ignoreNextChangeHint = true;
        this.enableHint = true;
        this.elem = document.createElement('div');
        this.elem.id = 'inventory';
        vert(this.elem);
        root.appendChild(this.elem);
        this.anim = this.elem.animate([{ background: "#000000DD" }, { background: '#FFFFFF33' }, { background: '#000000DD' }], {
            fill: "forwards",
            easing: "ease-in-out",
            duration: 1000,
        });
        this.anim.cancel();
        tileMap.onTileSetChange$.subscribe(() => this.updateItems(this.items));
    }
    setEnableHint(enable) {
        this.enableHint = enable;
    }
    clear() {
        Array.from(this.elem.children).forEach((c) => this.elem.removeChild(c));
    }
    toggle(update = false) {
        this.expanded = !this.expanded;
        this.ignoreNextChangeHint = true;
        // Update not always necessary, the toggle key (i) will automatically request a reload of the inventory
        if (update) {
            this.updateItems(this.items);
        }
    }
    updateItems(items, hint_change = false) {
        this.items = items;
        this.clear();
        // Hint that something changed in inventory, mainly for death after identifying items so player notices it
        if (this.enableHint && hint_change && !this.ignoreNextChangeHint) {
            this.anim.play();
        }
        this.ignoreNextChangeHint = false;
        this.elem.onclick = () => {
            this.expanded = !this.expanded;
            this.updateItems(this.items);
        };
        pointer(this.elem);
        this.createInventoryRows(items);
    }
    createInventoryRows(items) {
        items.forEach((item) => {
            if (item.str.toLowerCase() === 'coins' || item.accelerator === '$'.charCodeAt(0)) {
                return; // we have the coins in the status
            }
            if (item.identifier === 0) {
                if (this.expanded) {
                    const title = document.createElement('div');
                    title.style.marginBottom = '0.5rem 0';
                    title.innerHTML = item.str;
                    this.elem.appendChild(title);
                }
            }
            else {
                const container = document.createElement('div');
                horiz(container);
                // Using text allowed naming items with 'C'
                bucState(container, item.str);
                // if (item.buc === BUCState.BLESSED) {
                //     container.classList.add('blessed');
                // } else if (item.buc === BUCState.CURSED) {
                //     container.classList.add('cursed');
                // }
                const img = this.createItemImage(item);
                if (img) {
                    container.appendChild(img);
                }
                if (this.expanded) {
                    const text = document.createElement('div');
                    text.innerHTML = item.str;
                    container.appendChild(text);
                }
                this.elem.appendChild(container);
            }
        });
    }
    createItemImage(item) {
        if (!this.tileMap.currentTileSet)
            return null;
        let img = this.tileMap.currentTileSet.createBackgroundImage(this.tileMap.isRogueLevel() ? -1 : item.tile, item.accelerator);
        if (!this.tileMap.isRogueLevel() && item.count > 1) {
            const count = document.createElement('div');
            count.classList.add('count');
            count.innerHTML = `${item.count}`;
            img.appendChild(count);
        }
        img.classList.add('item');
        if (item.active) {
            img.classList.add('active');
        }
        img.title = item.description;
        return img;
    }
}

// This is a generated file. Do not edit.
var WIN_TYPE;
(function (WIN_TYPE) {
    WIN_TYPE[WIN_TYPE["NHW_MESSAGE"] = 1] = "NHW_MESSAGE";
    WIN_TYPE[WIN_TYPE["NHW_STATUS"] = 2] = "NHW_STATUS";
    WIN_TYPE[WIN_TYPE["NHW_MAP"] = 3] = "NHW_MAP";
    WIN_TYPE[WIN_TYPE["NHW_MENU"] = 4] = "NHW_MENU";
    WIN_TYPE[WIN_TYPE["NHW_TEXT"] = 5] = "NHW_TEXT";
})(WIN_TYPE || (WIN_TYPE = {}));
var STATUS_FIELD;
(function (STATUS_FIELD) {
    STATUS_FIELD[STATUS_FIELD["BL_TITLE"] = 0] = "BL_TITLE";
    STATUS_FIELD[STATUS_FIELD["BL_STR"] = 1] = "BL_STR";
    STATUS_FIELD[STATUS_FIELD["BL_DX"] = 2] = "BL_DX";
    STATUS_FIELD[STATUS_FIELD["BL_CO"] = 3] = "BL_CO";
    STATUS_FIELD[STATUS_FIELD["BL_IN"] = 4] = "BL_IN";
    STATUS_FIELD[STATUS_FIELD["BL_WI"] = 5] = "BL_WI";
    STATUS_FIELD[STATUS_FIELD["BL_CH"] = 6] = "BL_CH";
    STATUS_FIELD[STATUS_FIELD["BL_ALIGN"] = 7] = "BL_ALIGN";
    STATUS_FIELD[STATUS_FIELD["BL_SCORE"] = 8] = "BL_SCORE";
    STATUS_FIELD[STATUS_FIELD["BL_CAP"] = 9] = "BL_CAP";
    STATUS_FIELD[STATUS_FIELD["BL_GOLD"] = 10] = "BL_GOLD";
    STATUS_FIELD[STATUS_FIELD["BL_ENE"] = 11] = "BL_ENE";
    STATUS_FIELD[STATUS_FIELD["BL_ENEMAX"] = 12] = "BL_ENEMAX";
    STATUS_FIELD[STATUS_FIELD["BL_XP"] = 13] = "BL_XP";
    STATUS_FIELD[STATUS_FIELD["BL_AC"] = 14] = "BL_AC";
    STATUS_FIELD[STATUS_FIELD["BL_HD"] = 15] = "BL_HD";
    STATUS_FIELD[STATUS_FIELD["BL_TIME"] = 16] = "BL_TIME";
    STATUS_FIELD[STATUS_FIELD["BL_HUNGER"] = 17] = "BL_HUNGER";
    STATUS_FIELD[STATUS_FIELD["BL_HP"] = 18] = "BL_HP";
    STATUS_FIELD[STATUS_FIELD["BL_HPMAX"] = 19] = "BL_HPMAX";
    STATUS_FIELD[STATUS_FIELD["BL_LEVELDESC"] = 20] = "BL_LEVELDESC";
    STATUS_FIELD[STATUS_FIELD["BL_EXP"] = 21] = "BL_EXP";
    STATUS_FIELD[STATUS_FIELD["BL_CONDITION"] = 22] = "BL_CONDITION";
    STATUS_FIELD[STATUS_FIELD["BL_FLUSH"] = -1] = "BL_FLUSH";
})(STATUS_FIELD || (STATUS_FIELD = {}));
var ATTR;
(function (ATTR) {
    ATTR[ATTR["ATR_NONE"] = 0] = "ATR_NONE";
    ATTR[ATTR["ATR_BOLD"] = 1] = "ATR_BOLD";
    ATTR[ATTR["ATR_DIM"] = 2] = "ATR_DIM";
    ATTR[ATTR["ATR_ULINE"] = 4] = "ATR_ULINE";
    ATTR[ATTR["ATR_BLINK"] = 5] = "ATR_BLINK";
    ATTR[ATTR["ATR_INVERSE"] = 7] = "ATR_INVERSE";
})(ATTR || (ATTR = {}));
var CONDITION;
(function (CONDITION) {
    CONDITION[CONDITION["BL_MASK_STONE"] = 1] = "BL_MASK_STONE";
    CONDITION[CONDITION["BL_MASK_SLIME"] = 2] = "BL_MASK_SLIME";
    CONDITION[CONDITION["BL_MASK_STRNGL"] = 4] = "BL_MASK_STRNGL";
    CONDITION[CONDITION["BL_MASK_FOODPOIS"] = 8] = "BL_MASK_FOODPOIS";
    CONDITION[CONDITION["BL_MASK_TERMILL"] = 16] = "BL_MASK_TERMILL";
    CONDITION[CONDITION["BL_MASK_BLIND"] = 32] = "BL_MASK_BLIND";
    CONDITION[CONDITION["BL_MASK_DEAF"] = 64] = "BL_MASK_DEAF";
    CONDITION[CONDITION["BL_MASK_STUN"] = 128] = "BL_MASK_STUN";
    CONDITION[CONDITION["BL_MASK_CONF"] = 256] = "BL_MASK_CONF";
    CONDITION[CONDITION["BL_MASK_HALLU"] = 512] = "BL_MASK_HALLU";
    CONDITION[CONDITION["BL_MASK_LEV"] = 1024] = "BL_MASK_LEV";
    CONDITION[CONDITION["BL_MASK_FLY"] = 2048] = "BL_MASK_FLY";
    CONDITION[CONDITION["BL_MASK_RIDE"] = 4096] = "BL_MASK_RIDE";
})(CONDITION || (CONDITION = {}));
var MENU_SELECT;
(function (MENU_SELECT) {
    MENU_SELECT[MENU_SELECT["PICK_NONE"] = 0] = "PICK_NONE";
    MENU_SELECT[MENU_SELECT["PICK_ONE"] = 1] = "PICK_ONE";
    MENU_SELECT[MENU_SELECT["PICK_ANY"] = 2] = "PICK_ANY";
})(MENU_SELECT || (MENU_SELECT = {}));
var GLYPH;
(function (GLYPH) {
    GLYPH[GLYPH["GLYPH_MON_OFF"] = 0] = "GLYPH_MON_OFF";
    GLYPH[GLYPH["GLYPH_PET_OFF"] = 382] = "GLYPH_PET_OFF";
    GLYPH[GLYPH["GLYPH_INVIS_OFF"] = 764] = "GLYPH_INVIS_OFF";
    GLYPH[GLYPH["GLYPH_DETECT_OFF"] = 765] = "GLYPH_DETECT_OFF";
    GLYPH[GLYPH["GLYPH_BODY_OFF"] = 1147] = "GLYPH_BODY_OFF";
    GLYPH[GLYPH["GLYPH_RIDDEN_OFF"] = 1529] = "GLYPH_RIDDEN_OFF";
    GLYPH[GLYPH["GLYPH_OBJ_OFF"] = 1911] = "GLYPH_OBJ_OFF";
    GLYPH[GLYPH["GLYPH_CMAP_OFF"] = 2365] = "GLYPH_CMAP_OFF";
    GLYPH[GLYPH["GLYPH_EXPLODE_OFF"] = 2452] = "GLYPH_EXPLODE_OFF";
    GLYPH[GLYPH["GLYPH_ZAP_OFF"] = 2515] = "GLYPH_ZAP_OFF";
    GLYPH[GLYPH["GLYPH_SWALLOW_OFF"] = 2547] = "GLYPH_SWALLOW_OFF";
    GLYPH[GLYPH["GLYPH_WARNING_OFF"] = 5603] = "GLYPH_WARNING_OFF";
    GLYPH[GLYPH["GLYPH_STATUE_OFF"] = 5609] = "GLYPH_STATUE_OFF";
    GLYPH[GLYPH["MAX_GLYPH"] = 5991] = "MAX_GLYPH";
    GLYPH[GLYPH["NO_GLYPH"] = 5991] = "NO_GLYPH";
    GLYPH[GLYPH["GLYPH_INVISIBLE"] = 764] = "GLYPH_INVISIBLE";
})(GLYPH || (GLYPH = {}));
var COLORS;
(function (COLORS) {
    COLORS[COLORS["CLR_BLACK"] = 0] = "CLR_BLACK";
    COLORS[COLORS["CLR_RED"] = 1] = "CLR_RED";
    COLORS[COLORS["CLR_GREEN"] = 2] = "CLR_GREEN";
    COLORS[COLORS["CLR_BROWN"] = 3] = "CLR_BROWN";
    COLORS[COLORS["CLR_BLUE"] = 4] = "CLR_BLUE";
    COLORS[COLORS["CLR_MAGENTA"] = 5] = "CLR_MAGENTA";
    COLORS[COLORS["CLR_CYAN"] = 6] = "CLR_CYAN";
    COLORS[COLORS["CLR_GRAY"] = 7] = "CLR_GRAY";
    COLORS[COLORS["NO_COLOR"] = 8] = "NO_COLOR";
    COLORS[COLORS["CLR_ORANGE"] = 9] = "CLR_ORANGE";
    COLORS[COLORS["CLR_BRIGHT_GREEN"] = 10] = "CLR_BRIGHT_GREEN";
    COLORS[COLORS["CLR_YELLOW"] = 11] = "CLR_YELLOW";
    COLORS[COLORS["CLR_BRIGHT_BLUE"] = 12] = "CLR_BRIGHT_BLUE";
    COLORS[COLORS["CLR_BRIGHT_MAGENTA"] = 13] = "CLR_BRIGHT_MAGENTA";
    COLORS[COLORS["CLR_BRIGHT_CYAN"] = 14] = "CLR_BRIGHT_CYAN";
    COLORS[COLORS["CLR_WHITE"] = 15] = "CLR_WHITE";
    COLORS[COLORS["CLR_MAX"] = 16] = "CLR_MAX";
})(COLORS || (COLORS = {}));
var COLOR_ATTR;
(function (COLOR_ATTR) {
    COLOR_ATTR[COLOR_ATTR["HL_ATTCLR_DIM"] = 16] = "HL_ATTCLR_DIM";
    COLOR_ATTR[COLOR_ATTR["HL_ATTCLR_BLINK"] = 17] = "HL_ATTCLR_BLINK";
    COLOR_ATTR[COLOR_ATTR["HL_ATTCLR_ULINE"] = 18] = "HL_ATTCLR_ULINE";
    COLOR_ATTR[COLOR_ATTR["HL_ATTCLR_INVERSE"] = 19] = "HL_ATTCLR_INVERSE";
    COLOR_ATTR[COLOR_ATTR["HL_ATTCLR_BOLD"] = 20] = "HL_ATTCLR_BOLD";
    COLOR_ATTR[COLOR_ATTR["BL_ATTCLR_MAX"] = 21] = "BL_ATTCLR_MAX";
})(COLOR_ATTR || (COLOR_ATTR = {}));

function Icon(name) {
    const icon = document.createElement('i');
    icon.classList.add(`gg-${name}`);
    return icon;
}
function IconButton(name) {
    const container = document.createElement('div');
    center(container);
    container.style.justifyContent = 'end';
    container.appendChild(Icon(name));
    container.style.height = '16px';
    container.style.cursor = 'pointer';
    return container;
}

function Slider(value, maxValue, fg, bg) {
    const slider = document.createElement('div');
    horiz(slider);
    slider.style.height = '16px';
    slider.style.backgroundColor = bg;
    slider.style.flexGrow = '1';
    slider.style.position = 'relative';
    slider.style.alignItems = 'stretch';
    const filled = (value / maxValue) * 100;
    const fill = document.createElement('div');
    fill.style.width = `${filled}%`;
    fill.style.backgroundColor = fg;
    const text = document.createElement('span');
    fullScreen(text);
    text.style.textAlign = 'center';
    text.innerHTML = `${value} / ${maxValue}`;
    slider.appendChild(text);
    slider.appendChild(fill);
    return slider;
}

function Sprite(file, size, frames, durationInSec = 1, loop = true) {
    const sprite = document.createElement('div');
    sprite.style.backgroundImage = `url(${file})`;
    sprite.style.backgroundSize = `${size * frames}px`;
    sprite.style.width = `${size}px`;
    sprite.style.height = `${size}px`;
    sprite.style.backgroundPositionX = `-${frames * size}px`;
    sprite.classList.add('pixel');
    const positions = [];
    for (let i = 0; i < frames; i++) {
        positions.push(-i * size);
    }
    const anim = sprite.animate({ backgroundPositionX: positions }, { duration: 1000 * durationInSec, iterations: loop ? Infinity : 1, easing: `steps(${frames})` });
    anim.cancel();
    return { sprite, anim };
}

const COLOR_MAP = {
    [COLORS.CLR_RED]: 'red',
    [COLORS.CLR_GREEN]: 'green',
    [COLORS.CLR_ORANGE]: 'orange',
    [COLORS.CLR_YELLOW]: 'yellow',
};
class StatusLine {
    // private pulseBorder: HTMLElement;
    constructor(root) {
        this.expand = true;
        this.elem = document.createElement('div');
        this.elem.id = 'status';
        root.appendChild(this.elem);
        const hp = Sprite('UI_Heart.png', 32, 2);
        this.heartIcon = hp.sprite;
        this.heartAnim = hp.anim;
        this.manaIcon = Sprite('UI_Mana.png', 32, 1).sprite;
        const armor = Sprite('UI_Armor.png', 32, 2, 1, false);
        this.armorIcon = armor.sprite;
        // Enable this after we have settings to disable it
        // this.pulseBorder = document.createElement('div');
        // this.pulseBorder.style.backgroundImage = 'url("PulseBorder.png")';
        // this.pulseBorder.style.backgroundPosition = 'center';
        // this.pulseBorder.style.backgroundSize = 'cover';
        // this.pulseBorder.style.backgroundRepeat = 'no-repeat';
        // this.pulseBorder.style.display = 'none;'
        // fullScreen(this.pulseBorder);
        // this.pulseBorder.animate({ opacity: [0, 0.2, 0] }, { duration: 1000 * 1.5, iterations: Infinity });
        // root.appendChild(this.pulseBorder);
    }
    toggleExpandButton() {
        const icon = this.expand ? 'minimize-alt' : 'arrows-expand-right';
        const container = IconButton(icon);
        container.onclick = () => {
            this.expand = !this.expand;
            this.update(this.status || {});
        };
        return container;
    }
    createText(text, pulse = false, abs = false) {
        const elem = document.createElement('span');
        if (text) {
            // For AC
            const num = parseInt(text.text || '0');
            const txt = abs ? `${Math.abs(num)}` : text.text;
            elem.innerHTML = txt;
            if (pulse) {
                elem.style.animationName = 'pulse';
                elem.style.animationDuration = '2s';
                elem.style.animationIterationCount = 'infinite';
                elem.style.animationTimingFunction = 'ease-in-out';
            }
            if (text.color in COLOR_MAP) {
                const color = text.color;
                elem.style.color = COLOR_MAP[color];
            }
            if (text.attr.includes(ATTR.ATR_BOLD)) {
                elem.style.fontWeight = 'bold';
            }
        }
        return elem;
    }
    update(s) {
        Array.from(this.elem.children).forEach((c) => this.elem.removeChild(c));
        this.status = s;
        const firstRow = this.createRow();
        const conditions = document.createElement('div');
        horiz(conditions);
        conditions.appendChild(this.createText(s.hunger, true));
        s.condition?.forEach((c) => conditions.appendChild(this.createText(c, true)));
        if (s.carryCap) {
            conditions.appendChild(this.createText(s.carryCap, true));
        }
        conditions.style.flexGrow = '1';
        conditions.style.fontSize = '1.2rem';
        firstRow.appendChild(conditions);
        // firstRow.appendChild(this.toggleExpandButton());
        this.elem.appendChild(this.createMinMaxValue(this.heartIcon, '#D33', '#600', s.hp, s.hpMax));
        this.elem.appendChild(this.createMinMaxValue(this.manaIcon, '#33D', '#006', s.power, s.powerMax));
        const lastRow = this.createRow();
        const acIcon = this.createIconText(this.armorIcon, s.armor);
        lastRow.appendChild(acIcon);
        if (s.armor) {
            const ac = parseInt(s.armor.text);
            // Didn't find a way to do it via Animation
            this.armorIcon.style.backgroundPosition = ac < 0 ? '-32px' : '-64px';
        }
        const lvl = document.createElement('div');
        horiz(lvl);
        if (s.expLvl) {
            const lvlElem = this.createText(s.expLvl);
            lvl.style.gap = '0';
            lvl.appendChild(document.createTextNode('LV'));
            lvlElem.style.marginLeft = '0.5rem';
            lvl.appendChild(lvlElem);
            if (s.exp) {
                const expElem = this.createText(s.exp);
                lvl.appendChild(document.createTextNode('/'));
                lvl.appendChild(expElem);
            }
            lvl.title = s.title?.text || 'Untitled';
        }
        else if (s.hd) {
            lvl.appendChild(document.createTextNode('HD'));
            lvl.appendChild(this.createText(s.hd));
        }
        lastRow.appendChild(lvl);
        const other = document.createElement('div');
        horiz(other);
        other.appendChild(this.createText(s.align));
        other.appendChild(this.createText(s.dungeonLvl));
        other.style.flexGrow = '1';
        lastRow.appendChild(other);
        const money = document.createElement('div');
        horiz(money);
        if (s.time != null) {
            money.appendChild(document.createTextNode('T:'));
            money.appendChild(this.createText(s.time));
        }
        money.appendChild(document.createTextNode('$:'));
        money.appendChild(this.createText(s.gold));
        lastRow.appendChild(money);
        if (this.expand) {
            const stats = this.createRow();
            horiz(stats);
            stats.appendChild(document.createTextNode('Str:'));
            stats.appendChild(this.createText(s.str));
            stats.appendChild(document.createTextNode('Dex:'));
            stats.appendChild(this.createText(s.dex));
            stats.appendChild(document.createTextNode('Con:'));
            stats.appendChild(this.createText(s.con));
            stats.appendChild(document.createTextNode('Int:'));
            stats.appendChild(this.createText(s.int));
            stats.appendChild(document.createTextNode('Wis:'));
            stats.appendChild(this.createText(s.wis));
            stats.appendChild(document.createTextNode('Cha:'));
            stats.appendChild(this.createText(s.cha));
            stats.style.justifyContent = 'end';
        }
        if (s.hp) {
            if (s.hp.color === COLORS.CLR_RED) {
                if (this.heartAnim.playState !== 'running') {
                    this.heartAnim.play();
                }
            }
            else {
                this.heartAnim.cancel();
            }
        }
    }
    createRow() {
        const row = document.createElement('div');
        horiz(row);
        this.elem.appendChild(row);
        return row;
    }
    createIconText(icon, text, abs = false) {
        const elem = document.createElement('div');
        elem.style.position = 'relative';
        const actualText = text?.text;
        const label = this.createText(text, false, abs);
        label.title = actualText || '';
        fullScreen(label);
        center(label);
        elem.appendChild(icon);
        elem.appendChild(label);
        return elem;
    }
    createMinMaxValue(icon, fg, bg, v, maxV) {
        const elem = document.createElement('div');
        horiz(elem);
        elem.style.gap = '0';
        icon.style.marginRight = '-1rem';
        icon.style.zIndex = '1';
        elem.appendChild(icon);
        elem.appendChild(Slider(parseInt(v?.text || '0'), parseInt(maxV?.text || '1'), fg, bg));
        return elem;
    }
}

var GameState;
(function (GameState) {
    GameState[GameState["START"] = 0] = "START";
    GameState[GameState["RUNNING"] = 1] = "RUNNING";
    GameState[GameState["GAMEOVER"] = 2] = "GAMEOVER";
})(GameState || (GameState = {}));
function add(v1, v2) {
    return { x: v1.x + v2.x, y: v1.y + v2.y };
}
function sub(v1, v2) {
    return { x: v1.x - v2.x, y: v1.y - v2.y };
}
function mult(v1, v2) {
    return { x: v1.x * v2.x, y: v1.y * v2.y };
}
var BUCState;
(function (BUCState) {
    BUCState["BLESSED"] = "blessed";
    BUCState["UNCURSED"] = "uncursed";
    BUCState["CURSED"] = "cursed";
})(BUCState || (BUCState = {}));

class TileSet {
    constructor(file, tileSize, tileCol) {
        this.file = file;
        this.tileSize = tileSize;
        this.tileCol = tileCol;
        this.image = new Image();
        this.image.src = file;
    }
    getTilePosition(tile) {
        const row = Math.floor(tile / this.tileCol);
        const col = tile % this.tileCol;
        return { x: col, y: row };
    }
    getCoordinateForTile(tile) {
        const pos = this.getTilePosition(tile);
        return { x: pos.x * this.tileSize, y: pos.y * this.tileSize };
    }
    createEmptyTile() {
        const div = document.createElement('div');
        div.style.width = `${this.tileSize}px`;
        div.style.height = `${this.tileSize}px`;
        return div;
    }
    createBackgroundImage(tile, accelerator = 0) {
        const div = this.createEmptyTile();
        if (tile >= 0) {
            div.style.backgroundImage = `url('${this.file}')`;
            div.style.backgroundRepeat = 'no-repeat';
            const pos = this.getTilePosition(tile);
            const realPos = mult(pos, { x: this.tileSize, y: this.tileSize });
            div.style.backgroundPosition = `-${realPos.x}px -${realPos.y}px`;
        }
        if (accelerator !== 0) {
            const accel = document.createElement('div');
            accel.innerHTML = String.fromCharCode(accelerator);
            accel.classList.add('accel');
            div.appendChild(accel);
            rel(div);
            if (tile < 0) {
                accel.style.background = '#33333399';
                center(div);
            }
            else {
                accel.style.padding = '0 0.1rem';
                accel.style.background = '#00000099';
                topRight(accel);
            }
        }
        return div;
    }
    equals(other) {
        if (!other)
            return false;
        return this.image.src === other.image.src;
    }
}
class TileMap {
    constructor(root, tileSet, rogueTileSet) {
        this.tileSet = tileSet;
        this.rogueTileSet = rogueTileSet;
        this.mapBorder = true;
        this.isRogue = false;
        this.cursorPos = { x: 0, y: 0 };
        this.center = { x: 0, y: 0 };
        this.mapSize = { x: 79, y: 21 }; // Fixed map size? Might change in other version?
        this.tiles = [];
        this.onTileSetChange$ = new Subject();
        this.canvas = document.createElement('canvas');
        this.canvas.classList.add('map');
        this.cursorCanvas = document.createElement('canvas');
        this.cursorCanvas.classList.add('map');
        this.cursor = document.createElement('img');
        this.cursor.src = 'cursor.png';
        root.appendChild(this.canvas);
        root.appendChild(this.cursorCanvas);
        this.context = this.canvas.getContext('2d');
        this.cursorCtx = this.cursorCanvas.getContext('2d');
        this.updateCanvasSize();
        this.clearCanvas();
    }
    get currentTileSet() {
        return this.isRogue ? this.rogueTileSet : this.tileSet;
    }
    setMapBorder(enableMapBorder) {
        this.mapBorder = enableMapBorder;
        this.rerender();
    }
    setTileSets(tileset, rogueTileSet) {
        this.tileSet = tileset;
        this.rogueTileSet = rogueTileSet;
        this.onTileSetChange$.next();
        this.rerender();
    }
    setRogueLevel(isRogue) {
        this.isRogue = isRogue;
        this.onTileSetChange$.next();
    }
    isRogueLevel() {
        return this.isRogue;
    }
    onResize() {
        this.updateCanvasSize();
        this.rerender();
    }
    updateCanvasSize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.cursorCanvas.width = window.innerWidth;
        this.cursorCanvas.height = window.innerHeight;
    }
    // This is called before and after recenter, so it causes a glitch when doing them separately
    // Might be on purpose to indicate movement? But does not look good
    moveCursor(pos) {
        this.cursorPos = pos;
        this.clearCursor();
        this.updateCursor();
    }
    updateCursor() {
        const pos = this.localToCanvas(this.cursorPos);
        const cursorSize = 32;
        this.cursorCtx.drawImage(this.cursor, 0, 0, cursorSize, cursorSize, pos.x, pos.y, this.tileSize.x, this.tileSize.y);
    }
    clearCursor() {
        this.cursorCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    // TODO: doesn't have to always center it, should be "more-or-less" centered, thus the separate moveCursor function
    recenter(c) {
        this.center = c;
        this.cursorPos = c;
        this.rerender();
    }
    clearMap() {
        this.tiles = [];
        this.clearCanvas();
    }
    clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.clearCursor();
        if (this.mapBorder) {
            const map = mult(this.mapSize, this.tileSize);
            const localPos = this.localToCanvas({ x: 1, y: 0 });
            this.context.fillStyle = '#111';
            this.context.fillRect(localPos.x, localPos.y, map.x, map.y);
        }
    }
    rerender() {
        this.clearCanvas();
        for (let x = 0; x < this.tiles.length; x++) {
            const row = this.tiles[x];
            if (row) {
                for (let y = 0; y < row.length; y++) {
                    this.drawTile(x, y);
                }
            }
        }
        this.updateCursor();
    }
    printTile(tile) {
        this.setRogueLevel(tile.rogue); // not the most efficient way, but works
        if (!this.tiles[tile.x])
            this.tiles[tile.x] = [];
        const current = this.tiles[tile.x][tile.y];
        if (current?.tile === tile.tile && current?.peaceful === tile.peaceful)
            return;
        this.tiles[tile.x][tile.y] = { tile: tile.tile, peaceful: tile.peaceful };
        this.drawTile(tile.x, tile.y);
    }
    drawTile(x, y) {
        const tile = this.tiles[x][y];
        if (!this.currentTileSet || tile == null)
            return;
        const set = this.currentTileSet;
        const source = set.getCoordinateForTile(tile.tile);
        const size = set.tileSize;
        const localPos = this.localToCanvas({ x, y });
        this.context.drawImage(
        // Source
        set.image, source.x, source.y, size, size, 
        // Target
        localPos.x, localPos.y, size, size);
        if (tile.peaceful) {
            const radius = 3;
            const padding = 2;
            this.context.beginPath();
            this.context.arc(localPos.x + size - radius - padding, localPos.y + radius + padding, radius, 0, 2 * Math.PI);
            this.context.fillStyle = '#FF99FF';
            this.context.fill();
        }
    }
    localToCanvas(pos) {
        const globalPos = this.toGlobal(pos);
        const globalCenter = this.toGlobal(this.center);
        const relPosFromCenter = sub(globalPos, globalCenter);
        return add(this.canvasCenter, relPosFromCenter);
    }
    toGlobal(vec) {
        return mult(vec, this.tileSize);
    }
    get tileSize() {
        return { x: this.currentTileSet?.tileSize || 0, y: this.currentTileSet?.tileSize || 0 };
    }
    get canvasCenter() {
        return { x: Math.floor(this.canvas.width / 2), y: Math.floor(this.canvas.height / 2) };
    }
}

class Gameover extends Dialog {
    constructor() {
        super('<div><strong>Gameover</strong></div> Press any key to go back to the menu.', false);
    }
    onInput(e) {
        window.location.reload();
    }
}

var TileSetImage;
(function (TileSetImage) {
    TileSetImage["Nevanda"] = "Nevanda";
    TileSetImage["Dawnhack"] = "Dawnhack";
    TileSetImage["Default"] = "Default Nethack";
    TileSetImage["Chozo"] = "Chozo";
})(TileSetImage || (TileSetImage = {}));
({
    enableMapBorder: true,
    tileSetImage: TileSetImage.Nevanda,
    rogueTileSetImage: TileSetImage.Chozo,
    playerName: 'Unnamed',
    inventoryHint: true,
    options: '',
});

class GameScreen extends Screen {
    constructor() {
        super();
        this.resize$ = new Subject();
        this.tilemap = new TileMap(this.elem);
        this.console = new Console(this.elem);
        const sidebar = document.querySelector('#sidebar');
        this.inventory = new Inventory(sidebar, this.tilemap);
        this.status = new StatusLine(sidebar);
        this.elem.appendChild(sidebar);
        this.resize$.pipe(debounceTime(200)).subscribe(() => this.tilemap?.onResize());
    }
    createTileset(image) {
        switch (image) {
            case TileSetImage.Nevanda:
                return new TileSet('Nevanda.png', 32, 40);
            case TileSetImage.Dawnhack:
                return new TileSet('dawnhack_32.bmp', 32, 40);
            case TileSetImage.Chozo:
                return new TileSet('Chozo32-360.png', 32, 40);
            default:
                return new TileSet('nethack_default.png', 32, 40);
        }
    }
    onSettingsChange(setting) {
        const newTileset = this.createTileset(setting.tileSetImage);
        const newRogueTileSet = this.createTileset(setting.rogueTileSetImage);
        if (!newTileset.equals(this.tilemap.tileSet) || !newRogueTileSet.equals(this.tilemap.rogueTileSet)) {
            this.tilemap.setTileSets(newTileset, newRogueTileSet);
        }
        this.tilemap.setMapBorder(setting.enableMapBorder);
        this.inventory.setEnableHint(setting.inventoryHint);
    }
    onResize() {
        this.resize$.next();
        const version = document.querySelector('#version');
        version.style.display = 'none';
    }
    onMenu(prompt, count, items) {
        this.openMenu(prompt, count, items);
    }
    onCloseDialog() {
        super.onCloseDialog();
        this.activeMenu = undefined;
    }
    openMenu(prompt, count, items) {
        if (!this.activeMenu) {
            const dialog = new Dialog();
            this.activeMenu = new Menu(prompt, this.tilemap);
            dialog.elem.appendChild(this.activeMenu.elem);
            this.elem.appendChild(dialog.elem);
        }
        this.activeMenu.updateMenu(items, count);
    }
    openGameover() {
        const gameover = new Gameover();
        this.inputHandler = gameover;
        this.elem.appendChild(gameover.elem);
    }
}

class Question {
    constructor(question, choices, defaultChoice) {
        this.elem = document.createElement('div');
        this.elem.style.padding = '0.5rem 0';
        horiz(this.elem);
        this.choices = document.createElement('div');
        horiz(this.choices);
        this.choices.style.gap = '0';
        this.text = document.createElement('div');
        this.elem.appendChild(this.text);
        this.elem.appendChild(this.choices);
        this.text.innerHTML = question;
        if (choices.length > 0) {
            this.choices.innerHTML = '[';
            choices.forEach((c) => {
                const node = document.createElement('span');
                node.innerHTML = c;
                if (c === defaultChoice) {
                    node.style.fontWeight = 'bold';
                    node.style.color = 'red';
                }
                this.choices.appendChild(node);
            });
            this.choices.innerHTML += ']';
        }
        this.anim = this.elem.animate([{ background: "transparent" }, { background: '#FFFFFF33' }], {
            fill: "forwards",
            easing: "ease-in-out",
            duration: 500,
        });
    }
    answered(choice) {
        this.elem.appendChild(document.createTextNode(choice));
        this.anim.reverse();
    }
}

const SPECIAL_KEY_MAP = {
    Enter: 13,
    Escape: 27,
};
class Game {
    constructor() {
        this.openMenu = (winid, prompt, count, ...items) => this.current?.onMenu(prompt, count, items);
        this.openGetLine = (question, ...autocomplete) => this.current?.onLine(question, autocomplete);
        this.openGetTextArea = (value) => this.current?.onTextArea(value);
        this.openQuestion = (question, defaultChoice, ...choices) => {
            this.question = new Question(question, choices, defaultChoice);
            this.game.console.append(this.question.elem);
        };
        this.answerQuestion = (choice) => {
            this.question?.answered(choice);
        };
        this.openDialog = (winid, text) => this.current?.onDialog(text);
        this.closeDialog = (winid) => this.current?.onCloseDialog();
        this.printLine = (line) => this.game.console.appendLine(line);
        this.moveCursor = (x, y) => this.game.tilemap.recenter({ x, y });
        this.centerView = (x, y) => this.game.tilemap.recenter({ x, y });
        this.clearMap = () => this.game.tilemap.clearMap();
        this.printTile = (tile) => this.game.tilemap.printTile(tile);
        this.updateStatus = (s) => this.game.status.update(s);
        this.updateInventory = (...items) => this.game.inventory.updateItems(items, true);
        this.toggleInventory = () => this.game.inventory.toggle();
        this.updateState = async (state) => {
            switch (state) {
                case GameState.START:
                    this.changeScreen(this.start);
                    break;
                case GameState.RUNNING:
                    this.changeScreen(this.game);
                    break;
                case GameState.GAMEOVER:
                    this.game.openGameover();
                    break;
            }
        };
        this.updateSettings = (settings) => {
            this.current?.onSettingsChange(settings);
        };
        document.body.onresize = (e) => this.current?.onResize();
        document.body.onkeydown = (e) => {
            if (this.current?.inputHandler) {
                this.current.inputHandler.onInput(e);
            }
            else {
                if (e.key === 'Control' || e.key === 'Shift')
                    return;
                if (e.key.length === 1 || SPECIAL_KEY_MAP[e.key]) {
                    e.preventDefault();
                    let code = 0;
                    const specialKey = SPECIAL_KEY_MAP[e.key];
                    if (specialKey) {
                        code = specialKey;
                    }
                    else {
                        code = e.key.charCodeAt(0);
                        // Same as in cmd.c for M() and C()
                        if (e.ctrlKey) {
                            code = code & 0x1f;
                        }
                        else if (e.altKey) {
                            code = 0x80 | code;
                        }
                    }
                    window.nethackJS.sendInput(code);
                }
                else {
                    console.log('Unhandled key: ', e.key);
                }
            }
        };
        this.game = new GameScreen();
        this.start = new StartScreen();
    }
    changeScreen(screen) {
        if (this.current) {
            document.body.removeChild(this.current.elem);
        }
        this.current = screen;
        document.body.appendChild(this.current.elem);
        this.current.onResize();
    }
}

const game = new Game();
window.nethackUI = game;
