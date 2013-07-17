class StageShape extends createjs.Shape{

    private _container : createjs.Container;

    private _currentMousePos : Point;

    constructor( x : number , y : number , container : any ){
        this._container = container;
        super();

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