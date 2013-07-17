class CircleShape extends StageShape
{
    private updating : bool;

    private _radius : number;

    public onMouseClickedSignal : Signal = new Signal();

    private _strokeWidth    : number;
    private _highlightWidth : number;

    private _displayVO       : DisplayVO;

    constructor( x : number , y : number , container : createjs.Container, displayVO : DisplayVO ){
        super(x,y,container);

        this._displayVO         = displayVO;

        this.graphics.setStrokeStyle(5);
        this.graphics.beginStroke(this._displayVO.strokeColour);
        this.graphics.beginFill("rgba(255,255,0,0)").drawCircle(1,1,200);
        this.updating           = true;

        // Inits Stroke Width
        this._strokeWidth       = this._displayVO.strokeWidth;

        var _this : CircleShape = this;
        this.addEventListener('mousedown', function(evt) :void {
            _this.onMousePress(evt);
        });
    }

    public set currentMousePos ( point : Point )
    {
        super.currentMousePos   = point;
        this._radius = super.currentMousePos.distanceToPoint( new Point ( this.x + window.innerWidth / 2,this.y + window.innerHeight / 2 ) );
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

    // This is the test which determines is
    // Mouse Pointer is within the radius of the circle
    public circleHitTest( point : Point ) : Boolean
    {
        if( point.distanceToPoint(new Point(this.x, this.x) ) < this._radius + this._displayVO.strokeWidth * 2 )
        {
            return true;
        } else {
            return false;
        }
    }

    onMouseOver(evt):void
    {
        console.log("this on over");
        console.log(this);
    }

    onMousePress(evt):void
    {
        console.log("onMousePress");
        this.onMouseClickedSignal.dispatch(null);
        //this.updating = false;
    }
}