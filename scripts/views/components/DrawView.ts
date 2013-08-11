class DrawView extends View
{
    private fpsLabel            : createjs.Text;            // FPS LABEL

    private _debugBox           : createjs.Text;            // Debug Label

    private circlesContainer    : createjs.Container;       // Container for Circles

    private _activeCircleShape  : CircleShape;              // Current Active Shape

    private _shapesArray        : CircleShape [] ;          // Array of circles

    private _currentMousePos    : Point   ;                 // Mouse Point acording to stage

    private _highlightCircle    : HighlightCircle ;         // Circle use for pin pointing

    private _hintCircleAr       : createjs.Shape[];         // Hint Circle Array

    // to be moved to models

    private _hintNumber         : number = 4;               // Number of circle hinting

    private _centerCircle        : CenterCircle;             // Init Center Circle

    private _stateModel         : StateModel;

    constructor( container ) {
        super(container);
    }

    public init(){
        console.log("Drawview Init");

        // Init Mouse Point
        this._currentMousePos       = new Point(0,0);

        this.circlesContainer       = new createjs.Container();
        this.stage.addChild(this.circlesContainer);

        // Init Circles Array
        this._shapesArray           = [];

        // add a text object to output the current FPS:
        // might move this into a debug view soon
        this.fpsLabel               = new createjs.Text("-- fps","bold 18px Give You Glory","#000");
        this.stage.addChild(this.fpsLabel);
        this.fpsLabel.x             = 400;
        this.fpsLabel.y             = 0;

        this._debugBox              = new createjs.Text("-- debugBox","bold 18px Give You Glory","#000");
        this.stage.addChild(this._debugBox);
        this._debugBox.x            = 10;
        this._debugBox.y            = 10;

        this._centerCircle          = new CenterCircle(0 , 0, this.circlesContainer);
        this._centerCircle.removeSignal.addOnce(this.removeCenterCircle, this, 0);
        this.circlesContainer.addChild(this._centerCircle);

        this._highlightCircle       = new HighlightCircle(100,100 , this.circlesContainer);

        // Listeniners
        // start the tick and point it at the window so we can do some work before updating the stage:
        var _this : DrawView        = this;
        createjs.Ticker.addEventListener('tick', function():void {
            _this.tick();
        });

        // Move this
        this.stage.onMouseMove      = function(evt) {
            _this.onMouseMove(evt);
        }

        this.stage.onClick          = function ( evt ) {
            _this.onStageClick(evt);
        }

        window.addEventListener('resize', function() {
            _this.resize();
        });
        this.resize();

        // Creates Highlight circles
        this.createCircleClones();
    }

    private createCircleClones(): void
    {
        console.log("Creating clones " + this._hintNumber )

        this._hintCircleAr = [];

        // Creates First Hint Circle
        var hintRadius : number     = 50;
        var hintCircle : HintCircle = new HintCircle( 0 , 0 , hintRadius,  this.circlesContainer );
        hintCircle.cache( -hintRadius*1.1 , -hintRadius*1.1 , hintRadius*2*1.1 , hintRadius*2*1.1 );

        for( var i : number = 0 ; i < this._hintNumber ; i++ )
        {
            console.log("Created clone");
            this._hintCircleAr[i] = hintCircle.hintClone;
        }

    }

    private onMouseMove( evt )
    {
        this._currentMousePos.x    = evt.rawX - window.innerWidth / 2;
        this._currentMousePos.y    = evt.rawY - window.innerHeight / 2;

        // Shoot out current mouse position
        this._debugBox.text        = "xMouse: "+this._currentMousePos.x+","+this._currentMousePos.y;

        var currentMousePoint:Point = new Point( evt.stageX , evt.stageY );

        switch ( this._stateModel.currentState )
        {
            case StateModel.STATE_START:

                if ( this._centerCircle.circleHitTest(this._currentMousePos , this._centerCircle.radius , 50 ) ){
                    this._centerCircle.onMouseOver(null);
                } else {
                    this._centerCircle.onMouseOut(null);
                }
                break;

            case StateModel.STATE_RESIZING:

                if( this._activeCircleShape ) {
                    this._activeCircleShape.currentMousePos = currentMousePoint;
                    this._activeCircleShape.update();
                }
                break;

            case StateModel.STATE_CREATE:

                var highlighted : bool = false;        // To Find Out if any shape is being rolled over
                for ( var i : number = 0 ; i < this._shapesArray.length ; i ++ ) {
                    var currentShape : CircleShape =  this._shapesArray[i];
                    if (  currentShape.circleHitTest( this._currentMousePos , currentShape.radius, 10 ) ) {

                        // Highlights Active Circle
                        currentShape.highLight();

                        // Get Angle reletive to center circle ( snap effect );
                        var angle : number      = currentShape.getAngleFromCenter( this._currentMousePos );
                        // move temp circle to the angle of current circle
                        this.circlesContainer.addChild(this._highlightCircle);
                        this._highlightCircle.x = currentShape.x - ( currentShape.radius * Math.cos( angle ) );
                        this._highlightCircle.y = currentShape.y - ( currentShape.radius * Math.sin( angle ) );
                        highlighted = true;
                        // Change Mouse Icon To Circle

                        var angleAsDegrees : number = angle * (180/Math.PI);

                        // Creates Hinting Circle(s)
                        for( var i : number = 0 ; i < this._hintNumber ; i++ )
                        {
                            var hintShape : createjs.Shape = this._hintCircleAr[i];
                            var position : number = ( angleAsDegrees - ( ( 360 / ( this._hintNumber + 1 ) ) * ( i + 1 ) ) ) * ( Math.PI/180 ) ;
                            hintShape.x = currentShape.x - ( currentShape.radius * Math.cos( position ) ) ;
                            hintShape.y = currentShape.y - ( currentShape.radius * Math.sin( position ) );
                            this.circlesContainer.addChild(hintShape);
                        }
                    }
                }

                if(!highlighted)
                {
                    // Get ride of circles highlight if not needed
                    if(this.circlesContainer.contains(this._highlightCircle)) this.circlesContainer.removeChild(this._highlightCircle);
                }

                break;


        }


        /*
        // Active means it's resizing / being selected
        if( this._activeCircleShape ) {
            // This changes the radius of the circle ( adjusting it's size ) ;
            this._activeCircleShape.currentMousePos = currentMousePoint;
            this._activeCircleShape.update();
        }

        // Check for Center Shape
        // Eventually will loop through circles array
        if ( this._centerCircle.circleHitTest(this._currentMousePos , this._centerCircle.radius , 50 ) ){
            this._centerCircle.onMouseOver(null);
        } else {
            this._centerCircle.onMouseOut(null);
        }


        //for ( var shape : CircleShape  in this._shapesArray)
        var highlighted : bool = false;        // To Find Out if any shape is being rolled over
        for ( var i : number = 0 ; i < this._shapesArray.length ; i ++ ) {
            var currentShape : CircleShape =  this._shapesArray[i];
            if (  currentShape.circleHitTest( this._currentMousePos , currentShape.radius, 10 ) ) {

                // Highlights Active Circle
                currentShape.highLight();

                // Get Angle reletive to center circle ( snap effect );
                var angle : number      = currentShape.getAngleFromCenter( this._currentMousePos );
                // move temp circle to the angle of current circle
                this.circlesContainer.addChild(this._highlightCircle);
                this._highlightCircle.x = currentShape.x - ( currentShape.radius * Math.cos( angle ) );
                this._highlightCircle.y = currentShape.y - ( currentShape.radius * Math.sin( angle ) );
                highlighted = true;
                // Change Mouse Icon To Circle

                var angleAsDegrees : number = angle * (180/Math.PI);

                // Creates Hinting Circle
                for( var i : number = 0 ; i < this._hintNumber ; i++ )
                {
                   var hintShape : createjs.Shape = this._hintCircleAr[i];
                   var position : number = ( angleAsDegrees - ( ( 360 / ( this._hintNumber + 1 ) ) * ( i + 1 ) ) ) * ( Math.PI/180 ) ;
                   hintShape.x = currentShape.x - ( currentShape.radius * Math.cos( position ) ) ;
                   hintShape.y = currentShape.y - ( currentShape.radius * Math.sin( position ) );
                   this.circlesContainer.addChild(hintShape);
                }

                // Place circle /


            }
            // Reupdating all the circles for now
            // need to change this
            //currentShape.update();
        }

        if(!highlighted)
        {
            // Get ride of circles highlight if not needed
            if(this.circlesContainer.contains(this._highlightCircle)) this.circlesContainer.removeChild(this._highlightCircle);
        }

         */
    }

    private onStageClick ( event ) : void
    {

        switch ( this._stateModel.currentState )
        {
            case StateModel.STATE_START:

                // Check for Center Shape
                // Eventually will loop through circles array
                if ( this._centerCircle.circleHitTest(this._currentMousePos , this._centerCircle.radius, 50 ) ){
                    this._centerCircle.onMousePress(null);
                }
                break;

            case StateModel.STATE_RESIZING:

                // Will Eventually go back to whatever state it was last time
                this._activeCircleShape         = null;
                this._stateModel.currentState   = StateModel.STATE_CREATE;

                break;

            case StateModel.STATE_CREATE:

                // If highlight circle is on
                // then it's a valid click for a new circle
                if(this.circlesContainer.contains(this._highlightCircle))
                {
                    // Add Circle Where Highlight was
                    this.addCircle( this._highlightCircle.x , this._highlightCircle.y, true  );

                    // add circle(s) where hinting was
                    for( var i : number = 0  ; i < this._hintCircleAr.length ; i++ )
                    {
                        var hintShape : createjs.Shape = this._hintCircleAr[i];
                        this.addCircle( hintShape.x , hintShape.y );
                    }
                }
                break;
        }


        /*

        // Not sure what this does?
        //
        for ( var i : number = 0 ; i < this._shapesArray.length ; i ++ ) {
            var currentShape : CircleShape =  this._shapesArray[i];
            // CLick on all circles, no need for hittest for now..
            currentShape.onMousePress(null);
        }


        if(this._activeCircleShape != null )
        {
            // Adds Active Shape into shapes array and unactivates it
            var currentShape : CircleShape = this._activeCircleShape;
            this._shapesArray.push( currentShape );
            this._activeCircleShape = null;
        }



        // If highlight is on stage that means a new one is ready to be spawned
        // Now also creates a circle on the hints, need to move all of this to models soon.. soon
        if(this.circlesContainer.contains(this._highlightCircle))
        {

            console.log("add circle")
            // Add Circle Where Highlight was
            this.addCircle( this._highlightCircle.x , this._highlightCircle.y );

            // add circle(s) where hinting was
            for( var i : number = 0  ; i < this._hintCircleAr.length ; i++ )
            {
                console.log("add hint circle")
                var hintShape : createjs.Shape = this._hintCircleAr[i];
                this.addCircle( hintShape.x , hintShape.y );
            }
        }

         */
    }

    public resize() {
        console.log("stage resize");
        // Content: centered
        this.circlesContainer.x     =  window.innerWidth / 2;
        this.circlesContainer.y     =  window.innerHeight / 2;
        //this._activeCircleShape.currentMouse = new Point()
    }

    private addCircle( x , y , active:bool = false ) : void
    {
        this._stateModel.currentState = StateModel.STATE_RESIZING;

        var circleShape : CircleShape   = new CircleShape( x , y , this.stage, StageShape.createDisplayVO() )
        //circleShape.onMouseClickedSignal.addOnce(this.centerCircleClick, this, 0);
        this.circlesContainer.addChild(circleShape);
        if(active) this._activeCircleShape         = circleShape;       // Make the active circle control the sizing
        this._shapesArray.push( circleShape );                          // Adds it it can be detecte

        // Thhis gets pushed after click now
        //this._shapesArray.push(circleShape);        // Push Created Shape Into Array;
    }

    // Remove Shape from stage
    private removeCenterCircle( shape : StageShape ) : void
    {
        this.circlesContainer.removeChild(shape);
        this.addCircle(shape.x, shape.y, true );
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

    public set stateModel( model : StateModel )
    {
        this._stateModel = model;
        this._stateModel.stateChagneSignal.add(this.stateChanged, this, 0 );
    }

    private stateChanged(): void
    {
        console.log("StateChanged to " + this._stateModel.currentState );
    }
}
