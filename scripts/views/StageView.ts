class StageView extends View
{

    private canvas  : any;

    private w:number;
    private h:number;

    constructor( container ) {
        super(container);
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
        super._stage     = new createjs.Stage(this.canvas);

        // enabled mouse over / out events
        super._stage.enableMouseOver(10);
        super._stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas

        //if ( createjs.Touch.isSupported() ) {
        createjs.Touch.enable( super._stage );
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

        console.log("resize");
        // Resize the canvas element

        super._stage.canvas.width = window.innerWidth;
        super._stage.canvas.height = window.innerHeight;


        this.w = this.canvas.width;
        this.h = this.canvas.height;

        // Content: centered
        //canvas.x = stage.canvas.width / 2;
        this.canvas.y = super._stage.canvas.height / 2;

    }

}