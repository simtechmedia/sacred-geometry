class DrawView extends View
{
    private fpsLabel            : createjs.Text;            // FPS LABEL

    private _debugBox           : createjs.Text;            // Debug Label

    private circlesContainer    : createjs.Container;       // Container for Circles

    private _activeCircleShape  : CircleShape;              // Current Active Shape

    //private _shapesArray        : CircleShape [] ;          // Array of circles

    private _currentMousePos    : Point   ;                 // Mouse Point acording to stage

    private _highlightCircle    : HighlightCircle ;         // Circle use for pin pointing

    private _hintCircleAr       : createjs.Shape[];         // Hint Circle Array

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

        // First Circle Array will only have center circle
        var centerCircleArray  = [];
        var centerCicle : CenterCircle          = new CenterCircle(0 , 0, this.circlesContainer);
        centerCicle.removeSignal.addOnce(this.removeCenterCircle, this, 0);
        this.circlesContainer.addChild(centerCicle);
        centerCircleArray.push(centerCicle);
        this._stateModel.circlesArray.push(centerCircleArray);

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
        // Clear Old Ones if any
        if( this._hintCircleAr != null)
        {
            for ( var j : number = this._hintCircleAr.length+1 ; j > 0 ; j-- )
            {
                var hintShape : createjs.Shape = this._hintCircleAr[j];
                if( this.circlesContainer.contains(hintShape) ) this.circlesContainer.removeChild(hintShape);
                hintShape = null;
            }
        }

        this._hintCircleAr = [];

        // Creates First Hint Circle
        var hintRadius : number     = 50;
        var hintCircle : HintCircle = new HintCircle( 0 , 0 , hintRadius,  this.circlesContainer );
        hintCircle.cache( -hintRadius*1.1 , -hintRadius*1.1 , hintRadius*2*1.1 , hintRadius*2*1.1 );

        for( var i : number = 0 ; i < this._stateModel.spawnAmount ; i++ )
        {
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

                if ( this._stateModel.circlesArray[0][0].circleHitTest(this._currentMousePos , this._stateModel.circlesArray[0][0].radius , 50 ) ){
                    this._stateModel.circlesArray[0][0].onMouseOver(null);
                } else {
                    this._stateModel.circlesArray[0][0].onMouseOut(null);
                }
                break;

            case StateModel.STATE_RESIZING:

                if( this._activeCircleShape ) {
                    this._activeCircleShape.currentMousePos = currentMousePoint;
                    this._activeCircleShape.update();

                    // First Center Circle Won't have active grouop
                    if ( this._stateModel.circlesArray[this._stateModel.currentCircleDepth] != undefined )
                    {
                        for ( var k : number = 0 ; k  < this._stateModel.circlesArray[this._stateModel.currentCircleDepth].length ; k++ )
                        {
                            var hintedCircle : CircleShape = this._stateModel.circlesArray[this._stateModel.currentCircleDepth][k];
                            hintedCircle.radius = this._activeCircleShape.radius;
                            hintedCircle.update();
                        }
                    }
                }
                break;

            case StateModel.STATE_CREATE:
                var highlighted : bool = false;        // To Find Out if any shape is being rolled over

                for ( var i : number = 0 ; i < this._stateModel.circlesArray.length ; i ++ ) {

                    for ( var k : number = 0 ; k < this._stateModel.circlesArray[i].length ; k ++ ) {

                        var currentShape : CircleShape =  this._stateModel.circlesArray[i][k];

                        if (  currentShape.circleHitTest( this._currentMousePos , currentShape.radius, 10 ) ) {

                            console.log( "currentShape.level " + currentShape.level );


                            // Highlights Active Circle
                            //currentShape.highLight();


                            // Get Angle reletive to center circle ( snap effect );
                            var angle : number      = currentShape.getAngleFromCenter( this._currentMousePos );
                            // move temp circle to the angle of current circle
                            this.circlesContainer.addChild(this._highlightCircle);
                            this._highlightCircle.x = currentShape.x - ( currentShape.radius * Math.cos( angle ) );
                            this._highlightCircle.y = currentShape.y - ( currentShape.radius * Math.sin( angle ) );
                            highlighted = true;
                            // Change Mouse Icon To Circle
                            var angleAsDegrees : number = angle * (180/Math.PI);

                            // Hightlights all circle on the same level
                            // need to make it to create hint circles on all levels
                            for ( var j : number = 0 ; j < this._stateModel.circlesArray[currentShape.level].length ; j++ )
                            {
                                var shapeThatNeedsHighliting : CircleShape = this._stateModel.circlesArray[currentShape.level][j];
                                shapeThatNeedsHighliting.highLight();

                            }

                            // Creates Hinting Circle(s) on current circle
                            for( var j : number = 0 ; j < this._stateModel.spawnAmount ; j++ )
                            {
                                var hintShape : createjs.Shape = this._hintCircleAr[j];
                                var position : number = ( angleAsDegrees - ( ( 360 / ( this._stateModel.spawnAmount + 1 ) ) * ( j + 1 ) ) ) * ( Math.PI/180 ) ;
                                hintShape.x = currentShape.x - ( currentShape.radius * Math.cos( position ) ) ;
                                hintShape.y = currentShape.y - ( currentShape.radius * Math.sin( position ) );
                                this.circlesContainer.addChild(hintShape);
                            }
                        }
                        currentShape.update();
                    }
                }

                if(!highlighted)
                {
                    // Get ride of circles highlight if not needed
                    if(this.circlesContainer.contains(this._highlightCircle))
                    {
                        this.circlesContainer.removeChild(this._highlightCircle);
                        // Clear the hints

                        console.log("this._stateModel.spawnAmount = " + this._stateModel.spawnAmount);
                        for( var j : number = 0 ; j < this._stateModel.spawnAmount ; j++ ) {
                            var hintShape : createjs.Shape = this._hintCircleAr[j];
                            if(this.circlesContainer.contains(hintShape))this.circlesContainer.removeChild(hintShape);
                        }
                    }
                }
                break;
        }
    }

    private onStageClick ( event ) : void
    {

        switch ( this._stateModel.currentState )
        {
            case StateModel.STATE_START:

                // Check for Center Shape
                // Eventually will loop through circles array
                if ( this._stateModel.circlesArray[0][0].circleHitTest(this._currentMousePos , this._stateModel.circlesArray[0][0].radius, 50 ) ){
                    this._stateModel.circlesArray[0][0].onMousePress(null);

                }
                break;

            case StateModel.STATE_RESIZING:

                // Will Eventually go back to whatever state it was last time
                this._activeCircleShape                     = null;
                this._stateModel.currentState               = StateModel.STATE_CREATE;

                break;

            case StateModel.STATE_CREATE:

                // If highlight circle is on
                // then it's a valid click for a new circle
                if(this.circlesContainer.contains(this._highlightCircle))
                {
                    // Adds Cirlce Depth
                    this._stateModel.currentCircleDepth ++;

                    // Add Circle Where Highlight was

                    var currentCircleDepthAr   = [];

                    var newCircleFromPointer  = this.addCircle( this._highlightCircle.x , this._highlightCircle.y, this._stateModel.currentCircleDepth,  true  );
                    newCircleFromPointer.stateModel = this._stateModel;
                    currentCircleDepthAr.push(newCircleFromPointer);

                    // Clears the highlight
                    this.circlesContainer.removeChild(this._highlightCircle);


                    // add circle(s) where hinting was
                    for( var i : number = 0  ; i < this._hintCircleAr.length ; i++ )
                    {

                        var hintShape : createjs.Shape      = this._hintCircleAr[i];
                        var newCircleFromHint               = this.addCircle( hintShape.x , hintShape.y, this._stateModel.currentCircleDepth );
                        newCircleFromHint                   = this._stateModel ;
                        currentCircleDepthAr.push(newCircleFromHint);

                        // Clear Hint
                        this.circlesContainer.removeChild(hintShape);
                    }
                    //

                    // Push the new circle depth into array
                    this._stateModel.circlesArray[this._stateModel.currentCircleDepth] = currentCircleDepthAr;
                }
                break;
        }
    }

    public resize() {
        console.log("stage resize");
        // Content: centered
        this.circlesContainer.x     =  window.innerWidth / 2;
        this.circlesContainer.y     =  window.innerHeight / 2;
        //this._activeCircleShape.currentMouse = new Point()
    }

    private addCircle( x , y , level:number, active:bool = false ) : CircleShape
    {

        console.log( " add circle at level " + level )
        this._stateModel.currentState = StateModel.STATE_RESIZING;

        var circleShape : CircleShape   = new CircleShape( x , y , this.stage, level, StageShape.createDisplayVO(5, 10 , '#'+Math.floor(Math.random()*16777215).toString(16)  ));
        this.circlesContainer.addChild(circleShape);
        if(active) this._activeCircleShape         = circleShape;       // Make the active circle control the sizing
        return circleShape;
    }

    // Remove Shape from stage
    private removeCenterCircle( shape : StageShape ) : void
    {
        this.circlesContainer.removeChild(shape);

        var firstCircleArray  = [];
        var firstCircle : CircleShape = this.addCircle(shape.x, shape.y, 0 , true );
        this._activeCircleShape = firstCircle;
        firstCircleArray.push(firstCircle);

        // Replace Center Circle with this one
        this._stateModel.circlesArray[0] = firstCircleArray
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
        this._stateModel.modelUpdated.add(this.modelUpdated, this, 0 );
    }
    private modelUpdated(): void
    {
        // Model update , release the clones
        this.createCircleClones();
    }

    private stateChanged(): void
    {
        console.log("StateChanged to " + this._stateModel.currentState );
    }
}
