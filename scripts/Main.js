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
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.w = this.canvas.width;
        this.h = this.canvas.height;
        this.canvas.x = this.canvas.width / 2;
        this.canvas.y = this.canvas.height / 2;
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
        this._currentMousePos = new Point(0, 0);
        this.circlesContainer = new createjs.Container();
        this.stage.addChild(this.circlesContainer);
        this._shapesArray = [];
        this.fpsLabel = new createjs.Text("-- fps", "bold 18px Arial", "#FFF");
        this.stage.addChild(this.fpsLabel);
        this.fpsLabel.x = 400;
        this.fpsLabel.y = 0;
        this._debugBox = new createjs.Text("-- debugBox", "bold 18px Arial", "#FFF");
        this.stage.addChild(this._debugBox);
        this._debugBox.x = 10;
        this._debugBox.y = 10;
        var centerCircle = new CenterCircle(0, 0, this.circlesContainer);
        centerCircle.removeSignal.addOnce(this.removeObject, this, 0);
        this.circlesContainer.addChild(centerCircle);
        var _this = this;
        createjs.Ticker.addEventListener('tick', function () {
            _this.tick();
        });
        this.stage.onMouseMove = function (evt) {
            _this._currentMousePos.x = evt.rawX - window.innerWidth / 2;
            _this._currentMousePos.y = evt.rawY - window.innerHeight / 2;
            _this._debugBox.text = "xMouse: " + _this._currentMousePos.x + "," + _this._currentMousePos.y;
            var currentMousePoint = new Point(evt.stageX, evt.stageY);
            if(_this._activeShape) {
                _this._activeShape.currentMousePos = currentMousePoint;
            }
        };
        var _this = this;
        window.addEventListener('resize', function () {
            _this.resize();
        });
        this.resize();
    };
    DrawView.prototype.resize = function () {
        console.log("stage resize");
        this.circlesContainer.x = window.innerWidth / 2;
        this.circlesContainer.y = window.innerHeight / 2;
    };
    DrawView.prototype.addCircle = function (x, y) {
        var circleShape = new CircleShape(x, y, this.stage, StageShape.createDisplayVO());
        circleShape.onMouseClickedSignal.addOnce(this.resizeDone, this, 0);
        this.circlesContainer.addChild(circleShape);
        this._activeShape = circleShape;
        this._shapesArray.push(circleShape);
    };
    DrawView.prototype.resizeDone = function () {
        this._activeShape = null;
    };
    DrawView.prototype.removeObject = function (shape) {
        this.addCircle(shape.x, shape.y);
        this.circlesContainer.removeChild(shape);
    };
    DrawView.prototype.tick = function () {
        for(var i = 0; i < this._shapesArray.length; i++) {
            var currentShape = this._shapesArray[i];
            if(currentShape.circleHitTest(this._currentMousePos)) {
                currentShape.highLight();
            }
            currentShape.update();
        }
        this.fpsLabel.text = Math.round(createjs.Ticker.getMeasuredFPS()) + " fps";
        this.stage.update();
    };
    return DrawView;
})(View);
var StageShape = (function (_super) {
    __extends(StageShape, _super);
    function StageShape(x, y, container) {
        this._container = container;
        _super.call(this);
    }
    Object.defineProperty(StageShape.prototype, "container", {
        get: function () {
            return this._container;
        },
        set: function (container) {
            this._container = container;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StageShape.prototype, "currentMousePos", {
        get: function () {
            return this._currentMousePos;
        },
        set: function (point) {
            this._currentMousePos = point;
        },
        enumerable: true,
        configurable: true
    });
    StageShape.prototype.update = function () {
    };
    StageShape.createDisplayVO = function createDisplayVO(strokeWidth, hightlightStrokeWidth, strokecolour) {
        if (typeof strokeWidth === "undefined") { strokeWidth = 5; }
        if (typeof hightlightStrokeWidth === "undefined") { hightlightStrokeWidth = 10; }
        if (typeof strokecolour === "undefined") { strokecolour = "#000000"; }
        var displayVO = new DisplayVO();
        displayVO.strokeWidth = strokeWidth;
        displayVO.highlightStrokeWidth = hightlightStrokeWidth;
        displayVO.strokeColour = strokecolour;
        return displayVO;
    };
    return StageShape;
})(createjs.Shape);
var CenterCircle = (function (_super) {
    __extends(CenterCircle, _super);
    function CenterCircle(x, y, stage) {
        _super.call(this, x, y, stage);
        this._circleRadius = 50;
        this.removeSignal = new Signal();
        this.removing = false;
        this.graphics.setStrokeStyle(5);
        this.graphics.beginStroke("#000000");
        this.graphics.beginFill("#ffffff").drawCircle(1, 1, this._circleRadius - 2);
        var _this = this;
        this.addEventListener('mousedown', function (evt) {
            _this.onMousePress(evt);
        });
        this.helpLabel = new createjs.Text("Click to begin", "bold 18px Arial", "#FFF");
        this.container.addChild(this.helpLabel);
        this.helpLabel.x = this.x + 100;
        this.helpLabel.y = this.y;
    }
    CenterCircle.prototype.onMousePress = function (evt) {
        console.log("onMousePress");
        this.removing = true;
        this.container.addChild(this);
        var _this = this;
        TweenLite.to(this, 0.25, {
            scaleX: 0.1,
            scaleY: 0.1,
            ease: Quad.easeOut,
            onComplete: function () {
                _this.removeSignal.dispatch(_this);
            }
        });
    };
    CenterCircle.prototype.onMouseOver = function (evt) {
        if(!this.removing) {
            TweenLite.to(this, 0.5, {
                scaleX: 1.2,
                scaleY: 1.2,
                ease: Quad.easeOut
            });
            document.body.style.cursor = 'move';
        }
        if(this.container.contains(this.helpLabel)) {
            this.removeHelp();
        }
    };
    CenterCircle.prototype.removeHelp = function () {
        var _this = this;
        TweenLite.to(this.helpLabel, 0.5, {
            alpha: 0,
            ease: Quad.easeOut,
            onComplete: function () {
                _this.container.removeChild(_this.helpLabel);
            }
        });
    };
    CenterCircle.prototype.onMouseOut = function (evt) {
        if(!this.removing) {
            document.body.style.cursor = 'default';
            TweenLite.to(this, 0.5, {
                scaleX: 1,
                scaleY: 1,
                ease: Quad.easeOut
            });
        }
    };
    return CenterCircle;
})(StageShape);
var CircleShape = (function (_super) {
    __extends(CircleShape, _super);
    function CircleShape(x, y, container, displayVO) {
        _super.call(this, x, y, container);
        this.onMouseClickedSignal = new Signal();
        this._displayVO = displayVO;
        this.graphics.setStrokeStyle(5);
        this.graphics.beginStroke(this._displayVO.strokeColour);
        this.graphics.beginFill("rgba(255,255,0,0)").drawCircle(1, 1, 200);
        this.updating = true;
        this._strokeWidth = this._displayVO.strokeWidth;
        var _this = this;
        this.addEventListener('mousedown', function (evt) {
            _this.onMousePress(evt);
        });
    }
    Object.defineProperty(CircleShape.prototype, "currentMousePos", {
        set: function (point) {
            _super.prototype.currentMousePos = point;
            this._radius = _super.prototype.currentMousePos.distanceToPoint(new Point(this.x + window.innerWidth / 2, this.y + window.innerHeight / 2));
        },
        enumerable: true,
        configurable: true
    });
    CircleShape.prototype.update = function () {
        this.graphics.clear();
        this.graphics.setStrokeStyle(this._strokeWidth);
        this.graphics.beginStroke("#000000");
        this.graphics.beginFill("rgba(255,255,0,0)").drawCircle(0, 0, this._radius);
        this._strokeWidth = this._displayVO.strokeWidth;
    };
    CircleShape.prototype.highLight = function () {
        this._strokeWidth = this._displayVO.highlightStrokeWidth;
    };
    CircleShape.prototype.circleHitTest = function (point) {
        if(point.distanceToPoint(new Point(this.x, this.x)) < this._radius + this._displayVO.strokeWidth * 2) {
            return true;
        } else {
            return false;
        }
    };
    CircleShape.prototype.onMouseOver = function (evt) {
        console.log("this on over");
        console.log(this);
    };
    CircleShape.prototype.onMousePress = function (evt) {
        console.log("onMousePress");
        this.onMouseClickedSignal.dispatch(null);
    };
    return CircleShape;
})(StageShape);
var Point = (function () {
    function Point(_x, _y) {
        this.x = _x;
        this.y = _y;
    }
    Point.prototype.distanceToPoint = function (point) {
        var xs;
        var ys;
        xs = point.x - this.x;
        xs = xs * xs;
        ys = point.y - this.y;
        ys = ys * ys;
        return Math.sqrt(xs + ys);
    };
    return Point;
})();
var DisplayVO = (function () {
    function DisplayVO() { }
    return DisplayVO;
})();
var SacretGeometry = (function () {
    function SacretGeometry(container) {
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
