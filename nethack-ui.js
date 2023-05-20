const CONTINUE_KEY = ['Enter', ' '];
const CANCEL_KEY = ['Escape'];

class Dialog {
    constructor(text) {
        this.onClose = () => { };
        this.elem = document.createElement('pre');
        this.elem.innerHTML = text;
        this.elem.classList.add("dialog");
        setTimeout(() => {
            this.elem.classList.add("open");
        }, 100);
    }
    onInput(e) {
        if ([...CANCEL_KEY, ...CONTINUE_KEY].includes(e.key)) {
            this.onClose();
        }
    }
    static removeAll() {
        document.querySelectorAll(`.dialog`).forEach((elem) => {
            elem.classList.remove("open");
            setTimeout(() => elem.remove(), 200);
        });
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

function add(v1, v2) {
    return { x: v1.x + v2.x, y: v1.y + v2.y };
}
function sub(v1, v2) {
    return { x: v1.x - v2.x, y: v1.y - v2.y };
}
function mult(v1, v2) {
    return { x: v1.x * v2.x, y: v1.y * v2.y };
}

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
    createBackgroundImage(tile) {
        const div = document.createElement('div');
        div.style.width = `${this.tileSize}px`;
        div.style.height = `${this.tileSize}px`;
        div.style.backgroundImage = `url('${this.file}')`;
        div.style.backgroundRepeat = 'no-repeat';
        const pos = this.getTilePosition(tile);
        const realPos = mult(pos, { x: this.tileSize, y: this.tileSize });
        div.style.backgroundPosition = `-${realPos.x}px -${realPos.y}px`;
        return div;
    }
}
class TileMap {
    constructor(canvas, cursor, tileSet) {
        this.canvas = canvas;
        this.cursor = cursor;
        this.tileSet = tileSet;
        this.center = { x: 0, y: 0 };
        this.tiles = [];
        this.context = canvas.getContext("2d");
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

// From BrowserHack
const parse_inventory_description = (item) => {
    // parse count
    let description = item.str;
    let r = description.split(/^(a|an|\d+)\s+/);
    let count = 1;
    if (r.length == 3) {
        description = r[2];
        count = parseInt(r[1]) || 1;
    }
    // parse BCU
    let bcu = null;
    r = description.split(/^(blessed|uncursed|cursed)\s+/);
    if (r.length == 3) {
        description = r[2];
        bcu = r[1];
    }
    return {
        count: count,
        bcu: bcu,
        description: description
    };
};
class Inventory {
    constructor(elem, tileset) {
        this.elem = elem;
        this.tileset = tileset;
    }
    clear() {
        Array.from(this.elem.children).forEach((c) => this.elem.removeChild(c));
    }
    updateItems(items) {
        this.clear();
        this.createInventoryRows(items).forEach(row => this.elem.appendChild(row));
    }
    createInventoryRows(items) {
        const rows = [];
        const newRow = () => {
            const row = document.createElement("div");
            row.classList.add('row');
            return row;
        };
        let current = newRow();
        items
            .forEach((item) => {
            if (item.identifier === 0) {
                if (current.childNodes.length > 0) {
                    rows.push(current);
                    current = newRow();
                }
                current.innerHTML = item.str;
                current.classList.remove('row');
                current.classList.add('title');
                rows.push(current);
                current = newRow();
            }
            else {
                const img = this.tileset.createBackgroundImage(item.tile);
                // Inventory should always have accelerator
                const accel = document.createElement('div');
                accel.innerHTML = String.fromCharCode(item.accelerator);
                accel.classList.add('accel');
                img.appendChild(accel);
                const desc = parse_inventory_description(item);
                if (desc.count > 1) {
                    const count = document.createElement('div');
                    count.classList.add('count');
                    count.innerHTML = `${desc.count}`;
                    img.appendChild(count);
                }
                img.classList.add('item');
                if (item.active) {
                    img.classList.add('active');
                }
                img.title = item.str;
                current.appendChild(img);
            }
        });
        if (current.childNodes.length > 0) {
            rows.push(current);
            current = newRow();
        }
        return rows;
    }
    ;
}

class Console {
    constructor(elem) {
        this.elem = elem;
    }
    appendLine(line) {
        this.elem.innerHTML += line + '\n';
        this.elem.scrollTo(0, this.elem.scrollHeight);
    }
}

class StatusLine {
    constructor(elem) {
        this.elem = elem;
    }
    update(s) {
        this.elem.innerHTML = `${s.title} ${s.align}`; // TODO: set player name
        this.elem.innerHTML += `\nStr: ${s.str} Dex: ${s.dex} Con: ${s.con} Int: ${s.int} Wis: ${s.wis} Cha: ${s.cha}`;
        this.elem.innerHTML += `\nDlvl ${s.dungeonLvl} HP: ${s.hp}/${s.hpMax} Pw: ${s.power}/${s.powerMax} AC: ${s.armor} EXP: ${s.expLvl} $: ${s.gold}`;
    }
}

class Menu extends Dialog {
    constructor(prompt, items, count, tileset) {
        super(prompt);
        this.count = count;
        this.tileset = tileset;
        this.onSelect = (ids) => { };
        this.accelMap = {};
        this.elem.appendChild(this.createMenu(items, count));
        this.submitButton = this.createSelectButton();
        this.elem.appendChild(this.submitButton);
    }
    onInput(e) {
        if (CANCEL_KEY.includes(e.key)) {
            this.onSelect([]);
        }
        else if (CONTINUE_KEY.includes(e.key)) {
            this.submitButton.click();
        }
        else {
            const option = this.accelMap[e.key];
            if (option && !option.disabled) {
                option.checked = !option.checked;
                // if (this.count === 1) {
                //     this.submitButton.click();
                // }
            }
        }
    }
    createSelectButton() {
        const btn = document.createElement("button");
        btn.innerHTML = "Submit";
        btn.onclick = () => {
            const inputs = Array.from(document.querySelectorAll("#menu input"));
            const ids = inputs.filter((i) => i.checked && !i.disabled).map((i) => parseInt(i.value));
            this.onSelect(ids);
        };
        return btn;
    }
    createMenu(items, count) {
        let accelStart = 'a'.charCodeAt(0);
        this.accelMap = {};
        const list = document.createElement("div");
        list.style.display = "flex";
        list.style.flexDirection = "column";
        list.id = "menu";
        items.forEach((i) => {
            const div = document.createElement("div");
            if (i.identifier !== 0) {
                const elem = document.createElement("input");
                const label = document.createElement("label");
                const id = `menu-${i.identifier}`;
                const hasAccel = i.accelerator !== 0;
                // Hopefully when accel does not exist, then none of the items have one
                const accel = String.fromCharCode(hasAccel ? i.accelerator : accelStart);
                accelStart += 1;
                this.accelMap[accel] = elem;
                elem.type = count === 1 ? "radio" : "checkbox";
                elem.name = "menuSelect";
                elem.id = id;
                elem.disabled = i.identifier === 0;
                elem.checked = i.active;
                elem.value = `${i.identifier}`;
                label.htmlFor = id;
                label.innerHTML = `${accel} - ${i.str}`;
                div.appendChild(elem);
                div.appendChild(label);
            }
            else {
                div.appendChild(document.createTextNode(i.str || ' '));
            }
            list.appendChild(div);
        });
        return list;
    }
    ;
}

class Line extends Dialog {
    constructor(question, autocomplete) {
        super(question);
        this.autocomplete = autocomplete;
        this.onLineEnter = (line) => { };
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

class Game {
    constructor() {
        this.resize$ = new Subject();
        this.inputHandler = this;
        document.onkeydown = (e) => {
            console.log(e.key);
            this.inputHandler.onInput(e);
        };
        document.body.onresize = (e) => this.resize$.next();
        this.resize$.pipe(debounceTime(200)).subscribe(() => this.tilemap.onResize());
        const canvas = document.querySelector("canvas");
        const cursor = document.querySelector("#cursor");
        this.tileset = new TileSet("Nevanda.png", 32, 40);
        this.tilemap = new TileMap(canvas, cursor, this.tileset);
        this.inventory = new Inventory(document.querySelector('#inventory'), this.tileset);
        this.console = new Console(document.querySelector("#output"));
        this.status = new StatusLine(document.querySelector("#status"));
    }
    onInput(e) {
        if (e.key === "Control" || e.key === "Shift")
            return;
        e.preventDefault();
        if (e.key.length === 1) {
            let code = e.key.charCodeAt(0);
            if (e.ctrlKey) {
                if (code >= 65 && code <= 90) {
                    // A~Z
                    code = code - 64;
                }
                else if (code >= 97 && code <= 122) {
                    code = code - 96;
                }
            }
            window.nethackJS.sendInput(code);
        }
        else {
            console.log('Unhandled key: ', e.key);
        }
    }
    openMenu(prompt, count, items) {
        const menu = new Menu(prompt, items, count, this.tileset);
        menu.onSelect = ids => {
            window.nethackJS.selectMenu(ids);
            this.inputHandler = this;
            Dialog.removeAll(); // sometimes not closed?
        };
        this.inputHandler = menu;
        document.body.append(menu.elem);
    }
    openDialog(text) {
        const dialog = new Dialog(text);
        dialog.onClose = () => {
            window.nethackJS.sendInput(0);
            this.inputHandler = this;
        };
        this.inputHandler = dialog;
        document.body.append(dialog.elem);
    }
    openGetLine(question, autocomplete) {
        const line = new Line(question, autocomplete);
        line.onLineEnter = (line) => {
            window.nethackJS.sendLine(line);
            this.inputHandler = this;
            Dialog.removeAll(); // Usually not opened as a dialog, so close it ourself
        };
        this.inputHandler = line;
        document.body.append(line.elem);
        line.focus();
    }
}

const game = new Game();
window.nethackUI = {
    openMenu: (winid, prompt, count, ...items) => game.openMenu(prompt, count, items),
    openQuestion: (question, ...choices) => game.console.appendLine(`\n${question} ${choices}`),
    openGetLine: (question, ...autocomplete) => game.openGetLine(question, autocomplete),
    openDialog: (winid, text) => game.openDialog(text),
    closeDialog: (winid) => Dialog.removeAll(),
    printLine: (line) => game.console.appendLine(line),
    moveCursor: (x, y) => game.tilemap.recenter({ x, y }),
    centerView: (x, y) => game.tilemap.recenter({ x, y }),
    clearMap: () => game.tilemap.clearMap(),
    updateMap: (...tiles) => game.tilemap.addTile(...tiles),
    updateStatus: (s) => game.status.update(s),
    updateInventory: (...items) => game.inventory.updateItems(items),
};
