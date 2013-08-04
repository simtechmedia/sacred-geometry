class CircleShape extends StageShape
{
    private updating : bool;

    private _radius : number;

    public onMouseClickedSignal : Signal = new Signal();

    private _strokeWidth    : number;

    private _displayVO       : DisplayVO;

    public static STATE_ACTIVE      : String = "STATE_ACTIVE";        // state for when the circle is getting resized

    public static STATE_INAACTIVE   : String = "STATE_INACTIVE";      // when nothing's goign on


    constructor( x : number , y : number , container : createjs.Container, displayVO : DisplayVO ){

        super(x,y,container);

        this.x = x;
        this.y = y;
        console.log( "CircleShape() current x = " + this.x + " y : " + this.y );

        this._displayVO         = displayVO;

        this.graphics.setStrokeStyle(5);
        this.graphics.beginStroke(this._displayVO.strokeColour);
        this.graphics.beginFill("rgba(255,255,0,0)").drawCircle(1,1,1);
        this.updating           = true;

        // Inits Stroke Width
        this._strokeWidth       = this._displayVO.strokeWidth;

        var _this : CircleShape = this;
        this.addEventListener('mousedown', function(evt) :void {
            _this.onMousePress(evt);
        });

        // Initilises as active ( starts resizing soon as it puts on stage , might change thi late )
        this.currentState = CircleShape.STATE_ACTIVE;
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
        this.graphics.beginStroke("#000000");
        this.graphics.beginFill("rgba(255,255,0,0)").drawCircle(0,0,this._radius);

        // Resets
        this._strokeWidth = this._displayVO.strokeWidth;
    }

    // Highlights this circle, updates for one update cirlce
    public highLight()
    {
        this._strokeWidth = this._displayVO.highlightStrokeWidth;
    }

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

        console.log( theta);

        return theta;
    }

    public get radius () : number
    {
        return this._radius;
    }

    onMouseOver(evt):void
    {
        console.log("this on over");
        console.log(this);
    }

    onMousePress(evt):void
    {
        console.log("onMousePress");
        this.onMouseClickedSignal.dispatch(this);
        //this.updating = false;
    }
}