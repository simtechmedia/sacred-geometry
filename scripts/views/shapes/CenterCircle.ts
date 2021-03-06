
class CenterCircle extends StageShape{

    private _radius     : number  = 50;

    private helpLabel       : createjs.Text;

    public removeSignal     : Signal = new Signal();

    private removing        : Boolean = false;

    constructor( x : number , y : number , stage : any ){
        super(x , y , stage);
        this.graphics.setStrokeStyle(5);
        this.graphics.beginStroke("#000000");
        this.graphics.beginFill("#ffffff").drawCircle(1,1,this._radius-2);

        var _this : CenterCircle = this;

        this.addEventListener('mousedown', function(evt) :void {
            _this.onMousePress(evt);
        });

        this.helpLabel = new createjs.Text("Click to begin","bold 18px Arial","#000");
        this.container.addChild(this.helpLabel);
        this.helpLabel.x = this.x + 100;
        this.helpLabel.y = this.y;

    }

    public get radius ( ) : number
    {
        return this._radius;
    }



    public onMousePress(evt):void
    {
        console.log("onMousePress");
        this.removing = true;
        this.container.addChild(this);
        var _this : CenterCircle = this;
        TweenLite.to(this, 0.25, { scaleX:0.1 , scaleY:0.1, ease:Quad.easeOut, onComplete:function(){
            _this.removeSignal.dispatch(_this);
        }});
    }

    public onMouseOver(evt):void
    {

        if(this.currentState == StageShape.STATE_READY || this.currentState == StageShape.STATE_ANIMATING_OUT )
        {

            this.currentState = StageShape.STATE_ANIMATING_IN;

            if(!this.removing){

                var _this : CenterCircle = this;
                TweenLite.to(this, 0.5, { scaleX:1.2 , scaleY:1.2, ease:Quad.easeOut ,onComplete:function(){
                    _this.currentState = StageShape.STATE_EXPANDED;
                }});
                document.body.style.cursor='move';
            }

            // Remove if need be
            if(this.container.contains(this.helpLabel))  {
                this.removeHelp();
            }
        }
    }

    removeHelp():void
    {
        var _this : CenterCircle = this;
        TweenLite.to(this.helpLabel, 0.5, { alpha:0, ease:Quad.easeOut , onComplete:function(){
           _this.container.removeChild(_this.helpLabel);
        }})
    }

    onMouseOut(evt):void
    {
        if(this.currentState == StageShape.STATE_EXPANDED || this.currentState == StageShape.STATE_ANIMATING_IN )
        {
            this.currentState = StageShape.STATE_ANIMATING_OUT;

            if(!this.removing){
                document.body.style.cursor='default';

                var _this : CenterCircle = this;
                TweenLite.to(this, 0.5, { scaleX:1 , scaleY:1, ease:Quad.easeOut, onComplete:function(){
                    _this.currentState = StageShape.STATE_READY;
                }});
            }
        }


    }
}