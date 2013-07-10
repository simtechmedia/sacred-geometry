class StageShape extends createjs.Shape{

    private _container : createjs.Container;

    private _currentMousePos : createjs.Point;

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

    public set currentMousePos ( point : createjs.Point ) {
        this._currentMousePos = point;
    }

    public get currentMousePos () : createjs.Point
    {
        return this._currentMousePos;
    }

    public update() : void
    {

    }
}