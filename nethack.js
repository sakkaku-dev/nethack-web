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

function filter(predicate, thisArg) {
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
    return filter(function (_, index) { return count <= index; });
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

var GameStatus;
(function (GameStatus) {
    GameStatus[GameStatus["RUNNING"] = 0] = "RUNNING";
    GameStatus[GameStatus["EXITED"] = 1] = "EXITED";
    GameStatus[GameStatus["ERROR"] = 2] = "ERROR";
})(GameStatus || (GameStatus = {}));

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
})(STATUS_FIELD || (STATUS_FIELD = {}));
var ATTR;
(function (ATTR) {
    ATTR[ATTR["ATR_NONE"] = 0] = "ATR_NONE";
    ATTR[ATTR["ATR_ULINE"] = 4] = "ATR_ULINE";
    ATTR[ATTR["ATR_BOLD"] = 1] = "ATR_BOLD";
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
    [STATUS_FIELD.BL_TITLE]: (s, v) => (s.title = v.trim()),
    [STATUS_FIELD.BL_STR]: (s, v) => (s.str = v),
    [STATUS_FIELD.BL_DX]: (s, v) => (s.dex = parseInt(v)),
    [STATUS_FIELD.BL_CO]: (s, v) => (s.con = parseInt(v)),
    [STATUS_FIELD.BL_IN]: (s, v) => (s.int = parseInt(v)),
    [STATUS_FIELD.BL_WI]: (s, v) => (s.wis = parseInt(v)),
    [STATUS_FIELD.BL_CH]: (s, v) => (s.cha = parseInt(v)),
    [STATUS_FIELD.BL_ALIGN]: (s, v) => (s.align = v),
    [STATUS_FIELD.BL_SCORE]: (s, v) => (s.score = v),
    [STATUS_FIELD.BL_CAP]: (s, v) => (s.carryCap = v),
    // [STATUS_FIELD.BL_GOLD]: (s, v) => (s.gold = parseInt(v.split(":")[1])),
    [STATUS_FIELD.BL_GOLD]: (s, v) => (s.gold = parseInt(v)),
    [STATUS_FIELD.BL_ENE]: (s, v) => (s.power = parseInt(v)),
    [STATUS_FIELD.BL_ENEMAX]: (s, v) => (s.powerMax = parseInt(v)),
    [STATUS_FIELD.BL_XP]: (s, v) => (s.exp = parseInt(v)),
    [STATUS_FIELD.BL_AC]: (s, v) => (s.armor = parseInt(v)),
    [STATUS_FIELD.BL_HUNGER]: (s, v) => (s.hunger = (v || "").trim()),
    [STATUS_FIELD.BL_HP]: (s, v) => (s.hp = parseInt(v)),
    [STATUS_FIELD.BL_HPMAX]: (s, v) => (s.hpMax = parseInt(v)),
    [STATUS_FIELD.BL_LEVELDESC]: (s, v) => (s.dungeonLvl = v),
    [STATUS_FIELD.BL_EXP]: (s, v) => (s.expLvl = parseInt(v)),
    [STATUS_FIELD.BL_CONDITION]: (s, v) => (s.condition = conditionMap[parseInt(v)] ?? undefined),
    // [STATUS_FIELD.BL_CHARACTERISTICS]: () => {},
    // [STATUS_FIELD.BL_RESET]: () => {},
    // [STATUS_FIELD.BL_FLUSH]: () => {},
    [STATUS_FIELD.BL_HD]: () => { },
    [STATUS_FIELD.BL_TIME]: (s, v) => {
        s.time = parseInt(v);
    },
    // [STATUS_FIELD.MAXBLSTATS]: () => {},
};
// See mswproc.c
const conditionMap = {
    [CONDITION.BL_MASK_BLIND]: "Blind",
    [CONDITION.BL_MASK_CONF]: "Conf",
    [CONDITION.BL_MASK_DEAF]: "Deaf",
    [CONDITION.BL_MASK_FLY]: "Fly",
    [CONDITION.BL_MASK_FOODPOIS]: "FoodPois",
    [CONDITION.BL_MASK_HALLU]: "Hallu",
    [CONDITION.BL_MASK_LEV]: "Lev",
    [CONDITION.BL_MASK_RIDE]: "Ride",
    [CONDITION.BL_MASK_SLIME]: "Slime",
    [CONDITION.BL_MASK_STONE]: "Stone",
    [CONDITION.BL_MASK_STRNGL]: "Strngl",
    [CONDITION.BL_MASK_STUN]: "Stun",
    [CONDITION.BL_MASK_TERMILL]: "TermIll",
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

const SAVE_FILES_STORAGE_KEY = "sakkaku-dev-nethack-savefiles";
const MAX_STRING_LENGTH = 256; // defined in global.h BUFSZ
class NetHackWrapper {
    async messageMenu(dismissAccel, how, mesg) {
        // Just information? currently known usage with (z)ap followed by (?)
        this.ui.printLine(mesg);
    }
    constructor(debug = false, module, win = window) {
        this.debug = debug;
        this.module = module;
        this.win = win;
        this.commandMap = {
            [Command.CREATE_WINDOW]: this.createWindow.bind(this),
            [Command.DESTROY_WINDOW]: async (winid) => this.ui.closeDialog(winid),
            [Command.CLEAR_WINDOW]: this.clearWindow.bind(this),
            // [Command.EXIT_WINDOWS]: this.exitWindows.bind(this),
            [Command.GAME_END]: this.gameEnd.bind(this),
            // Text / Dialog
            [Command.PUTSTR]: this.handlePutStr.bind(this),
            [Command.RAW_PRINT]: async (str) => this.ui.printLine(str),
            [Command.RAW_PRINT_BOLD]: async (str) => this.ui.printLine(str),
            // Map
            [Command.PRINT_GLYPH]: async (winid, x, y, glyph) => this.tiles$.next([...this.tiles$.value, { x, y, tile: this.toTile(glyph) }]),
            [Command.CURSOR]: async (winid, x, y) => winid == this.global.globals.WIN_MAP && this.ui.moveCursor(x, y),
            [Command.CLIPAROUND]: async (x, y) => this.ui.centerView(x, y),
            // Status
            [Command.STATUS_UPDATE]: this.statusUpdate.bind(this),
            // Menu
            [Command.MENU_START]: async () => (this.menu = { winid: 0, items: [], count: 0, prompt: "" }),
            [Command.MENU_END]: async (winid, prompt) => (this.menu.prompt = prompt),
            [Command.MENU_ADD]: this.menuAdd.bind(this),
            [Command.MENU_SELECT]: this.menuSelect.bind(this),
            // Waiting input
            [Command.DISPLAY_WINDOW]: this.displayWindow.bind(this),
            [Command.GET_CHAR]: this.waitInput.bind(this),
            [Command.GET_POSKEY]: this.waitInput.bind(this),
            [Command.YN_FUNCTION]: this.yesNoQuestion.bind(this),
            [Command.ASK_NAME]: this.waitInput.bind(this),
            [Command.GET_LINE]: this.getLine.bind(this),
            [Command.GET_EXT_CMD]: this.getExtCmd.bind(this),
            // according to window.doc, a 50ms delay, but add more since drawing the tile takes longer
            [Command.DELAY_OUTPUT]: () => new Promise((resolve) => setTimeout(resolve, 100)),
            [Command.MESSAGE_MENU]: this.messageMenu.bind(this),
            // TODO: message_menu
            // TODO: select_menu with yn_function
        };
        this.idCounter = 0;
        this.menu = { winid: 0, items: [], count: 0, prompt: "" };
        this.putStr = "";
        this.backupFile = "";
        this.input$ = new Subject();
        this.selectedMenu$ = new Subject();
        this.line$ = new Subject();
        this.status$ = new BehaviorSubject({});
        this.inventory$ = new Subject();
        this.tiles$ = new BehaviorSubject([]);
        this.awaitingInput$ = new BehaviorSubject(false);
        this.playing$ = new BehaviorSubject(GameStatus.EXITED);
        this.playing$
            .pipe(skip(1), filter((x) => !this.isGameRunning()), tap((s) => this.ui.onGameover(s)))
            .subscribe();
        this.tiles$
            .pipe(skip(1), filter((x) => x.length > 0), debounceTime(100), tap((tiles) => this.ui.updateMap(...tiles)), tap(() => this.tiles$.next([])))
            .subscribe();
        this.inventory$
            .pipe(filter((x) => x.length > 0), debounceTime(500), tap((items) => this.ui.updateInventory(...items)))
            .subscribe();
        this.status$
            .pipe(skip(1), debounceTime(100), tap((s) => this.ui.updateStatus(s)))
            .subscribe();
        this.input$.subscribe(() => this.awaitingInput$.next(false));
        this.win.nethackCallback = this.handle.bind(this);
        this.win.onbeforeunload = (e) => {
            if (this.isGameRunning()) {
                // TODO: auto save?
                return (e.returnValue = "Game progress will be lost if not saved.");
            }
        };
        this.win.onerror = (e) => {
            if (this.isGameRunning()) {
                this.playing$.next(GameStatus.ERROR);
            }
        };
        if (!this.module.preRun) {
            this.module.preRun = [];
        }
        this.module.preRun.push(() => {
            this.loadSaveFiles();
            if (this.backupFile) {
                this.loadBackupSaveFile(this.backupFile);
            }
        });
    }
    isGameRunning() {
        return this.playing$.value === GameStatus.RUNNING;
    }
    log(...args) {
        if (this.debug) {
            console.log(...args);
        }
    }
    setBackupFile(file) {
        this.backupFile = file;
    }
    startGame() {
        this.playing$.next(GameStatus.RUNNING);
        // cannot be reloaded again, will fail
        // @ts-ignore
        import('./nethack-5b70fdf9.js').then(function (n) { return n.n; })
            .then((x) => {
            x.default(this.module);
        })
            .catch((e) => {
            console.log("Failed to load nethack module", e);
            this.playing$.next(GameStatus.ERROR);
        });
    }
    // Getting input from user
    selectMenu(items) {
        this.log("Selected menu", items);
        this.selectedMenu$.next(items);
    }
    sendInput(key) {
        this.log("Receiced input", key);
        this.input$.next(key);
    }
    sendLine(line) {
        if (line.length >= MAX_STRING_LENGTH) {
            this.log(`Line is too long. It can only be ${MAX_STRING_LENGTH} characters long.`, line);
        }
        else {
            this.log("Receiced line", line);
            this.line$.next(line);
        }
    }
    // Waiting for input from user
    async waitInput() {
        this.log("Waiting user input...");
        this.awaitingInput$.next(true);
        return await firstValueFrom(this.input$);
    }
    async waitLine() {
        this.log("Waiting user input line...");
        this.awaitingInput$.next(true);
        return await firstValueFrom(this.line$);
    }
    // Commands
    async handle(cmd, ...args) {
        this.log(cmd, args);
        const commandHandler = this.commandMap[cmd];
        if (commandHandler) {
            return commandHandler(...args);
        }
        if (cmd == Command.GET_HISTORY) {
            return "";
        }
        return -1;
    }
    async getExtCmd(commandPointer, numCommands) {
        const commands = this.getArrayValue(commandPointer, numCommands);
        this.ui.openGetLine("#", ...commands);
        const line = await this.waitLine();
        const idx = commands.findIndex((x) => x === line);
        if (idx >= 0 && idx < commands.length) {
            return idx;
        }
        return -1;
    }
    async getLine(question, searchPointer) {
        this.ui.openGetLine(question);
        const line = await this.waitLine();
        const ptr = this.global.helpers.getPointerValue("nethack.getLine", searchPointer, Type.POINTER);
        this.global.helpers.setPointerValue("nethack.getLine", ptr, Type.STRING, line);
    }
    async yesNoQuestion(question, choices) {
        // Question already contains the choices
        if (/\[[a-zA-Z]+\]/.test(question)) {
            choices = [];
        }
        this.ui.openQuestion(question, ...choices);
        return this.waitInput();
    }
    async createWindow(type) {
        this.idCounter++;
        return this.idCounter;
    }
    async displayWindow(winid, blocking) {
        if (this.putStr !== "") {
            this.ui.openDialog(winid, this.putStr);
            await this.waitInput();
            this.putStr = "";
        }
    }
    async clearWindow(winid) {
        if (winid === this.global.globals.WIN_MAP) {
            this.ui.clearMap();
        }
        this.putStr = "";
    }
    async gameEnd(status) {
        console.log("Ended game with status", status);
        this.syncSaveFiles();
        this.playing$.next(GameStatus.EXITED);
    }
    syncSaveFiles() {
        console.log("Syncing save files");
        this.module.FS.syncfs((err) => {
            if (err) {
                console.warn("Failed to sync FS. Save might not work", err);
            }
        });
        // backup save files in case user forgets to save
        try {
            const savefiles = this.module.FS.readdir("/nethack/save");
            for (let i = 0; i < savefiles.length; ++i) {
                let file = savefiles[i];
                if (file == "." || file == "..")
                    continue;
                if (file === "record")
                    continue; // This is just in save folder, so it gets persisted, nethack should not delete it like the save file
                file = "/nethack/save/" + file;
                try {
                    const data = btoa(String.fromCharCode.apply(null, this.module.FS.readFile(file, { encoding: "binary" })));
                    localStorage.setItem(`${SAVE_FILES_STORAGE_KEY}-${file}`, JSON.stringify({ data }));
                }
                catch (e) {
                    console.warn("Failed to sync save file", file);
                }
            }
        }
        catch (e) { }
    }
    loadSaveFiles() {
        const mod = this.module;
        try {
            mod.FS.mkdir("/nethack/save");
        }
        catch (e) { }
        mod.FS.mount(mod.IDBFS, {}, "/nethack/save");
        mod.FS.syncfs(true, (err) => {
            if (err) {
                console.warn("Failed to sync FS. Save might not work", err);
            }
        });
    }
    getBackupFiles() {
        const result = [];
        for (let i = 0, len = localStorage.length; i < len; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(SAVE_FILES_STORAGE_KEY)) {
                result.push(key.substring(SAVE_FILES_STORAGE_KEY.length + 1));
            }
        }
        return result;
    }
    loadBackupSaveFile(file) {
        const strData = localStorage.getItem(`${SAVE_FILES_STORAGE_KEY}-${file}`);
        if (strData) {
            const { data } = JSON.parse(strData);
            try {
                const bytes = atob(data);
                var buf = new ArrayBuffer(bytes.length);
                var array = new Uint8Array(buf);
                for (var i = 0; i < bytes.length; ++i)
                    array[i] = bytes.charCodeAt(i);
                this.module.FS.writeFile(file, array, { encoding: "binary" });
            }
            catch (e) {
                console.warn("Failed to load backup file", e);
            }
        }
    }
    async menuAdd(winid, glyph, identifier, accelerator, groupAcc, attr, str, flag) {
        this.menu.items.push({
            tile: this.toTile(glyph),
            identifier,
            accelerator: parseInt(accelerator),
            groupAcc,
            attr,
            str,
            active: flag === ItemFlag.SELECTED,
        });
    }
    async menuSelect(winid, select, selected) {
        if (winid === this.global.globals.WIN_INVEN) {
            const activeRegex = /\((wielded( in other hand)?|in quiver|weapon in hands?|being worn|on (left|right) (hand|foreclaw|paw|pectoral fin))\)/;
            this.menu.items.forEach((i) => (i.active = activeRegex.test(i.str)));
            this.inventory$.next(this.menu.items);
            return 0;
        }
        if (this.menu.items.length === 0) {
            return 0;
        }
        if (select == MENU_SELECT.PICK_NONE) {
            this.ui.openDialog(winid, this.menu.items.map((i) => i.str).join("\n"));
            await this.waitInput();
            return 0;
        }
        if (select == MENU_SELECT.PICK_ANY) {
            this.ui.openMenu(winid, this.menu.prompt, -1, ...this.menu.items);
        }
        else {
            this.ui.openMenu(winid, this.menu.prompt, 1, ...this.menu.items);
        }
        this.log("Waiting for menu select...");
        const selectedIds = await firstValueFrom(this.selectedMenu$);
        const itemIds = selectedIds.filter((id) => this.menu.items.find((x) => x.identifier === id));
        if (itemIds.length === 0) {
            return -1;
        }
        this.selectItems(itemIds, selected);
        return itemIds?.length ?? -1;
    }
    async handlePutStr(winid, attr, str) {
        if (winid === this.global.globals.WIN_STATUS) {
            // 3.6 updates the status with putStr:
            // Web_user the Aspirant        St:18/20 Dx:12 Co:15 In:9 Wi:18 Ch:12  Lawful
            // Dlvl:1  $:0  HP:14(14) Pw:8(8) AC:7  Exp:1 T:200
            const status = this.status$.value;
            const statLineRegex = /St:\d+.*Dx:\d+.*/;
            // Split regex more in case some things can be hidden/shown
            if (statLineRegex.test(str)) {
                let m = str.match(/\w ([a-zA-z\s]+) .* St:.*Ch:\d+ [\s]* (\w+)/);
                if (m) {
                    statusMap[STATUS_FIELD.BL_TITLE](status, m[1]);
                    statusMap[STATUS_FIELD.BL_ALIGN](status, m[2]);
                }
                m = str.match(/St:([\d\/]+) Dx:(\d+) Co:(\d+) In:(\d+) Wi:(\d+) Ch:(\d+)/);
                if (m) {
                    statusMap[STATUS_FIELD.BL_STR](status, m[1]);
                    statusMap[STATUS_FIELD.BL_DX](status, m[2]);
                    statusMap[STATUS_FIELD.BL_CO](status, m[3]);
                    statusMap[STATUS_FIELD.BL_IN](status, m[4]);
                    statusMap[STATUS_FIELD.BL_WI](status, m[5]);
                    statusMap[STATUS_FIELD.BL_CH](status, m[6]);
                }
            }
            else {
                let m = str.match(/HP:(\d+)\((\d+)\).*Pw:(\d+)\((\d+)\)/);
                if (m) {
                    statusMap[STATUS_FIELD.BL_HP](status, m[1]);
                    statusMap[STATUS_FIELD.BL_HPMAX](status, m[2]);
                    statusMap[STATUS_FIELD.BL_ENE](status, m[3]);
                    statusMap[STATUS_FIELD.BL_ENEMAX](status, m[4]);
                }
                m = str.match(/Dlvl:(\d+)/);
                if (m)
                    statusMap[STATUS_FIELD.BL_LEVELDESC](status, m[1]);
                m = str.match(/\$:(\d+)/);
                if (m)
                    statusMap[STATUS_FIELD.BL_GOLD](status, m[1]);
                m = str.match(/AC:([-]?\d+)/);
                if (m)
                    statusMap[STATUS_FIELD.BL_AC](status, m[1]);
                m = str.match(/Xp:(\d+\/\d+)/); // Contains lvl + exp
                if (m) {
                    const v = m[1].split("/");
                    statusMap[STATUS_FIELD.BL_EXP](status, v[0]);
                    statusMap[STATUS_FIELD.BL_XP](status, v[1]);
                }
                else {
                    m = str.match(/Exp:(\d+)/);
                    if (m)
                        statusMap[STATUS_FIELD.BL_EXP](status, m[1]);
                }
                m = str.match(/T:(\d+)/);
                if (m)
                    statusMap[STATUS_FIELD.BL_TIME](status, m[1]);
                m = str.match(/([a-zA-Z\s]+)$/); // Contains everything status related, eg hunger, conditions
                if (m)
                    statusMap[STATUS_FIELD.BL_HUNGER](status, m[1]);
            }
            this.status$.next(status);
        }
        else {
            this.putStr += str + "\n";
        }
    }
    async statusUpdate(type, ptr) {
        // const ignored = [STATUS_FIELD.BL_FLUSH, STATUS_FIELD.BL_RESET];
        // if (ignored.includes(type)) {
        //   return;
        // }
        const mapper = statusMap[type];
        if (mapper) {
            let value;
            if (type == STATUS_FIELD.BL_CONDITION) {
                value = this.getPointerValue(ptr, Type.INT);
            }
            else {
                value = this.getPointerValue(ptr, Type.STRING);
            }
            var status = this.status$.value;
            mapper(status, value);
            this.status$.next(status);
        }
        else {
            this.log("Unhandled status type", STATUS_FIELD[type]);
        }
    }
    // Utils
    selectItems(itemIds, selectedPointer) {
        const int_size = 4;
        const size = int_size * 2; // selected object has 3 fields, in 3.6 only 2
        const total_size = size * itemIds.length;
        const start_ptr = this.module._malloc(total_size);
        // write selected items to memory
        let ptr = start_ptr;
        itemIds.forEach((id) => {
            this.global.helpers.setPointerValue("nethack.menu.selected", ptr, Type.INT, id);
            this.global.helpers.setPointerValue("nethack.menu.selected", ptr + int_size, Type.INT, -1);
            // this.global.helpers.setPointerValue("nethack.menu.selected", ptr + int_size * 2, Type.INT, 0); // Only 2 properties in 3.6
            ptr += size;
        });
        // point selected to the first item
        const selected_pp = this.global.helpers.getPointerValue("", selectedPointer, Type.POINTER);
        this.global.helpers.setPointerValue("nethack.menu.setSelected", selected_pp, Type.INT, start_ptr);
    }
    toTile(glyph) {
        return this.module._glyph_to_tile(glyph);
    }
    getPointerValue(ptr, type) {
        const x = this.global.helpers.getPointerValue("nethack.pointerValue", ptr, Type.POINTER);
        return this.global.helpers.getPointerValue("nethack.pointerValue", x, type);
    }
    // ptr should be a pointer to a pointer
    getArrayValue(ptr, length) {
        const arr = [];
        const pointer = this.global.helpers.getPointerValue("nethack.arrayValue", ptr, Type.POINTER);
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
var Type;
(function (Type) {
    Type["INT"] = "i";
    Type["STRING"] = "s";
    Type["POINTER"] = "p";
})(Type || (Type = {}));

const options = [
    "showexp",
    "perm_invent",
    "autopickup",
    "pickup_types:$",
    "pickup_thrown",
    "pickup_burden:S",
    "autoopen",
    "!cmdassist",
    "sortloot:full",
];
const Module = {};
Module.onRuntimeInitialized = () => {
    Module.ccall("shim_graphics_set_callback", null, ["string"], ["nethackCallback"], {
        async: true,
    });
};
Module.preRun = [
    () => {
        // Module.ENV["USER"] = "web_user"; // TODO: get name
        Module.ENV.NETHACKOPTIONS = options.join(",");
    },
];
window.nethackJS = new NetHackWrapper(true, Module);
