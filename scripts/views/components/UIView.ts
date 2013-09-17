class UIView extends View
{

    private _stateModel : StateModel;

    private fpsLabel            : createjs.Text;            // FPS LABEL

    private _debugBox           : createjs.Text;            // Debug Label


    constructor( container ) {
        super(container);
    }

    public init()
    {
        console.log("UIView Inited");

        var _this = this;
        // Keyboard Event Binding
        document.onkeydown = function (evt) {
            _this.handleKeyDown(evt);
        };

        // add a text object to output the current FPS:
        // might move this into a debug view soon
        this.fpsLabel               = new createjs.Text("-- fps","bold 18px Give You Glory","#000");
        this.stage.addChild(this.fpsLabel);
        this.fpsLabel.x             = 400;
        this.fpsLabel.y             = 0;

        this._debugBox              = new createjs.Text("-- debugBox","bold 18px Give You Glory","#000");
        this.stage.addChild(this._debugBox);
        this._debugBox.x            = 10;
        this._debugBox.y            = 10;
    }

    private handleKeyDown( evt )
    {
        if(!evt){ var evt = window.event }

        console.log("key handle down " + this._stateModel);

        switch( evt.keyCode)
        {
            case 37:
                this._stateModel.spawnAmountSubtract();
                break;
            case 39:
                this._stateModel.spawnAmountAdd();
                break;
        }
    }

    public update():void
    {
                this.fpsLabel.text = Math.round(createjs.Ticker.getMeasuredFPS())+" fps";

    }

    public set stateModel( model : StateModel )
    {
        console.log("Set statemdoel in stageView ");
        this._stateModel = model;
    }
}