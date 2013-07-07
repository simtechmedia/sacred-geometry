///<reference path='Signal.ts'/>

     class SignalBinding{

        constructor(signal, listener, isOnce, listenerContext, priority){
            this._listener = listener;
            this._isOnce = isOnce;
            this.context = listenerContext;
            this._signal = signal;
            this._priority = priority || 0;
        }

        /**
         * Handler function bound to the signal.
         * @type Function
         * @private
         */
        _listener;

        /**
         * If binding should be executed just once.
         * @type boolean
         * @private
         */
        _isOnce;

        /**
         * Context on which listener will be executed (object that should represent the `this` variable inside listener function).
         * @memberOf SignalBinding.prototype
         * @name context
         * @type Object|undefined|null
         */
        context;

        /**
         * Reference to Signal object that listener is currently bound to.
         * @type Signal
         * @private
         */
        _signal;

        /**
         * Listener priority
         * @type Number
         * @private
         */
        _priority;
    

        /**
         * If binding is active and should be executed.
         * @type boolean
         */
        active:bool = true;

        /**
         * Default parameters passed to listener during `Signal.dispatch` and `SignalBinding.execute`. (curried parameters)
         * @type Array|null
         */
        params = null;

        /**
         * Call listener passing arbitrary parameters.
         * <p>If binding was added using `Signal.addOnce()` it will be automatically removed from signal dispatch queue, this method is used internally for the signal dispatch.</p>
         * @param {Array} [paramsArr] Array of parameters that should be passed to the listener
         * @return {*} Value returned by the listener.
         */
        execute(paramsArr) {
            var handlerReturn, params;
            if (this.active && !!this._listener) {
                params = this.params? this.params.concat(paramsArr) : paramsArr;
                handlerReturn = this._listener.apply(this.context, params);
                if (this._isOnce) {
                    this.detach();
                }
            }
            return handlerReturn;
        }

        /**
         * Detach binding from signal.
         * - alias to: mySignal.remove(myBinding.getListener());
         * @return {Function|null} Handler function bound to the signal or `null` if binding was previously detached.
         */
        detach() {
            return this.isBound()? this._signal.remove(this._listener, this.context) : null;
        }

        /**
         * @return {Boolean} `true` if binding is still bound to the signal and have a listener.
         */
        isBound() {
            return (!!this._signal && !!this._listener);
        }

        /**
         * @return {Function} Handler function bound to the signal.
         */
        getListener() {
            return this._listener;
        }

        /**
         * Delete instance properties
         * @private
         */
        _destroy() {
            delete this._signal;
            delete this._listener;
            delete this.context;
        }

        /**
         * @return {boolean} If SignalBinding will only be executed once.
         */
        isOnce() {
            return this._isOnce;
        }

        /**
         * @return {string} String representation of the object.
         */
        toString() {
            return '[SignalBinding isOnce:' + this._isOnce +', isBound:'+ this.isBound() +', active:' + this.active + ']';
        }

}