class DrawView extends View
{

    private fpsLabel : createjs.Text;           // FPS LABEL

    private _debugBox : createjs.Text;          // Debug Label

    private circlesContainer : createjs.Container;  // Container for Circles

    private _activeShape : StageShape;          // Current Active Shape

    private _shapesArray : CircleShape [] ;     // Array of circles

    private _currentMousePos : Point   ;        // Mouse Point acording to stage

    constructor( container ) {
        super(container);
    }

    public init(){
        console.log("Drawview Init");

        // Init Mouse Point
        this._currentMousePos = new Point(0,0);

        this.circlesContainer = new createjs.Container();
        this.stage.addChild(this.circlesContainer);

        // Init Circles Array
        this._shapesArray = [];

        // add a text object to output the current FPS:
        // might move this into a debug view soon
        this.fpsLabel = new createjs.Text("-- fps","bold 18px Arial","#FFF");
        this.stage.addChild(this.fpsLabel);
        this.fpsLabel.x = 400;
        this.fpsLabel.y = 0;

        this._debugBox = new createjs.Text("-- debugBox","bold 18px Arial","#FFF");
        this.stage.addChild(this._debugBox);
        this._debugBox.x = 10;
        this._debugBox.y = 10;

        var centerCircle : CenterCircle = new CenterCircle(0 , 0, this.circlesContainer);
        centerCircle.removeSignal.addOnce(this.removeObject, this, 0);
        this.circlesContainer.addChild(centerCircle);

        // start the tick and point it at the window so we can do some work before updating the stage:
        var _this = this;
        createjs.Ticker.addEventListener('tick', function():void {
            _this.tick();
        });


        // Move this
        this.stage.onMouseMove = function(evt) {

            _this._currentMousePos.x = evt.rawX - window.innerWidth / 2;
            _this._currentMousePos.y = evt.rawY - window.innerHeight / 2;

            _this._debugBox.text = "xMouse: "+_this._currentMousePos.x+","+_this._currentMousePos.y;

            //console.log("stageX/Y: "+evt.stageX+","+evt.stageY); // always in bounds
            //console.log("rawX/Y: "+evt.rawX+","+evt.rawY); // could be < 0, or > width/height

            var currentMousePoint:Point = new Point( evt.stageX , evt.stageY );

            if(_this._activeShape) {
                _this._activeShape.currentMousePos = currentMousePoint;
                _this._activeShape.update();
            }
        }

        var _this = this;
        window.addEventListener('resize', function() {
            _this.resize();
        });
        this.resize();
    }

    public resize() {
        console.log("stage resize");
        // Content: centered
        this.circlesContainer.x =  window.innerWidth / 2;
        this.circlesContainer.y =  window.innerHeight / 2;
        //this._activeShape.currentMouse = new Point()
    }

    private addCircle( x , y ) : void
    {
        var circleShape : CircleShape   = new CircleShape(x,y, this.stage)
        circleShape.onMouseClickedSignal.addOnce(this.resizeDone, this, 0);
        this.circlesContainer.addChild(circleShape);
        this._activeShape               = circleShape;
        this._shapesArray.push(circleShape);        // Push Created Shape Into Array;


    }

    private resizeDone()
    {
        this._activeShape = null;
    }

    // Remove Shape from stage
    private removeObject( shape : StageShape ) : void
    {
        this.addCircle(shape.x, shape.y);
        this.circlesContainer.removeChild(shape);
    }

    /**
     * onTick Handler
     */
    private tick():void
    {


        //for ( var shape : CircleShape  in this._shapesArray)
        for ( var i : number = 0 ; i < this._shapesArray.length ; i ++ ) {
           var currentShape : CircleShape =  this._shapesArray[i];

           if (  currentShape.circleHitTest( this._currentMousePos ) ) {
               currentShape.alpha = 0;
           } else {
               currentShape.alpha = 1;
           }
            // Reupdating all the circles for now
            // need to change this
            currentShape.update();
        }

        //if (circle.hitTest(stage.mouseX, stage.mouseY)) { circle.alpha = 1; }
        this.fpsLabel.text = Math.round(createjs.Ticker.getMeasuredFPS())+" fps";
        this.stage.update();
    }
}
