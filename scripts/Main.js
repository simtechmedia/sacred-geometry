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
        document.onkeydown = function (evt) {
            _this.handleKeyDown(evt);
        };
        this.resize();
    };
    StageView.prototype.handleKeyDown = function (evt) {
        if(!evt) {
            var evt = window.event;
        }
        console.log("key handle down " + this._stateModel);
        switch(evt.keyCode) {
            case 37:
                this._stateModel.spawnAmountSubtract();
                break;
            case 39:
                this._stateModel.spawnAmountAdd();
                break;
        }
    };
    Object.defineProperty(StageView.prototype, "stateModel", {
        set: function (model) {
            console.log("Set statemdoel in stageView ");
            this._stateModel = model;
        },
        enumerable: true,
        configurable: true
    });
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
        this.fpsLabel = new createjs.Text("-- fps", "bold 18px Give You Glory", "#000");
        this.stage.addChild(this.fpsLabel);
        this.fpsLabel.x = 400;
        this.fpsLabel.y = 0;
        this._debugBox = new createjs.Text("-- debugBox", "bold 18px Give You Glory", "#000");
        this.stage.addChild(this._debugBox);
        this._debugBox.x = 10;
        this._debugBox.y = 10;
        var centerCircleArray = [];
        var centerCicle = new CenterCircle(0, 0, this.circlesContainer);
        centerCicle.removeSignal.addOnce(this.removeCenterCircle, this, 0);
        this.circlesContainer.addChild(centerCicle);
        centerCircleArray.push(centerCicle);
        this._stateModel.circlesArray.push(centerCircleArray);
        var _this = this;
        createjs.Ticker.addEventListener('tick', function () {
            _this.tick();
        });
        this.stage.onMouseMove = function (evt) {
            _this.onMouseMove(evt);
        };
        this.stage.onClick = function (evt) {
            _this.onStageClick(evt);
        };
        window.addEventListener('resize', function () {
            _this.resize();
        });
        this.resize();
    };
    DrawView.prototype.onMouseMove = function (evt) {
        this._currentMousePos.x = evt.rawX - window.innerWidth / 2;
        this._currentMousePos.y = evt.rawY - window.innerHeight / 2;
        this._debugBox.text = "xMouse: " + this._currentMousePos.x + "," + this._currentMousePos.y;
        var currentMousePoint = new Point(evt.stageX, evt.stageY);
        switch(this._stateModel.currentState) {
            case StateModel.STATE_START:
                if(this._stateModel.circlesArray[0][0].circleHitTest(this._currentMousePos, this._stateModel.circlesArray[0][0].radius, 50)) {
                    this._stateModel.circlesArray[0][0].onMouseOver(null);
                } else {
                    this._stateModel.circlesArray[0][0].onMouseOut(null);
                }
                break;
            case StateModel.STATE_RESIZING:
                if(this._activeCircleShape) {
                    this._activeCircleShape.currentMousePos = currentMousePoint;
                    this._activeCircleShape.update();
                    if(this._stateModel.circlesArray[this._stateModel.currentCircleDepth] != undefined) {
                        for(var k = 0; k < this._stateModel.circlesArray[this._stateModel.currentCircleDepth].length; k++) {
                            var hintedCircle = this._stateModel.circlesArray[this._stateModel.currentCircleDepth][k];
                            hintedCircle.radius = this._activeCircleShape.radius;
                            hintedCircle.update();
                        }
                    }
                }
                break;
            case StateModel.STATE_CREATE:
                var highlighted = false;
                for(var i = 0; i < this._stateModel.circlesArray.length; i++) {
                    for(var k = 0; k < this._stateModel.circlesArray[i].length; k++) {
                        var currentShape = this._stateModel.circlesArray[i][k];
                        if(currentShape.circleHitTest(this._currentMousePos, currentShape.radius, 10)) {
                            var angle = currentShape.getAngleFromCenter(this._currentMousePos);
                            currentShape.highlight(angle, true);
                            highlighted = true;
                            var angleAsDegrees = angle * (180 / Math.PI);
                            for(var j = 0; j < this._stateModel.circlesArray[currentShape.level].length; j++) {
                                var shapeThatNeedsHighliting = this._stateModel.circlesArray[currentShape.level][j];
                                if(shapeThatNeedsHighliting != currentShape) {
                                    shapeThatNeedsHighliting.highlight(angle, false);
                                }
                            }
                        }
                        currentShape.update();
                    }
                }
                if(!highlighted) {
                    this.clearHighlights();
                }
                break;
        }
    };
    DrawView.prototype.onStageClick = function (event) {
        switch(this._stateModel.currentState) {
            case StateModel.STATE_START:
                if(this._stateModel.circlesArray[0][0].circleHitTest(this._currentMousePos, this._stateModel.circlesArray[0][0].radius, 50)) {
                    this._stateModel.circlesArray[0][0].onMousePress(null);
                }
                break;
            case StateModel.STATE_RESIZING:
                this._activeCircleShape = null;
                this._stateModel.currentState = StateModel.STATE_CREATE;
                break;
            case StateModel.STATE_CREATE:
                var currentLevel;
                var creating = false;
                var currentCircleDepthAr = [];
                for(var i = 0; i < this._stateModel.circlesArray.length; i++) {
                    for(var k = 0; k < this._stateModel.circlesArray[i].length; k++) {
                        var currentShape = this._stateModel.circlesArray[i][k];
                        if(currentShape.hasHighlightCircle) {
                            this._stateModel.currentCircleDepth++;
                            var newCircleFromPointer = this.addCircle(currentShape.highlightCircle.x, currentShape.highlightCircle.y, this._stateModel.currentCircleDepth, true);
                            newCircleFromPointer.stateModel = this._stateModel;
                            currentCircleDepthAr.push(newCircleFromPointer);
                            creating = true;
                            currentLevel = currentShape.level;
                        }
                    }
                }
                if(creating == true) {
                    for(var j = 0; j < this._stateModel.circlesArray[currentShape.level].length; j++) {
                        var circleOnSameLevel = this._stateModel.circlesArray[currentShape.level][j];
                        for(var i = 0; i < circleOnSameLevel.hintCircleShapesAr.length; i++) {
                            var hintShape = circleOnSameLevel.hintCircleShapesAr[i];
                            var newCircleFromHint = this.addCircle(hintShape.x, hintShape.y, this._stateModel.currentCircleDepth);
                            console.log("creating circle at " + this._stateModel.currentCircleDepth);
                            newCircleFromHint.stateModel = this._stateModel;
                            currentCircleDepthAr.push(newCircleFromHint);
                        }
                    }
                    this._stateModel.circlesArray[this._stateModel.currentCircleDepth] = currentCircleDepthAr;
                    this.clearHighlights();
                }
                break;
        }
    };
    DrawView.prototype.clearHighlights = function () {
        for(var i = 0; i < this._stateModel.circlesArray.length; i++) {
            for(var k = 0; k < this._stateModel.circlesArray[i].length; k++) {
                var currentShape = this._stateModel.circlesArray[i][k];
                currentShape.unHighlight();
            }
        }
    };
    DrawView.prototype.resize = function () {
        console.log("stage resize");
        this.circlesContainer.x = window.innerWidth / 2;
        this.circlesContainer.y = window.innerHeight / 2;
    };
    DrawView.prototype.addCircle = function (x, y, level, active) {
        if (typeof active === "undefined") { active = false; }
        console.log(" add circle at level " + level);
        this._stateModel.currentState = StateModel.STATE_RESIZING;
        var circleShape = new CircleShape(x, y, this.circlesContainer, level, StageShape.createDisplayVO(5, 10, '#' + Math.floor(Math.random() * 16777215).toString(16)));
        this.circlesContainer.addChild(circleShape);
        if(active) {
            this._activeCircleShape = circleShape;
        }
        return circleShape;
    };
    DrawView.prototype.removeCenterCircle = function (shape) {
        this.circlesContainer.removeChild(shape);
        var firstCircleArray = [];
        var firstCircle = this.addCircle(shape.x, shape.y, 0, true);
        firstCircle.stateModel = this._stateModel;
        this._activeCircleShape = firstCircle;
        firstCircleArray.push(firstCircle);
        this._stateModel.circlesArray[0] = firstCircleArray;
    };
    DrawView.prototype.tick = function () {
        this.fpsLabel.text = Math.round(createjs.Ticker.getMeasuredFPS()) + " fps";
        this.stage.update();
    };
    Object.defineProperty(DrawView.prototype, "stateModel", {
        set: function (model) {
            this._stateModel = model;
            this._stateModel.stateChagneSignal.add(this.stateChanged, this, 0);
            this._stateModel.modelUpdated.add(this.modelUpdated, this, 0);
        },
        enumerable: true,
        configurable: true
    });
    DrawView.prototype.modelUpdated = function () {
        for(var i = 0; i < this._stateModel.circlesArray.length; i++) {
            for(var k = 0; k < this._stateModel.circlesArray[i].length; k++) {
                var currentShape = this._stateModel.circlesArray[i][k];
                currentShape.createCircleClones();
            }
        }
    };
    DrawView.prototype.stateChanged = function () {
        console.log("StateChanged to " + this._stateModel.currentState);
    };
    return DrawView;
})(View);
var StageShape = (function (_super) {
    __extends(StageShape, _super);
    function StageShape(x, y, container) {
        this._container = container;
        _super.call(this);
        this.currentState = StageShape.STATE_READY;
    }
    StageShape.STATE_READY = "STATE_READY";
    StageShape.STATE_ANIMATING_IN = "STATE_ANIMATING_IN";
    StageShape.STATE_ANIMATING_OUT = "STATE_ANIMATING_OUT";
    StageShape.STATE_EXPANDED = "STATE_EXPANDED";
    Object.defineProperty(StageShape.prototype, "currentState", {
        get: function () {
            return this._currentState;
        },
        set: function (state) {
            this._currentState = state;
        },
        enumerable: true,
        configurable: true
    });
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
    StageShape.prototype.circleHitTest = function (point, radius, buffer) {
        if (typeof buffer === "undefined") { buffer = 10; }
        if(point.distanceToPoint(new Point(this.x, this.y)) < radius + buffer && point.distanceToPoint(new Point(this.x, this.y)) > radius - buffer) {
            return true;
        } else {
            return false;
        }
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
        this._radius = 50;
        this.removeSignal = new Signal();
        this.removing = false;
        this.graphics.setStrokeStyle(5);
        this.graphics.beginStroke("#000000");
        this.graphics.beginFill("#ffffff").drawCircle(1, 1, this._radius - 2);
        var _this = this;
        this.addEventListener('mousedown', function (evt) {
            _this.onMousePress(evt);
        });
        this.helpLabel = new createjs.Text("Click to begin", "bold 18px Arial", "#000");
        this.container.addChild(this.helpLabel);
        this.helpLabel.x = this.x + 100;
        this.helpLabel.y = this.y;
    }
    Object.defineProperty(CenterCircle.prototype, "radius", {
        get: function () {
            return this._radius;
        },
        enumerable: true,
        configurable: true
    });
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
        if(this.currentState == StageShape.STATE_READY || this.currentState == StageShape.STATE_ANIMATING_OUT) {
            this.currentState = StageShape.STATE_ANIMATING_IN;
            if(!this.removing) {
                var _this = this;
                TweenLite.to(this, 0.5, {
                    scaleX: 1.2,
                    scaleY: 1.2,
                    ease: Quad.easeOut,
                    onComplete: function () {
                        _this.currentState = StageShape.STATE_EXPANDED;
                    }
                });
                document.body.style.cursor = 'move';
            }
            if(this.container.contains(this.helpLabel)) {
                this.removeHelp();
            }
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
        if(this.currentState == StageShape.STATE_EXPANDED || this.currentState == StageShape.STATE_ANIMATING_IN) {
            this.currentState = StageShape.STATE_ANIMATING_OUT;
            if(!this.removing) {
                document.body.style.cursor = 'default';
                var _this = this;
                TweenLite.to(this, 0.5, {
                    scaleX: 1,
                    scaleY: 1,
                    ease: Quad.easeOut,
                    onComplete: function () {
                        _this.currentState = StageShape.STATE_READY;
                    }
                });
            }
        }
    };
    return CenterCircle;
})(StageShape);
var HintCircle = (function (_super) {
    __extends(HintCircle, _super);
    function HintCircle(x, y, radius, stage) {
        _super.call(this, x, y, stage);
        this._circleRadius = radius;
        var x, y;
        for(var ang = 0; ang <= 360; ang += 5) {
            var rad = ang * (Math.PI / 180);
            x = this.x + (this._circleRadius * Math.cos(rad));
            y = this.y + (this._circleRadius * Math.sin(rad));
            this.graphics.beginFill("#000000").drawCircle(x, y, 2);
        }
    }
    Object.defineProperty(HintCircle.prototype, "hintClone", {
        get: function () {
            var shape = this.clone();
            shape.regX = this._circleRadius * 1.1;
            shape.regY = this._circleRadius * 1.1;
            return shape;
        },
        enumerable: true,
        configurable: true
    });
    return HintCircle;
})(StageShape);
var CircleShape = (function (_super) {
    __extends(CircleShape, _super);
    function CircleShape(x, y, container, level, displayVO) {
        _super.call(this, x, y, container);
        this.onMouseClickedSignal = new Signal();
        this.x = x;
        this.y = y;
        this._level = level;
        this._displayVO = displayVO;
        this.graphics.setStrokeStyle(5);
        this.graphics.beginStroke(this._displayVO.strokeColour);
        this.graphics.beginFill("rgba(255,255,0,0)").drawCircle(1, 1, 1);
        this.updating = true;
        this._highlightCircle = new HighlightCircle(100, 100, this.container);
        this._hasHighlightCircle = false;
        this._highlighted = false;
        this._strokeWidth = this._displayVO.strokeWidth;
        var _this = this;
        this.addEventListener('mousedown', function (evt) {
            _this.onMousePress(evt);
        });
        this.currentState = CircleShape.STATE_ACTIVE;
    }
    CircleShape.STATE_ACTIVE = "STATE_ACTIVE";
    CircleShape.STATE_INAACTIVE = "STATE_INACTIVE";
    CircleShape.prototype.createCircleClones = function () {
        if(this._hintCircleShapesAr != null) {
            for(var j = this._hintCircleShapesAr.length + 1; j > 0; j--) {
                var hintShape = this._hintCircleShapesAr[j];
                if(this.container.contains(hintShape)) {
                    this.container.removeChild(hintShape);
                }
                hintShape = null;
            }
        }
        this._hintCircleShapesAr = [];
        var hintRadius = 50;
        var hintCircle = new HintCircle(0, 0, hintRadius, this.container);
        hintCircle.cache(-hintRadius * 1.1, -hintRadius * 1.1, hintRadius * 2 * 1.1, hintRadius * 2 * 1.1);
        for(var i = 0; i < this._stateModel.spawnAmount; i++) {
            this._hintCircleShapesAr[i] = hintCircle.hintClone;
        }
    };
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
        this.graphics.beginStroke(this._displayVO.strokeColour);
        this.graphics.beginFill("rgba(255,255,0,0)").drawCircle(0, 0, this._radius);
        this._strokeWidth = this._displayVO.strokeWidth;
    };
    CircleShape.prototype.getAngleFromCenter = function (point) {
        var reletiveX = point.x - this.x;
        var reletiveY = point.y - this.y;
        var theta = Math.atan2(-reletiveY, -reletiveX);
        if(theta < 0) {
            theta += 2 * Math.PI;
        }
        return theta;
    };
    CircleShape.prototype.highlight = function (angle, originalCircle) {
        this._highlighted = true;
        this._strokeWidth = this._displayVO.highlightStrokeWidth;
        var angleAsDegrees = angle * (180 / Math.PI);
        if(originalCircle == true) {
            this._hasHighlightCircle = true;
            this.container.addChild(this._highlightCircle);
            this._highlightCircle.x = this.x - (this.radius * Math.cos(angle));
            this._highlightCircle.y = this.y - (this.radius * Math.sin(angle));
            for(var l = 0; l < this._stateModel.spawnAmount - 1; l++) {
                var hintShape = this._hintCircleShapesAr[l];
                var position = (angleAsDegrees - ((360 / (this._stateModel.spawnAmount)) * (l + 1))) * (Math.PI / 180);
                hintShape.x = this.x - (this.radius * Math.cos(position));
                hintShape.y = this.y - (this.radius * Math.sin(position));
                this.container.addChild(hintShape);
            }
        } else {
            for(var l = 0; l < this._stateModel.spawnAmount; l++) {
                var hintShape = this._hintCircleShapesAr[l];
                var position = (angleAsDegrees - ((360 / (this._stateModel.spawnAmount)) * l)) * (Math.PI / 180);
                hintShape.x = this.x - (this.radius * Math.cos(position));
                hintShape.y = this.y - (this.radius * Math.sin(position));
                this.container.addChild(hintShape);
            }
        }
    };
    CircleShape.prototype.unHighlight = function () {
        if(this._highlighted == true) {
            this._highlighted = false;
            this._hasHighlightCircle = false;
            if(this.container.contains(this._highlightCircle)) {
                this.container.removeChild(this._highlightCircle);
            }
            for(var j = 0; j < this._hintCircleShapesAr.length; j++) {
                var hintShape = this._hintCircleShapesAr[j];
                if(this.container.contains(hintShape)) {
                    this.container.removeChild(hintShape);
                }
            }
        }
    };
    Object.defineProperty(CircleShape.prototype, "radius", {
        get: function () {
            return this._radius;
        },
        set: function (rad) {
            this._radius = rad;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CircleShape.prototype, "level", {
        get: function () {
            return this._level;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CircleShape.prototype, "stateModel", {
        set: function (model) {
            this._stateModel = model;
            this.createCircleClones();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CircleShape.prototype, "hasHighlightCircle", {
        get: function () {
            return this._hasHighlightCircle;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CircleShape.prototype, "highlightCircle", {
        get: function () {
            return this._highlightCircle;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CircleShape.prototype, "hintCircleShapesAr", {
        get: function () {
            return this._hintCircleShapesAr;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CircleShape.prototype, "highlighted", {
        get: function () {
            return this._highlighted;
        },
        enumerable: true,
        configurable: true
    });
    CircleShape.prototype.onMouseOver = function (evt) {
        console.log("this on over");
        console.log(this);
    };
    CircleShape.prototype.onMousePress = function (evt) {
        console.log("onMousePress");
        this.onMouseClickedSignal.dispatch(this);
    };
    return CircleShape;
})(StageShape);
var HighlightCircle = (function (_super) {
    __extends(HighlightCircle, _super);
    function HighlightCircle(x, y, stage) {
        _super.call(this, x, y, stage);
        this._circleRadius = 50;
        this.graphics.setStrokeStyle(5);
        this.graphics.beginStroke("#000000");
        this.graphics.beginFill("#ffffff").drawCircle(1, 1, this._circleRadius - 2);
        var _this = this;
        this.alpha = 0.8;
    }
    HighlightCircle.prototype.onMousePress = function (evt) {
        console.log("onMousePress");
    };
    return HighlightCircle;
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
var StateModel = (function () {
    function StateModel() {
        this.stateChagneSignal = new Signal();
        this.modelUpdated = new Signal();
        this._circlesArray = [];
    }
    StateModel.STATE_START = "STATE_START";
    StateModel.STATE_CREATE = "STATE_CREATE";
    StateModel.STATE_RESIZING = "STATE_RESIZING";
    StateModel.prototype.init = function () {
        this._currentState = StateModel.STATE_START;
        this._spawnAmount = 6;
        this._currentCircleDepth = 0;
    };
    Object.defineProperty(StateModel.prototype, "currentState", {
        get: function () {
            return this._currentState;
        },
        set: function (state) {
            this._currentState = state;
            this.stateChagneSignal.dispatch(this._currentState);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateModel.prototype, "circlesArray", {
        get: function () {
            return this._circlesArray;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateModel.prototype, "currentCircleDepth", {
        get: function () {
            return this._currentCircleDepth;
        },
        set: function (num) {
            this._currentCircleDepth = num;
        },
        enumerable: true,
        configurable: true
    });
    StateModel.prototype.spawnAmountAdd = function () {
        this.spawnAmount = this.spawnAmount + 1;
    };
    StateModel.prototype.spawnAmountSubtract = function () {
        if(this._spawnAmount >= 1) {
            this.spawnAmount = this.spawnAmount - 1;
        }
    };
    Object.defineProperty(StateModel.prototype, "spawnAmount", {
        get: function () {
            return this._spawnAmount;
        },
        set: function (num) {
            this._spawnAmount = num;
            this.modelUpdated.dispatch(null);
        },
        enumerable: true,
        configurable: true
    });
    return StateModel;
})();
var SacretGeometry = (function () {
    function SacretGeometry(container) {
        this.container = container;
        this.stateModel = new StateModel();
        this.stateModel.init();
        this.stageView = new StageView(this.container);
        this.stageView.stateModel = this.stateModel;
        this.stageView.init();
        this.drawView = new DrawView(this.container);
        this.drawView.stateModel = this.stateModel;
        this.drawView.stage = this.stageView.stage;
        this.drawView.init();
    }
    return SacretGeometry;
})();
//@ sourceMappingURL=Main.js.map
