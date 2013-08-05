class HintCircle  extends StageShape
{
    private _container      : createjs.Container;
    private _stage          : any;
    public _circleRadius    : number  = 50;

    constructor( x : number , y : number , stage : any ){
        super(x , y , stage);

        var x: number, y:number ;


        for ( var  ang : number = 0 ; ang <= 360 ; ang += 5)
        {
            var rad : number = ang * (Math.PI/180);
            x = this.x + ( this._circleRadius * Math.cos(rad));
            y = this.y + ( this._circleRadius * Math.sin(rad));

            this.graphics.beginFill("#000000").drawCircle(x,y,2);

        }
    }

    public onMousePress(evt):void
    {
        console.log("onMousePress");

    }

}