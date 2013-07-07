class DrawView extends View
{

    private fpsLabel : createjs.Text;


    constructor( container ) {
        super(container);
    }

    public init(){
        console.log("Drawview Init");


        // add a text object to output the current FPS:
        // might move this into a debug view soon
        this.fpsLabel = new createjs.Text("-- fps","bold 18px Arial","#FFF");
        super.stage.addChild(this.fpsLabel);
        this.fpsLabel.x = 400;
        this.fpsLabel.y = 0;

        // start the tick and point it at the window so we can do some work before updating the stage:
        var _this = this;
        createjs.Ticker.addEventListener('tick', function():void {
            _this.tick();
        });
    }


    /**
     * onTick Handler
     */
    private tick():void
    {
//        if(!this.stage) {
//            // If stage isn't ready, the tick is canceled
//            return;
//        }

        this.fpsLabel.text = Math.round(createjs.Ticker.getMeasuredFPS())+" fps";
        super.stage.update();
    }
}
