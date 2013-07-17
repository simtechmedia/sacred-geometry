class CircleShape extends StageShape
{
    private updating : bool;

    private _radius : number;

    public onMouseClickedSignal : Signal = new Signal();

    constructor( x : number , y : number , container : createjs.Container ){
        super(x,y,container);
        this.graphics.setStrokeStyle(5);
        this.graphics.beginStroke("#000000");
        this.graphics.beginFill("rgba(255,255,0,0)").drawCircle(1,1,200);
        this.updating = true;

        var _this : CircleShape = this;
        this.addEventListener('mousedown', function(evt) :void {
            _this.onMousePress(evt);
        });
    }


    public update()
    {
        this._radius = this.currentMousePos.distanceToPoint( new Point ( this.x + window.innerWidth / 2,this.y + window.innerHeight / 2 ) );
        if(this.updating == true )
        {
            this.graphics.clear();
            this.graphics.setStrokeStyle(5);
            this.graphics.beginStroke("#000000");
            this.graphics.beginFill("rgba(255,255,0,0)").drawCircle(0,0,this._radius);
        }
    }

    public circleHitTest( point : Point ) : Boolean
    {
        if( point.distanceToPoint(new Point(this.x, this.x) ) < this._radius )
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