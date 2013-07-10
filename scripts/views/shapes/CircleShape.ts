class CircleShape extends StageShape
{
    constructor( x : number , y : number , container : createjs.Container ){
        super(x,y,container);
        this.graphics.setStrokeStyle(5);
        this.graphics.beginStroke("#000000");
        this.graphics.beginFill("rgba(255,255,0,0)").drawCircle(1,1,200);
    }


    public update()
    {
        console.log("circleshape update");
    }
}