class HighlightCircle  extends StageShape
{
    private _container : createjs.Container;
    private _stage          : any;

    public _circleRadius   : number  = 50;

    constructor( x : number , y : number , stage : any ){
        super(x , y , stage);
        this.graphics.setStrokeStyle(5);
        this.graphics.beginStroke("#000000");
        this.graphics.beginFill("#ffffff").drawCircle(1,1,this._circleRadius-2);

        var _this : HighlightCircle = this;

        this.alpha = 0.8;

    }

    public onMousePress(evt):void
    {
        console.log("onMousePress");

    }

}