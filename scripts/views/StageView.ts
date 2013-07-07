class StageView
{
    private container;

    private stage   : any;                           // Stage
    private canvas  : any;

    private w:number;
    private h:number;

    constructor( container ) {
        //super(container);
        this.container = container;
    }

    public fpsLabel : createjs.Text;

    public init():void
    {
        console.log("partivleView Init");
        if (window.top != window) {
            document.getElementById("header").style.display = "none";
        }
        // create a new stage and point it at our canvas:

        this.canvas     = <HTMLCanvasElement>document.getElementById("mainCanvas");
        this.stage      = new createjs.Stage(this.canvas);

        // enabled mouse over / out events
        this.stage.enableMouseOver(10);
        this.stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas

        //if ( createjs.Touch.isSupported() ) {
        createjs.Touch.enable( this.stage );
        //}


        var _this = this;
        window.addEventListener('resize', function() {
            _this.resize();
        });

        this.resize();
    }

    /**
     * Resize event handler
     */
    private resize() {
        // Resize the canvas element

        this.stage.canvas.width = window.innerWidth;
        this.stage.canvas.height = window.innerHeight;


        this.w = this.canvas.width;
        this.h = this.canvas.height;

        // Content: centered
        //canvas.x = stage.canvas.width / 2;
        this.canvas.y = this.stage.canvas.height / 2;

    }

    public getStage():any
    {
        return this.stage;
    }


}