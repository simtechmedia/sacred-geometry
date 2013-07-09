var SignalBinding = (function () {
    function SignalBinding(signal, listener, isOnce, listenerContext, priority) {
        this.active = true;
        this.params = null;
        this._listener = listener;
        this._isOnce = isOnce;
        this.context = listenerContext;
        this._signal = signal;
        this._priority = priority || 0;
    }
    SignalBinding.prototype.execute = function (paramsArr) {
        var handlerReturn, params;
        if(this.active && !!this._listener) {
            params = this.params ? this.params.concat(paramsArr) : paramsArr;
            handlerReturn = this._listener.apply(this.context, params);
            if(this._isOnce) {
                this.detach();
            }
        }
        return handlerReturn;
    };
    SignalBinding.prototype.detach = function () {
        return this.isBound() ? this._signal.remove(this._listener, this.context) : null;
    };
    SignalBinding.prototype.isBound = function () {
        return (!!this._signal && !!this._listener);
    };
    SignalBinding.prototype.getListener = function () {
        return this._listener;
    };
    SignalBinding.prototype._destroy = function () {
        delete this._signal;
        delete this._listener;
        delete this.context;
    };
    SignalBinding.prototype.isOnce = function () {
        return this._isOnce;
    };
    SignalBinding.prototype.toString = function () {
        return '[SignalBinding isOnce:' + this._isOnce + ', isBound:' + this.isBound() + ', active:' + this.active + ']';
    };
    return SignalBinding;
})();
function validateListener(listener, fnName) {
    if(typeof listener !== 'function') {
        throw new Error('listener is a required param of {fn}() and should be a Function.'.replace('{fn}', fnName));
    }
}
var Signal = (function () {
    function Signal() {
        this._bindings = [];
        this._prevParams = null;
        this.VERSION = '::VERSION_NUMBER::';
        this.memorize = false;
        this._shouldPropagate = true;
        this.active = true;
    }
    Signal.prototype._registerListener = function (listener, isOnce, listenerContext, priority) {
        var prevIndex = this._indexOfListener(listener, listenerContext);
        var binding;
        if(prevIndex !== -1) {
            binding = this._bindings[prevIndex];
            if(binding.isOnce() !== isOnce) {
                throw new Error('You cannot add' + (isOnce ? '' : 'Once') + '() then add' + (!isOnce ? '' : 'Once') + '() the same listener without removing the relationship first.');
            }
        } else {
            binding = new SignalBinding(this, listener, isOnce, listenerContext, priority);
            this._addBinding(binding);
        }
        if(this.memorize && this._prevParams) {
            binding.execute(this._prevParams);
        }
        return binding;
    };
    Signal.prototype._addBinding = function (binding) {
        var n = this._bindings.length;
        do {
            --n;
        }while(this._bindings[n] && binding._priority <= this._bindings[n]._priority);
        this._bindings.splice(n + 1, 0, binding);
    };
    Signal.prototype._indexOfListener = function (listener, context) {
        var n = this._bindings.length, cur;
        while(n--) {
            cur = this._bindings[n];
            if(cur._listener === listener && cur.context === context) {
                return n;
            }
        }
        return -1;
    };
    Signal.prototype.has = function (listener, context) {
        return this._indexOfListener(listener, context) !== -1;
    };
    Signal.prototype.add = function (listener, listenerContext, priority) {
        validateListener(listener, 'add');
        return this._registerListener(listener, false, listenerContext, priority);
    };
    Signal.prototype.addOnce = function (listener, listenerContext, priority) {
        validateListener(listener, 'addOnce');
        return this._registerListener(listener, true, listenerContext, priority);
    };
    Signal.prototype.remove = function (listener, context) {
        validateListener(listener, 'remove');
        var i = this._indexOfListener(listener, context);
        if(i !== -1) {
            this._bindings[i]._destroy();
            this._bindings.splice(i, 1);
        }
        return listener;
    };
    Signal.prototype.removeAll = function () {
        var n = this._bindings.length;
        while(n--) {
            this._bindings[n]._destroy();
        }
        this._bindings.length = 0;
    };
    Signal.prototype.getNumListeners = function () {
        return this._bindings.length;
    };
    Signal.prototype.halt = function () {
        this._shouldPropagate = false;
    };
    Signal.prototype.dispatch = function (params) {
        if(!this.active) {
            return;
        }
        var paramsArr = Array.prototype.slice.call(arguments), n = this._bindings.length, bindings;
        if(this.memorize) {
            this._prevParams = paramsArr;
        }
        if(!n) {
            return;
        }
        bindings = this._bindings.slice(0);
        this._shouldPropagate = true;
        do {
            n--;
        }while(bindings[n] && this._shouldPropagate && bindings[n].execute(paramsArr) !== false);
    };
    Signal.prototype.forget = function () {
        this._prevParams = null;
    };
    Signal.prototype.dispose = function () {
        this.removeAll();
        delete this._bindings;
        delete this._prevParams;
    };
    Signal.prototype.toString = function () {
        return '[Signal active:' + this.active + ' numListeners:' + this.getNumListeners() + ']';
    };
    return Signal;
})();
var View = (function () {
    function View(container) {
        this._container = container;
    }
    Object.defineProperty(View.prototype, "stage", {
        get: function () {
            return this._stage;
        },
        set: function (stage) {
            this._stage = stage;
        },
        enumerable: true,
        configurable: true
    });
    return View;
})();
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var StageView = (function (_super) {
    __extends(StageView, _super);
    function StageView(container) {
        _super.call(this, container);
    }
    StageView.prototype.init = function () {
        console.log("partivleView Init");
        if(window.top != window) {
            document.getElementById("header").style.display = "none";
        }
        this.canvas = document.getElementById("mainCanvas");
        _super.prototype._stage = new createjs.Stage(this.canvas);
        _super.prototype._stage.enableMouseOver(10);
        _super.prototype._stage.mouseMoveOutside = true;
        createjs.Touch.enable(_super.prototype._stage);
        var _this = this;
        window.addEventListener('resize', function () {
            _this.resize();
        });
        this.resize();
    };
    StageView.prototype.resize = function () {
        console.log("resize");
        _super.prototype._stage.canvas.width = window.innerWidth;
        _super.prototype._stage.canvas.height = window.innerHeight;
        this.w = this.canvas.width;
        this.h = this.canvas.height;
        this.canvas.y = _super.prototype._stage.canvas.height / 2;
    };
    return StageView;
})(View);
var DrawView = (function (_super) {
    __extends(DrawView, _super);
    function DrawView(container) {
        _super.call(this, container);
    }
    DrawView.prototype.init = function () {
        console.log("Drawview Init");
        this.fpsLabel = new createjs.Text("-- fps", "bold 18px Arial", "#FFF");
        _super.prototype.stage.addChild(this.fpsLabel);
        this.fpsLabel.x = 400;
        this.fpsLabel.y = 0;
        var centerCircle = new CenterCircle(this.stage.canvas.width / 2, this.stage.canvas.height / 2, this.stage);
        this.stage.addChild(centerCircle);
        var _this = this;
        createjs.Ticker.addEventListener('tick', function () {
            _this.tick();
        });
        var _this = this;
        this.stage.addEventListener('mousedown', function (evt) {
            _this.onMousePress(evt);
        });
    };
    DrawView.prototype.onMousePress = function (evt) {
        console.log("cliickkk");
        this._stage.addChild(this);
        console.log(evt.stageX);
        console.log(evt.stageY);
    };
    DrawView.prototype.tick = function () {
        this.fpsLabel.text = Math.round(createjs.Ticker.getMeasuredFPS()) + " fps";
        _super.prototype.stage.update();
    };
    return DrawView;
})(View);
var StageShape = (function (_super) {
    __extends(StageShape, _super);
    function StageShape(x, y, stage) {
        this._stage = stage;
        _super.call(this);
    }
    Object.defineProperty(StageShape.prototype, "stage", {
        get: function () {
            return this._stage;
        },
        set: function (stage) {
            this._stage = stage;
        },
        enumerable: true,
        configurable: true
    });
    return StageShape;
})(createjs.Shape);
var CenterCircle = (function (_super) {
    __extends(CenterCircle, _super);
    function CenterCircle(x, y, stage) {
        _super.call(this, x, y, stage);
        this._circleRadius = 50;
        this.graphics.setStrokeStyle(5);
        this.graphics.beginStroke("#000000");
        this.graphics.beginFill("#ffffff").drawCircle(1, 1, this._circleRadius - 2);
        this.x = x + this._circleRadius / 2;
        this.y = y + this._circleRadius / 2;
        var _this = this;
        this.addEventListener('mousedown', function (evt) {
            _this.onMousePress(evt);
        });
        this.helpLabel = new createjs.Text("Click and drag this circle to begin", "bold 18px Arial", "#FFF");
        this.stage.addChild(this.helpLabel);
        this.helpLabel.x = this.x + 100;
        this.helpLabel.y = this.y;
    }
    CenterCircle.prototype.onMousePress = function (evt) {
        this._stage.addChild(this);
        var offset = {
            x: this.x - evt.stageX,
            y: this.y - evt.stageY
        };
        var _this = this;
        evt.onMouseMove = function (ev) {
            _this.x = ev.stageX + offset.x;
            _this.y = ev.stageY + offset.y;
        };
    };
    CenterCircle.prototype.onMouseOver = function (evt) {
        document.body.style.cursor = 'move';
        TweenLite.to(this, 0.5, {
            scaleX: 1.2,
            scaleY: 1.2,
            ease: Quad.easeOut
        });
    };
    CenterCircle.prototype.onMouseOut = function (evt) {
        document.body.style.cursor = 'default';
        TweenLite.to(this, 0.5, {
            scaleX: 1,
            scaleY: 1,
            ease: Quad.easeOut
        });
    };
    return CenterCircle;
})(StageShape);
var SacretGeometry = (function () {
    function SacretGeometry(container) {
        console.log("hello world");
        this.container = container;
        this.stageView = new StageView(this.container);
        this.stageView.init();
        this.drawView = new DrawView(this.container);
        this.drawView.stage = this.stageView.stage;
        this.drawView.init();
    }
    return SacretGeometry;
})();
//@ sourceMappingURL=Main.js.map
