class CircleShape extends StageShape
{
    private updating : bool;

    private _radius : number;

    public onMouseClickedSignal : Signal = new Signal();

    private _strokeWidth    : number;

    private _displayVO       : DisplayVO;

    public static STATE_ACTIVE      : String = "STATE_ACTIVE";        // state for when the circle is getting resized

    public static STATE_INAACTIVE   : String = "STATE_INACTIVE";      // when nothing's goign on

    private _level : number;        // What level the circle is at

    private _stateModel : StateModel ;

    // Goign to make the hint circle inited in each circle, will eventually make it a shared circle
    private _hintCircleShapesAr  : createjs.Shape[];   // Hint Circle Array, shapes only
    private _highlightCircle    : HighlightCircle ;         // Circle use for pin pointing

    private _highlighted        : bool;

    private _hasHighlightCircle : bool ;                    // If it has the highlight circle

    constructor( x : number , y : number , container : createjs.Container, level:number, displayVO : DisplayVO ){

        super(x,y,container);

        this.x                  = x;
        this.y                  = y;
        this._level             = level;

        this._displayVO         = displayVO;

        this.graphics.setStrokeStyle(2);
        this.graphics.beginStroke(this._displayVO.strokeColour);
        this.graphics.beginFill("rgba(255,255,0,0)").drawCircle(1,1,1);
        this.updating           = true;

        this._highlightCircle       = new HighlightCircle(100,100 , this.container);
        this._hasHighlightCircle    = false;
        this._highlighted = false;

        // Inits Stroke Width
        this._strokeWidth       = this._displayVO.strokeWidth;


        // Initilises as active ( starts resizing soon as it puts on stage , might change thi late )
        this.currentState = CircleShape.STATE_ACTIVE;

    }

    public createCircleClones(): void
    {

//        console.log("Creating clones");
        // Clear Old Ones if any
        if( this._hintCircleShapesAr != null)
        {
//            console.log("Clearing old circles")
            for ( var j : number = this._hintCircleShapesAr.length+1 ; j > 0 ; j-- )
            {
                var hintShape : createjs.Shape = this._hintCircleShapesAr[j];
                if( this.container.contains(hintShape) ) this.container.removeChild(hintShape);
                hintShape = null;
            }
        }

        this._hintCircleShapesAr = [];

        // Creates First Hint Circle
        var hintRadius : number     = 50;
        var hintCircle : HintCircle = new HintCircle( 0 , 0 , hintRadius,  this.container );
        hintCircle.cache( -hintRadius*1.1 , -hintRadius*1.1 , hintRadius*2*1.1 , hintRadius*2*1.1 );

        for( var i : number = 0 ; i < this._stateModel.spawnAmount ; i++ ) {
            this._hintCircleShapesAr[i] = hintCircle.hintClone;
        }
    }

    /*
    Find out distance from here to center
     */
    public set currentMousePos ( point : Point )
    {
        super.currentMousePos   = point;
        this._radius            = super.currentMousePos.distanceToPoint( new Point ( this.x + window.innerWidth / 2,this.y + window.innerHeight / 2 ) );
    }

    public update()
    {
        this.graphics.clear();
        this.graphics.setStrokeStyle(this._strokeWidth);
        this.graphics.beginStroke(this._displayVO.strokeColour);
        this.graphics.beginFill("rgba(255,255,0,0)").drawCircle(0,0,this._radius);

        // Resets
        this._strokeWidth = this._displayVO.strokeWidth;
    }

    // Highlights this circle, updates for one update cirlce
    /*
    public highLight()
    {
        console.log("shape should be highlighting");

    }*/

    public getAngleFromCenter ( point : Point ) : number
    {
        var reletiveX : number = point.x - this.x;
        var reletiveY : number = point.y - this.y;
        var theta     : number = Math.atan2(-reletiveY , -reletiveX);

        if(theta < 0) {
            theta += 2*Math.PI;
        }
        // Turns our you use radians and not angles, doh
        //var angle : number = theta * 180 / Math.PI ;

        return theta;
    }

    public highlight ( angle : number , originalCircle : bool ) : void
    {
        this._highlighted       = true
        this._strokeWidth       = this._displayVO.highlightStrokeWidth;

        var angleAsDegrees : number = angle * (180/Math.PI);

        // Creates Hinting Circle(s) on current circle
        // making it to be the circles responsibility

        // If original circle is false, it needs the full amount, otherwise it's missing one because it's taken by original circle
        if( originalCircle == true ) {
            this._hasHighlightCircle = true;            // Has the highlight circle

            // Spawn Highlight Circle
            this.container.addChild(this._highlightCircle);
            this._highlightCircle.x = this.x - ( this.radius * Math.cos( angle ) );
            this._highlightCircle.y = this.y - ( this.radius * Math.sin( angle ) );

            // Spawns Hints without Highlight Circle
            for( var l : number = 0 ; l < this._stateModel.spawnAmount - 1; l++ )
            {
                var hintShape : createjs.Shape = this._hintCircleShapesAr[l];
                var position : number = ( angleAsDegrees - ( ( 360 / ( this._stateModel.spawnAmount ) ) * ( l + 1 ) ) ) * ( Math.PI/180 ) ;
                hintShape.x = this.x - ( this.radius * Math.cos( position ) ) ;
                hintShape.y = this.y - ( this.radius * Math.sin( position ) );
                this.container.addChild(hintShape);
            }
        } else {


            for( var l : number = 0 ; l < this._stateModel.spawnAmount ; l++ )
            {
                var hintShape : createjs.Shape = this._hintCircleShapesAr[l];
                var position : number = ( angleAsDegrees - ( ( 360 / ( this._stateModel.spawnAmount  ) ) *  l  ) ) * ( Math.PI/180 ) ;
                hintShape.x = this.x - ( this.radius * Math.cos( position ) ) ;
                hintShape.y = this.y - ( this.radius * Math.sin( position ) );
                this.container.addChild(hintShape);
            }
        }
    }

    // Gets rid of the highlights
    public unHighlight()
    {
//        console.log("unHighlight");

        if(this._highlighted == true ) {

            this._highlighted           = false;
            this._hasHighlightCircle    = false;        // Make sure this is doesn't have highlight circle

            if(this.container.contains(this._highlightCircle))  this.container.removeChild(this._highlightCircle);
            // Clear the hints

            for( var j : number = 0 ; j < this._hintCircleShapesAr.length ; j++ ) {
                var hintShape : createjs.Shape = this._hintCircleShapesAr[j];
                if(this.container.contains(hintShape))this.container.removeChild(hintShape);
            }
        }
    }

    public get radius () : number
    {
        return this._radius;
    }

    public set radius( rad : number )
    {
        this._radius = rad;
    }

    public get level (): number
    {
        return this._level;
    }

    public set stateModel( model : StateModel )
    {
//        console.log("set stateModel");
        this._stateModel = model;

        this._stateModel.stateChagneSignal.add(this.stateChanged, this, 0 );

        // For now the circles init the clones shapes, will change this
        // to be more dynamic eventually, just wanted to get it out of the draw view
        this.createCircleClones();
    }

    private stateChanged(): void
    {
//        console.log("state changed")
        // State model changed, redo the circle clones incase the number changes
        this.unHighlight();
        this.createCircleClones();
    }

    public get hasHighlightCircle():bool
    {
        return this._hasHighlightCircle;
    }

    public get highlightCircle():HighlightCircle
    {
        return this._highlightCircle;
    }

    public get hintCircleShapesAr():createjs.Shape[]
    {
        if(this._hasHighlightCircle == true ) {
            // Copy Array gotta be a better way than this?
            var newAr : createjs.Shape[] = [];
            for ( var i : number = 0 ; i < this._hintCircleShapesAr.length - 1 ; i ++ ) {
                newAr.push(this._hintCircleShapesAr[i]);
            }
            return newAr;
        } else {
            return this._hintCircleShapesAr;
        }
    }

    public get highlighted():bool
    {
        return this._highlighted;
    }

}