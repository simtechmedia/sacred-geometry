class DrawView extends View
{
    private fpsLabel            : createjs.Text;            // FPS LABEL

    private _debugBox           : createjs.Text;            // Debug Label

    private circlesContainer    : createjs.Container;       // Container for Circles

    private _activeCircleShape  : CircleShape;              // Current Active Shape

    private _shapesArray        : CircleShape [] ;          // Array of circles

    private _currentMousePos    : Point   ;                 // Mouse Point acording to stage

    private _highlightCircle    : HighlightCircle ;         // Circle use for pin pointing

    // to be moved to model

    private circleSplit         : number = 4;

    constructor( container ) {
        super(container);
    }

    public init(){
        console.log("Drawview Init");

        // Init Mouse Point
        this._currentMousePos   = new Point(0,0);

        this.circlesContainer   = new createjs.Container();
        this.stage.addChild(this.circlesContainer);

        // Init Circles Array
        this._shapesArray       = [];

        // add a text object to output the current FPS:
        // might move this into a debug view soon
        this.fpsLabel           = new createjs.Text("-- fps","bold 18px Give You Glory","#000");
        this.stage.addChild(this.fpsLabel);
        this.fpsLabel.x         = 400;
        this.fpsLabel.y         = 0;

        this._debugBox          = new createjs.Text("-- debugBox","bold 18px Give You Glory","#000");
        this.stage.addChild(this._debugBox);
        this._debugBox.x        = 10;
        this._debugBox.y        = 10;

        var centerCircle : CenterCircle = new CenterCircle(0 , 0, this.circlesContainer);
        centerCircle.removeSignal.addOnce(this.removeObject, this, 0);
        this.circlesContainer.addChild(centerCircle);

        // start the tick and point it at the window so we can do some work before updating the stage:
        var _this : DrawView    = this;
        createjs.Ticker.addEventListener('tick', function():void {
            _this.tick();
        });

        this._highlightCircle   = new HighlightCircle(100,100 , this.circlesContainer)

        // Move this
        this.stage.onMouseMove          = function(evt) {

            _this._currentMousePos.x    = evt.rawX - window.innerWidth / 2;
            _this._currentMousePos.y    = evt.rawY - window.innerHeight / 2;

            // Shoot out current mouse position
            _this._debugBox.text        = "xMouse: "+_this._currentMousePos.x+","+_this._currentMousePos.y;

            var currentMousePoint:Point = new Point( evt.stageX , evt.stageY );


            // Active means it's resizing / being selected
            if( _this._activeCircleShape ) {
                // This changes the radius of the circle ( adjusting it's size ) ;
                _this._activeCircleShape.currentMousePos = currentMousePoint;
                _this._activeCircleShape.update();
            }

            // Check for Center Shape
            // Eventually will loop through circles array
            if ( centerCircle.circleHitTest(_this._currentMousePos , centerCircle.radius , 50 ) ){
                centerCircle.onMouseOver(null);
            } else {
                centerCircle.onMouseOut(null);
            }

            //for ( var shape : CircleShape  in this._shapesArray)
            var highlighted : bool = false;        // To Find Out if any shape is being rolled over
            for ( var i : number = 0 ; i < _this._shapesArray.length ; i ++ ) {
                var currentShape : CircleShape =  _this._shapesArray[i];
                if (  currentShape.circleHitTest( _this._currentMousePos , currentShape.radius, 10 ) ) {

                    // Highlights Active Circle
                    currentShape.highLight();

                    // Get Angle reletive to center circle ( snap effect );
                    var angle : number      = currentShape.getAngleFromCenter( _this._currentMousePos );
                    // move temp circle to the angle of current circle
                    _this.circlesContainer.addChild(_this._highlightCircle);
                    _this._highlightCircle.x = currentShape.x - ( currentShape.radius * Math.cos( angle ) );
                    _this._highlightCircle.y = currentShape.y - ( currentShape.radius * Math.sin( angle ) );
                    highlighted = true;
                    // Change Mouse Icon To Circle
                }
                // Reupdating all the circles for now
                // need to change this
                //currentShape.update();
            }

            if(!highlighted)
            {
                // Get ride of circles highlight if not needed
                if(_this.circlesContainer.contains(_this._highlightCircle)) _this.circlesContainer.removeChild(_this._highlightCircle);
            }
        }

        var _this = this;
        this.stage.onClick = function ( evt ) {
            console.log("click xMouse: "+_this._currentMousePos.x+","+_this._currentMousePos.y );

            // Check for Center Shape
            // Eventually will loop through circles array
            if ( centerCircle.circleHitTest(_this._currentMousePos , centerCircle.radius, 50 ) ){
                centerCircle.onMousePress(null);
            }

            for ( var i : number = 0 ; i < _this._shapesArray.length ; i ++ ) {
                var currentShape : CircleShape =  _this._shapesArray[i];
                // CLick on all circles, no need for hittest for now..
                currentShape.onMousePress(null);
            }

            if(_this._activeCircleShape != null )
            {
                // Adds Active Shape into shapes array and unactivates it
                var currentShape : CircleShape = _this._activeCircleShape;
                _this._shapesArray.push( currentShape );
                _this._activeCircleShape = null;
            }

            // If highlight is on stage that means a new one is ready to be spawned
            if(_this.circlesContainer.contains(_this._highlightCircle))
            {
                _this.addCircle( _this._highlightCircle.x , _this._highlightCircle.y );
            }
        }

        window.addEventListener('resize', function() {
            _this.resize();
        });
        this.resize();
    }

    public resize() {
        console.log("stage resize");
        // Content: centered
        this.circlesContainer.x     =  window.innerWidth / 2;
        this.circlesContainer.y     =  window.innerHeight / 2;
        //this._activeCircleShape.currentMouse = new Point()
    }

    private addCircle( x , y ) : void
    {
        console.log ( "Adding circle at " + x + " y : " + y );
        var circleShape : CircleShape   = new CircleShape( x , y , this.stage, StageShape.createDisplayVO() )
        circleShape.onMouseClickedSignal.addOnce(this.centerCircleClick, this, 0);
        this.circlesContainer.addChild(circleShape);
        this._activeCircleShape         = circleShape;

        // Thhis gets pushed after click now
        //this._shapesArray.push(circleShape);        // Push Created Shape Into Array;
    }

    private centerCircleClick( circleShape : CircleShape )
    {
        console.log ( "circle Shape clicked") ;
        this._activeCircleShape     = null;
        circleShape.currentState    = CircleShape.STATE_INAACTIVE;
        /*
        switch ( circleShape.currentState )
        {
            // Shaps is resizing
            case CircleShape.STATE_ACTIVE:
                this._activeCircleShape = null;
                circleShape.currentState = CircleShape.STATE_INAACTIVE;
                break;
            // Shape is ready to spawn a new circle
            case CircleShape.STATE_INAACTIVE:
                this.addCircle( circleShape.x , circleShape.y );
                break;
        }*/
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
        //if (circle.hitTest(stage.mouseX, stage.mouseY)) { circle.alpha = 1; }
        this.fpsLabel.text = Math.round(createjs.Ticker.getMeasuredFPS())+" fps";
        this.stage.update();
    }
}
