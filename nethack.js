var Type;
(function (Type) {
    Type["INT"] = "i";
    Type["STRING"] = "s";
    Type["POINTER"] = "p";
})(Type || (Type = {}));
function toTile(glyph) {
    return window.module._glyph_to_tile(glyph);
}
const TYPE_SIZES = {
    [Type.INT]: 4,
    [Type.POINTER]: 4,
    [Type.STRING]: 4, // TODO
};
const MAX_LONG = 2147483647;
function selectItems(items, selectedPointer) {
    const int_size = TYPE_SIZES[Type.INT];
    const size = int_size * 2; // selected object has 3 fields, in 3.6 only 2
    const total_size = size * items.length;
    const start_ptr = window.module._malloc(total_size);
    // write selected items to memory
    let ptr = start_ptr;
    items.forEach((item) => {
        window.nethackGlobal.helpers.setPointerValue('nethack.menu.selected', ptr, Type.INT, item.identifier);
        window.nethackGlobal.helpers.setPointerValue('nethack.menu.selected', ptr + int_size, Type.INT, item.count == null || isNaN(item.count) ? -1 : Math.min(item.count, MAX_LONG) // Limit count to prevent dungeon collapse
        );
        // this.global.helpers.setPointerValue("nethack.menu.selected", ptr + int_size * 2, Type.INT, 0); // Only 2 properties in 3.6
        ptr += size;
    });
    // point selected to the first item
    const selected_pp = window.nethackGlobal.helpers.getPointerValue('', selectedPointer, Type.POINTER);
    window.nethackGlobal.helpers.setPointerValue('nethack.menu.setSelected', selected_pp, Type.INT, start_ptr);
}
function getArrayValue(start_ptr, index, type) {
    const ptr = start_ptr + index * TYPE_SIZES[type];
    return window.nethackGlobal.helpers.getPointerValue('nethack.menu.setSelected', ptr, type);
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

var BehaviorSubject = (function (_super) {
    __extends(BehaviorSubject, _super);
    function BehaviorSubject(_value) {
        var _this = _super.call(this) || this;
        _this._value = _value;
        return _this;
    }
    Object.defineProperty(BehaviorSubject.prototype, "value", {
        get: function () {
            return this.getValue();
        },
        enumerable: false,
        configurable: true
    });
    BehaviorSubject.prototype._subscribe = function (subscriber) {
        var subscription = _super.prototype._subscribe.call(this, subscriber);
        !subscription.closed && subscriber.next(this._value);
        return subscription;
    };
    BehaviorSubject.prototype.getValue = function () {
        var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, _value = _a._value;
        if (hasError) {
            throw thrownError;
        }
        this._throwIfClosed();
        return _value;
    };
    BehaviorSubject.prototype.next = function (value) {
        _super.prototype.next.call(this, (this._value = value));
    };
    return BehaviorSubject;
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

var EmptyError = createErrorClass(function (_super) { return function EmptyErrorImpl() {
    _super(this);
    this.name = 'EmptyError';
    this.message = 'no elements in sequence';
}; });

function firstValueFrom(source, config) {
    var hasConfig = typeof config === 'object';
    return new Promise(function (resolve, reject) {
        var subscriber = new SafeSubscriber({
            next: function (value) {
                resolve(value);
                subscriber.unsubscribe();
            },
            error: reject,
            complete: function () {
                if (hasConfig) {
                    resolve(config.defaultValue);
                }
                else {
                    reject(new EmptyError());
                }
            },
        });
        source.subscribe(subscriber);
    });
}

function filter$1(predicate, thisArg) {
    return operate(function (source, subscriber) {
        var index = 0;
        source.subscribe(createOperatorSubscriber(subscriber, function (value) { return predicate.call(thisArg, value, index++) && subscriber.next(value); }));
    });
}

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

function skip(count) {
    return filter$1(function (_, index) { return count <= index; });
}

function tap(observerOrNext, error, complete) {
    var tapObserver = isFunction(observerOrNext) || error || complete
        ?
            { next: observerOrNext, error: error, complete: complete }
        : observerOrNext;
    return tapObserver
        ? operate(function (source, subscriber) {
            var _a;
            (_a = tapObserver.subscribe) === null || _a === void 0 ? void 0 : _a.call(tapObserver);
            var isUnsub = true;
            source.subscribe(createOperatorSubscriber(subscriber, function (value) {
                var _a;
                (_a = tapObserver.next) === null || _a === void 0 ? void 0 : _a.call(tapObserver, value);
                subscriber.next(value);
            }, function () {
                var _a;
                isUnsub = false;
                (_a = tapObserver.complete) === null || _a === void 0 ? void 0 : _a.call(tapObserver);
                subscriber.complete();
            }, function (err) {
                var _a;
                isUnsub = false;
                (_a = tapObserver.error) === null || _a === void 0 ? void 0 : _a.call(tapObserver, err);
                subscriber.error(err);
            }, function () {
                var _a, _b;
                if (isUnsub) {
                    (_a = tapObserver.unsubscribe) === null || _a === void 0 ? void 0 : _a.call(tapObserver);
                }
                (_b = tapObserver.finalize) === null || _b === void 0 ? void 0 : _b.call(tapObserver);
            }));
        })
        :
            identity;
}

var GameState;
(function (GameState) {
    GameState[GameState["START"] = 0] = "START";
    GameState[GameState["RUNNING"] = 1] = "RUNNING";
    GameState[GameState["DIED"] = 2] = "DIED";
    GameState[GameState["GAMEOVER"] = 3] = "GAMEOVER";
})(GameState || (GameState = {}));
var BUCState;
(function (BUCState) {
    BUCState["BLESSED"] = "blessed";
    BUCState["UNCURSED"] = "uncursed";
    BUCState["CURSED"] = "cursed";
})(BUCState || (BUCState = {}));

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

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function getAugmentedNamespace(n) {
  if (n.__esModule) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			if (this instanceof a) {
				var args = [null];
				args.push.apply(args, arguments);
				var Ctor = Function.bind.apply(f, args);
				return new Ctor();
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var nethack = {exports: {}};

var empty = {};

var empty$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    default: empty
});

var require$$0 = /*@__PURE__*/getAugmentedNamespace(empty$1);

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
function resolve() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : '/';

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
}
// path.normalize(path)
// posix version
function normalize(path) {
  var isPathAbsolute = isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isPathAbsolute).join('/');

  if (!path && !isPathAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isPathAbsolute ? '/' : '') + path;
}
// posix version
function isAbsolute(path) {
  return path.charAt(0) === '/';
}

// posix version
function join() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
}


// path.relative(from, to)
// posix version
function relative(from, to) {
  from = resolve(from).substr(1);
  to = resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
}

var sep = '/';
var delimiter = ':';

function dirname(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
}

function basename(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
}


function extname(path) {
  return splitPath(path)[3];
}
var path = {
  extname: extname,
  basename: basename,
  dirname: dirname,
  sep: sep,
  delimiter: delimiter,
  relative: relative,
  join: join,
  isAbsolute: isAbsolute,
  normalize: normalize,
  resolve: resolve
};
function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b' ?
    function (str, start, len) { return str.substr(start, len) } :
    function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

var path$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    basename: basename,
    default: path,
    delimiter: delimiter,
    dirname: dirname,
    extname: extname,
    isAbsolute: isAbsolute,
    join: join,
    normalize: normalize,
    relative: relative,
    resolve: resolve,
    sep: sep
});

var require$$1 = /*@__PURE__*/getAugmentedNamespace(path$1);

(function (module, exports) {
	var Module = (function() {
	  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
	  if (typeof __filename !== 'undefined') _scriptDir = _scriptDir || __filename;
	  return (
	function(Module) {
	  Module = Module || {};

	var Module=typeof Module!=="undefined"?Module:{};var readyPromiseResolve,readyPromiseReject;Module["ready"]=new Promise(function(resolve,reject){readyPromiseResolve=resolve;readyPromiseReject=reject;});if(!Module.expectedDataFileDownloads){Module.expectedDataFileDownloads=0;}Module.expectedDataFileDownloads++;(function(){var loadPackage=function(metadata){if(typeof window==="object"){window["encodeURIComponent"](window.location.pathname.toString().substring(0,window.location.pathname.toString().lastIndexOf("/"))+"/");}else if(typeof process==="undefined"&&typeof location!=="undefined"){encodeURIComponent(location.pathname.toString().substring(0,location.pathname.toString().lastIndexOf("/"))+"/");}var PACKAGE_NAME="nethack.data";var REMOTE_PACKAGE_BASE="nethack.data";if(typeof Module["locateFilePackage"]==="function"&&!Module["locateFile"]){Module["locateFile"]=Module["locateFilePackage"];err("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)");}var REMOTE_PACKAGE_NAME=Module["locateFile"]?Module["locateFile"](REMOTE_PACKAGE_BASE,""):REMOTE_PACKAGE_BASE;var REMOTE_PACKAGE_SIZE=metadata["remote_package_size"];metadata["package_uuid"];function fetchRemotePackage(packageName,packageSize,callback,errback){if(typeof process==="object"&&typeof process.versions==="object"&&typeof process.versions.node==="string"){require$$0.readFile(packageName,function(err,contents){if(err){errback(err);}else {callback(contents.buffer);}});return}var xhr=new XMLHttpRequest;xhr.open("GET",packageName,true);xhr.responseType="arraybuffer";xhr.onprogress=function(event){var url=packageName;var size=packageSize;if(event.total)size=event.total;if(event.loaded){if(!xhr.addedTotal){xhr.addedTotal=true;if(!Module.dataFileDownloads)Module.dataFileDownloads={};Module.dataFileDownloads[url]={loaded:event.loaded,total:size};}else {Module.dataFileDownloads[url].loaded=event.loaded;}var total=0;var loaded=0;var num=0;for(var download in Module.dataFileDownloads){var data=Module.dataFileDownloads[download];total+=data.total;loaded+=data.loaded;num++;}total=Math.ceil(total*Module.expectedDataFileDownloads/num);if(Module["setStatus"])Module["setStatus"]("Downloading data... ("+loaded+"/"+total+")");}else if(!Module.dataFileDownloads){if(Module["setStatus"])Module["setStatus"]("Downloading data...");}};xhr.onerror=function(event){throw new Error("NetworkError for: "+packageName)};xhr.onload=function(event){if(xhr.status==200||xhr.status==304||xhr.status==206||xhr.status==0&&xhr.response){var packageData=xhr.response;callback(packageData);}else {throw new Error(xhr.statusText+" : "+xhr.responseURL)}};xhr.send(null);}function handleError(error){console.error("package error:",error);}var fetchedCallback=null;var fetched=Module["getPreloadedPackage"]?Module["getPreloadedPackage"](REMOTE_PACKAGE_NAME,REMOTE_PACKAGE_SIZE):null;if(!fetched)fetchRemotePackage(REMOTE_PACKAGE_NAME,REMOTE_PACKAGE_SIZE,function(data){if(fetchedCallback){fetchedCallback(data);fetchedCallback=null;}else {fetched=data;}},handleError);function runWithFS(){function assert(check,msg){if(!check)throw msg+(new Error).stack}Module["FS_createPath"]("/","nethack",true,true);function DataRequest(start,end,audio){this.start=start;this.end=end;this.audio=audio;}DataRequest.prototype={requests:{},open:function(mode,name){this.name=name;this.requests[name]=this;Module["addRunDependency"]("fp "+this.name);},send:function(){},onload:function(){var byteArray=this.byteArray.subarray(this.start,this.end);this.finish(byteArray);},finish:function(byteArray){var that=this;Module["FS_createDataFile"](this.name,null,byteArray,true,true,true);Module["removeRunDependency"]("fp "+that.name);this.requests[this.name]=null;}};var files=metadata["files"];for(var i=0;i<files.length;++i){new DataRequest(files[i]["start"],files[i]["end"],files[i]["audio"]||0).open("GET",files[i]["filename"]);}function processPackageData(arrayBuffer){assert(arrayBuffer,"Loading data file failed.");assert(arrayBuffer instanceof ArrayBuffer,"bad input to processPackageData");var byteArray=new Uint8Array(arrayBuffer);DataRequest.prototype.byteArray=byteArray;var files=metadata["files"];for(var i=0;i<files.length;++i){DataRequest.prototype.requests[files[i].filename].onload();}Module["removeRunDependency"]("datafile_nethack.data");}Module["addRunDependency"]("datafile_nethack.data");if(!Module.preloadResults)Module.preloadResults={};Module.preloadResults[PACKAGE_NAME]={fromCache:false};if(fetched){processPackageData(fetched);fetched=null;}else {fetchedCallback=processPackageData;}}if(Module["calledRun"]){runWithFS();}else {if(!Module["preRun"])Module["preRun"]=[];Module["preRun"].push(runWithFS);}};loadPackage({"files":[{"filename":"/nethack/license","start":0,"end":4875},{"filename":"/nethack/logfile","start":4875,"end":4875},{"filename":"/nethack/nhdat","start":4875,"end":1264204},{"filename":"/nethack/perm","start":1264204,"end":1264204},{"filename":"/nethack/record","start":1264204,"end":1264204},{"filename":"/nethack/symbols","start":1264204,"end":1280960},{"filename":"/nethack/sysconf","start":1280960,"end":1286678},{"filename":"/nethack/xlogfile","start":1286678,"end":1286678}],"remote_package_size":1286678,"package_uuid":"4d5e0311-b021-4a1a-b796-165005a661db"});})();var moduleOverrides={};var key;for(key in Module){if(Module.hasOwnProperty(key)){moduleOverrides[key]=Module[key];}}var arguments_=[];var thisProgram="./this.program";var quit_=function(status,toThrow){throw toThrow};var ENVIRONMENT_IS_WEB=typeof window==="object";var ENVIRONMENT_IS_WORKER=typeof importScripts==="function";var ENVIRONMENT_IS_NODE=typeof process==="object"&&typeof process.versions==="object"&&typeof process.versions.node==="string";var scriptDirectory="";function locateFile(path){if(Module["locateFile"]){return Module["locateFile"](path,scriptDirectory)}return scriptDirectory+path}var read_,readAsync,readBinary;function logExceptionOnExit(e){if(e instanceof ExitStatus)return;var toLog=e;err("exiting due to exception: "+toLog);}var nodeFS;var nodePath;if(ENVIRONMENT_IS_NODE){if(ENVIRONMENT_IS_WORKER){scriptDirectory=require$$1.dirname(scriptDirectory)+"/";}else {scriptDirectory=__dirname+"/";}read_=function shell_read(filename,binary){if(!nodeFS)nodeFS=require$$0;if(!nodePath)nodePath=require$$1;filename=nodePath["normalize"](filename);return nodeFS["readFileSync"](filename,binary?null:"utf8")};readBinary=function readBinary(filename){var ret=read_(filename,true);if(!ret.buffer){ret=new Uint8Array(ret);}assert(ret.buffer);return ret};readAsync=function readAsync(filename,onload,onerror){if(!nodeFS)nodeFS=require$$0;if(!nodePath)nodePath=require$$1;filename=nodePath["normalize"](filename);nodeFS["readFile"](filename,function(err,data){if(err)onerror(err);else onload(data.buffer);});};if(process["argv"].length>1){thisProgram=process["argv"][1].replace(/\\/g,"/");}arguments_=process["argv"].slice(2);process["on"]("uncaughtException",function(ex){if(!(ex instanceof ExitStatus)){throw ex}});process["on"]("unhandledRejection",function(reason){throw reason});quit_=function(status,toThrow){if(keepRuntimeAlive()){process["exitCode"]=status;throw toThrow}logExceptionOnExit(toThrow);process["exit"](status);};Module["inspect"]=function(){return "[Emscripten Module object]"};}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){if(ENVIRONMENT_IS_WORKER){scriptDirectory=self.location.href;}else if(typeof document!=="undefined"&&document.currentScript){scriptDirectory=document.currentScript.src;}if(_scriptDir){scriptDirectory=_scriptDir;}if(scriptDirectory.indexOf("blob:")!==0){scriptDirectory=scriptDirectory.substr(0,scriptDirectory.replace(/[?#].*/,"").lastIndexOf("/")+1);}else {scriptDirectory="";}{read_=function(url){var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.send(null);return xhr.responseText};if(ENVIRONMENT_IS_WORKER){readBinary=function(url){var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.responseType="arraybuffer";xhr.send(null);return new Uint8Array(xhr.response)};}readAsync=function(url,onload,onerror){var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=function(){if(xhr.status==200||xhr.status==0&&xhr.response){onload(xhr.response);return}onerror();};xhr.onerror=onerror;xhr.send(null);};}}else;var out=Module["print"]||console.log.bind(console);var err=Module["printErr"]||console.warn.bind(console);for(key in moduleOverrides){if(moduleOverrides.hasOwnProperty(key)){Module[key]=moduleOverrides[key];}}moduleOverrides=null;if(Module["arguments"])arguments_=Module["arguments"];if(Module["thisProgram"])thisProgram=Module["thisProgram"];if(Module["quit"])quit_=Module["quit"];function convertJsFunctionToWasm(func,sig){if(typeof WebAssembly.Function==="function"){var typeNames={"i":"i32","j":"i64","f":"f32","d":"f64"};var type={parameters:[],results:sig[0]=="v"?[]:[typeNames[sig[0]]]};for(var i=1;i<sig.length;++i){type.parameters.push(typeNames[sig[i]]);}return new WebAssembly.Function(type,func)}var typeSection=[1,0,1,96];var sigRet=sig.slice(0,1);var sigParam=sig.slice(1);var typeCodes={"i":127,"j":126,"f":125,"d":124};typeSection.push(sigParam.length);for(var i=0;i<sigParam.length;++i){typeSection.push(typeCodes[sigParam[i]]);}if(sigRet=="v"){typeSection.push(0);}else {typeSection=typeSection.concat([1,typeCodes[sigRet]]);}typeSection[1]=typeSection.length-2;var bytes=new Uint8Array([0,97,115,109,1,0,0,0].concat(typeSection,[2,7,1,1,101,1,102,0,0,7,5,1,1,102,0,0]));var module=new WebAssembly.Module(bytes);var instance=new WebAssembly.Instance(module,{"e":{"f":func}});var wrappedFunc=instance.exports["f"];return wrappedFunc}var freeTableIndexes=[];var functionsInTableMap;function getEmptyTableSlot(){if(freeTableIndexes.length){return freeTableIndexes.pop()}try{wasmTable.grow(1);}catch(err){if(!(err instanceof RangeError)){throw err}throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH."}return wasmTable.length-1}function updateTableMap(offset,count){for(var i=offset;i<offset+count;i++){var item=getWasmTableEntry(i);if(item){functionsInTableMap.set(item,i);}}}function addFunction(func,sig){if(!functionsInTableMap){functionsInTableMap=new WeakMap;updateTableMap(0,wasmTable.length);}if(functionsInTableMap.has(func)){return functionsInTableMap.get(func)}var ret=getEmptyTableSlot();try{setWasmTableEntry(ret,func);}catch(err){if(!(err instanceof TypeError)){throw err}var wrapped=convertJsFunctionToWasm(func,sig);setWasmTableEntry(ret,wrapped);}functionsInTableMap.set(func,ret);return ret}function removeFunction(index){functionsInTableMap.delete(getWasmTableEntry(index));freeTableIndexes.push(index);}var wasmBinary;if(Module["wasmBinary"])wasmBinary=Module["wasmBinary"];var noExitRuntime=Module["noExitRuntime"]||true;if(typeof WebAssembly!=="object"){abort("no native wasm support detected");}function setValue(ptr,value,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":HEAP8[ptr>>0]=value;break;case"i8":HEAP8[ptr>>0]=value;break;case"i16":HEAP16[ptr>>1]=value;break;case"i32":HEAP32[ptr>>2]=value;break;case"i64":tempI64=[value>>>0,(tempDouble=value,+Math.abs(tempDouble)>=1?tempDouble>0?(Math.min(+Math.floor(tempDouble/4294967296),4294967295)|0)>>>0:~~+Math.ceil((tempDouble-+(~~tempDouble>>>0))/4294967296)>>>0:0)],HEAP32[ptr>>2]=tempI64[0],HEAP32[ptr+4>>2]=tempI64[1];break;case"float":HEAPF32[ptr>>2]=value;break;case"double":HEAPF64[ptr>>3]=value;break;default:abort("invalid type for setValue: "+type);}}function getValue(ptr,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":return HEAP8[ptr>>0];case"i8":return HEAP8[ptr>>0];case"i16":return HEAP16[ptr>>1];case"i32":return HEAP32[ptr>>2];case"i64":return HEAP32[ptr>>2];case"float":return HEAPF32[ptr>>2];case"double":return Number(HEAPF64[ptr>>3]);default:abort("invalid type for getValue: "+type);}return null}var wasmMemory;var ABORT=false;var EXITSTATUS;function assert(condition,text){if(!condition){abort("Assertion failed: "+text);}}function getCFunc(ident){var func=Module["_"+ident];assert(func,"Cannot call unknown function "+ident+", make sure it is exported");return func}function ccall(ident,returnType,argTypes,args,opts){var toC={"string":function(str){var ret=0;if(str!==null&&str!==undefined&&str!==0){var len=(str.length<<2)+1;ret=stackAlloc(len);stringToUTF8(str,ret,len);}return ret},"array":function(arr){var ret=stackAlloc(arr.length);writeArrayToMemory(arr,ret);return ret}};function convertReturnValue(ret){if(returnType==="string")return UTF8ToString(ret);if(returnType==="boolean")return Boolean(ret);return ret}var func=getCFunc(ident);var cArgs=[];var stack=0;if(args){for(var i=0;i<args.length;i++){var converter=toC[argTypes[i]];if(converter){if(stack===0)stack=stackSave();cArgs[i]=converter(args[i]);}else {cArgs[i]=args[i];}}}var ret=func.apply(null,cArgs);function onDone(ret){runtimeKeepalivePop();if(stack!==0)stackRestore(stack);return convertReturnValue(ret)}runtimeKeepalivePush();var asyncMode=opts&&opts.async;if(Asyncify.currData){return Asyncify.whenDone().then(onDone)}ret=onDone(ret);if(asyncMode)return Promise.resolve(ret);return ret}function cwrap(ident,returnType,argTypes,opts){argTypes=argTypes||[];var numericArgs=argTypes.every(function(type){return type==="number"});var numericRet=returnType!=="string";if(numericRet&&numericArgs&&!opts){return getCFunc(ident)}return function(){return ccall(ident,returnType,argTypes,arguments,opts)}}var UTF8Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf8"):undefined;function UTF8ArrayToString(heap,idx,maxBytesToRead){var endIdx=idx+maxBytesToRead;var endPtr=idx;while(heap[endPtr]&&!(endPtr>=endIdx))++endPtr;if(endPtr-idx>16&&heap.subarray&&UTF8Decoder){return UTF8Decoder.decode(heap.subarray(idx,endPtr))}else {var str="";while(idx<endPtr){var u0=heap[idx++];if(!(u0&128)){str+=String.fromCharCode(u0);continue}var u1=heap[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}var u2=heap[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2;}else {u0=(u0&7)<<18|u1<<12|u2<<6|heap[idx++]&63;}if(u0<65536){str+=String.fromCharCode(u0);}else {var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023);}}}return str}function UTF8ToString(ptr,maxBytesToRead){return ptr?UTF8ArrayToString(HEAPU8,ptr,maxBytesToRead):""}function stringToUTF8Array(str,heap,outIdx,maxBytesToWrite){if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343){var u1=str.charCodeAt(++i);u=65536+((u&1023)<<10)|u1&1023;}if(u<=127){if(outIdx>=endIdx)break;heap[outIdx++]=u;}else if(u<=2047){if(outIdx+1>=endIdx)break;heap[outIdx++]=192|u>>6;heap[outIdx++]=128|u&63;}else if(u<=65535){if(outIdx+2>=endIdx)break;heap[outIdx++]=224|u>>12;heap[outIdx++]=128|u>>6&63;heap[outIdx++]=128|u&63;}else {if(outIdx+3>=endIdx)break;heap[outIdx++]=240|u>>18;heap[outIdx++]=128|u>>12&63;heap[outIdx++]=128|u>>6&63;heap[outIdx++]=128|u&63;}}heap[outIdx]=0;return outIdx-startIdx}function stringToUTF8(str,outPtr,maxBytesToWrite){return stringToUTF8Array(str,HEAPU8,outPtr,maxBytesToWrite)}function lengthBytesUTF8(str){var len=0;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127)++len;else if(u<=2047)len+=2;else if(u<=65535)len+=3;else len+=4;}return len}function allocateUTF8(str){var size=lengthBytesUTF8(str)+1;var ret=_malloc(size);if(ret)stringToUTF8Array(str,HEAP8,ret,size);return ret}function allocateUTF8OnStack(str){var size=lengthBytesUTF8(str)+1;var ret=stackAlloc(size);stringToUTF8Array(str,HEAP8,ret,size);return ret}function writeArrayToMemory(array,buffer){HEAP8.set(array,buffer);}function writeAsciiToMemory(str,buffer,dontAddNull){for(var i=0;i<str.length;++i){HEAP8[buffer++>>0]=str.charCodeAt(i);}if(!dontAddNull)HEAP8[buffer>>0]=0;}var buffer,HEAP8,HEAPU8,HEAP16,HEAP32,HEAPF32,HEAPF64;function updateGlobalBufferAndViews(buf){buffer=buf;Module["HEAP8"]=HEAP8=new Int8Array(buf);Module["HEAP16"]=HEAP16=new Int16Array(buf);Module["HEAP32"]=HEAP32=new Int32Array(buf);Module["HEAPU8"]=HEAPU8=new Uint8Array(buf);Module["HEAPU16"]=new Uint16Array(buf);Module["HEAPU32"]=new Uint32Array(buf);Module["HEAPF32"]=HEAPF32=new Float32Array(buf);Module["HEAPF64"]=HEAPF64=new Float64Array(buf);}Module["INITIAL_MEMORY"]||16777216;var wasmTable;var __ATPRERUN__=[];var __ATINIT__=[];var __ATMAIN__=[];var __ATPOSTRUN__=[];var runtimeExited=false;var runtimeKeepaliveCounter=0;function keepRuntimeAlive(){return noExitRuntime||runtimeKeepaliveCounter>0}function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift());}}callRuntimeCallbacks(__ATPRERUN__);}function initRuntime(){if(!Module["noFSInit"]&&!FS.init.initialized)FS.init();FS.ignorePermissions=false;callRuntimeCallbacks(__ATINIT__);}function preMain(){callRuntimeCallbacks(__ATMAIN__);}function exitRuntime(){runtimeExited=true;}function postRun(){if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift());}}callRuntimeCallbacks(__ATPOSTRUN__);}function addOnPreRun(cb){__ATPRERUN__.unshift(cb);}function addOnInit(cb){__ATINIT__.unshift(cb);}function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb);}var runDependencies=0;var dependenciesFulfilled=null;function getUniqueRunDependency(id){return id}function addRunDependency(id){runDependencies++;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies);}}function removeRunDependency(id){runDependencies--;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies);}if(runDependencies==0){if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback();}}}Module["preloadedImages"]={};Module["preloadedAudios"]={};function abort(what){{if(Module["onAbort"]){Module["onAbort"](what);}}what="Aborted("+what+")";err(what);ABORT=true;EXITSTATUS=1;what+=". Build with -s ASSERTIONS=1 for more info.";var e=new WebAssembly.RuntimeError(what);readyPromiseReject(e);throw e}var dataURIPrefix="data:application/octet-stream;base64,";function isDataURI(filename){return filename.startsWith(dataURIPrefix)}function isFileURI(filename){return filename.startsWith("file://")}var wasmBinaryFile;wasmBinaryFile="nethack.wasm";if(!isDataURI(wasmBinaryFile)){wasmBinaryFile=locateFile(wasmBinaryFile);}function getBinary(file){try{if(file==wasmBinaryFile&&wasmBinary){return new Uint8Array(wasmBinary)}if(readBinary){return readBinary(file)}else {throw "both async and sync fetching of the wasm failed"}}catch(err){abort(err);}}function getBinaryPromise(){if(!wasmBinary&&(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER)){if(typeof fetch==="function"&&!isFileURI(wasmBinaryFile)){return fetch(wasmBinaryFile,{credentials:"same-origin"}).then(function(response){if(!response["ok"]){throw "failed to load wasm binary file at '"+wasmBinaryFile+"'"}return response["arrayBuffer"]()}).catch(function(){return getBinary(wasmBinaryFile)})}else {if(readAsync){return new Promise(function(resolve,reject){readAsync(wasmBinaryFile,function(response){resolve(new Uint8Array(response));},reject);})}}}return Promise.resolve().then(function(){return getBinary(wasmBinaryFile)})}function createWasm(){var info={"a":asmLibraryArg};function receiveInstance(instance,module){var exports=instance.exports;exports=Asyncify.instrumentWasmExports(exports);Module["asm"]=exports;wasmMemory=Module["asm"]["N"];updateGlobalBufferAndViews(wasmMemory.buffer);wasmTable=Module["asm"]["P"];addOnInit(Module["asm"]["O"]);removeRunDependency();}addRunDependency();function receiveInstantiationResult(result){receiveInstance(result["instance"]);}function instantiateArrayBuffer(receiver){return getBinaryPromise().then(function(binary){return WebAssembly.instantiate(binary,info)}).then(function(instance){return instance}).then(receiver,function(reason){err("failed to asynchronously prepare wasm: "+reason);abort(reason);})}function instantiateAsync(){if(!wasmBinary&&typeof WebAssembly.instantiateStreaming==="function"&&!isDataURI(wasmBinaryFile)&&!isFileURI(wasmBinaryFile)&&typeof fetch==="function"){return fetch(wasmBinaryFile,{credentials:"same-origin"}).then(function(response){var result=WebAssembly.instantiateStreaming(response,info);return result.then(receiveInstantiationResult,function(reason){err("wasm streaming compile failed: "+reason);err("falling back to ArrayBuffer instantiation");return instantiateArrayBuffer(receiveInstantiationResult)})})}else {return instantiateArrayBuffer(receiveInstantiationResult)}}if(Module["instantiateWasm"]){try{var exports=Module["instantiateWasm"](info,receiveInstance);exports=Asyncify.instrumentWasmExports(exports);return exports}catch(e){err("Module.instantiateWasm callback failed with error: "+e);return false}}instantiateAsync().catch(readyPromiseReject);return {}}var tempDouble;var tempI64;var ASM_CONSTS={351340:function(){FS.syncfs(function(err){if(err)console.log("Cannot sync FS, savegame may not work!");});},351434:function(){FS.syncfs(function(err){if(err)console.log("Cannot sync FS, savegame may not work!");});},351528:function(){globalThis.nethackGlobal=globalThis.nethackGlobal||{};globalThis.nethackGlobal.constants=globalThis.nethackGlobal.constants||{};},351670:function(){globalThis.nethackGlobal=globalThis.nethackGlobal||{};globalThis.nethackGlobal.globals=globalThis.nethackGlobal.globals||{};}};function create_global(name_str,ptr,type_str){let name=UTF8ToString(name_str);let type=UTF8ToString(type_str);let getPointerValue=globalThis.nethackGlobal.helpers.getPointerValue;let setPointerValue=globalThis.nethackGlobal.helpers.setPointerValue;let{obj:obj,prop:prop}=createPath(globalThis.nethackGlobal.globals,name);Object.defineProperty(obj,prop,{get:getPointerValue.bind(null,name,ptr,type),set:setPointerValue.bind(null,name,ptr,type),configurable:true,enumerable:true});function createPath(obj,path){path=path.split(".");let i;for(i=0;i<path.length-1;i++){if(obj[path[i]]===undefined){obj[path[i]]={};}obj=obj[path[i]];}return {obj:obj,prop:path[i]}}}function js_helpers_init(){globalThis.nethackGlobal=globalThis.nethackGlobal||{};globalThis.nethackGlobal.helpers=globalThis.nethackGlobal.helpers||{};installHelper(mapglyphHelper);installHelper(displayInventory);installHelper(getPointerValue);installHelper(setPointerValue);function mapglyphHelper(glyph,x,y,mgflags){let ochar=_malloc(4);let ocolor=_malloc(4);let ospecial=_malloc(4);_mapglyph(glyph,ochar,ocolor,ospecial,x,y,mgflags);let ch=getValue(ochar,"i32");let color=getValue(ocolor,"i32");let special=getValue(ospecial,"i32");_free(ochar);_free(ocolor);_free(ospecial);return {glyph:glyph,ch:ch,color:color,special:special,x:x,y:y,mgflags:mgflags}}function displayInventory(){return _display_inventory(0,0)}function getPointerValue(name,ptr,type){switch(type){case"s":return UTF8ToString(ptr);case"p":if(!ptr)return 0;return getValue(ptr,"*");case"c":return String.fromCharCode(getValue(ptr,"i8"));case"0":return getValue(ptr,"i8");case"1":return getValue(ptr,"i16");case"2":case"i":case"n":return getValue(ptr,"i32");case"f":return getValue(ptr,"float");case"d":return getValue(ptr,"double");case"o":case"v":return ptr;default:throw new TypeError("unknown type:"+type)}}function setPointerValue(name,ptr,type,value=0){switch(type){case"p":throw new Error("not implemented");case"s":if(typeof value!=="string")throw new TypeError(`expected ${name} return type to be string`);stringToUTF8(value,ptr,1024);break;case"i":if(typeof value!=="number"||!Number.isInteger(value))throw new TypeError(`expected ${name} return type to be integer`);setValue(ptr,value,"i32");break;case"c":if(typeof value!=="number"||!Number.isInteger(value))throw new TypeError(`expected ${name} return type to be integer representing an character`);setValue(ptr,value,"i8");break;case"f":if(typeof value!=="number"||isFloat(value))throw new TypeError(`expected ${name} return type to be float`);setValue(ptr,value,"double");break;case"d":if(typeof value!=="number"||isFloat(value))throw new TypeError(`expected ${name} return type to be double`);setValue(ptr,value,"double");break;case"v":break;default:throw new Error("unknown type")}function isFloat(n){return n===+n&&n!==(n|0)&&!Number.isInteger(n)}}function installHelper(fn,name){name=name||fn.name;globalThis.nethackGlobal.helpers[name]=fn;}}function local_callback(cb_name,shim_name,ret_ptr,fmt_str,args){Asyncify.handleSleep(wakeUp=>{let name=UTF8ToString(shim_name);let fmt=UTF8ToString(fmt_str);let cbName=UTF8ToString(cb_name);if(!globalThis.nethackGlobal){wakeUp();return}let getPointerValue=globalThis.nethackGlobal.helpers.getPointerValue;let setPointerValue=globalThis.nethackGlobal.helpers.setPointerValue;reentryMutexLock(name);let argTypes=fmt.split("");let retType=argTypes.shift();let jsArgs=[];for(let i=0;i<argTypes.length;i++){let ptr=args+4*i;let val=getArg(name,ptr,argTypes[i]);jsArgs.push(val);}let userCallback=globalThis[cbName];runJsEventLoop(()=>userCallback.call(this,name,...jsArgs)).then(retVal=>{setPointerValue(name,ret_ptr,retType,retVal);setTimeout(()=>{reentryMutexUnlock();wakeUp();},0);});function getArg(name,ptr,type){return type==="o"?ptr:getPointerValue(name,getValue(ptr,"*"),type)}async function runJsEventLoop(cb){return new Promise(resolve=>{setTimeout(()=>{resolve(cb());},0);})}function reentryMutexLock(name){globalThis.nethackGlobal=globalThis.nethackGlobal||{};if(globalThis.nethackGlobal.shimFunctionRunning){throw new Error(`'${name}' attempting second call to 'local_callback' before '${globalThis.nethackGlobal.shimFunctionRunning}' has finished, will crash emscripten Asyncify. For details see: emscripten.org/docs/porting/asyncify.html#reentrancy`)}globalThis.nethackGlobal.shimFunctionRunning=name;}function reentryMutexUnlock(){globalThis.nethackGlobal.shimFunctionRunning=null;}});}function set_const(scope_str,name_str,num){let scope=UTF8ToString(scope_str);let name=UTF8ToString(name_str);globalThis.nethackGlobal.constants[scope]=globalThis.nethackGlobal.constants[scope]||{};globalThis.nethackGlobal.constants[scope][name]=num;globalThis.nethackGlobal.constants[scope][num]=name;}function shim_add_menu(w,glyph,identifier,ch,gch,attr,str,preselected){globalThis.nethackJS.handle("shim_add_menu",w,glyph,getValue(identifier,"*"),ch,gch,attr,UTF8ToString(str),preselected);}function shim_cliparound(x,y){globalThis.nethackJS.handle("shim_cliparound",x,y);}function shim_curs(w,x,y){globalThis.nethackJS.handle("shim_curs",w,x,y);}function shim_print_tile(w,x,y,glyph,bkglyph,is_pet){globalThis.nethackJS.handle("shim_print_glyph",w,x,y,glyph,bkglyph,is_pet);}function shim_putstr(w,attr,str){globalThis.nethackJS.handle("shim_putstr",w,attr,UTF8ToString(str));}function shim_status_enablefield(fldidx,nm,fmt,enable){globalThis.nethackJS.handle("shim_status_enablefield",fldidx,nm,fmt,enable);}function shim_status_update(fldidx,ptr,chg,percent,color,colormasks){globalThis.nethackJS.handle("shim_status_update",fldidx,ptr,chg,percent,color,colormasks);}function callRuntimeCallbacks(callbacks){while(callbacks.length>0){var callback=callbacks.shift();if(typeof callback=="function"){callback(Module);continue}var func=callback.func;if(typeof func==="number"){if(callback.arg===undefined){(function(){dynCall_v.call(null,func);})();}else {(function(a1){dynCall_vi.apply(null,[func,a1]);})(callback.arg);}}else {func(callback.arg===undefined?null:callback.arg);}}}var wasmTableMirror=[];function getWasmTableEntry(funcPtr){var func=wasmTableMirror[funcPtr];if(!func){if(funcPtr>=wasmTableMirror.length)wasmTableMirror.length=funcPtr+1;wasmTableMirror[funcPtr]=func=wasmTable.get(funcPtr);}return func}function handleException(e){if(e instanceof ExitStatus||e=="unwind"){return EXITSTATUS}quit_(1,e);}function setWasmTableEntry(idx,func){wasmTable.set(idx,func);wasmTableMirror[idx]=func;}function _tzset_impl(){var currentYear=(new Date).getFullYear();var winter=new Date(currentYear,0,1);var summer=new Date(currentYear,6,1);var winterOffset=winter.getTimezoneOffset();var summerOffset=summer.getTimezoneOffset();var stdTimezoneOffset=Math.max(winterOffset,summerOffset);HEAP32[__get_timezone()>>2]=stdTimezoneOffset*60;HEAP32[__get_daylight()>>2]=Number(winterOffset!=summerOffset);function extractZone(date){var match=date.toTimeString().match(/\(([A-Za-z ]+)\)$/);return match?match[1]:"GMT"}var winterName=extractZone(winter);var summerName=extractZone(summer);var winterNamePtr=allocateUTF8(winterName);var summerNamePtr=allocateUTF8(summerName);if(summerOffset<winterOffset){HEAP32[__get_tzname()>>2]=winterNamePtr;HEAP32[__get_tzname()+4>>2]=summerNamePtr;}else {HEAP32[__get_tzname()>>2]=summerNamePtr;HEAP32[__get_tzname()+4>>2]=winterNamePtr;}}function _tzset(){if(_tzset.called)return;_tzset.called=true;_tzset_impl();}function _localtime_r(time,tmPtr){_tzset();var date=new Date(HEAP32[time>>2]*1e3);HEAP32[tmPtr>>2]=date.getSeconds();HEAP32[tmPtr+4>>2]=date.getMinutes();HEAP32[tmPtr+8>>2]=date.getHours();HEAP32[tmPtr+12>>2]=date.getDate();HEAP32[tmPtr+16>>2]=date.getMonth();HEAP32[tmPtr+20>>2]=date.getFullYear()-1900;HEAP32[tmPtr+24>>2]=date.getDay();var start=new Date(date.getFullYear(),0,1);var yday=(date.getTime()-start.getTime())/(1e3*60*60*24)|0;HEAP32[tmPtr+28>>2]=yday;HEAP32[tmPtr+36>>2]=-(date.getTimezoneOffset()*60);var summerOffset=new Date(date.getFullYear(),6,1).getTimezoneOffset();var winterOffset=start.getTimezoneOffset();var dst=(summerOffset!=winterOffset&&date.getTimezoneOffset()==Math.min(winterOffset,summerOffset))|0;HEAP32[tmPtr+32>>2]=dst;var zonePtr=HEAP32[__get_tzname()+(dst?4:0)>>2];HEAP32[tmPtr+40>>2]=zonePtr;return tmPtr}function ___localtime_r(a0,a1){return _localtime_r(a0,a1)}var PATH={splitPath:function(filename){var splitPathRe=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;return splitPathRe.exec(filename).slice(1)},normalizeArray:function(parts,allowAboveRoot){var up=0;for(var i=parts.length-1;i>=0;i--){var last=parts[i];if(last==="."){parts.splice(i,1);}else if(last===".."){parts.splice(i,1);up++;}else if(up){parts.splice(i,1);up--;}}if(allowAboveRoot){for(;up;up--){parts.unshift("..");}}return parts},normalize:function(path){var isAbsolute=path.charAt(0)==="/",trailingSlash=path.substr(-1)==="/";path=PATH.normalizeArray(path.split("/").filter(function(p){return !!p}),!isAbsolute).join("/");if(!path&&!isAbsolute){path=".";}if(path&&trailingSlash){path+="/";}return (isAbsolute?"/":"")+path},dirname:function(path){var result=PATH.splitPath(path),root=result[0],dir=result[1];if(!root&&!dir){return "."}if(dir){dir=dir.substr(0,dir.length-1);}return root+dir},basename:function(path){if(path==="/")return "/";path=PATH.normalize(path);path=path.replace(/\/$/,"");var lastSlash=path.lastIndexOf("/");if(lastSlash===-1)return path;return path.substr(lastSlash+1)},extname:function(path){return PATH.splitPath(path)[3]},join:function(){var paths=Array.prototype.slice.call(arguments,0);return PATH.normalize(paths.join("/"))},join2:function(l,r){return PATH.normalize(l+"/"+r)}};function getRandomDevice(){if(typeof crypto==="object"&&typeof crypto["getRandomValues"]==="function"){var randomBuffer=new Uint8Array(1);return function(){crypto.getRandomValues(randomBuffer);return randomBuffer[0]}}else if(ENVIRONMENT_IS_NODE){try{var crypto_module=require$$0;return function(){return crypto_module["randomBytes"](1)[0]}}catch(e){}}return function(){abort("randomDevice");}}var PATH_FS={resolve:function(){var resolvedPath="",resolvedAbsolute=false;for(var i=arguments.length-1;i>=-1&&!resolvedAbsolute;i--){var path=i>=0?arguments[i]:FS.cwd();if(typeof path!=="string"){throw new TypeError("Arguments to path.resolve must be strings")}else if(!path){return ""}resolvedPath=path+"/"+resolvedPath;resolvedAbsolute=path.charAt(0)==="/";}resolvedPath=PATH.normalizeArray(resolvedPath.split("/").filter(function(p){return !!p}),!resolvedAbsolute).join("/");return (resolvedAbsolute?"/":"")+resolvedPath||"."},relative:function(from,to){from=PATH_FS.resolve(from).substr(1);to=PATH_FS.resolve(to).substr(1);function trim(arr){var start=0;for(;start<arr.length;start++){if(arr[start]!=="")break}var end=arr.length-1;for(;end>=0;end--){if(arr[end]!=="")break}if(start>end)return [];return arr.slice(start,end-start+1)}var fromParts=trim(from.split("/"));var toParts=trim(to.split("/"));var length=Math.min(fromParts.length,toParts.length);var samePartsLength=length;for(var i=0;i<length;i++){if(fromParts[i]!==toParts[i]){samePartsLength=i;break}}var outputParts=[];for(var i=samePartsLength;i<fromParts.length;i++){outputParts.push("..");}outputParts=outputParts.concat(toParts.slice(samePartsLength));return outputParts.join("/")}};var TTY={ttys:[],init:function(){},shutdown:function(){},register:function(dev,ops){TTY.ttys[dev]={input:[],output:[],ops:ops};FS.registerDevice(dev,TTY.stream_ops);},stream_ops:{open:function(stream){var tty=TTY.ttys[stream.node.rdev];if(!tty){throw new FS.ErrnoError(43)}stream.tty=tty;stream.seekable=false;},close:function(stream){stream.tty.ops.flush(stream.tty);},flush:function(stream){stream.tty.ops.flush(stream.tty);},read:function(stream,buffer,offset,length,pos){if(!stream.tty||!stream.tty.ops.get_char){throw new FS.ErrnoError(60)}var bytesRead=0;for(var i=0;i<length;i++){var result;try{result=stream.tty.ops.get_char(stream.tty);}catch(e){throw new FS.ErrnoError(29)}if(result===undefined&&bytesRead===0){throw new FS.ErrnoError(6)}if(result===null||result===undefined)break;bytesRead++;buffer[offset+i]=result;}if(bytesRead){stream.node.timestamp=Date.now();}return bytesRead},write:function(stream,buffer,offset,length,pos){if(!stream.tty||!stream.tty.ops.put_char){throw new FS.ErrnoError(60)}try{for(var i=0;i<length;i++){stream.tty.ops.put_char(stream.tty,buffer[offset+i]);}}catch(e){throw new FS.ErrnoError(29)}if(length){stream.node.timestamp=Date.now();}return i}},default_tty_ops:{get_char:function(tty){if(!tty.input.length){var result=null;if(ENVIRONMENT_IS_NODE){var BUFSIZE=256;var buf=Buffer.alloc(BUFSIZE);var bytesRead=0;try{bytesRead=nodeFS.readSync(process.stdin.fd,buf,0,BUFSIZE,null);}catch(e){if(e.toString().includes("EOF"))bytesRead=0;else throw e}if(bytesRead>0){result=buf.slice(0,bytesRead).toString("utf-8");}else {result=null;}}else if(typeof window!="undefined"&&typeof window.prompt=="function"){result=window.prompt("Input: ");if(result!==null){result+="\n";}}else if(typeof readline=="function"){result=readline();if(result!==null){result+="\n";}}if(!result){return null}tty.input=intArrayFromString(result,true);}return tty.input.shift()},put_char:function(tty,val){if(val===null||val===10){out(UTF8ArrayToString(tty.output,0));tty.output=[];}else {if(val!=0)tty.output.push(val);}},flush:function(tty){if(tty.output&&tty.output.length>0){out(UTF8ArrayToString(tty.output,0));tty.output=[];}}},default_tty1_ops:{put_char:function(tty,val){if(val===null||val===10){err(UTF8ArrayToString(tty.output,0));tty.output=[];}else {if(val!=0)tty.output.push(val);}},flush:function(tty){if(tty.output&&tty.output.length>0){err(UTF8ArrayToString(tty.output,0));tty.output=[];}}}};function mmapAlloc(size){abort();}var MEMFS={ops_table:null,mount:function(mount){return MEMFS.createNode(null,"/",16384|511,0)},createNode:function(parent,name,mode,dev){if(FS.isBlkdev(mode)||FS.isFIFO(mode)){throw new FS.ErrnoError(63)}if(!MEMFS.ops_table){MEMFS.ops_table={dir:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr,lookup:MEMFS.node_ops.lookup,mknod:MEMFS.node_ops.mknod,rename:MEMFS.node_ops.rename,unlink:MEMFS.node_ops.unlink,rmdir:MEMFS.node_ops.rmdir,readdir:MEMFS.node_ops.readdir,symlink:MEMFS.node_ops.symlink},stream:{llseek:MEMFS.stream_ops.llseek}},file:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr},stream:{llseek:MEMFS.stream_ops.llseek,read:MEMFS.stream_ops.read,write:MEMFS.stream_ops.write,allocate:MEMFS.stream_ops.allocate,mmap:MEMFS.stream_ops.mmap,msync:MEMFS.stream_ops.msync}},link:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr,readlink:MEMFS.node_ops.readlink},stream:{}},chrdev:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr},stream:FS.chrdev_stream_ops}};}var node=FS.createNode(parent,name,mode,dev);if(FS.isDir(node.mode)){node.node_ops=MEMFS.ops_table.dir.node;node.stream_ops=MEMFS.ops_table.dir.stream;node.contents={};}else if(FS.isFile(node.mode)){node.node_ops=MEMFS.ops_table.file.node;node.stream_ops=MEMFS.ops_table.file.stream;node.usedBytes=0;node.contents=null;}else if(FS.isLink(node.mode)){node.node_ops=MEMFS.ops_table.link.node;node.stream_ops=MEMFS.ops_table.link.stream;}else if(FS.isChrdev(node.mode)){node.node_ops=MEMFS.ops_table.chrdev.node;node.stream_ops=MEMFS.ops_table.chrdev.stream;}node.timestamp=Date.now();if(parent){parent.contents[name]=node;parent.timestamp=node.timestamp;}return node},getFileDataAsTypedArray:function(node){if(!node.contents)return new Uint8Array(0);if(node.contents.subarray)return node.contents.subarray(0,node.usedBytes);return new Uint8Array(node.contents)},expandFileStorage:function(node,newCapacity){var prevCapacity=node.contents?node.contents.length:0;if(prevCapacity>=newCapacity)return;var CAPACITY_DOUBLING_MAX=1024*1024;newCapacity=Math.max(newCapacity,prevCapacity*(prevCapacity<CAPACITY_DOUBLING_MAX?2:1.125)>>>0);if(prevCapacity!=0)newCapacity=Math.max(newCapacity,256);var oldContents=node.contents;node.contents=new Uint8Array(newCapacity);if(node.usedBytes>0)node.contents.set(oldContents.subarray(0,node.usedBytes),0);},resizeFileStorage:function(node,newSize){if(node.usedBytes==newSize)return;if(newSize==0){node.contents=null;node.usedBytes=0;}else {var oldContents=node.contents;node.contents=new Uint8Array(newSize);if(oldContents){node.contents.set(oldContents.subarray(0,Math.min(newSize,node.usedBytes)));}node.usedBytes=newSize;}},node_ops:{getattr:function(node){var attr={};attr.dev=FS.isChrdev(node.mode)?node.id:1;attr.ino=node.id;attr.mode=node.mode;attr.nlink=1;attr.uid=0;attr.gid=0;attr.rdev=node.rdev;if(FS.isDir(node.mode)){attr.size=4096;}else if(FS.isFile(node.mode)){attr.size=node.usedBytes;}else if(FS.isLink(node.mode)){attr.size=node.link.length;}else {attr.size=0;}attr.atime=new Date(node.timestamp);attr.mtime=new Date(node.timestamp);attr.ctime=new Date(node.timestamp);attr.blksize=4096;attr.blocks=Math.ceil(attr.size/attr.blksize);return attr},setattr:function(node,attr){if(attr.mode!==undefined){node.mode=attr.mode;}if(attr.timestamp!==undefined){node.timestamp=attr.timestamp;}if(attr.size!==undefined){MEMFS.resizeFileStorage(node,attr.size);}},lookup:function(parent,name){throw FS.genericErrors[44]},mknod:function(parent,name,mode,dev){return MEMFS.createNode(parent,name,mode,dev)},rename:function(old_node,new_dir,new_name){if(FS.isDir(old_node.mode)){var new_node;try{new_node=FS.lookupNode(new_dir,new_name);}catch(e){}if(new_node){for(var i in new_node.contents){throw new FS.ErrnoError(55)}}}delete old_node.parent.contents[old_node.name];old_node.parent.timestamp=Date.now();old_node.name=new_name;new_dir.contents[new_name]=old_node;new_dir.timestamp=old_node.parent.timestamp;old_node.parent=new_dir;},unlink:function(parent,name){delete parent.contents[name];parent.timestamp=Date.now();},rmdir:function(parent,name){var node=FS.lookupNode(parent,name);for(var i in node.contents){throw new FS.ErrnoError(55)}delete parent.contents[name];parent.timestamp=Date.now();},readdir:function(node){var entries=[".",".."];for(var key in node.contents){if(!node.contents.hasOwnProperty(key)){continue}entries.push(key);}return entries},symlink:function(parent,newname,oldpath){var node=MEMFS.createNode(parent,newname,511|40960,0);node.link=oldpath;return node},readlink:function(node){if(!FS.isLink(node.mode)){throw new FS.ErrnoError(28)}return node.link}},stream_ops:{read:function(stream,buffer,offset,length,position){var contents=stream.node.contents;if(position>=stream.node.usedBytes)return 0;var size=Math.min(stream.node.usedBytes-position,length);if(size>8&&contents.subarray){buffer.set(contents.subarray(position,position+size),offset);}else {for(var i=0;i<size;i++)buffer[offset+i]=contents[position+i];}return size},write:function(stream,buffer,offset,length,position,canOwn){if(!length)return 0;var node=stream.node;node.timestamp=Date.now();if(buffer.subarray&&(!node.contents||node.contents.subarray)){if(canOwn){node.contents=buffer.subarray(offset,offset+length);node.usedBytes=length;return length}else if(node.usedBytes===0&&position===0){node.contents=buffer.slice(offset,offset+length);node.usedBytes=length;return length}else if(position+length<=node.usedBytes){node.contents.set(buffer.subarray(offset,offset+length),position);return length}}MEMFS.expandFileStorage(node,position+length);if(node.contents.subarray&&buffer.subarray){node.contents.set(buffer.subarray(offset,offset+length),position);}else {for(var i=0;i<length;i++){node.contents[position+i]=buffer[offset+i];}}node.usedBytes=Math.max(node.usedBytes,position+length);return length},llseek:function(stream,offset,whence){var position=offset;if(whence===1){position+=stream.position;}else if(whence===2){if(FS.isFile(stream.node.mode)){position+=stream.node.usedBytes;}}if(position<0){throw new FS.ErrnoError(28)}return position},allocate:function(stream,offset,length){MEMFS.expandFileStorage(stream.node,offset+length);stream.node.usedBytes=Math.max(stream.node.usedBytes,offset+length);},mmap:function(stream,address,length,position,prot,flags){if(address!==0){throw new FS.ErrnoError(28)}if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(43)}var ptr;var allocated;var contents=stream.node.contents;if(!(flags&2)&&contents.buffer===buffer){allocated=false;ptr=contents.byteOffset;}else {if(position>0||position+length<contents.length){if(contents.subarray){contents=contents.subarray(position,position+length);}else {contents=Array.prototype.slice.call(contents,position,position+length);}}allocated=true;ptr=mmapAlloc();if(!ptr){throw new FS.ErrnoError(48)}HEAP8.set(contents,ptr);}return {ptr:ptr,allocated:allocated}},msync:function(stream,buffer,offset,length,mmapFlags){if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(43)}if(mmapFlags&2){return 0}MEMFS.stream_ops.write(stream,buffer,0,length,offset,false);return 0}}};function asyncLoad(url,onload,onerror,noRunDep){var dep=!noRunDep?getUniqueRunDependency("al "+url):"";readAsync(url,function(arrayBuffer){assert(arrayBuffer,'Loading data file "'+url+'" failed (no arrayBuffer).');onload(new Uint8Array(arrayBuffer));if(dep)removeRunDependency();},function(event){if(onerror){onerror();}else {throw 'Loading data file "'+url+'" failed.'}});if(dep)addRunDependency();}var IDBFS={dbs:{},indexedDB:function(){if(typeof indexedDB!=="undefined")return indexedDB;var ret=null;if(typeof window==="object")ret=window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB;assert(ret,"IDBFS used, but indexedDB not supported");return ret},DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function(mount){return MEMFS.mount.apply(null,arguments)},syncfs:function(mount,populate,callback){IDBFS.getLocalSet(mount,function(err,local){if(err)return callback(err);IDBFS.getRemoteSet(mount,function(err,remote){if(err)return callback(err);var src=populate?remote:local;var dst=populate?local:remote;IDBFS.reconcile(src,dst,callback);});});},getDB:function(name,callback){var db=IDBFS.dbs[name];if(db){return callback(null,db)}var req;try{req=IDBFS.indexedDB().open(name,IDBFS.DB_VERSION);}catch(e){return callback(e)}if(!req){return callback("Unable to connect to IndexedDB")}req.onupgradeneeded=function(e){var db=e.target.result;var transaction=e.target.transaction;var fileStore;if(db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)){fileStore=transaction.objectStore(IDBFS.DB_STORE_NAME);}else {fileStore=db.createObjectStore(IDBFS.DB_STORE_NAME);}if(!fileStore.indexNames.contains("timestamp")){fileStore.createIndex("timestamp","timestamp",{unique:false});}};req.onsuccess=function(){db=req.result;IDBFS.dbs[name]=db;callback(null,db);};req.onerror=function(e){callback(this.error);e.preventDefault();};},getLocalSet:function(mount,callback){var entries={};function isRealDir(p){return p!=="."&&p!==".."}function toAbsolute(root){return function(p){return PATH.join2(root,p)}}var check=FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));while(check.length){var path=check.pop();var stat;try{stat=FS.stat(path);}catch(e){return callback(e)}if(FS.isDir(stat.mode)){check.push.apply(check,FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));}entries[path]={"timestamp":stat.mtime};}return callback(null,{type:"local",entries:entries})},getRemoteSet:function(mount,callback){var entries={};IDBFS.getDB(mount.mountpoint,function(err,db){if(err)return callback(err);try{var transaction=db.transaction([IDBFS.DB_STORE_NAME],"readonly");transaction.onerror=function(e){callback(this.error);e.preventDefault();};var store=transaction.objectStore(IDBFS.DB_STORE_NAME);var index=store.index("timestamp");index.openKeyCursor().onsuccess=function(event){var cursor=event.target.result;if(!cursor){return callback(null,{type:"remote",db:db,entries:entries})}entries[cursor.primaryKey]={"timestamp":cursor.key};cursor.continue();};}catch(e){return callback(e)}});},loadLocalEntry:function(path,callback){var stat,node;try{var lookup=FS.lookupPath(path);node=lookup.node;stat=FS.stat(path);}catch(e){return callback(e)}if(FS.isDir(stat.mode)){return callback(null,{"timestamp":stat.mtime,"mode":stat.mode})}else if(FS.isFile(stat.mode)){node.contents=MEMFS.getFileDataAsTypedArray(node);return callback(null,{"timestamp":stat.mtime,"mode":stat.mode,"contents":node.contents})}else {return callback(new Error("node type not supported"))}},storeLocalEntry:function(path,entry,callback){try{if(FS.isDir(entry["mode"])){FS.mkdirTree(path,entry["mode"]);}else if(FS.isFile(entry["mode"])){FS.writeFile(path,entry["contents"],{canOwn:true});}else {return callback(new Error("node type not supported"))}FS.chmod(path,entry["mode"]);FS.utime(path,entry["timestamp"],entry["timestamp"]);}catch(e){return callback(e)}callback(null);},removeLocalEntry:function(path,callback){try{var lookup=FS.lookupPath(path);var stat=FS.stat(path);if(FS.isDir(stat.mode)){FS.rmdir(path);}else if(FS.isFile(stat.mode)){FS.unlink(path);}}catch(e){return callback(e)}callback(null);},loadRemoteEntry:function(store,path,callback){var req=store.get(path);req.onsuccess=function(event){callback(null,event.target.result);};req.onerror=function(e){callback(this.error);e.preventDefault();};},storeRemoteEntry:function(store,path,entry,callback){try{var req=store.put(entry,path);}catch(e){callback(e);return}req.onsuccess=function(){callback(null);};req.onerror=function(e){callback(this.error);e.preventDefault();};},removeRemoteEntry:function(store,path,callback){var req=store.delete(path);req.onsuccess=function(){callback(null);};req.onerror=function(e){callback(this.error);e.preventDefault();};},reconcile:function(src,dst,callback){var total=0;var create=[];Object.keys(src.entries).forEach(function(key){var e=src.entries[key];var e2=dst.entries[key];if(!e2||e["timestamp"].getTime()!=e2["timestamp"].getTime()){create.push(key);total++;}});var remove=[];Object.keys(dst.entries).forEach(function(key){if(!src.entries[key]){remove.push(key);total++;}});if(!total){return callback(null)}var errored=false;var db=src.type==="remote"?src.db:dst.db;var transaction=db.transaction([IDBFS.DB_STORE_NAME],"readwrite");var store=transaction.objectStore(IDBFS.DB_STORE_NAME);function done(err){if(err&&!errored){errored=true;return callback(err)}}transaction.onerror=function(e){done(this.error);e.preventDefault();};transaction.oncomplete=function(e){if(!errored){callback(null);}};create.sort().forEach(function(path){if(dst.type==="local"){IDBFS.loadRemoteEntry(store,path,function(err,entry){if(err)return done(err);IDBFS.storeLocalEntry(path,entry,done);});}else {IDBFS.loadLocalEntry(path,function(err,entry){if(err)return done(err);IDBFS.storeRemoteEntry(store,path,entry,done);});}});remove.sort().reverse().forEach(function(path){if(dst.type==="local"){IDBFS.removeLocalEntry(path,done);}else {IDBFS.removeRemoteEntry(store,path,done);}});}};var ERRNO_CODES={};var NODEFS={isWindows:false,staticInit:function(){NODEFS.isWindows=!!process.platform.match(/^win/);var flags=process["binding"]("constants");if(flags["fs"]){flags=flags["fs"];}NODEFS.flagsForNodeMap={1024:flags["O_APPEND"],64:flags["O_CREAT"],128:flags["O_EXCL"],256:flags["O_NOCTTY"],0:flags["O_RDONLY"],2:flags["O_RDWR"],4096:flags["O_SYNC"],512:flags["O_TRUNC"],1:flags["O_WRONLY"]};},convertNodeCode:function(e){var code=e.code;return ERRNO_CODES[code]},mount:function(mount){return NODEFS.createNode(null,"/",NODEFS.getMode(mount.opts.root),0)},createNode:function(parent,name,mode,dev){if(!FS.isDir(mode)&&!FS.isFile(mode)&&!FS.isLink(mode)){throw new FS.ErrnoError(28)}var node=FS.createNode(parent,name,mode);node.node_ops=NODEFS.node_ops;node.stream_ops=NODEFS.stream_ops;return node},getMode:function(path){var stat;try{stat=fs.lstatSync(path);if(NODEFS.isWindows){stat.mode=stat.mode|(stat.mode&292)>>2;}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(NODEFS.convertNodeCode(e))}return stat.mode},realPath:function(node){var parts=[];while(node.parent!==node){parts.push(node.name);node=node.parent;}parts.push(node.mount.opts.root);parts.reverse();return PATH.join.apply(null,parts)},flagsForNode:function(flags){flags&=~2097152;flags&=~2048;flags&=~32768;flags&=~524288;flags&=~65536;var newFlags=0;for(var k in NODEFS.flagsForNodeMap){if(flags&k){newFlags|=NODEFS.flagsForNodeMap[k];flags^=k;}}if(!flags){return newFlags}else {throw new FS.ErrnoError(28)}},node_ops:{getattr:function(node){var path=NODEFS.realPath(node);var stat;try{stat=fs.lstatSync(path);}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(NODEFS.convertNodeCode(e))}if(NODEFS.isWindows&&!stat.blksize){stat.blksize=4096;}if(NODEFS.isWindows&&!stat.blocks){stat.blocks=(stat.size+stat.blksize-1)/stat.blksize|0;}return {dev:stat.dev,ino:stat.ino,mode:stat.mode,nlink:stat.nlink,uid:stat.uid,gid:stat.gid,rdev:stat.rdev,size:stat.size,atime:stat.atime,mtime:stat.mtime,ctime:stat.ctime,blksize:stat.blksize,blocks:stat.blocks}},setattr:function(node,attr){var path=NODEFS.realPath(node);try{if(attr.mode!==undefined){fs.chmodSync(path,attr.mode);node.mode=attr.mode;}if(attr.timestamp!==undefined){var date=new Date(attr.timestamp);fs.utimesSync(path,date,date);}if(attr.size!==undefined){fs.truncateSync(path,attr.size);}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(NODEFS.convertNodeCode(e))}},lookup:function(parent,name){var path=PATH.join2(NODEFS.realPath(parent),name);var mode=NODEFS.getMode(path);return NODEFS.createNode(parent,name,mode)},mknod:function(parent,name,mode,dev){var node=NODEFS.createNode(parent,name,mode,dev);var path=NODEFS.realPath(node);try{if(FS.isDir(node.mode)){fs.mkdirSync(path,node.mode);}else {fs.writeFileSync(path,"",{mode:node.mode});}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(NODEFS.convertNodeCode(e))}return node},rename:function(oldNode,newDir,newName){var oldPath=NODEFS.realPath(oldNode);var newPath=PATH.join2(NODEFS.realPath(newDir),newName);try{fs.renameSync(oldPath,newPath);}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(NODEFS.convertNodeCode(e))}oldNode.name=newName;},unlink:function(parent,name){var path=PATH.join2(NODEFS.realPath(parent),name);try{fs.unlinkSync(path);}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(NODEFS.convertNodeCode(e))}},rmdir:function(parent,name){var path=PATH.join2(NODEFS.realPath(parent),name);try{fs.rmdirSync(path);}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(NODEFS.convertNodeCode(e))}},readdir:function(node){var path=NODEFS.realPath(node);try{return fs.readdirSync(path)}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(NODEFS.convertNodeCode(e))}},symlink:function(parent,newName,oldPath){var newPath=PATH.join2(NODEFS.realPath(parent),newName);try{fs.symlinkSync(oldPath,newPath);}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(NODEFS.convertNodeCode(e))}},readlink:function(node){var path=NODEFS.realPath(node);try{path=fs.readlinkSync(path);path=NODEJS_PATH.relative(NODEJS_PATH.resolve(node.mount.opts.root),path);return path}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(NODEFS.convertNodeCode(e))}}},stream_ops:{open:function(stream){var path=NODEFS.realPath(stream.node);try{if(FS.isFile(stream.node.mode)){stream.nfd=fs.openSync(path,NODEFS.flagsForNode(stream.flags));}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(NODEFS.convertNodeCode(e))}},close:function(stream){try{if(FS.isFile(stream.node.mode)&&stream.nfd){fs.closeSync(stream.nfd);}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(NODEFS.convertNodeCode(e))}},read:function(stream,buffer,offset,length,position){if(length===0)return 0;try{return fs.readSync(stream.nfd,Buffer.from(buffer.buffer),offset,length,position)}catch(e){throw new FS.ErrnoError(NODEFS.convertNodeCode(e))}},write:function(stream,buffer,offset,length,position){try{return fs.writeSync(stream.nfd,Buffer.from(buffer.buffer),offset,length,position)}catch(e){throw new FS.ErrnoError(NODEFS.convertNodeCode(e))}},llseek:function(stream,offset,whence){var position=offset;if(whence===1){position+=stream.position;}else if(whence===2){if(FS.isFile(stream.node.mode)){try{var stat=fs.fstatSync(stream.nfd);position+=stat.size;}catch(e){throw new FS.ErrnoError(NODEFS.convertNodeCode(e))}}}if(position<0){throw new FS.ErrnoError(28)}return position},mmap:function(stream,address,length,position,prot,flags){if(address!==0){throw new FS.ErrnoError(28)}if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(43)}var ptr=mmapAlloc();NODEFS.stream_ops.read(stream,HEAP8,ptr,length,position);return {ptr:ptr,allocated:true}},msync:function(stream,buffer,offset,length,mmapFlags){if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(43)}if(mmapFlags&2){return 0}NODEFS.stream_ops.write(stream,buffer,0,length,offset,false);return 0}}};var FS={root:null,mounts:[],devices:{},streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},filesystems:null,syncFSRequests:0,lookupPath:function(path,opts){path=PATH_FS.resolve(FS.cwd(),path);opts=opts||{};if(!path)return {path:"",node:null};var defaults={follow_mount:true,recurse_count:0};for(var key in defaults){if(opts[key]===undefined){opts[key]=defaults[key];}}if(opts.recurse_count>8){throw new FS.ErrnoError(32)}var parts=PATH.normalizeArray(path.split("/").filter(function(p){return !!p}),false);var current=FS.root;var current_path="/";for(var i=0;i<parts.length;i++){var islast=i===parts.length-1;if(islast&&opts.parent){break}current=FS.lookupNode(current,parts[i]);current_path=PATH.join2(current_path,parts[i]);if(FS.isMountpoint(current)){if(!islast||islast&&opts.follow_mount){current=current.mounted.root;}}if(!islast||opts.follow){var count=0;while(FS.isLink(current.mode)){var link=FS.readlink(current_path);current_path=PATH_FS.resolve(PATH.dirname(current_path),link);var lookup=FS.lookupPath(current_path,{recurse_count:opts.recurse_count});current=lookup.node;if(count++>40){throw new FS.ErrnoError(32)}}}}return {path:current_path,node:current}},getPath:function(node){var path;while(true){if(FS.isRoot(node)){var mount=node.mount.mountpoint;if(!path)return mount;return mount[mount.length-1]!=="/"?mount+"/"+path:mount+path}path=path?node.name+"/"+path:node.name;node=node.parent;}},hashName:function(parentid,name){var hash=0;for(var i=0;i<name.length;i++){hash=(hash<<5)-hash+name.charCodeAt(i)|0;}return (parentid+hash>>>0)%FS.nameTable.length},hashAddNode:function(node){var hash=FS.hashName(node.parent.id,node.name);node.name_next=FS.nameTable[hash];FS.nameTable[hash]=node;},hashRemoveNode:function(node){var hash=FS.hashName(node.parent.id,node.name);if(FS.nameTable[hash]===node){FS.nameTable[hash]=node.name_next;}else {var current=FS.nameTable[hash];while(current){if(current.name_next===node){current.name_next=node.name_next;break}current=current.name_next;}}},lookupNode:function(parent,name){var errCode=FS.mayLookup(parent);if(errCode){throw new FS.ErrnoError(errCode,parent)}var hash=FS.hashName(parent.id,name);for(var node=FS.nameTable[hash];node;node=node.name_next){var nodeName=node.name;if(node.parent.id===parent.id&&nodeName===name){return node}}return FS.lookup(parent,name)},createNode:function(parent,name,mode,rdev){var node=new FS.FSNode(parent,name,mode,rdev);FS.hashAddNode(node);return node},destroyNode:function(node){FS.hashRemoveNode(node);},isRoot:function(node){return node===node.parent},isMountpoint:function(node){return !!node.mounted},isFile:function(mode){return (mode&61440)===32768},isDir:function(mode){return (mode&61440)===16384},isLink:function(mode){return (mode&61440)===40960},isChrdev:function(mode){return (mode&61440)===8192},isBlkdev:function(mode){return (mode&61440)===24576},isFIFO:function(mode){return (mode&61440)===4096},isSocket:function(mode){return (mode&49152)===49152},flagModes:{"r":0,"r+":2,"w":577,"w+":578,"a":1089,"a+":1090},modeStringToFlags:function(str){var flags=FS.flagModes[str];if(typeof flags==="undefined"){throw new Error("Unknown file open mode: "+str)}return flags},flagsToPermissionString:function(flag){var perms=["r","w","rw"][flag&3];if(flag&512){perms+="w";}return perms},nodePermissions:function(node,perms){if(FS.ignorePermissions){return 0}if(perms.includes("r")&&!(node.mode&292)){return 2}else if(perms.includes("w")&&!(node.mode&146)){return 2}else if(perms.includes("x")&&!(node.mode&73)){return 2}return 0},mayLookup:function(dir){var errCode=FS.nodePermissions(dir,"x");if(errCode)return errCode;if(!dir.node_ops.lookup)return 2;return 0},mayCreate:function(dir,name){try{var node=FS.lookupNode(dir,name);return 20}catch(e){}return FS.nodePermissions(dir,"wx")},mayDelete:function(dir,name,isdir){var node;try{node=FS.lookupNode(dir,name);}catch(e){return e.errno}var errCode=FS.nodePermissions(dir,"wx");if(errCode){return errCode}if(isdir){if(!FS.isDir(node.mode)){return 54}if(FS.isRoot(node)||FS.getPath(node)===FS.cwd()){return 10}}else {if(FS.isDir(node.mode)){return 31}}return 0},mayOpen:function(node,flags){if(!node){return 44}if(FS.isLink(node.mode)){return 32}else if(FS.isDir(node.mode)){if(FS.flagsToPermissionString(flags)!=="r"||flags&512){return 31}}return FS.nodePermissions(node,FS.flagsToPermissionString(flags))},MAX_OPEN_FDS:4096,nextfd:function(fd_start,fd_end){fd_start=fd_start||0;fd_end=fd_end||FS.MAX_OPEN_FDS;for(var fd=fd_start;fd<=fd_end;fd++){if(!FS.streams[fd]){return fd}}throw new FS.ErrnoError(33)},getStream:function(fd){return FS.streams[fd]},createStream:function(stream,fd_start,fd_end){if(!FS.FSStream){FS.FSStream=function(){};FS.FSStream.prototype={object:{get:function(){return this.node},set:function(val){this.node=val;}},isRead:{get:function(){return (this.flags&2097155)!==1}},isWrite:{get:function(){return (this.flags&2097155)!==0}},isAppend:{get:function(){return this.flags&1024}}};}var newStream=new FS.FSStream;for(var p in stream){newStream[p]=stream[p];}stream=newStream;var fd=FS.nextfd(fd_start,fd_end);stream.fd=fd;FS.streams[fd]=stream;return stream},closeStream:function(fd){FS.streams[fd]=null;},chrdev_stream_ops:{open:function(stream){var device=FS.getDevice(stream.node.rdev);stream.stream_ops=device.stream_ops;if(stream.stream_ops.open){stream.stream_ops.open(stream);}},llseek:function(){throw new FS.ErrnoError(70)}},major:function(dev){return dev>>8},minor:function(dev){return dev&255},makedev:function(ma,mi){return ma<<8|mi},registerDevice:function(dev,ops){FS.devices[dev]={stream_ops:ops};},getDevice:function(dev){return FS.devices[dev]},getMounts:function(mount){var mounts=[];var check=[mount];while(check.length){var m=check.pop();mounts.push(m);check.push.apply(check,m.mounts);}return mounts},syncfs:function(populate,callback){if(typeof populate==="function"){callback=populate;populate=false;}FS.syncFSRequests++;if(FS.syncFSRequests>1){err("warning: "+FS.syncFSRequests+" FS.syncfs operations in flight at once, probably just doing extra work");}var mounts=FS.getMounts(FS.root.mount);var completed=0;function doCallback(errCode){FS.syncFSRequests--;return callback(errCode)}function done(errCode){if(errCode){if(!done.errored){done.errored=true;return doCallback(errCode)}return}if(++completed>=mounts.length){doCallback(null);}}mounts.forEach(function(mount){if(!mount.type.syncfs){return done(null)}mount.type.syncfs(mount,populate,done);});},mount:function(type,opts,mountpoint){var root=mountpoint==="/";var pseudo=!mountpoint;var node;if(root&&FS.root){throw new FS.ErrnoError(10)}else if(!root&&!pseudo){var lookup=FS.lookupPath(mountpoint,{follow_mount:false});mountpoint=lookup.path;node=lookup.node;if(FS.isMountpoint(node)){throw new FS.ErrnoError(10)}if(!FS.isDir(node.mode)){throw new FS.ErrnoError(54)}}var mount={type:type,opts:opts,mountpoint:mountpoint,mounts:[]};var mountRoot=type.mount(mount);mountRoot.mount=mount;mount.root=mountRoot;if(root){FS.root=mountRoot;}else if(node){node.mounted=mount;if(node.mount){node.mount.mounts.push(mount);}}return mountRoot},unmount:function(mountpoint){var lookup=FS.lookupPath(mountpoint,{follow_mount:false});if(!FS.isMountpoint(lookup.node)){throw new FS.ErrnoError(28)}var node=lookup.node;var mount=node.mounted;var mounts=FS.getMounts(mount);Object.keys(FS.nameTable).forEach(function(hash){var current=FS.nameTable[hash];while(current){var next=current.name_next;if(mounts.includes(current.mount)){FS.destroyNode(current);}current=next;}});node.mounted=null;var idx=node.mount.mounts.indexOf(mount);node.mount.mounts.splice(idx,1);},lookup:function(parent,name){return parent.node_ops.lookup(parent,name)},mknod:function(path,mode,dev){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);if(!name||name==="."||name===".."){throw new FS.ErrnoError(28)}var errCode=FS.mayCreate(parent,name);if(errCode){throw new FS.ErrnoError(errCode)}if(!parent.node_ops.mknod){throw new FS.ErrnoError(63)}return parent.node_ops.mknod(parent,name,mode,dev)},create:function(path,mode){mode=mode!==undefined?mode:438;mode&=4095;mode|=32768;return FS.mknod(path,mode,0)},mkdir:function(path,mode){mode=mode!==undefined?mode:511;mode&=511|512;mode|=16384;return FS.mknod(path,mode,0)},mkdirTree:function(path,mode){var dirs=path.split("/");var d="";for(var i=0;i<dirs.length;++i){if(!dirs[i])continue;d+="/"+dirs[i];try{FS.mkdir(d,mode);}catch(e){if(e.errno!=20)throw e}}},mkdev:function(path,mode,dev){if(typeof dev==="undefined"){dev=mode;mode=438;}mode|=8192;return FS.mknod(path,mode,dev)},symlink:function(oldpath,newpath){if(!PATH_FS.resolve(oldpath)){throw new FS.ErrnoError(44)}var lookup=FS.lookupPath(newpath,{parent:true});var parent=lookup.node;if(!parent){throw new FS.ErrnoError(44)}var newname=PATH.basename(newpath);var errCode=FS.mayCreate(parent,newname);if(errCode){throw new FS.ErrnoError(errCode)}if(!parent.node_ops.symlink){throw new FS.ErrnoError(63)}return parent.node_ops.symlink(parent,newname,oldpath)},rename:function(old_path,new_path){var old_dirname=PATH.dirname(old_path);var new_dirname=PATH.dirname(new_path);var old_name=PATH.basename(old_path);var new_name=PATH.basename(new_path);var lookup,old_dir,new_dir;lookup=FS.lookupPath(old_path,{parent:true});old_dir=lookup.node;lookup=FS.lookupPath(new_path,{parent:true});new_dir=lookup.node;if(!old_dir||!new_dir)throw new FS.ErrnoError(44);if(old_dir.mount!==new_dir.mount){throw new FS.ErrnoError(75)}var old_node=FS.lookupNode(old_dir,old_name);var relative=PATH_FS.relative(old_path,new_dirname);if(relative.charAt(0)!=="."){throw new FS.ErrnoError(28)}relative=PATH_FS.relative(new_path,old_dirname);if(relative.charAt(0)!=="."){throw new FS.ErrnoError(55)}var new_node;try{new_node=FS.lookupNode(new_dir,new_name);}catch(e){}if(old_node===new_node){return}var isdir=FS.isDir(old_node.mode);var errCode=FS.mayDelete(old_dir,old_name,isdir);if(errCode){throw new FS.ErrnoError(errCode)}errCode=new_node?FS.mayDelete(new_dir,new_name,isdir):FS.mayCreate(new_dir,new_name);if(errCode){throw new FS.ErrnoError(errCode)}if(!old_dir.node_ops.rename){throw new FS.ErrnoError(63)}if(FS.isMountpoint(old_node)||new_node&&FS.isMountpoint(new_node)){throw new FS.ErrnoError(10)}if(new_dir!==old_dir){errCode=FS.nodePermissions(old_dir,"w");if(errCode){throw new FS.ErrnoError(errCode)}}FS.hashRemoveNode(old_node);try{old_dir.node_ops.rename(old_node,new_dir,new_name);}catch(e){throw e}finally{FS.hashAddNode(old_node);}},rmdir:function(path){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);var node=FS.lookupNode(parent,name);var errCode=FS.mayDelete(parent,name,true);if(errCode){throw new FS.ErrnoError(errCode)}if(!parent.node_ops.rmdir){throw new FS.ErrnoError(63)}if(FS.isMountpoint(node)){throw new FS.ErrnoError(10)}parent.node_ops.rmdir(parent,name);FS.destroyNode(node);},readdir:function(path){var lookup=FS.lookupPath(path,{follow:true});var node=lookup.node;if(!node.node_ops.readdir){throw new FS.ErrnoError(54)}return node.node_ops.readdir(node)},unlink:function(path){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);var node=FS.lookupNode(parent,name);var errCode=FS.mayDelete(parent,name,false);if(errCode){throw new FS.ErrnoError(errCode)}if(!parent.node_ops.unlink){throw new FS.ErrnoError(63)}if(FS.isMountpoint(node)){throw new FS.ErrnoError(10)}parent.node_ops.unlink(parent,name);FS.destroyNode(node);},readlink:function(path){var lookup=FS.lookupPath(path);var link=lookup.node;if(!link){throw new FS.ErrnoError(44)}if(!link.node_ops.readlink){throw new FS.ErrnoError(28)}return PATH_FS.resolve(FS.getPath(link.parent),link.node_ops.readlink(link))},stat:function(path,dontFollow){var lookup=FS.lookupPath(path,{follow:!dontFollow});var node=lookup.node;if(!node){throw new FS.ErrnoError(44)}if(!node.node_ops.getattr){throw new FS.ErrnoError(63)}return node.node_ops.getattr(node)},lstat:function(path){return FS.stat(path,true)},chmod:function(path,mode,dontFollow){var node;if(typeof path==="string"){var lookup=FS.lookupPath(path,{follow:!dontFollow});node=lookup.node;}else {node=path;}if(!node.node_ops.setattr){throw new FS.ErrnoError(63)}node.node_ops.setattr(node,{mode:mode&4095|node.mode&~4095,timestamp:Date.now()});},lchmod:function(path,mode){FS.chmod(path,mode,true);},fchmod:function(fd,mode){var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(8)}FS.chmod(stream.node,mode);},chown:function(path,uid,gid,dontFollow){var node;if(typeof path==="string"){var lookup=FS.lookupPath(path,{follow:!dontFollow});node=lookup.node;}else {node=path;}if(!node.node_ops.setattr){throw new FS.ErrnoError(63)}node.node_ops.setattr(node,{timestamp:Date.now()});},lchown:function(path,uid,gid){FS.chown(path,uid,gid,true);},fchown:function(fd,uid,gid){var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(8)}FS.chown(stream.node,uid,gid);},truncate:function(path,len){if(len<0){throw new FS.ErrnoError(28)}var node;if(typeof path==="string"){var lookup=FS.lookupPath(path,{follow:true});node=lookup.node;}else {node=path;}if(!node.node_ops.setattr){throw new FS.ErrnoError(63)}if(FS.isDir(node.mode)){throw new FS.ErrnoError(31)}if(!FS.isFile(node.mode)){throw new FS.ErrnoError(28)}var errCode=FS.nodePermissions(node,"w");if(errCode){throw new FS.ErrnoError(errCode)}node.node_ops.setattr(node,{size:len,timestamp:Date.now()});},ftruncate:function(fd,len){var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(8)}if((stream.flags&2097155)===0){throw new FS.ErrnoError(28)}FS.truncate(stream.node,len);},utime:function(path,atime,mtime){var lookup=FS.lookupPath(path,{follow:true});var node=lookup.node;node.node_ops.setattr(node,{timestamp:Math.max(atime,mtime)});},open:function(path,flags,mode,fd_start,fd_end){if(path===""){throw new FS.ErrnoError(44)}flags=typeof flags==="string"?FS.modeStringToFlags(flags):flags;mode=typeof mode==="undefined"?438:mode;if(flags&64){mode=mode&4095|32768;}else {mode=0;}var node;if(typeof path==="object"){node=path;}else {path=PATH.normalize(path);try{var lookup=FS.lookupPath(path,{follow:!(flags&131072)});node=lookup.node;}catch(e){}}var created=false;if(flags&64){if(node){if(flags&128){throw new FS.ErrnoError(20)}}else {node=FS.mknod(path,mode,0);created=true;}}if(!node){throw new FS.ErrnoError(44)}if(FS.isChrdev(node.mode)){flags&=~512;}if(flags&65536&&!FS.isDir(node.mode)){throw new FS.ErrnoError(54)}if(!created){var errCode=FS.mayOpen(node,flags);if(errCode){throw new FS.ErrnoError(errCode)}}if(flags&512){FS.truncate(node,0);}flags&=~(128|512|131072);var stream=FS.createStream({node:node,path:FS.getPath(node),id:node.id,flags:flags,mode:node.mode,seekable:true,position:0,stream_ops:node.stream_ops,node_ops:node.node_ops,ungotten:[],error:false},fd_start,fd_end);if(stream.stream_ops.open){stream.stream_ops.open(stream);}if(Module["logReadFiles"]&&!(flags&1)){if(!FS.readFiles)FS.readFiles={};if(!(path in FS.readFiles)){FS.readFiles[path]=1;}}return stream},close:function(stream){if(FS.isClosed(stream)){throw new FS.ErrnoError(8)}if(stream.getdents)stream.getdents=null;try{if(stream.stream_ops.close){stream.stream_ops.close(stream);}}catch(e){throw e}finally{FS.closeStream(stream.fd);}stream.fd=null;},isClosed:function(stream){return stream.fd===null},llseek:function(stream,offset,whence){if(FS.isClosed(stream)){throw new FS.ErrnoError(8)}if(!stream.seekable||!stream.stream_ops.llseek){throw new FS.ErrnoError(70)}if(whence!=0&&whence!=1&&whence!=2){throw new FS.ErrnoError(28)}stream.position=stream.stream_ops.llseek(stream,offset,whence);stream.ungotten=[];return stream.position},read:function(stream,buffer,offset,length,position){if(length<0||position<0){throw new FS.ErrnoError(28)}if(FS.isClosed(stream)){throw new FS.ErrnoError(8)}if((stream.flags&2097155)===1){throw new FS.ErrnoError(8)}if(FS.isDir(stream.node.mode)){throw new FS.ErrnoError(31)}if(!stream.stream_ops.read){throw new FS.ErrnoError(28)}var seeking=typeof position!=="undefined";if(!seeking){position=stream.position;}else if(!stream.seekable){throw new FS.ErrnoError(70)}var bytesRead=stream.stream_ops.read(stream,buffer,offset,length,position);if(!seeking)stream.position+=bytesRead;return bytesRead},write:function(stream,buffer,offset,length,position,canOwn){if(length<0||position<0){throw new FS.ErrnoError(28)}if(FS.isClosed(stream)){throw new FS.ErrnoError(8)}if((stream.flags&2097155)===0){throw new FS.ErrnoError(8)}if(FS.isDir(stream.node.mode)){throw new FS.ErrnoError(31)}if(!stream.stream_ops.write){throw new FS.ErrnoError(28)}if(stream.seekable&&stream.flags&1024){FS.llseek(stream,0,2);}var seeking=typeof position!=="undefined";if(!seeking){position=stream.position;}else if(!stream.seekable){throw new FS.ErrnoError(70)}var bytesWritten=stream.stream_ops.write(stream,buffer,offset,length,position,canOwn);if(!seeking)stream.position+=bytesWritten;return bytesWritten},allocate:function(stream,offset,length){if(FS.isClosed(stream)){throw new FS.ErrnoError(8)}if(offset<0||length<=0){throw new FS.ErrnoError(28)}if((stream.flags&2097155)===0){throw new FS.ErrnoError(8)}if(!FS.isFile(stream.node.mode)&&!FS.isDir(stream.node.mode)){throw new FS.ErrnoError(43)}if(!stream.stream_ops.allocate){throw new FS.ErrnoError(138)}stream.stream_ops.allocate(stream,offset,length);},mmap:function(stream,address,length,position,prot,flags){if((prot&2)!==0&&(flags&2)===0&&(stream.flags&2097155)!==2){throw new FS.ErrnoError(2)}if((stream.flags&2097155)===1){throw new FS.ErrnoError(2)}if(!stream.stream_ops.mmap){throw new FS.ErrnoError(43)}return stream.stream_ops.mmap(stream,address,length,position,prot,flags)},msync:function(stream,buffer,offset,length,mmapFlags){if(!stream||!stream.stream_ops.msync){return 0}return stream.stream_ops.msync(stream,buffer,offset,length,mmapFlags)},munmap:function(stream){return 0},ioctl:function(stream,cmd,arg){if(!stream.stream_ops.ioctl){throw new FS.ErrnoError(59)}return stream.stream_ops.ioctl(stream,cmd,arg)},readFile:function(path,opts){opts=opts||{};opts.flags=opts.flags||0;opts.encoding=opts.encoding||"binary";if(opts.encoding!=="utf8"&&opts.encoding!=="binary"){throw new Error('Invalid encoding type "'+opts.encoding+'"')}var ret;var stream=FS.open(path,opts.flags);var stat=FS.stat(path);var length=stat.size;var buf=new Uint8Array(length);FS.read(stream,buf,0,length,0);if(opts.encoding==="utf8"){ret=UTF8ArrayToString(buf,0);}else if(opts.encoding==="binary"){ret=buf;}FS.close(stream);return ret},writeFile:function(path,data,opts){opts=opts||{};opts.flags=opts.flags||577;var stream=FS.open(path,opts.flags,opts.mode);if(typeof data==="string"){var buf=new Uint8Array(lengthBytesUTF8(data)+1);var actualNumBytes=stringToUTF8Array(data,buf,0,buf.length);FS.write(stream,buf,0,actualNumBytes,undefined,opts.canOwn);}else if(ArrayBuffer.isView(data)){FS.write(stream,data,0,data.byteLength,undefined,opts.canOwn);}else {throw new Error("Unsupported data type")}FS.close(stream);},cwd:function(){return FS.currentPath},chdir:function(path){var lookup=FS.lookupPath(path,{follow:true});if(lookup.node===null){throw new FS.ErrnoError(44)}if(!FS.isDir(lookup.node.mode)){throw new FS.ErrnoError(54)}var errCode=FS.nodePermissions(lookup.node,"x");if(errCode){throw new FS.ErrnoError(errCode)}FS.currentPath=lookup.path;},createDefaultDirectories:function(){FS.mkdir("/tmp");FS.mkdir("/home");FS.mkdir("/home/web_user");},createDefaultDevices:function(){FS.mkdir("/dev");FS.registerDevice(FS.makedev(1,3),{read:function(){return 0},write:function(stream,buffer,offset,length,pos){return length}});FS.mkdev("/dev/null",FS.makedev(1,3));TTY.register(FS.makedev(5,0),TTY.default_tty_ops);TTY.register(FS.makedev(6,0),TTY.default_tty1_ops);FS.mkdev("/dev/tty",FS.makedev(5,0));FS.mkdev("/dev/tty1",FS.makedev(6,0));var random_device=getRandomDevice();FS.createDevice("/dev","random",random_device);FS.createDevice("/dev","urandom",random_device);FS.mkdir("/dev/shm");FS.mkdir("/dev/shm/tmp");},createSpecialDirectories:function(){FS.mkdir("/proc");var proc_self=FS.mkdir("/proc/self");FS.mkdir("/proc/self/fd");FS.mount({mount:function(){var node=FS.createNode(proc_self,"fd",16384|511,73);node.node_ops={lookup:function(parent,name){var fd=+name;var stream=FS.getStream(fd);if(!stream)throw new FS.ErrnoError(8);var ret={parent:null,mount:{mountpoint:"fake"},node_ops:{readlink:function(){return stream.path}}};ret.parent=ret;return ret}};return node}},{},"/proc/self/fd");},createStandardStreams:function(){if(Module["stdin"]){FS.createDevice("/dev","stdin",Module["stdin"]);}else {FS.symlink("/dev/tty","/dev/stdin");}if(Module["stdout"]){FS.createDevice("/dev","stdout",null,Module["stdout"]);}else {FS.symlink("/dev/tty","/dev/stdout");}if(Module["stderr"]){FS.createDevice("/dev","stderr",null,Module["stderr"]);}else {FS.symlink("/dev/tty1","/dev/stderr");}FS.open("/dev/stdin",0);FS.open("/dev/stdout",1);FS.open("/dev/stderr",1);},ensureErrnoError:function(){if(FS.ErrnoError)return;FS.ErrnoError=function ErrnoError(errno,node){this.node=node;this.setErrno=function(errno){this.errno=errno;};this.setErrno(errno);this.message="FS error";};FS.ErrnoError.prototype=new Error;FS.ErrnoError.prototype.constructor=FS.ErrnoError;[44].forEach(function(code){FS.genericErrors[code]=new FS.ErrnoError(code);FS.genericErrors[code].stack="<generic error, no stack>";});},staticInit:function(){FS.ensureErrnoError();FS.nameTable=new Array(4096);FS.mount(MEMFS,{},"/");FS.createDefaultDirectories();FS.createDefaultDevices();FS.createSpecialDirectories();FS.filesystems={"MEMFS":MEMFS,"IDBFS":IDBFS,"NODEFS":NODEFS};},init:function(input,output,error){FS.init.initialized=true;FS.ensureErrnoError();Module["stdin"]=input||Module["stdin"];Module["stdout"]=output||Module["stdout"];Module["stderr"]=error||Module["stderr"];FS.createStandardStreams();},quit:function(){FS.init.initialized=false;var fflush=Module["_fflush"];if(fflush)fflush(0);for(var i=0;i<FS.streams.length;i++){var stream=FS.streams[i];if(!stream){continue}FS.close(stream);}},getMode:function(canRead,canWrite){var mode=0;if(canRead)mode|=292|73;if(canWrite)mode|=146;return mode},findObject:function(path,dontResolveLastLink){var ret=FS.analyzePath(path,dontResolveLastLink);if(ret.exists){return ret.object}else {return null}},analyzePath:function(path,dontResolveLastLink){try{var lookup=FS.lookupPath(path,{follow:!dontResolveLastLink});path=lookup.path;}catch(e){}var ret={isRoot:false,exists:false,error:0,name:null,path:null,object:null,parentExists:false,parentPath:null,parentObject:null};try{var lookup=FS.lookupPath(path,{parent:true});ret.parentExists=true;ret.parentPath=lookup.path;ret.parentObject=lookup.node;ret.name=PATH.basename(path);lookup=FS.lookupPath(path,{follow:!dontResolveLastLink});ret.exists=true;ret.path=lookup.path;ret.object=lookup.node;ret.name=lookup.node.name;ret.isRoot=lookup.path==="/";}catch(e){ret.error=e.errno;}return ret},createPath:function(parent,path,canRead,canWrite){parent=typeof parent==="string"?parent:FS.getPath(parent);var parts=path.split("/").reverse();while(parts.length){var part=parts.pop();if(!part)continue;var current=PATH.join2(parent,part);try{FS.mkdir(current);}catch(e){}parent=current;}return current},createFile:function(parent,name,properties,canRead,canWrite){var path=PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name);var mode=FS.getMode(canRead,canWrite);return FS.create(path,mode)},createDataFile:function(parent,name,data,canRead,canWrite,canOwn){var path=name?PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name):parent;var mode=FS.getMode(canRead,canWrite);var node=FS.create(path,mode);if(data){if(typeof data==="string"){var arr=new Array(data.length);for(var i=0,len=data.length;i<len;++i)arr[i]=data.charCodeAt(i);data=arr;}FS.chmod(node,mode|146);var stream=FS.open(node,577);FS.write(stream,data,0,data.length,0,canOwn);FS.close(stream);FS.chmod(node,mode);}return node},createDevice:function(parent,name,input,output){var path=PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name);var mode=FS.getMode(!!input,!!output);if(!FS.createDevice.major)FS.createDevice.major=64;var dev=FS.makedev(FS.createDevice.major++,0);FS.registerDevice(dev,{open:function(stream){stream.seekable=false;},close:function(stream){if(output&&output.buffer&&output.buffer.length){output(10);}},read:function(stream,buffer,offset,length,pos){var bytesRead=0;for(var i=0;i<length;i++){var result;try{result=input();}catch(e){throw new FS.ErrnoError(29)}if(result===undefined&&bytesRead===0){throw new FS.ErrnoError(6)}if(result===null||result===undefined)break;bytesRead++;buffer[offset+i]=result;}if(bytesRead){stream.node.timestamp=Date.now();}return bytesRead},write:function(stream,buffer,offset,length,pos){for(var i=0;i<length;i++){try{output(buffer[offset+i]);}catch(e){throw new FS.ErrnoError(29)}}if(length){stream.node.timestamp=Date.now();}return i}});return FS.mkdev(path,mode,dev)},forceLoadFile:function(obj){if(obj.isDevice||obj.isFolder||obj.link||obj.contents)return true;if(typeof XMLHttpRequest!=="undefined"){throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.")}else if(read_){try{obj.contents=intArrayFromString(read_(obj.url),true);obj.usedBytes=obj.contents.length;}catch(e){throw new FS.ErrnoError(29)}}else {throw new Error("Cannot load without read() or XMLHttpRequest.")}},createLazyFile:function(parent,name,url,canRead,canWrite){function LazyUint8Array(){this.lengthKnown=false;this.chunks=[];}LazyUint8Array.prototype.get=function LazyUint8Array_get(idx){if(idx>this.length-1||idx<0){return undefined}var chunkOffset=idx%this.chunkSize;var chunkNum=idx/this.chunkSize|0;return this.getter(chunkNum)[chunkOffset]};LazyUint8Array.prototype.setDataGetter=function LazyUint8Array_setDataGetter(getter){this.getter=getter;};LazyUint8Array.prototype.cacheLength=function LazyUint8Array_cacheLength(){var xhr=new XMLHttpRequest;xhr.open("HEAD",url,false);xhr.send(null);if(!(xhr.status>=200&&xhr.status<300||xhr.status===304))throw new Error("Couldn't load "+url+". Status: "+xhr.status);var datalength=Number(xhr.getResponseHeader("Content-length"));var header;var hasByteServing=(header=xhr.getResponseHeader("Accept-Ranges"))&&header==="bytes";var usesGzip=(header=xhr.getResponseHeader("Content-Encoding"))&&header==="gzip";var chunkSize=1024*1024;if(!hasByteServing)chunkSize=datalength;var doXHR=function(from,to){if(from>to)throw new Error("invalid range ("+from+", "+to+") or no bytes requested!");if(to>datalength-1)throw new Error("only "+datalength+" bytes available! programmer error!");var xhr=new XMLHttpRequest;xhr.open("GET",url,false);if(datalength!==chunkSize)xhr.setRequestHeader("Range","bytes="+from+"-"+to);if(typeof Uint8Array!="undefined")xhr.responseType="arraybuffer";if(xhr.overrideMimeType){xhr.overrideMimeType("text/plain; charset=x-user-defined");}xhr.send(null);if(!(xhr.status>=200&&xhr.status<300||xhr.status===304))throw new Error("Couldn't load "+url+". Status: "+xhr.status);if(xhr.response!==undefined){return new Uint8Array(xhr.response||[])}else {return intArrayFromString(xhr.responseText||"",true)}};var lazyArray=this;lazyArray.setDataGetter(function(chunkNum){var start=chunkNum*chunkSize;var end=(chunkNum+1)*chunkSize-1;end=Math.min(end,datalength-1);if(typeof lazyArray.chunks[chunkNum]==="undefined"){lazyArray.chunks[chunkNum]=doXHR(start,end);}if(typeof lazyArray.chunks[chunkNum]==="undefined")throw new Error("doXHR failed!");return lazyArray.chunks[chunkNum]});if(usesGzip||!datalength){chunkSize=datalength=1;datalength=this.getter(0).length;chunkSize=datalength;out("LazyFiles on gzip forces download of the whole file when length is accessed");}this._length=datalength;this._chunkSize=chunkSize;this.lengthKnown=true;};if(typeof XMLHttpRequest!=="undefined"){if(!ENVIRONMENT_IS_WORKER)throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";var lazyArray=new LazyUint8Array;Object.defineProperties(lazyArray,{length:{get:function(){if(!this.lengthKnown){this.cacheLength();}return this._length}},chunkSize:{get:function(){if(!this.lengthKnown){this.cacheLength();}return this._chunkSize}}});var properties={isDevice:false,contents:lazyArray};}else {var properties={isDevice:false,url:url};}var node=FS.createFile(parent,name,properties,canRead,canWrite);if(properties.contents){node.contents=properties.contents;}else if(properties.url){node.contents=null;node.url=properties.url;}Object.defineProperties(node,{usedBytes:{get:function(){return this.contents.length}}});var stream_ops={};var keys=Object.keys(node.stream_ops);keys.forEach(function(key){var fn=node.stream_ops[key];stream_ops[key]=function forceLoadLazyFile(){FS.forceLoadFile(node);return fn.apply(null,arguments)};});stream_ops.read=function stream_ops_read(stream,buffer,offset,length,position){FS.forceLoadFile(node);var contents=stream.node.contents;if(position>=contents.length)return 0;var size=Math.min(contents.length-position,length);if(contents.slice){for(var i=0;i<size;i++){buffer[offset+i]=contents[position+i];}}else {for(var i=0;i<size;i++){buffer[offset+i]=contents.get(position+i);}}return size};node.stream_ops=stream_ops;return node},createPreloadedFile:function(parent,name,url,canRead,canWrite,onload,onerror,dontCreateFile,canOwn,preFinish){Browser.init();var fullname=name?PATH_FS.resolve(PATH.join2(parent,name)):parent;function processData(byteArray){function finish(byteArray){if(preFinish)preFinish();if(!dontCreateFile){FS.createDataFile(parent,name,byteArray,canRead,canWrite,canOwn);}if(onload)onload();removeRunDependency();}var handled=false;Module["preloadPlugins"].forEach(function(plugin){if(handled)return;if(plugin["canHandle"](fullname)){plugin["handle"](byteArray,fullname,finish,function(){if(onerror)onerror();removeRunDependency();});handled=true;}});if(!handled)finish(byteArray);}addRunDependency();if(typeof url=="string"){asyncLoad(url,function(byteArray){processData(byteArray);},onerror);}else {processData(url);}},indexedDB:function(){return window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB},DB_NAME:function(){return "EM_FS_"+window.location.pathname},DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function(paths,onload,onerror){onload=onload||function(){};onerror=onerror||function(){};var indexedDB=FS.indexedDB();try{var openRequest=indexedDB.open(FS.DB_NAME(),FS.DB_VERSION);}catch(e){return onerror(e)}openRequest.onupgradeneeded=function openRequest_onupgradeneeded(){out("creating db");var db=openRequest.result;db.createObjectStore(FS.DB_STORE_NAME);};openRequest.onsuccess=function openRequest_onsuccess(){var db=openRequest.result;var transaction=db.transaction([FS.DB_STORE_NAME],"readwrite");var files=transaction.objectStore(FS.DB_STORE_NAME);var ok=0,fail=0,total=paths.length;function finish(){if(fail==0)onload();else onerror();}paths.forEach(function(path){var putRequest=files.put(FS.analyzePath(path).object.contents,path);putRequest.onsuccess=function putRequest_onsuccess(){ok++;if(ok+fail==total)finish();};putRequest.onerror=function putRequest_onerror(){fail++;if(ok+fail==total)finish();};});transaction.onerror=onerror;};openRequest.onerror=onerror;},loadFilesFromDB:function(paths,onload,onerror){onload=onload||function(){};onerror=onerror||function(){};var indexedDB=FS.indexedDB();try{var openRequest=indexedDB.open(FS.DB_NAME(),FS.DB_VERSION);}catch(e){return onerror(e)}openRequest.onupgradeneeded=onerror;openRequest.onsuccess=function openRequest_onsuccess(){var db=openRequest.result;try{var transaction=db.transaction([FS.DB_STORE_NAME],"readonly");}catch(e){onerror(e);return}var files=transaction.objectStore(FS.DB_STORE_NAME);var ok=0,fail=0,total=paths.length;function finish(){if(fail==0)onload();else onerror();}paths.forEach(function(path){var getRequest=files.get(path);getRequest.onsuccess=function getRequest_onsuccess(){if(FS.analyzePath(path).exists){FS.unlink(path);}FS.createDataFile(PATH.dirname(path),PATH.basename(path),getRequest.result,true,true,true);ok++;if(ok+fail==total)finish();};getRequest.onerror=function getRequest_onerror(){fail++;if(ok+fail==total)finish();};});transaction.onerror=onerror;};openRequest.onerror=onerror;}};var SYSCALLS={mappings:{},DEFAULT_POLLMASK:5,calculateAt:function(dirfd,path,allowEmpty){if(path[0]==="/"){return path}var dir;if(dirfd===-100){dir=FS.cwd();}else {var dirstream=FS.getStream(dirfd);if(!dirstream)throw new FS.ErrnoError(8);dir=dirstream.path;}if(path.length==0){if(!allowEmpty){throw new FS.ErrnoError(44)}return dir}return PATH.join2(dir,path)},doStat:function(func,path,buf){try{var stat=func(path);}catch(e){if(e&&e.node&&PATH.normalize(path)!==PATH.normalize(FS.getPath(e.node))){return -54}throw e}HEAP32[buf>>2]=stat.dev;HEAP32[buf+4>>2]=0;HEAP32[buf+8>>2]=stat.ino;HEAP32[buf+12>>2]=stat.mode;HEAP32[buf+16>>2]=stat.nlink;HEAP32[buf+20>>2]=stat.uid;HEAP32[buf+24>>2]=stat.gid;HEAP32[buf+28>>2]=stat.rdev;HEAP32[buf+32>>2]=0;tempI64=[stat.size>>>0,(tempDouble=stat.size,+Math.abs(tempDouble)>=1?tempDouble>0?(Math.min(+Math.floor(tempDouble/4294967296),4294967295)|0)>>>0:~~+Math.ceil((tempDouble-+(~~tempDouble>>>0))/4294967296)>>>0:0)],HEAP32[buf+40>>2]=tempI64[0],HEAP32[buf+44>>2]=tempI64[1];HEAP32[buf+48>>2]=4096;HEAP32[buf+52>>2]=stat.blocks;HEAP32[buf+56>>2]=stat.atime.getTime()/1e3|0;HEAP32[buf+60>>2]=0;HEAP32[buf+64>>2]=stat.mtime.getTime()/1e3|0;HEAP32[buf+68>>2]=0;HEAP32[buf+72>>2]=stat.ctime.getTime()/1e3|0;HEAP32[buf+76>>2]=0;tempI64=[stat.ino>>>0,(tempDouble=stat.ino,+Math.abs(tempDouble)>=1?tempDouble>0?(Math.min(+Math.floor(tempDouble/4294967296),4294967295)|0)>>>0:~~+Math.ceil((tempDouble-+(~~tempDouble>>>0))/4294967296)>>>0:0)],HEAP32[buf+80>>2]=tempI64[0],HEAP32[buf+84>>2]=tempI64[1];return 0},doMsync:function(addr,stream,len,flags,offset){var buffer=HEAPU8.slice(addr,addr+len);FS.msync(stream,buffer,offset,len,flags);},doMkdir:function(path,mode){path=PATH.normalize(path);if(path[path.length-1]==="/")path=path.substr(0,path.length-1);FS.mkdir(path,mode,0);return 0},doMknod:function(path,mode,dev){switch(mode&61440){case 32768:case 8192:case 24576:case 4096:case 49152:break;default:return -28}FS.mknod(path,mode,dev);return 0},doReadlink:function(path,buf,bufsize){if(bufsize<=0)return -28;var ret=FS.readlink(path);var len=Math.min(bufsize,lengthBytesUTF8(ret));var endChar=HEAP8[buf+len];stringToUTF8(ret,buf,bufsize+1);HEAP8[buf+len]=endChar;return len},doAccess:function(path,amode){if(amode&~7){return -28}var node;var lookup=FS.lookupPath(path,{follow:true});node=lookup.node;if(!node){return -44}var perms="";if(amode&4)perms+="r";if(amode&2)perms+="w";if(amode&1)perms+="x";if(perms&&FS.nodePermissions(node,perms)){return -2}return 0},doDup:function(path,flags,suggestFD){var suggest=FS.getStream(suggestFD);if(suggest)FS.close(suggest);return FS.open(path,flags,0,suggestFD,suggestFD).fd},doReadv:function(stream,iov,iovcnt,offset){var ret=0;for(var i=0;i<iovcnt;i++){var ptr=HEAP32[iov+i*8>>2];var len=HEAP32[iov+(i*8+4)>>2];var curr=FS.read(stream,HEAP8,ptr,len,offset);if(curr<0)return -1;ret+=curr;if(curr<len)break}return ret},doWritev:function(stream,iov,iovcnt,offset){var ret=0;for(var i=0;i<iovcnt;i++){var ptr=HEAP32[iov+i*8>>2];var len=HEAP32[iov+(i*8+4)>>2];var curr=FS.write(stream,HEAP8,ptr,len,offset);if(curr<0)return -1;ret+=curr;}return ret},varargs:undefined,get:function(){SYSCALLS.varargs+=4;var ret=HEAP32[SYSCALLS.varargs-4>>2];return ret},getStr:function(ptr){var ret=UTF8ToString(ptr);return ret},getStreamFromFD:function(fd){var stream=FS.getStream(fd);if(!stream)throw new FS.ErrnoError(8);return stream},get64:function(low,high){return low}};function ___syscall_access(path,amode){try{path=SYSCALLS.getStr(path);return SYSCALLS.doAccess(path,amode)}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return -e.errno}}function ___syscall_chdir(path){try{path=SYSCALLS.getStr(path);FS.chdir(path);return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return -e.errno}}function ___syscall_chmod(path,mode){try{path=SYSCALLS.getStr(path);FS.chmod(path,mode);return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return -e.errno}}function setErrNo(value){HEAP32[___errno_location()>>2]=value;return value}function ___syscall_fcntl64(fd,cmd,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(fd);switch(cmd){case 0:{var arg=SYSCALLS.get();if(arg<0){return -28}var newStream;newStream=FS.open(stream.path,stream.flags,0,arg);return newStream.fd}case 1:case 2:return 0;case 3:return stream.flags;case 4:{var arg=SYSCALLS.get();stream.flags|=arg;return 0}case 12:{var arg=SYSCALLS.get();var offset=0;HEAP16[arg+offset>>1]=2;return 0}case 13:case 14:return 0;case 16:case 8:return -28;case 9:setErrNo(28);return -1;default:{return -28}}}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return -e.errno}}function ___syscall_fstat64(fd,buf){try{var stream=SYSCALLS.getStreamFromFD(fd);return SYSCALLS.doStat(FS.stat,stream.path,buf)}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return -e.errno}}function ___syscall_getcwd(buf,size){try{if(size===0)return -28;var cwd=FS.cwd();var cwdLengthInBytes=lengthBytesUTF8(cwd);if(size<cwdLengthInBytes+1)return -68;stringToUTF8(cwd,buf,size);return buf}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return -e.errno}}function ___syscall_getegid32(){return 0}function ___syscall_getgid32(){return ___syscall_getegid32()}function ___syscall_getuid32(){return ___syscall_getegid32()}function ___syscall_ioctl(fd,op,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(fd);switch(op){case 21509:case 21505:{if(!stream.tty)return -59;return 0}case 21510:case 21511:case 21512:case 21506:case 21507:case 21508:{if(!stream.tty)return -59;return 0}case 21519:{if(!stream.tty)return -59;var argp=SYSCALLS.get();HEAP32[argp>>2]=0;return 0}case 21520:{if(!stream.tty)return -59;return -28}case 21531:{var argp=SYSCALLS.get();return FS.ioctl(stream,op,argp)}case 21523:{if(!stream.tty)return -59;return 0}case 21524:{if(!stream.tty)return -59;return 0}default:abort("bad ioctl syscall "+op);}}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return -e.errno}}function ___syscall_open(path,flags,varargs){SYSCALLS.varargs=varargs;try{var pathname=SYSCALLS.getStr(path);var mode=varargs?SYSCALLS.get():0;var stream=FS.open(pathname,flags,mode);return stream.fd}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return -e.errno}}function ___syscall_rename(old_path,new_path){try{old_path=SYSCALLS.getStr(old_path);new_path=SYSCALLS.getStr(new_path);FS.rename(old_path,new_path);return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return -e.errno}}function ___syscall_stat64(path,buf){try{path=SYSCALLS.getStr(path);return SYSCALLS.doStat(FS.stat,path,buf)}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return -e.errno}}function ___syscall_unlink(path){try{path=SYSCALLS.getStr(path);FS.unlink(path);return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return -e.errno}}function _abort(){abort("");}var readAsmConstArgsArray=[];function readAsmConstArgs(sigPtr,buf){readAsmConstArgsArray.length=0;var ch;buf>>=2;while(ch=HEAPU8[sigPtr++]){var readAsmConstArgsDouble=ch<105;if(readAsmConstArgsDouble&&buf&1)buf++;readAsmConstArgsArray.push(readAsmConstArgsDouble?HEAPF64[buf++>>1]:HEAP32[buf]);++buf;}return readAsmConstArgsArray}function _emscripten_asm_const_int(code,sigPtr,argbuf){var args=readAsmConstArgs(sigPtr,argbuf);return ASM_CONSTS[code].apply(null,args)}var _emscripten_get_now;if(ENVIRONMENT_IS_NODE){_emscripten_get_now=function(){var t=process["hrtime"]();return t[0]*1e3+t[1]/1e6};}else _emscripten_get_now=function(){return performance.now()};function _emscripten_memcpy_big(dest,src,num){HEAPU8.copyWithin(dest,src,src+num);}function abortOnCannotGrowMemory(requestedSize){abort("OOM");}function _emscripten_resize_heap(requestedSize){HEAPU8.length;abortOnCannotGrowMemory();}var ENV={};function getExecutableName(){return thisProgram||"./this.program"}function getEnvStrings(){if(!getEnvStrings.strings){var lang=(typeof navigator==="object"&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8";var env={"USER":"web_user","LOGNAME":"web_user","PATH":"/","PWD":"/","HOME":"/home/web_user","LANG":lang,"_":getExecutableName()};for(var x in ENV){if(ENV[x]===undefined)delete env[x];else env[x]=ENV[x];}var strings=[];for(var x in env){strings.push(x+"="+env[x]);}getEnvStrings.strings=strings;}return getEnvStrings.strings}function _environ_get(__environ,environ_buf){var bufSize=0;getEnvStrings().forEach(function(string,i){var ptr=environ_buf+bufSize;HEAP32[__environ+i*4>>2]=ptr;writeAsciiToMemory(string,ptr);bufSize+=string.length+1;});return 0}function _environ_sizes_get(penviron_count,penviron_buf_size){var strings=getEnvStrings();HEAP32[penviron_count>>2]=strings.length;var bufSize=0;strings.forEach(function(string){bufSize+=string.length+1;});HEAP32[penviron_buf_size>>2]=bufSize;return 0}function _exit(status){exit(status);}function _fd_close(fd){try{var stream=SYSCALLS.getStreamFromFD(fd);FS.close(stream);return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return e.errno}}function _fd_read(fd,iov,iovcnt,pnum){try{var stream=SYSCALLS.getStreamFromFD(fd);var num=SYSCALLS.doReadv(stream,iov,iovcnt);HEAP32[pnum>>2]=num;return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return e.errno}}function _fd_seek(fd,offset_low,offset_high,whence,newOffset){try{var stream=SYSCALLS.getStreamFromFD(fd);var HIGH_OFFSET=4294967296;var offset=offset_high*HIGH_OFFSET+(offset_low>>>0);var DOUBLE_LIMIT=9007199254740992;if(offset<=-DOUBLE_LIMIT||offset>=DOUBLE_LIMIT){return -61}FS.llseek(stream,offset,whence);tempI64=[stream.position>>>0,(tempDouble=stream.position,+Math.abs(tempDouble)>=1?tempDouble>0?(Math.min(+Math.floor(tempDouble/4294967296),4294967295)|0)>>>0:~~+Math.ceil((tempDouble-+(~~tempDouble>>>0))/4294967296)>>>0:0)],HEAP32[newOffset>>2]=tempI64[0],HEAP32[newOffset+4>>2]=tempI64[1];if(stream.getdents&&offset===0&&whence===0)stream.getdents=null;return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return e.errno}}function _fd_write(fd,iov,iovcnt,pnum){try{var stream=SYSCALLS.getStreamFromFD(fd);var num=SYSCALLS.doWritev(stream,iov,iovcnt);HEAP32[pnum>>2]=num;return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return e.errno}}function _mktime(tmPtr){_tzset();var date=new Date(HEAP32[tmPtr+20>>2]+1900,HEAP32[tmPtr+16>>2],HEAP32[tmPtr+12>>2],HEAP32[tmPtr+8>>2],HEAP32[tmPtr+4>>2],HEAP32[tmPtr>>2],0);var dst=HEAP32[tmPtr+32>>2];var guessedOffset=date.getTimezoneOffset();var start=new Date(date.getFullYear(),0,1);var summerOffset=new Date(date.getFullYear(),6,1).getTimezoneOffset();var winterOffset=start.getTimezoneOffset();var dstOffset=Math.min(winterOffset,summerOffset);if(dst<0){HEAP32[tmPtr+32>>2]=Number(summerOffset!=winterOffset&&dstOffset==guessedOffset);}else if(dst>0!=(dstOffset==guessedOffset)){var nonDstOffset=Math.max(winterOffset,summerOffset);var trueOffset=dst>0?dstOffset:nonDstOffset;date.setTime(date.getTime()+(trueOffset-guessedOffset)*6e4);}HEAP32[tmPtr+24>>2]=date.getDay();var yday=(date.getTime()-start.getTime())/(1e3*60*60*24)|0;HEAP32[tmPtr+28>>2]=yday;HEAP32[tmPtr>>2]=date.getSeconds();HEAP32[tmPtr+4>>2]=date.getMinutes();HEAP32[tmPtr+8>>2]=date.getHours();HEAP32[tmPtr+12>>2]=date.getDate();HEAP32[tmPtr+16>>2]=date.getMonth();return date.getTime()/1e3|0}function _time(ptr){var ret=Date.now()/1e3|0;if(ptr){HEAP32[ptr>>2]=ret;}return ret}function runAndAbortIfError(func){try{return func()}catch(e){abort(e);}}function callUserCallback(func,synchronous){if(runtimeExited||ABORT){return}if(synchronous){func();return}try{func();}catch(e){handleException(e);}}function runtimeKeepalivePush(){runtimeKeepaliveCounter+=1;}function runtimeKeepalivePop(){runtimeKeepaliveCounter-=1;}var Asyncify={State:{Normal:0,Unwinding:1,Rewinding:2,Disabled:3},state:0,StackSize:4096,currData:null,handleSleepReturnValue:0,exportCallStack:[],callStackNameToId:{},callStackIdToName:{},callStackId:0,asyncPromiseHandlers:null,sleepCallbacks:[],getCallStackId:function(funcName){var id=Asyncify.callStackNameToId[funcName];if(id===undefined){id=Asyncify.callStackId++;Asyncify.callStackNameToId[funcName]=id;Asyncify.callStackIdToName[id]=funcName;}return id},instrumentWasmExports:function(exports){var ret={};for(var x in exports){(function(x){var original=exports[x];if(typeof original==="function"){ret[x]=function(){Asyncify.exportCallStack.push(x);try{return original.apply(null,arguments)}finally{if(!ABORT){var y=Asyncify.exportCallStack.pop();assert(y===x);Asyncify.maybeStopUnwind();}}};}else {ret[x]=original;}})(x);}return ret},maybeStopUnwind:function(){if(Asyncify.currData&&Asyncify.state===Asyncify.State.Unwinding&&Asyncify.exportCallStack.length===0){Asyncify.state=Asyncify.State.Normal;runAndAbortIfError(Module["_asyncify_stop_unwind"]);if(typeof Fibers!=="undefined"){Fibers.trampoline();}}},whenDone:function(){return new Promise(function(resolve,reject){Asyncify.asyncPromiseHandlers={resolve:resolve,reject:reject};})},allocateData:function(){var ptr=_malloc(12+Asyncify.StackSize);Asyncify.setDataHeader(ptr,ptr+12,Asyncify.StackSize);Asyncify.setDataRewindFunc(ptr);return ptr},setDataHeader:function(ptr,stack,stackSize){HEAP32[ptr>>2]=stack;HEAP32[ptr+4>>2]=stack+stackSize;},setDataRewindFunc:function(ptr){var bottomOfCallStack=Asyncify.exportCallStack[0];var rewindId=Asyncify.getCallStackId(bottomOfCallStack);HEAP32[ptr+8>>2]=rewindId;},getDataRewindFunc:function(ptr){var id=HEAP32[ptr+8>>2];var name=Asyncify.callStackIdToName[id];var func=Module["asm"][name];return func},doRewind:function(ptr){var start=Asyncify.getDataRewindFunc(ptr);return start()},handleSleep:function(startAsync){if(ABORT)return;if(Asyncify.state===Asyncify.State.Normal){var reachedCallback=false;var reachedAfterCallback=false;startAsync(function(handleSleepReturnValue){if(ABORT)return;Asyncify.handleSleepReturnValue=handleSleepReturnValue||0;reachedCallback=true;if(!reachedAfterCallback){return}Asyncify.state=Asyncify.State.Rewinding;runAndAbortIfError(function(){Module["_asyncify_start_rewind"](Asyncify.currData);});if(typeof Browser!=="undefined"&&Browser.mainLoop.func){Browser.mainLoop.resume();}var asyncWasmReturnValue,isError=false;try{asyncWasmReturnValue=Asyncify.doRewind(Asyncify.currData);}catch(err){asyncWasmReturnValue=err;isError=true;}var handled=false;if(!Asyncify.currData){var asyncPromiseHandlers=Asyncify.asyncPromiseHandlers;if(asyncPromiseHandlers){Asyncify.asyncPromiseHandlers=null;(isError?asyncPromiseHandlers.reject:asyncPromiseHandlers.resolve)(asyncWasmReturnValue);handled=true;}}if(isError&&!handled){throw asyncWasmReturnValue}});reachedAfterCallback=true;if(!reachedCallback){Asyncify.state=Asyncify.State.Unwinding;Asyncify.currData=Asyncify.allocateData();runAndAbortIfError(function(){Module["_asyncify_start_unwind"](Asyncify.currData);});if(typeof Browser!=="undefined"&&Browser.mainLoop.func){Browser.mainLoop.pause();}}}else if(Asyncify.state===Asyncify.State.Rewinding){Asyncify.state=Asyncify.State.Normal;runAndAbortIfError(Module["_asyncify_stop_rewind"]);_free(Asyncify.currData);Asyncify.currData=null;Asyncify.sleepCallbacks.forEach(function(func){callUserCallback(func);});}else {abort("invalid state: "+Asyncify.state);}return Asyncify.handleSleepReturnValue},handleAsync:function(startAsync){return Asyncify.handleSleep(function(wakeUp){startAsync().then(wakeUp);})}};var FSNode=function(parent,name,mode,rdev){if(!parent){parent=this;}this.parent=parent;this.mount=parent.mount;this.mounted=null;this.id=FS.nextInode++;this.name=name;this.mode=mode;this.node_ops={};this.stream_ops={};this.rdev=rdev;};var readMode=292|73;var writeMode=146;Object.defineProperties(FSNode.prototype,{read:{get:function(){return (this.mode&readMode)===readMode},set:function(val){val?this.mode|=readMode:this.mode&=~readMode;}},write:{get:function(){return (this.mode&writeMode)===writeMode},set:function(val){val?this.mode|=writeMode:this.mode&=~writeMode;}},isFolder:{get:function(){return FS.isDir(this.mode)}},isDevice:{get:function(){return FS.isChrdev(this.mode)}}});FS.FSNode=FSNode;FS.staticInit();Module["FS_createPath"]=FS.createPath;Module["FS_createDataFile"]=FS.createDataFile;Module["FS_createPreloadedFile"]=FS.createPreloadedFile;Module["FS_createLazyFile"]=FS.createLazyFile;Module["FS_createDevice"]=FS.createDevice;Module["FS_unlink"]=FS.unlink;if(ENVIRONMENT_IS_NODE){var fs=require$$0;var NODEJS_PATH=require$$1;NODEFS.staticInit();}ERRNO_CODES={"EPERM":63,"ENOENT":44,"ESRCH":71,"EINTR":27,"EIO":29,"ENXIO":60,"E2BIG":1,"ENOEXEC":45,"EBADF":8,"ECHILD":12,"EAGAIN":6,"EWOULDBLOCK":6,"ENOMEM":48,"EACCES":2,"EFAULT":21,"ENOTBLK":105,"EBUSY":10,"EEXIST":20,"EXDEV":75,"ENODEV":43,"ENOTDIR":54,"EISDIR":31,"EINVAL":28,"ENFILE":41,"EMFILE":33,"ENOTTY":59,"ETXTBSY":74,"EFBIG":22,"ENOSPC":51,"ESPIPE":70,"EROFS":69,"EMLINK":34,"EPIPE":64,"EDOM":18,"ERANGE":68,"ENOMSG":49,"EIDRM":24,"ECHRNG":106,"EL2NSYNC":156,"EL3HLT":107,"EL3RST":108,"ELNRNG":109,"EUNATCH":110,"ENOCSI":111,"EL2HLT":112,"EDEADLK":16,"ENOLCK":46,"EBADE":113,"EBADR":114,"EXFULL":115,"ENOANO":104,"EBADRQC":103,"EBADSLT":102,"EDEADLOCK":16,"EBFONT":101,"ENOSTR":100,"ENODATA":116,"ETIME":117,"ENOSR":118,"ENONET":119,"ENOPKG":120,"EREMOTE":121,"ENOLINK":47,"EADV":122,"ESRMNT":123,"ECOMM":124,"EPROTO":65,"EMULTIHOP":36,"EDOTDOT":125,"EBADMSG":9,"ENOTUNIQ":126,"EBADFD":127,"EREMCHG":128,"ELIBACC":129,"ELIBBAD":130,"ELIBSCN":131,"ELIBMAX":132,"ELIBEXEC":133,"ENOSYS":52,"ENOTEMPTY":55,"ENAMETOOLONG":37,"ELOOP":32,"EOPNOTSUPP":138,"EPFNOSUPPORT":139,"ECONNRESET":15,"ENOBUFS":42,"EAFNOSUPPORT":5,"EPROTOTYPE":67,"ENOTSOCK":57,"ENOPROTOOPT":50,"ESHUTDOWN":140,"ECONNREFUSED":14,"EADDRINUSE":3,"ECONNABORTED":13,"ENETUNREACH":40,"ENETDOWN":38,"ETIMEDOUT":73,"EHOSTDOWN":142,"EHOSTUNREACH":23,"EINPROGRESS":26,"EALREADY":7,"EDESTADDRREQ":17,"EMSGSIZE":35,"EPROTONOSUPPORT":66,"ESOCKTNOSUPPORT":137,"EADDRNOTAVAIL":4,"ENETRESET":39,"EISCONN":30,"ENOTCONN":53,"ETOOMANYREFS":141,"EUSERS":136,"EDQUOT":19,"ESTALE":72,"ENOTSUP":138,"ENOMEDIUM":148,"EILSEQ":25,"EOVERFLOW":61,"ECANCELED":11,"ENOTRECOVERABLE":56,"EOWNERDEAD":62,"ESTRPIPE":135};function intArrayFromString(stringy,dontAddNull,length){var len=length>0?length:lengthBytesUTF8(stringy)+1;var u8array=new Array(len);var numBytesWritten=stringToUTF8Array(stringy,u8array,0,u8array.length);if(dontAddNull)u8array.length=numBytesWritten;return u8array}var asmLibraryArg={"x":___localtime_r,"y":___syscall_access,"C":___syscall_chdir,"G":___syscall_chmod,"k":___syscall_fcntl64,"E":___syscall_fstat64,"z":___syscall_getcwd,"A":___syscall_getgid32,"d":___syscall_getuid32,"m":___syscall_ioctl,"o":___syscall_open,"D":___syscall_rename,"F":___syscall_stat64,"B":___syscall_unlink,"p":_abort,"f":create_global,"g":_emscripten_asm_const_int,"l":_emscripten_get_now,"t":_emscripten_memcpy_big,"u":_emscripten_resize_heap,"v":_environ_get,"w":_environ_sizes_get,"h":_exit,"j":_fd_close,"n":_fd_read,"s":_fd_seek,"i":_fd_write,"q":js_helpers_init,"b":local_callback,"r":_mktime,"a":set_const,"K":shim_add_menu,"J":shim_cliparound,"L":shim_curs,"M":shim_print_tile,"e":shim_putstr,"I":shim_status_enablefield,"H":shim_status_update,"c":_time};createWasm();Module["___wasm_call_ctors"]=function(){return (Module["___wasm_call_ctors"]=Module["asm"]["O"]).apply(null,arguments)};var _malloc=Module["_malloc"]=function(){return (_malloc=Module["_malloc"]=Module["asm"]["Q"]).apply(null,arguments)};var _free=Module["_free"]=function(){return (_free=Module["_free"]=Module["asm"]["R"]).apply(null,arguments)};var ___errno_location=Module["___errno_location"]=function(){return (___errno_location=Module["___errno_location"]=Module["asm"]["S"]).apply(null,arguments)};Module["_main"]=function(){return (Module["_main"]=Module["asm"]["T"]).apply(null,arguments)};Module["_glyph_to_tile"]=function(){return (Module["_glyph_to_tile"]=Module["asm"]["U"]).apply(null,arguments)};Module["_shim_graphics_set_callback"]=function(){return (Module["_shim_graphics_set_callback"]=Module["asm"]["V"]).apply(null,arguments)};var __get_tzname=Module["__get_tzname"]=function(){return (__get_tzname=Module["__get_tzname"]=Module["asm"]["W"]).apply(null,arguments)};var __get_daylight=Module["__get_daylight"]=function(){return (__get_daylight=Module["__get_daylight"]=Module["asm"]["X"]).apply(null,arguments)};var __get_timezone=Module["__get_timezone"]=function(){return (__get_timezone=Module["__get_timezone"]=Module["asm"]["Y"]).apply(null,arguments)};var stackSave=Module["stackSave"]=function(){return (stackSave=Module["stackSave"]=Module["asm"]["Z"]).apply(null,arguments)};var stackRestore=Module["stackRestore"]=function(){return (stackRestore=Module["stackRestore"]=Module["asm"]["_"]).apply(null,arguments)};var stackAlloc=Module["stackAlloc"]=function(){return (stackAlloc=Module["stackAlloc"]=Module["asm"]["$"]).apply(null,arguments)};var dynCall_vi=Module["dynCall_vi"]=function(){return (dynCall_vi=Module["dynCall_vi"]=Module["asm"]["aa"]).apply(null,arguments)};var dynCall_v=Module["dynCall_v"]=function(){return (dynCall_v=Module["dynCall_v"]=Module["asm"]["ba"]).apply(null,arguments)};Module["_asyncify_start_unwind"]=function(){return (Module["_asyncify_start_unwind"]=Module["asm"]["ca"]).apply(null,arguments)};Module["_asyncify_stop_unwind"]=function(){return (Module["_asyncify_stop_unwind"]=Module["asm"]["da"]).apply(null,arguments)};Module["_asyncify_start_rewind"]=function(){return (Module["_asyncify_start_rewind"]=Module["asm"]["ea"]).apply(null,arguments)};Module["_asyncify_stop_rewind"]=function(){return (Module["_asyncify_stop_rewind"]=Module["asm"]["fa"]).apply(null,arguments)};Module["ccall"]=ccall;Module["cwrap"]=cwrap;Module["setValue"]=setValue;Module["getValue"]=getValue;Module["UTF8ToString"]=UTF8ToString;Module["addRunDependency"]=addRunDependency;Module["removeRunDependency"]=removeRunDependency;Module["FS_createPath"]=FS.createPath;Module["FS_createDataFile"]=FS.createDataFile;Module["FS_createPreloadedFile"]=FS.createPreloadedFile;Module["FS_createLazyFile"]=FS.createLazyFile;Module["FS_createDevice"]=FS.createDevice;Module["FS_unlink"]=FS.unlink;Module["addFunction"]=addFunction;Module["removeFunction"]=removeFunction;Module["ENV"]=ENV;Module["FS"]=FS;Module["IDBFS"]=IDBFS;var calledRun;function ExitStatus(status){this.name="ExitStatus";this.message="Program terminated with exit("+status+")";this.status=status;}dependenciesFulfilled=function runCaller(){if(!calledRun)run();if(!calledRun)dependenciesFulfilled=runCaller;};function callMain(args){var entryFunction=Module["_main"];args=args||[];var argc=args.length+1;var argv=stackAlloc((argc+1)*4);HEAP32[argv>>2]=allocateUTF8OnStack(thisProgram);for(var i=1;i<argc;i++){HEAP32[(argv>>2)+i]=allocateUTF8OnStack(args[i-1]);}HEAP32[(argv>>2)+argc]=0;try{var ret=entryFunction(argc,argv);exit(ret,true);return ret}catch(e){return handleException(e)}finally{}}function run(args){args=args||arguments_;if(runDependencies>0){return}preRun();if(runDependencies>0){return}function doRun(){if(calledRun)return;calledRun=true;Module["calledRun"]=true;if(ABORT)return;initRuntime();preMain();readyPromiseResolve(Module);if(Module["onRuntimeInitialized"])Module["onRuntimeInitialized"]();if(shouldRunNow)callMain(args);postRun();}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout(function(){setTimeout(function(){Module["setStatus"]("");},1);doRun();},1);}else {doRun();}}Module["run"]=run;function exit(status,implicit){EXITSTATUS=status;if(keepRuntimeAlive());else {exitRuntime();}procExit(status);}function procExit(code){EXITSTATUS=code;if(!keepRuntimeAlive()){if(Module["onExit"])Module["onExit"](code);ABORT=true;}quit_(code,new ExitStatus(code));}if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()();}}var shouldRunNow=true;if(Module["noInitialRun"])shouldRunNow=false;run();


	  return Module.ready
	}
	);
	})();
	module.exports = Module; 
} (nethack));

var nethackExports = nethack.exports;
var nethackLib = /*@__PURE__*/getDefaultExportFromCjs(nethackExports);

var Command;
(function (Command) {
    Command["YN_FUNCTION"] = "shim_yn_function";
    Command["GET_CHAR"] = "shim_nhgetch";
    Command["GET_NH_EVENT"] = "shim_get_nh_event";
    Command["GET_POSKEY"] = "shim_nh_poskey";
    Command["ASK_NAME"] = "shim_askname";
    Command["GET_LINE"] = "shim_getlin";
    Command["GET_EXT_CMD"] = "shim_get_ext_cmd_helper";
    Command["GET_HISTORY"] = "shim_getmsghistory";
    Command["MESSAGE_MENU"] = "shim_message_menu";
    Command["DELAY_OUTPUT"] = "shim_delay_output";
    Command["STATUS_INIT"] = "shim_status_init";
    Command["STATUS_UPDATE"] = "shim_status_update";
    Command["STATUS_ENABLE_FIELD"] = "shim_status_enablefield";
    Command["CREATE_WINDOW"] = "shim_create_nhwindow";
    Command["DESTROY_WINDOW"] = "shim_destroy_nhwindow";
    Command["DISPLAY_WINDOW"] = "shim_display_nhwindow";
    Command["CLEAR_WINDOW"] = "shim_clear_nhwindow";
    Command["EXIT_WINDOWS"] = "shim_exit_nhwindows";
    Command["MENU_START"] = "shim_start_menu";
    Command["MENU_END"] = "shim_end_menu";
    Command["MENU_ADD"] = "shim_add_menu";
    Command["MENU_SELECT"] = "shim_select_menu";
    Command["PRINT_GLYPH"] = "shim_print_glyph";
    Command["CURSOR"] = "shim_curs";
    Command["CLIPAROUND"] = "shim_cliparound";
    Command["PUTSTR"] = "shim_putstr";
    Command["RAW_PRINT"] = "shim_raw_print";
    Command["RAW_PRINT_BOLD"] = "shim_raw_print_bold";
    Command["DISPLAY_FILE"] = "shim_display_file";
    Command["GAME_END"] = "shim_game_end";
})(Command || (Command = {}));
var ItemFlag;
(function (ItemFlag) {
    ItemFlag[ItemFlag["NONE"] = 0] = "NONE";
    ItemFlag[ItemFlag["SELECTED"] = 1] = "SELECTED";
    ItemFlag[ItemFlag["SKIPINVERT"] = 2] = "SKIPINVERT";
})(ItemFlag || (ItemFlag = {}));
const statusMap = {
    [STATUS_FIELD.BL_TITLE]: (s, v) => (s.title = v),
    [STATUS_FIELD.BL_STR]: (s, v) => (s.str = v),
    [STATUS_FIELD.BL_DX]: (s, v) => (s.dex = v),
    [STATUS_FIELD.BL_CO]: (s, v) => (s.con = v),
    [STATUS_FIELD.BL_IN]: (s, v) => (s.int = v),
    [STATUS_FIELD.BL_WI]: (s, v) => (s.wis = v),
    [STATUS_FIELD.BL_CH]: (s, v) => (s.cha = v),
    [STATUS_FIELD.BL_ALIGN]: (s, v) => (s.align = v),
    [STATUS_FIELD.BL_SCORE]: (s, v) => (s.score = v),
    [STATUS_FIELD.BL_CAP]: (s, v) => (s.carryCap = v),
    [STATUS_FIELD.BL_GOLD]: (s, v) => {
        if (v) {
            v.text = v.text.split(':')[1];
        }
        s.gold = v;
    },
    [STATUS_FIELD.BL_ENE]: (s, v) => (s.power = v),
    [STATUS_FIELD.BL_ENEMAX]: (s, v) => (s.powerMax = v),
    [STATUS_FIELD.BL_EXP]: (s, v) => (s.exp = v),
    [STATUS_FIELD.BL_AC]: (s, v) => (s.armor = v),
    [STATUS_FIELD.BL_HUNGER]: (s, v) => (s.hunger = v),
    [STATUS_FIELD.BL_HP]: (s, v) => (s.hp = v),
    [STATUS_FIELD.BL_HPMAX]: (s, v) => (s.hpMax = v),
    [STATUS_FIELD.BL_LEVELDESC]: (s, v) => (s.dungeonLvl = v),
    [STATUS_FIELD.BL_XP]: (s, v) => (s.expLvl = v),
    [STATUS_FIELD.BL_CONDITION]: (s, v) => {
        // if (v) {
        //   const cond = parseNumberOrUndefined(v.text);
        //   v.text = conditionMap[cond as CONDITION] ?? v.text;
        // }
        // s.condition = v;
    },
    // [STATUS_FIELD.BL_CHARACTERISTICS]: () => {},
    // [STATUS_FIELD.BL_RESET]: () => {},
    [STATUS_FIELD.BL_FLUSH]: () => { },
    [STATUS_FIELD.BL_HD]: (s, v) => (s.hd = v),
    [STATUS_FIELD.BL_TIME]: (s, v) => (s.time = v),
    // [STATUS_FIELD.MAXBLSTATS]: () => {},
};
// See mswproc.c
const conditionMap = {
    [CONDITION.BL_MASK_BLIND]: 'Blind',
    [CONDITION.BL_MASK_CONF]: 'Conf',
    [CONDITION.BL_MASK_DEAF]: 'Deaf',
    [CONDITION.BL_MASK_FLY]: 'Fly',
    [CONDITION.BL_MASK_FOODPOIS]: 'FoodPois',
    [CONDITION.BL_MASK_HALLU]: 'Hallu',
    [CONDITION.BL_MASK_LEV]: 'Lev',
    [CONDITION.BL_MASK_RIDE]: 'Ride',
    [CONDITION.BL_MASK_SLIME]: 'Slime',
    [CONDITION.BL_MASK_STONE]: 'Stone',
    [CONDITION.BL_MASK_STRNGL]: 'Strngl',
    [CONDITION.BL_MASK_STUN]: 'Stun',
    [CONDITION.BL_MASK_TERMILL]: 'TermIll',
    // [CONDITION.BL_MASK_BAREH]: "Bare",
    // [CONDITION.BL_MASK_BUSY]: "Busy",
    // [CONDITION.BL_MASK_ELF_IRON]: "Iron",
    // [CONDITION.BL_MASK_GLOWHANDS]: "Glow",
    // [CONDITION.BL_MASK_GRAB]: "Grab",
    // [CONDITION.BL_MASK_HELD]: "Held",
    // [CONDITION.BL_MASK_ICY]: "Icy",
    // [CONDITION.BL_MASK_INLAVA]: "Lava",
    // [CONDITION.BL_MASK_TETHERED]: "Teth",
    // [CONDITION.BL_MASK_TRAPPED]: "Trap",
    // [CONDITION.BL_MASK_UNCONSC]: "Out",
    // [CONDITION.BL_MASK_WOUNDEDL]: "Legs",
    // [CONDITION.BL_MASK_HOLDING]: "Uhold",
    // [CONDITION.BL_MASK_SLIPPERY]: "Slip",
    // [CONDITION.BL_MASK_PARLYZ]: "Parlyz",
    // [CONDITION.BL_MASK_SLEEPING]: "Zzz",
    // [CONDITION.BL_MASK_SUBMERGED]: "Sub",
};

class AccelIterator {
    constructor() {
        this.start = 'a'.charCodeAt(0);
        this.end = 'z'.charCodeAt(0);
        this.start2 = 'A'.charCodeAt(0);
        this.end2 = 'Z'.charCodeAt(0);
        // Hopefully there won't be more that this
        this.start3 = '0'.charCodeAt(0);
        this.end3 = '9'.charCodeAt(0);
        this.current = this.start;
    }
    nextChar() {
        return String.fromCharCode(this.next());
    }
    next() {
        const accel = this.current;
        if (accel === this.end) {
            this.current = this.start2;
        }
        else if (accel === this.end2) {
            this.current = this.start3;
        }
        else {
            this.current += 1;
        }
        return accel;
    }
    reset() {
        this.current = this.start;
    }
}

const EMPTY_ITEM = {
    tile: 0,
    groupAcc: 0,
    attr: 0,
    accelerator: 0,
    str: '',
    identifier: 0,
    active: false,
};
function setAccelerators(items, accel) {
    accel.reset();
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.identifier !== 0) {
            if (item.accelerator === 0) {
                item.accelerator = accel.next();
            }
        }
        else if (i < items.length - 1) {
            const nextItem = items[i + 1];
            if (nextItem.groupAcc) {
                item.accelerator = nextItem.groupAcc;
            }
        }
    }
}
function clearMenuItems(items) {
    items.forEach((i) => (i.active = false));
}
const SELECT_ALL = '.'.charCodeAt(0);
const DESELECT_ALL = '-'.charCodeAt(0);
const TOGGLE_ALL = '@'.charCodeAt(0);
function toggleMenuItems(accel, count, menuSelect, items) {
    const selectable = items.filter((i) => i.identifier !== 0 && i.accelerator !== 0);
    const selected = selectable.findIndex((i) => i.accelerator === accel);
    if (selected !== -1) {
        if (menuSelect === MENU_SELECT.PICK_ONE) {
            clearMenuItems(selectable);
        }
        const item = selectable[selected];
        let c = count;
        if (count === 0 || isNaN(count)) {
            c = undefined;
        }
        item.active = !item.active;
        item.count = c;
    }
    else if (menuSelect === MENU_SELECT.PICK_ANY) {
        const groups = selectable.filter((i) => i.groupAcc !== 0 && i.groupAcc === accel);
        const enable = groups.some((i) => !i.active);
        groups.forEach((i) => (i.active = enable));
        if (groups.length === 0) {
            switch (accel) {
                case SELECT_ALL:
                    selectable.forEach((i) => (i.active = true));
                    break;
                case DESELECT_ALL:
                    selectable.forEach((i) => (i.active = false));
                    break;
                case TOGGLE_ALL:
                    const toggleEnable = selectable.some((i) => !i.active);
                    selectable.forEach((i) => (i.active = toggleEnable));
                    break;
            }
        }
    }
}
function getCountForSelect(select) {
    if (select === MENU_SELECT.PICK_NONE)
        return 0;
    if (select === MENU_SELECT.PICK_ONE)
        return 1;
    return -1;
}

const SAVE_FILES_STORAGE_KEY = 'sakkaku-dev-nethack-savefiles';
const RECORD_FILE_STORAGE_KEY = 'sakkaku-dev-nethack-records';
const SAVE_FOLDER = '/nethack/save/';
function parsePlayerName(file) {
    const prefix = SAVE_FOLDER + '0';
    return file.substring(prefix.length);
}
function listBackupFiles() {
    const result = [];
    for (let i = 0, len = localStorage.length; i < len; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(SAVE_FILES_STORAGE_KEY)) {
            const file = key.substring(SAVE_FILES_STORAGE_KEY.length + 1);
            const data = getStoragedSaveFileData(file);
            if (data) {
                const player = parsePlayerName(file);
                const modified = data.modified ? new Date(data.modified) : undefined;
                result.push({ file, player, modified });
            }
        }
    }
    return result;
}
function getStoragedSaveFileData(file) {
    const strData = localStorage.getItem(`${SAVE_FILES_STORAGE_KEY}-${file}`);
    if (strData) {
        return JSON.parse(strData);
    }
    return null;
}
function loadBackupSaveFile(file, module) {
    const data = getStoragedSaveFileData(file);
    if (data) {
        try {
            const array = decodeData(data);
            module.FS.writeFile(file, array, { encoding: 'binary' });
        }
        catch (e) {
            console.warn('Failed to load backup file', e);
        }
    }
}
function decodeData(data) {
    const bytes = atob(data.data);
    const buf = new ArrayBuffer(bytes.length);
    const array = new Uint8Array(buf);
    for (var i = 0; i < bytes.length; ++i)
        array[i] = bytes.charCodeAt(i);
    return array;
}
function syncSaveFiles(module) {
    module.FS.syncfs((err) => {
        if (err) {
            console.warn('Failed to sync FS. Save might not work', err);
        }
    });
    saveBackupFiles(module);
}
function saveBackupFiles(module) {
    try {
        const savefiles = module.FS.readdir('/nethack/save');
        for (let i = 0; i < savefiles.length; ++i) {
            let file = savefiles[i];
            if (file == '.' || file == '..')
                continue;
            if (file === 'record') {
                file = SAVE_FOLDER + file;
                const data = readFile(module, file);
                localStorage.setItem(RECORD_FILE_STORAGE_KEY, data);
            }
            else {
                file = SAVE_FOLDER + file;
                try {
                    const data = readFile(module, file);
                    saveFileData(file, data);
                }
                catch (e) {
                    console.warn('Failed to sync save file', file);
                }
            }
        }
    }
    catch (e) { }
}
function saveFileData(file, data) {
    localStorage.setItem(`${SAVE_FILES_STORAGE_KEY}-${file}`, JSON.stringify({ data, modified: new Date().toISOString() }));
}
function readFile(module, file) {
    return btoa(String.fromCharCode.apply(null, module.FS.readFile(file, { encoding: 'binary' })));
}
function loadSaveFiles(module, backupFile) {
    try {
        module.FS.mkdir('/nethack/save');
    }
    catch (e) { }
    module.FS.mount(module.IDBFS, {}, '/nethack/save');
    module.FS.syncfs(true, (err) => {
        if (err) {
            console.warn('Failed to sync FS. Save might not work', err);
        }
    });
    if (backupFile) {
        loadBackupSaveFile(backupFile, module);
    }
}
function loadRecords() {
    const data = localStorage.getItem(RECORD_FILE_STORAGE_KEY) || '';
    return atob(data);
}
function exportSaveFile(file) {
    const data = getStoragedSaveFileData(file.file);
    if (data) {
        const blob = new Blob([decodeData(data)], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        downloadURL(url, file.file.substring(SAVE_FOLDER.length));
        setTimeout(function () {
            return window.URL.revokeObjectURL(url);
        }, 1000);
    }
    else {
        console.warn('Failed to create export save file. Stored save file data missing or invalid.', file);
    }
}
async function importSaveFile(file) {
    const buf = await file.arrayBuffer();
    const array = new Uint8Array(buf);
    const data = btoa(String.fromCharCode.apply(null, array));
    saveFileData(SAVE_FOLDER + file.name, data);
}
function downloadURL(data, fileName) {
    const a = document.createElement('a');
    a.href = data;
    a.download = fileName;
    document.body.appendChild(a);
    a.style.display = 'none';
    a.click();
    a.remove();
}

const ENTER = 13;
const ESC = 27;
const SPACE = ' '.charCodeAt(0);
const CONTINUE_KEYS = [SPACE, ENTER, ESC];

// From BrowserHack
const activeRegex = /\((wielded( in other hand)?|in quiver|weapon in hands?|being worn|on (left|right) (hand|foreclaw|paw|pectoral fin))\)/;
function toInventoryItem(item) {
    // parse count
    let description = item.str;
    let r = description.split(/^(a|an|\d+)\s+/);
    let count = 1;
    if (r.length == 3) {
        description = r[2];
        count = parseInt(r[1]) || 1;
    }
    let buc = null;
    r = description.split(/^(blessed|uncursed|cursed)\s+/);
    if (r.length == 3) {
        description = r[2];
        buc = r[1];
    }
    return {
        ...item,
        active: activeRegex.test(item.str),
        count,
        buc,
        description,
    };
}

const ATTR_MAP = {
    [COLOR_ATTR.HL_ATTCLR_DIM]: ATTR.ATR_DIM,
    [COLOR_ATTR.HL_ATTCLR_BLINK]: ATTR.ATR_BLINK,
    [COLOR_ATTR.HL_ATTCLR_ULINE]: ATTR.ATR_ULINE,
    [COLOR_ATTR.HL_ATTCLR_INVERSE]: ATTR.ATR_INVERSE,
    [COLOR_ATTR.HL_ATTCLR_BOLD]: ATTR.ATR_BOLD,
};
function createStatusText(text, colorValue) {
    // Defined in window.doc -> status_update()
    const color = colorValue & 0x00ff;
    // Bold is for some reason 2
    // Underline is 8, so to correct this shift by another bit
    const attr = colorValue >> (8 + 1);
    return { text, color, attr: [attr] };
}
// Similar to wintty.c render_status(), condcolor() and condattr()
function createConditionStatusText(conditionBits, colorMask) {
    const result = [];
    for (let c of Object.values(CONDITION)) {
        if (typeof c !== 'number')
            continue;
        const condition = c;
        if (conditionBits & condition) {
            result.push({
                text: conditionMap[condition],
                color: parseConditionColor(condition, colorMask),
                attr: parseConditionAttr(condition, colorMask),
            });
            conditionBits &= ~condition;
        }
    }
    return result;
}
function parseConditionColor(condition, maskPointer) {
    for (let i = COLORS.CLR_BLACK; i < COLORS.CLR_MAX; i++) {
        if (i === COLORS.NO_COLOR)
            continue; // Has lowest priority
        const clr = getArrayValue(maskPointer, i, Type.INT);
        if ((condition & clr) !== 0) {
            return i;
        }
    }
    return COLORS.NO_COLOR;
}
function parseConditionAttr(condition, maskPointer) {
    const result = [];
    for (let i = COLOR_ATTR.HL_ATTCLR_DIM; i < COLOR_ATTR.BL_ATTCLR_MAX; i++) {
        const attr = getArrayValue(maskPointer, i, Type.INT);
        if ((condition & attr) !== 0) {
            result.push(ATTR_MAP[i]);
        }
    }
    return result;
}

const SETTINGS_KEY = 'sakkaku-dev-nethack-settings';
var TileSetImage;
(function (TileSetImage) {
    TileSetImage["Nevanda"] = "Nevanda";
    TileSetImage["Dawnhack"] = "Dawnhack";
    TileSetImage["Default"] = "Default Nethack";
    TileSetImage["Chozo"] = "Chozo";
})(TileSetImage || (TileSetImage = {}));
const defaultSetting = {
    enableMapBorder: true,
    tileSetImage: TileSetImage.Nevanda,
    playerName: 'Unnamed',
    options: '',
};
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return {
        ...defaultSetting,
        ...settings,
    };
}
function saveSettings(s) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}
async function loadDefaultOptions() {
    return fetch('nethackrc.default').then(x => x.text());
}

const VERSION = 'e79b47b13e94df6cebdf23ca41effa14377ef8f7';

const ASCII_MAX = 127;
const MAX_STRING_LENGTH = 256; // defined in global.h BUFSZ
const MAX_PLAYER_NAME = 32; // defined in global.h PL_NSIZ
var InputType;
(function (InputType) {
    InputType["ALL"] = "All";
    InputType["CONTINUE"] = "Continue";
    InputType["ASCII"] = "Ascii";
    InputType["ESCAPE"] = "Esc";
})(InputType || (InputType = {}));
class NetHackWrapper {
    constructor(debug = false, module, util, win = window, autostart = true) {
        this.debug = debug;
        this.module = module;
        this.util = util;
        this.win = win;
        this.autostart = autostart;
        this.commandMap = {
            [Command.CREATE_WINDOW]: this.createWindow.bind(this),
            [Command.DESTROY_WINDOW]: async (winid) => this.ui.closeDialog(winid),
            [Command.CLEAR_WINDOW]: this.clearWindow.bind(this),
            // [Command.EXIT_WINDOWS]: this.exitWindows.bind(this),
            [Command.GAME_END]: this.gameEnd.bind(this),
            // Text / Dialog
            [Command.PUTSTR]: this.handlePutStr.bind(this),
            [Command.RAW_PRINT]: async (str) => this.handlePrintLine(ATTR.ATR_NONE, str),
            [Command.RAW_PRINT_BOLD]: async (str) => this.handlePrintLine(ATTR.ATR_BOLD, str),
            // Map
            [Command.PRINT_GLYPH]: async (winid, x, y, glyph, bkglyph, isPet) => {
                this.tiles$.next([...this.tiles$.value, { x, y, tile: this.util.toTile(glyph), peaceful: isPet === 1 }]);
                if (bkglyph !== 0 && bkglyph !== 5991) {
                    console.log(`%c Background Tile found! ${bkglyph}, ${this.util.toTile(bkglyph)}`, 'background: #222; color: #bada55');
                }
            },
            [Command.CURSOR]: async (winid, x, y) => winid == this.global.globals.WIN_MAP && this.ui.moveCursor(x, y),
            [Command.CLIPAROUND]: async (x, y) => this.ui.centerView(x, y),
            // Status
            [Command.STATUS_UPDATE]: this.statusUpdate.bind(this),
            [Command.STATUS_ENABLE_FIELD]: this.statusEnableField.bind(this),
            // Menu
            [Command.MENU_START]: async () => (this.menuItems = []),
            [Command.MENU_END]: async (winid, prompt) => (this.menuPrompt = prompt),
            [Command.MENU_ADD]: this.menuAdd.bind(this),
            [Command.MENU_SELECT]: this.menuSelect.bind(this),
            // Waiting input
            [Command.DISPLAY_WINDOW]: this.displayWindow.bind(this),
            [Command.GET_CHAR]: () => this.waitForNextAction(),
            [Command.GET_POSKEY]: () => this.waitForNextAction(),
            [Command.YN_FUNCTION]: this.yesNoQuestion.bind(this),
            [Command.GET_LINE]: this.getLine.bind(this),
            [Command.GET_EXT_CMD]: this.getExtCmd.bind(this),
            [Command.ASK_NAME]: this.askName.bind(this),
            // according to window.doc, a 50ms delay, but add more since drawing the tile takes longer
            [Command.DELAY_OUTPUT]: () => new Promise((resolve) => setTimeout(resolve, 100)),
            [Command.MESSAGE_MENU]: this.messageMenu.bind(this),
        };
        this.idCounter = 0;
        this.menuItems = [];
        this.menuPrompt = '';
        this.putStr = '';
        this.putStrWinId = 0;
        this.backupFile = '';
        this.accel = new AccelIterator();
        this.status = {};
        this.input$ = new Subject();
        this.line$ = new Subject();
        this.inventory$ = new Subject();
        this.tiles$ = new BehaviorSubject([]);
        this.awaitingInput$ = new BehaviorSubject(false);
        this.gameState$ = new BehaviorSubject(GameState.START);
        this.settings$ = new BehaviorSubject(defaultSetting);
        this.shouldWaitForInput = true;
        this.gameState$.pipe(tap((s) => this.ui.updateState(s))).subscribe();
        this.settings$
            .pipe(skip(1), // skip first default setting
        debounceTime(100), tap((s) => saveSettings(s)))
            .subscribe();
        this.tiles$
            .pipe(skip(1), filter$1((x) => x.length > 0), debounceTime(100), tap((tiles) => this.ui.updateMap(...tiles)), tap(() => this.tiles$.next([])))
            .subscribe();
        this.inventory$
            .pipe(filter$1((x) => x.length > 0), debounceTime(100), tap((items) => this.ui.updateInventory(...items)))
            .subscribe();
        this.win.nethackCallback = this.handle.bind(this);
        this.win.onbeforeunload = (e) => {
            if (this.isGameRunning()) {
                // TODO: auto save?
                return (e.returnValue = 'Game progress will be lost if not saved.');
            }
        };
        this.win.onerror = (e) => {
            if (this.isGameRunning()) {
                const title = 'An unexpected error occurred.';
                const unsaved = 'Unfortunately the game progress could not be saved.';
                const backup = 'Use the Backup option in the main menu to restart from your latest save.';
                this.ui.openDialog(-1, `${title}\n${unsaved}\n\n${backup}`);
                this.waitInput(InputType.CONTINUE).then(() => {
                    this.ui.closeDialog(-1);
                    this.gameState$.next(GameState.GAMEOVER);
                });
            }
        };
        if (!this.module.preRun) {
            this.module.preRun = [];
        }
        this.module.preRun.push(() => loadSaveFiles(this.module, this.backupFile));
        this.module.preRun.push(() => this.setupNethackOptions());
        if (autostart) {
            console.log('Running version', VERSION);
            this.openStartScreen();
        }
    }
    setupNethackOptions() {
        const home = '/home/nethack_player';
        this.module.ENV.HOME = home;
        try {
            this.module.FS.mkdir('/home/nethack_player');
        }
        catch (e) { }
        const options = this.settings$.value.options;
        this.module.FS.writeFile(home + '/.nethackrc', options, { encoding: 'utf8' });
    }
    async openStartScreen() {
        await this.reloadSettings();
        while (!this.isGameRunning()) {
            const actions = [async () => this.startGame()];
            const startMenu = ['Start Game'];
            startMenu.push('Backups');
            actions.push(() => this.backupOperations());
            startMenu.push('Options');
            actions.push(() => this.options());
            const records = loadRecords();
            if (records.length) {
                startMenu.push('Highscores');
                actions.push(async () => {
                    this.ui.openDialog(-1, records);
                    await this.waitInput(InputType.CONTINUE);
                    this.ui.closeDialog(-1);
                });
            }
            const id = await this.openCustomMenu('Welcome to NetHack', startMenu);
            if (id !== -1) {
                await actions[id]();
            }
        }
        this.ui.closeDialog(-1);
    }
    async backupOperations() {
        await this.openSubMenu('Backup Actions', () => ['Load', 'Export', 'Import'], () => [
            () => this.selectBackup(listBackupFiles(), (file) => {
                this.backupFile = file.file;
                this.startGame(file.player);
                return true; // close sub menu
            }),
            () => this.selectBackup(listBackupFiles(), (file) => exportSaveFile(file)),
            () => {
                const elem = document.querySelector('#importSaveFile');
                elem.click();
                elem.onchange = () => {
                    if (elem.files) {
                        const file = elem.files[0];
                        importSaveFile(file);
                    }
                };
            },
        ]);
    }
    async selectBackup(files, handler) {
        const backupId = await this.openCustomMenu('Select backup file', files.map((f) => `${f.player} ${f.modified ? ' - ' + f.modified.toISOString() : ''}`));
        if (backupId !== -1) {
            const selected = files[backupId];
            return handler(selected);
        }
    }
    async reloadSettings() {
        const settings = loadSettings();
        settings.options = await this.mapDefaultNethackOptions(settings.options);
        this.settings$.next(settings);
    }
    updateSettings(setting) {
        this.settings$.next({ ...this.settings$.value, ...setting });
    }
    get settings() {
        return this.settings$.value;
    }
    async options() {
        await this.openSubMenu('Options', () => [
            `Enable map border - [${this.settings.enableMapBorder}]`,
            `Tileset - ${this.settings.tileSetImage}`,
            `Nethack Options`,
        ], () => [
            async () => this.updateSettings({ enableMapBorder: !this.settings.enableMapBorder }),
            () => this.tilesetOption(),
            () => this.editNethackOption(),
        ]);
    }
    async openSubMenu(title, optionText, optionActions) {
        let cancel = false;
        do {
            const optionId = await this.openCustomMenu(title, optionText());
            if (optionId === -1) {
                cancel = true;
            }
            else {
                const close = await optionActions()[optionId]();
                if (close) {
                    cancel = true;
                }
            }
        } while (!cancel);
    }
    async tilesetOption() {
        const images = Object.values(TileSetImage);
        const idx = await this.openCustomMenu('Tileset Image', images);
        if (idx !== -1) {
            this.updateSettings({ tileSetImage: images[idx] });
        }
    }
    async editNethackOption() {
        this.ui.openGetTextArea(this.settings$.value.options);
        const newValue = await this.waitLine(false);
        if (newValue != null) {
            this.updateSettings({ options: await this.mapDefaultNethackOptions(newValue) });
        }
        this.ui.closeDialog(-1);
    }
    async mapDefaultNethackOptions(opt) {
        if (!opt || opt.startsWith('# Default Options')) {
            return await loadDefaultOptions();
        }
        return opt;
    }
    async startGame(player) {
        this.gameState$.next(GameState.RUNNING);
        await nethackLib(this.module);
        if (player) {
            this.setPlayerName(player);
        }
        this.ui.updateSettings(loadSettings());
    }
    async askName() {
        const settings = loadSettings();
        let name = '';
        let prompt = 'Who are you?';
        do {
            this.ui.openGetLine(prompt, settings.playerName);
            name = (await this.waitLine())?.trim() || '';
            if (name.length >= MAX_PLAYER_NAME) {
                name = '';
                prompt = `Your name can only be ${MAX_PLAYER_NAME} characters long:`;
            }
            this.ui.closeDialog(-1);
        } while (name === '');
        this.setPlayerName(name);
    }
    setPlayerName(name) {
        this.global.globals.plname = name;
        this.updateSettings({ playerName: name });
    }
    async openCustomMenu(prompt, buttons) {
        const items = buttons.map((file, i) => ({
            ...EMPTY_ITEM,
            str: file,
            identifier: i + 1,
        }));
        const selectedItems = await this.startUserMenuSelect(-1, prompt, MENU_SELECT.PICK_ONE, items);
        if (selectedItems.length) {
            return selectedItems[0].identifier - 1;
        }
        return -1;
    }
    isGameRunning() {
        return this.gameState$.value === GameState.RUNNING;
    }
    log(...args) {
        if (this.debug) {
            console.log(...args);
        }
    }
    // Getting input from user
    async sendInput(...keys) {
        for (const key of keys) {
            await this.waitForAwaitingInput();
            const k = typeof key === 'string' ? key.charCodeAt(0) : key;
            this.log('Sending input', k);
            this.input$.next(k);
        }
    }
    async sendLine(line) {
        await this.waitForAwaitingInput();
        this.line$.next(line);
    }
    // Waiting for input from user
    async waitInput(type = InputType.ALL) {
        this.awaitingInput$.next(true);
        console.log('Awaiting input', type);
        const value = await firstValueFrom(this.input$.pipe(filter$1((c) => {
            switch (type) {
                case InputType.CONTINUE:
                    return CONTINUE_KEYS.includes(c);
                case InputType.ASCII:
                    return c <= ASCII_MAX;
                case InputType.ESCAPE:
                    return c === ESC;
                default:
                    return true;
            }
        })));
        this.awaitingInput$.next(false);
        return value;
    }
    async waitLine(limitLength = true) {
        this.awaitingInput$.next(true);
        const value = await firstValueFrom(this.line$.pipe(filter$1((line) => !limitLength || (line?.length || 0) < MAX_STRING_LENGTH)));
        this.awaitingInput$.next(false);
        return value;
    }
    async waitForNextAction() {
        const code = await this.waitInput();
        if (code === 'i'.charCodeAt(0)) {
            this.ui.toggleInventory();
        }
        return code;
    }
    async waitForAwaitingInput() {
        if (!this.shouldWaitForInput) {
            // In case this causes problems again
            return;
        }
        await firstValueFrom(this.awaitingInput$.pipe(filter$1((x) => x)));
    }
    // Commands
    async handle(cmd, ...args) {
        this.log(cmd, args);
        const commandHandler = this.commandMap[cmd];
        if (commandHandler) {
            return commandHandler(...args);
        }
        if (cmd == Command.GET_HISTORY) {
            return '';
        }
        return -1;
    }
    async messageMenu(dismissAccel, how, mesg) {
        // Just information? currently known usage with (z)ap followed by (?)
        this.ui.printLine(mesg);
    }
    async getExtCmd(commandPointer, numCommands) {
        const commands = this.getArrayValue(commandPointer, numCommands);
        this.ui.openGetLine('#', ...commands);
        const line = await this.waitLine();
        const idx = commands.findIndex((x) => x === line);
        this.ui.closeDialog(-1);
        if (idx >= 0 && idx < commands.length) {
            return idx;
        }
        return -1;
    }
    async getLine(question, searchPointer) {
        this.ui.openGetLine(question);
        const line = await this.waitLine();
        if (line != null) {
            const ptr = this.global.helpers.getPointerValue('nethack.getLine', searchPointer, Type.POINTER);
            this.global.helpers.setPointerValue('nethack.getLine', ptr, Type.STRING, line);
        }
        this.ui.closeDialog(-1);
    }
    async yesNoQuestion(question, choices, defaultChoice) {
        // const m = question.split(/\s+\[([\$a-zA-Z\-]+)(\sor\s[\*\?]+)\]/);
        const m = question.split(/\s+\[([\$a-zA-Z\s\-\*\?]+)\]/);
        if (m.length >= 2) {
            question = m[0];
            choices = m[1];
        }
        let allChoices = choices;
        if (!!choices && !choices.includes('-') && !choices.includes(' or ') && !choices.includes('*')) {
            allChoices = choices.split('');
        }
        if (allChoices === '' || Array.isArray(allChoices)) {
            this.ui.openQuestion(question, String.fromCharCode(defaultChoice), ...allChoices);
        }
        else {
            this.ui.openQuestion(question, String.fromCharCode(defaultChoice), allChoices);
        }
        let c = 0;
        do {
            c = await this.waitInput(InputType.ALL);
            // Default behaviour described in window.doc
            if (c === ESC) {
                if (choices.includes('q')) {
                    c = 'q'.charCodeAt(0);
                }
                else if (choices.includes('n')) {
                    c = 'n'.charCodeAt(0);
                }
                else {
                    c = defaultChoice;
                }
                break;
            }
            else if ([SPACE, ENTER].includes(c)) {
                c = defaultChoice;
                break;
            }
            // TODO: handle choice #, allows numbers
        } while (Array.isArray(allChoices) && !allChoices.includes(String.fromCharCode(c)));
        this.ui.closeDialog(-1);
        return c;
    }
    async createWindow(type) {
        this.idCounter++;
        return this.idCounter;
    }
    async displayWindow(winid, blocking) {
        if (this.putStr !== '') {
            if (this.putStrWinId === winid) {
                this.ui.openDialog(winid, this.putStr);
                await this.waitInput(InputType.CONTINUE);
                this.putStr = '';
            }
            else {
                this.log('putStr has value but another window is displayed', winid);
            }
        }
    }
    async clearWindow(winid) {
        if (winid === this.global.globals.WIN_MAP) {
            this.ui.clearMap();
        }
        this.putStr = '';
    }
    async gameEnd(status) {
        this.log('Ended game with status', status);
        syncSaveFiles(this.module);
        this.gameState$.next(GameState.GAMEOVER);
    }
    async menuAdd(winid, glyph, identifier, accelerator, groupAcc, attr, str, flag) {
        this.menuItems.push({
            tile: this.util.toTile(glyph),
            identifier,
            accelerator,
            groupAcc,
            attr,
            str,
            active: flag === ItemFlag.SELECTED,
        });
    }
    async menuSelect(winid, select, selected) {
        if (winid === this.global.globals.WIN_INVEN) {
            const items = this.menuItems.map((i) => toInventoryItem(i));
            this.inventory$.next(items);
            return 0;
        }
        if (this.menuItems.length === 0) {
            return 0;
        }
        const items = await this.startUserMenuSelect(winid, this.menuPrompt, select, this.menuItems);
        this.ui.closeDialog(winid); // sometimes it's not closed
        if (items.length === 0) {
            return -1;
        }
        this.util.selectItems(items, selected);
        return items.length;
    }
    async handlePutStr(winid, attr, str) {
        // if (winid === this.global.globals.WIN_STATUS) {
        //   const status = this.status$.value;
        //   parseAndMapStatus(str, status);
        //   this.status$.next(status);
        if (winid === this.global.globals.WIN_MESSAGE) {
            this.handlePrintLine(attr, str);
        }
        else {
            if (this.putStrWinId !== winid) {
                this.log('putStr value changed without displaying it', str, winid);
                this.putStr = '';
            }
            this.putStr += str + '\n';
            this.putStrWinId = winid;
        }
    }
    handlePrintLine(attr, str) {
        if (str.match(/You die/)) {
            this.gameState$.next(GameState.DIED);
        }
        this.ui.printLine(str);
    }
    async statusEnableField(type, name, format, enable) {
        if (!enable) {
            statusMap[type](this.status, undefined);
        }
    }
    async statusUpdate(type, ptr, chg, percentage, color, colormasks) {
        if (type === STATUS_FIELD.BL_FLUSH) {
            this.ui.updateStatus(this.status);
            return;
        }
        const mapper = statusMap[type];
        if (mapper) {
            if (type == STATUS_FIELD.BL_CONDITION) {
                const conditionBits = this.global.helpers.getPointerValue('status', ptr, Type.INT);
                this.status.condition = createConditionStatusText(conditionBits, colormasks);
            }
            else {
                const text = this.global.helpers.getPointerValue('status', ptr, Type.STRING);
                mapper(this.status, createStatusText(text, color));
            }
        }
        else {
            this.log('Unhandled status type', STATUS_FIELD[type]);
        }
    }
    // Utils
    async startUserMenuSelect(id, prompt, select, items) {
        setAccelerators(items, this.accel);
        const selectCount = getCountForSelect(select);
        let char = 0;
        let count = '';
        while (!CONTINUE_KEYS.includes(char)) {
            this.ui.openMenu(id, prompt, selectCount, ...items);
            char = await this.waitInput(InputType.ASCII);
            if (char >= 48 && char <= 57) {
                count += String.fromCharCode(char);
            }
            else if (selectCount !== 0) {
                toggleMenuItems(char, parseInt(count), select, items);
                items.filter(i => !i.active).forEach(i => i.count = undefined);
                count = '';
                if (select === MENU_SELECT.PICK_ONE && items.some((i) => i.active)) {
                    break;
                }
            }
        }
        if (char === ESC) {
            clearMenuItems(items);
        }
        return items.filter((i) => i.active);
    }
    getPointerValue(ptr, type) {
        const x = this.global.helpers.getPointerValue('nethack.pointerValue', ptr, Type.POINTER);
        return this.global.helpers.getPointerValue('nethack.pointerValue', x, type);
    }
    // ptr should be a pointer to a pointer
    getArrayValue(ptr, length) {
        const arr = [];
        const pointer = this.global.helpers.getPointerValue('nethack.arrayValue', ptr, Type.POINTER);
        for (let i = 0; i < length; i++) {
            const value = this.getPointerValue(pointer + i * 4, Type.STRING);
            arr.push(value);
        }
        return arr;
    }
    get global() {
        return this.win.nethackGlobal;
    }
    get ui() {
        return this.win.nethackUI;
    }
}

const Module = {};
Module.onRuntimeInitialized = () => {
    Module.ccall('shim_graphics_set_callback', null, ['string'], ['nethackCallback'], {
        async: true,
    });
};
Module.preRun = [
    () => {
        Module.ENV['USER'] = 'player'; // Nethack only asks for a name if the default one is generic like 'player'
        // Module.ENV.NETHACKOPTIONS = options.join(',');
    },
];
window.module = Module;
window.nethackJS = new NetHackWrapper(true, Module, { selectItems, toTile });
