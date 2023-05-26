function fullScreen(elem) {
    elem.style.position = "absolute";
    elem.style.top = "0";
    elem.style.left = "0";
    elem.style.right = "0";
    elem.style.bottom = "0";
}
function topRight(elem) {
    elem.style.position = "absolute";
    elem.style.top = "0";
    elem.style.right = "0";
}
function center(elem) {
    elem.style.display = "flex";
    elem.style.justifyContent = "center";
    elem.style.alignItems = "center";
}
function vert(elem) {
    elem.style.display = "flex";
    elem.style.gap = "1rem";
    elem.style.flexDirection = "column";
}
function horiz(elem) {
    elem.style.display = "flex";
    elem.style.flexDirection = "row";
    elem.style.gap = "0.5rem";
    elem.style.alignItems = "center";
}
function rel(elem) {
    elem.style.position = "relative";
}
function accelStyle(elem) {
    topRight(elem);
    elem.style.background = "#00000099";
    elem.style.padding = "0 0.1rem";
}
function title(elem) {
    elem.style.fontSize = "1.5rem";
    elem.style.fontWeight = "bold";
    elem.style.padding = "0.5rem 1rem";
}

const createAccel = (accel) => {
    const accelElem = document.createElement("div");
    accelElem.classList.add("accel");
    accelElem.innerHTML = String.fromCharCode(accel);
    return accelElem;
};
function AccelButton(item, prepend = true, tileset) {
    const btn = document.createElement("button");
    horiz(btn);
    btn.onclick = () => window.nethackJS.sendInput(item.accelerator);
    if (item.active) {
        btn.classList.add("active");
    }
    const label = document.createElement("span");
    label.innerHTML = item.str;
    if (prepend) {
        btn.appendChild(createAccel(item.accelerator));
    }
    if (item.tile && tileset) {
        const img = tileset.createBackgroundImage(item.tile);
        btn.appendChild(img);
    }
    btn.appendChild(label);
    if (!prepend) {
        btn.appendChild(createAccel(item.accelerator));
    }
    return btn;
}

class Menu {
    constructor(prompt, tileset) {
        this.prompt = prompt;
        this.tileset = tileset;
        this.elem = document.createElement("div");
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
        this.createMenu(items, this.menuContainer);
        this.elem.appendChild(this.menuContainer);
    }
    createLabel() {
        const label = document.createElement("div");
        label.innerHTML = this.prompt;
        return label;
    }
    createMenu(items, container) {
        items.forEach((i) => {
            if (i.identifier !== 0) {
                container.appendChild(AccelButton(i, true, this.tileset));
            }
            else if (i.str !== "") {
                container.appendChild(AccelButton(i, false, this.tileset));
            }
        });
        return container;
    }
}

class Dialog {
    constructor(text = '') {
        const overlay = document.createElement("div");
        overlay.style.zIndex = "1";
        overlay.classList.add("dialog-overlay");
        fullScreen(overlay);
        document.body.appendChild(overlay);
        this.elem = document.createElement("pre");
        if (text !== "") {
            this.elem.innerHTML = this.escapeHtml(text);
        }
        vert(this.elem);
        this.elem.classList.add("dialog");
        setTimeout(() => {
            this.elem.classList.add("open");
        }, 100);
    }
    /// https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript
    escapeHtml(unsafe) {
        return unsafe
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
    static removeAll() {
        document.querySelectorAll(`.dialog`).forEach((elem) => {
            elem.classList.remove("open");
            setTimeout(() => {
                elem.remove();
                document.querySelectorAll(".dialog-overlay").forEach((e) => e.remove());
            }, 200);
        });
    }
}

class Screen {
    constructor() {
        this.elem = document.createElement("div");
        fullScreen(this.elem);
        center(this.elem);
    }
    createButton(text, onClick = () => { }) {
        const btn = document.createElement("button");
        btn.innerHTML = text;
        btn.onclick = onClick;
        return btn;
    }
    onResize() { }
    onMenu(prompt, count, items) { }
    onDialog(text) {
        const dialog = new Dialog(text);
        this.elem.appendChild(dialog.elem);
    }
    onCloseDialog() {
        Dialog.removeAll();
    }
}

class StartScreen extends Screen {
    constructor() {
        super();
        this.menu = new Menu('Test');
        this.menu.label.style.marginBottom = '2rem';
        title(this.menu.label);
        this.elem.appendChild(this.menu.elem);
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
    }
    appendLine(line) {
        this.elem.innerHTML += line + '\n';
        this.elem.scrollTo(0, this.elem.scrollHeight);
    }
}

class Inventory {
    constructor(root, tileset) {
        this.tileset = tileset;
        this.expanded = false;
        this.elem = document.createElement("div");
        this.elem.id = "inventory";
        vert(this.elem);
        root.appendChild(this.elem);
    }
    clear() {
        Array.from(this.elem.children).forEach((c) => this.elem.removeChild(c));
    }
    toggle() {
        this.expanded = !this.expanded;
        // Update not necessary, the toggle key will automatically request a reload of the inventory
    }
    updateItems(items) {
        this.clear();
        this.createInventoryRows(items);
    }
    createInventoryRows(items) {
        items.forEach((item) => {
            if (item.str.toLowerCase() === "coins" || item.accelerator === "$".charCodeAt(0)) {
                return; // we have the coins in the status
            }
            if (item.identifier === 0) {
                if (this.expanded) {
                    const title = document.createElement("div");
                    title.style.marginBottom = "0.5rem 0";
                    title.innerHTML = item.str;
                    this.elem.appendChild(title);
                }
            }
            else {
                const container = document.createElement("div");
                horiz(container);
                const img = this.createItemImage(item);
                container.appendChild(img);
                if (this.expanded) {
                    const text = document.createElement("div");
                    text.innerHTML = item.str;
                    container.appendChild(text);
                }
                this.elem.appendChild(container);
            }
        });
    }
    createItemImage(item) {
        const img = this.tileset.createBackgroundImage(item.tile, item.accelerator);
        if (item.count > 1) {
            const count = document.createElement("div");
            count.classList.add("count");
            count.innerHTML = `${item.count}`;
            img.appendChild(count);
        }
        img.classList.add("item");
        if (item.active) {
            img.classList.add("active");
        }
        img.title = item.description;
        return img;
    }
}

const CANCEL_KEY = ['Escape'];

class Line extends Dialog {
    constructor(question, autocomplete) {
        super(question);
        this.autocomplete = autocomplete;
        this.onLineEnter = (line) => { };
        console.log(autocomplete);
        horiz(this.elem);
        // this.onClose = () => this.onLineEnter('');
        const input = document.createElement('input');
        this.input = input;
        this.elem.appendChild(input);
        input.onkeydown = e => {
            if (e.key === 'Tab') {
                //prevent losing focus
                e.preventDefault();
            }
        };
        input.onkeyup = e => {
            // From BrowserHack
            if (e.key === 'Enter') {
                e.preventDefault();
                this.onLineEnter(input.value);
            }
            else if (this.autocomplete.length) {
                if (e.key === 'Backspace') {
                    input.value = input.value.substring(0, input.selectionStart || 0);
                }
                else {
                    const possibleItems = [];
                    const search = input.value;
                    this.autocomplete.forEach(function (str) {
                        if (str.indexOf(search) == 0)
                            possibleItems.push(str);
                    });
                    // we may press a, then press b before releasing a
                    // thus for the string "ab" we will receive two keyup events
                    // do not clear the selection
                    if ((possibleItems.length == 1) && (input.selectionStart == input.selectionEnd)) {
                        input.value = possibleItems[0];
                        input.setSelectionRange(search.length, possibleItems[0].length);
                    }
                }
            }
        };
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

class StatusLine {
    constructor(root) {
        this.elem = document.createElement("pre");
        this.elem.id = "status";
        root.appendChild(this.elem);
    }
    // TODO: will be refactored
    update(s) {
        this.elem.innerHTML = `${s.title || "No Title"} ${s.align || "No Alignment"} ${s.time != null ? "T:" + s.time : ""} \t ${s.hunger || ""}`;
        this.elem.innerHTML += `\nStr: ${s.str ?? "-"} Dex: ${s.dex ?? "-"} Con: ${s.con ?? "-"} Int: ${s.int ?? "-"} Wis: ${s.wis ?? "-"} Cha: ${s.cha ?? "-"}`;
        this.elem.innerHTML += `\nDlvl ${s.dungeonLvl ?? "-"} HP: ${s.hp ?? "-"}/${s.hpMax ?? "-"} Pw: ${s.power ?? "-"}/${s.powerMax ?? "-"} AC: ${s.armor ?? "-"} EXP: ${s.expLvl}${s.exp != null ? "/" + s.exp : ""} $: ${s.gold ?? "-"}`;
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
    createBackgroundImage(tile, accelerator = 0) {
        const div = document.createElement('div');
        div.style.width = `${this.tileSize}px`;
        div.style.height = `${this.tileSize}px`;
        div.style.backgroundImage = `url('${this.file}')`;
        div.style.backgroundRepeat = 'no-repeat';
        const pos = this.getTilePosition(tile);
        const realPos = mult(pos, { x: this.tileSize, y: this.tileSize });
        div.style.backgroundPosition = `-${realPos.x}px -${realPos.y}px`;
        if (accelerator !== 0) {
            const accel = document.createElement('div');
            accel.innerHTML = String.fromCharCode(accelerator);
            accel.classList.add('accel');
            div.appendChild(accel);
            rel(div);
            accelStyle(accel);
        }
        return div;
    }
}
class TileMap {
    constructor(root, tileSet) {
        this.tileSet = tileSet;
        this.center = { x: 0, y: 0 };
        this.tiles = [];
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'map';
        this.cursor = document.createElement('img');
        this.cursor.src = 'cursor.png';
        this.cursor.id = 'cursor';
        root.appendChild(this.canvas);
        root.appendChild(this.cursor);
        this.context = this.canvas.getContext("2d");
        this.updateCanvasSize();
        this.clearCanvas();
    }
    onResize() {
        this.updateCanvasSize();
        this.rerender();
    }
    updateCanvasSize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    recenter(c) {
        this.center = c;
        this.rerender();
    }
    clearMap() {
        this.tiles = [];
        this.clearCanvas();
    }
    clearCanvas() {
        this.cursor.style.display = 'none';
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
        this.cursor.style.display = 'block';
    }
    addTile(...tiles) {
        tiles.forEach(tile => {
            if (!this.tiles[tile.x])
                this.tiles[tile.x] = [];
            this.tiles[tile.x][tile.y] = tile.tile;
            this.drawTile(tile.x, tile.y);
        });
    }
    drawTile(x, y) {
        const tile = this.tiles[x][y];
        if (tile == null)
            return;
        const source = this.tileSet.getCoordinateForTile(tile);
        const size = this.tileSet.tileSize;
        const globalPos = this.toGlobal({ x, y });
        const globalCenter = this.toGlobal(this.center);
        const relPosFromCenter = sub(globalPos, globalCenter);
        const localPos = add(this.canvasCenter, relPosFromCenter);
        this.context.drawImage(
        // Source
        this.tileSet.image, source.x, source.y, size, size, 
        // Target
        localPos.x, localPos.y, size, size);
    }
    toGlobal(vec) {
        return mult(vec, this.tileSize);
    }
    get tileSize() {
        return { x: this.tileSet.tileSize, y: this.tileSet.tileSize };
    }
    get canvasCenter() {
        return { x: this.canvas.width / 2, y: this.canvas.height / 2 };
    }
}

class GameScreen extends Screen {
    constructor() {
        super();
        this.resize$ = new Subject();
        this.tileset = new TileSet("Nevanda.png", 32, 40);
        this.tilemap = new TileMap(this.elem, this.tileset);
        this.inventory = new Inventory(this.elem, this.tileset);
        this.console = new Console(this.elem);
        this.status = new StatusLine(this.elem);
        this.resize$.pipe(debounceTime(200)).subscribe(() => this.tilemap?.onResize());
    }
    onResize() {
        this.resize$.next();
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
            this.activeMenu = new Menu(prompt, this.tileset);
            dialog.elem.appendChild(this.activeMenu.elem);
            this.elem.appendChild(dialog.elem);
        }
        this.activeMenu.updateMenu(items, count);
    }
    openGetLine(question, autocomplete) {
        const line = new Line(question, autocomplete);
        line.onLineEnter = (line) => {
            window.nethackJS.sendLine(line);
            this.inputHandler = undefined;
            Dialog.removeAll(); // Usually not opened as a dialog, so close it ourself
        };
        this.inputHandler = line;
        this.elem.appendChild(line.elem);
        line.focus();
    }
}

const SPECIAL_KEY_MAP = {
    Enter: 13,
    Escape: 27,
};
class Game {
    constructor() {
        this.openMenu = (winid, prompt, count, ...items) => this.current?.onMenu(prompt, count, items);
        this.openQuestion = (question, ...choices) => this.game.console.appendLine(`\n${question} ${choices}`);
        this.openGetLine = (question, ...autocomplete) => this.game.openGetLine(question, autocomplete);
        this.openDialog = (winid, text) => this.current?.onDialog(text);
        this.closeDialog = (winid) => this.current?.onCloseDialog();
        this.printLine = (line) => this.game.console.appendLine(line);
        this.moveCursor = (x, y) => this.game.tilemap.recenter({ x, y });
        this.centerView = (x, y) => this.game.tilemap.recenter({ x, y });
        this.clearMap = () => this.game.tilemap.clearMap();
        this.updateMap = (...tiles) => this.game.tilemap.addTile(...tiles);
        this.updateStatus = (s) => this.game.status.update(s);
        this.updateInventory = (...items) => this.game.inventory.updateItems(items);
        this.toggleInventory = () => this.game.inventory.toggle();
        this.updateState = (state) => {
            switch (state) {
                case GameState.START:
                    this.changeScreen(this.start);
                    break;
                case GameState.RUNNING:
                    this.changeScreen(this.game);
                    break;
                case GameState.GAMEOVER:
                    window.location.reload();
                    break;
            }
        };
        document.body.onresize = (e) => this.current?.onResize();
        document.onkeydown = (e) => {
            if (this.current?.inputHandler) {
                this.current.inputHandler.onInput(e);
            }
            else {
                if (e.key === "Control" || e.key === "Shift")
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
                        if (e.ctrlKey) {
                            if (code >= 65 && code <= 90) {
                                // A~Z
                                code = code - 64;
                            }
                            else if (code >= 97 && code <= 122) {
                                code = code - 96;
                            }
                        }
                    }
                    window.nethackJS.sendInput(code);
                }
                else {
                    console.log("Unhandled key: ", e.key);
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
