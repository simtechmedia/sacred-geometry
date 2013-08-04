class StageShape extends createjs.Shape{

    private _container : createjs.Container;

    private _currentMousePos : Point;

    public static STATE_READY           : String = "STATE_READY";
    public static STATE_ANIMATING_IN    : String = "STATE_ANIMATING_IN";
    public static STATE_ANIMATING_OUT   : String = "STATE_ANIMATING_OUT";
    public static STATE_EXPANDED        : String = "STATE_EXPANDED";

    private _currentState : String ;

    constructor( x : number , y : number , container : any ){
        this._container = container;
        super();

        this.currentState = StageShape.STATE_READY;

    }

    public set currentState ( state : String )
    {
        this._currentState = state;
    }

    public get currentState () : String
    {
        return this._currentState;
    }

    public set container ( container : createjs.Container )   {
        this._container      = container;
    }

    public get container(): createjs.Container
    {
        return this._container;
    }

    public set currentMousePos ( point : Point ) {
        this._currentMousePos = point;
    }

    public get currentMousePos () : Point
    {
        return this._currentMousePos;
    }

    public update() : void
    {

    }

    public circleHitTest( point : Point , radius : number  , buffer : number = 10 ) : Boolean
    {
        if( point.distanceToPoint(new Point(this.x, this.y) ) < radius + buffer &&
            point.distanceToPoint(new Point(this.x, this.y) ) > radius - buffer )
        {
            return true;
        } else {
            return false;
        }
    }

    // Helper Functio to return a VO for it's display
    // Might take this out later
    public static createDisplayVO( strokeWidth:number = 5, hightlightStrokeWidth : number = 10, strokecolour = "#000000") : DisplayVO
    {
        var displayVO : DisplayVO = new DisplayVO();

        displayVO.strokeWidth           = strokeWidth;
        displayVO.highlightStrokeWidth  = hightlightStrokeWidth;
        displayVO.strokeColour          = strokecolour;

        return displayVO;
    }

}