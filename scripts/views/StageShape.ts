class StageShape extends createjs.Shape{

    private _stage : any;


    constructor( x : number , y : number , stage : any ){
        this._stage = stage;
        super();

    }
    public set stage ( stage : any )   {
        this._stage      = stage;
    }

    public get stage(): any
    {
        return this._stage;
    }
}