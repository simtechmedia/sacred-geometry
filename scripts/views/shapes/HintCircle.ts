class HintCircle  extends StageShape
{

    private _circleRadius    : number;

    constructor( x : number , y : number , radius: number ,  stage : any ){
        super(x , y , stage);
        this._circleRadius = radius;

        // Creates Doted Line
        var x: number, y:number ;
        for ( var  ang : number = 0 ; ang <= 360 ; ang += 5)
        {
            var rad : number = ang * (Math.PI/180);
            x = this.x + ( this._circleRadius * Math.cos(rad));
            y = this.y + ( this._circleRadius * Math.sin(rad));
            this.graphics.beginFill("#000000").drawCircle(x,y,2);
        }
    }

    public get hintClone():createjs.Shape
    {
        var shape: createjs.Shape = this.clone();
        shape.regX = this._circleRadius * 1.1;
        shape.regY = this._circleRadius * 1.1;
        return shape;
    }
}