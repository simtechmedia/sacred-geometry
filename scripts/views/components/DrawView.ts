class DrawView extends View
{

    private fpsLabel : createjs.Text;

    private circlesContainer : createjs.Container;

    private _activeShape : StageShape;

    constructor( container ) {
        super(container);
    }

    public init(){
        console.log("Drawview Init");

        this.circlesContainer = new createjs.Container();
        this.stage.addChild(this.circlesContainer);

        // add a text object to output the current FPS:
        // might move this into a debug view soon
        this.fpsLabel = new createjs.Text("-- fps","bold 18px Arial","#FFF");
        this.stage.addChild(this.fpsLabel);
        this.fpsLabel.x = 400;
        this.fpsLabel.y = 0;

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
            //console.log("stageX/Y: "+evt.stageX+","+evt.stageY); // always in bounds
            //console.log("rawX/Y: "+evt.rawX+","+evt.rawY); // could be < 0, or > width/height

            //var point : createjs.Point = new createjs.Point(0,0)

            if(_this._activeShape) {
                //_this._activeShape.currentMousePos = currentMousePoint;
                //_this._activeShape.update();
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
        var circleShape : CircleShape = new CircleShape(x,y, this.stage)
        this.circlesContainer.addChild(circleShape);

        this._activeShape = circleShape;
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
//        if(!this.stage) {
//            // If stage isn't ready, the tick is canceled
//            return;
//        }

        this.fpsLabel.text = Math.round(createjs.Ticker.getMeasuredFPS())+" fps";
        this.stage.update();
    }
}
