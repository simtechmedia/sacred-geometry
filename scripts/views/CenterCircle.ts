
class CenterCircle extends StageShape{

    private _circleRadius : number  = 50;

    private _stage : any;

    private helpLabel : createjs.Text;

    constructor( x : number , y : number , stage : any ){
        super(x , y , stage);


        this.graphics.setStrokeStyle(5);
        this.graphics.beginStroke("#000000");
        this.graphics.beginFill("#ffffff").drawCircle(1,1,this._circleRadius-2);
        this.x = x + this._circleRadius /2 ;
        this.y = y + this._circleRadius /2 ;

        var _this : CenterCircle = this;

        this.addEventListener('mousedown', function(evt) :void {
            _this.onMousePress(evt);
        });

        this.helpLabel = new createjs.Text("Click and drag this circle to begin","bold 18px Arial","#FFF");
        this.stage.addChild(this.helpLabel);
        this.helpLabel.x = this.x + 100;
        this.helpLabel.y = this.y;


//        this.addEventListener('mouseover', function(evt) :void {
//            _this.onMouseOver(evt);
//        });
//
//        this.addEventListener('mouseout', function(evt) : void {
//            _this.onMouseOut(evt);
//        });
//

    }



    onMousePress(evt):void
    {
        this._stage.addChild(this);
        var offset = {x:this.x-evt.stageX, y:this.y-evt.stageY};

        var _this : CenterCircle = this;

        evt.onMouseMove = function(ev) {
            _this.x = ev.stageX+offset.x;
            _this.y = ev.stageY+offset.y;
        }

    }

    onMouseOver(evt):void
    {
        document.body.style.cursor='move';
        TweenLite.to(this, 0.5, { scaleX:1.2 , scaleY:1.2, ease:Quad.easeOut});
    }

    onMouseOut(evt):void
    {
        document.body.style.cursor='default';
        TweenLite.to(this, 0.5, { scaleX:1 , scaleY:1, ease:Quad.easeOut});
    }
}