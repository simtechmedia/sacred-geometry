class UIView extends View
{

    private _stateModel : StateModel;

    private fpsLabel            : createjs.Text;            // FPS LABEL

    private _debugBox           : createjs.Text;            // Debug Label

    private _spawnAmountTxt     : createjs.Text;

    private _circleDepthTxt     : createjs.Text;

    private _toggleUITxt        : createjs.Text;
    private _uiToggleBol        : bool;

    private _uiContainer         : createjs.Container;

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

        this._uiContainer       = new createjs.Container();
        this.stage.addChild(this._uiContainer);

        // add a text object to output the current FPS:
        // might move this into a debug view soon
        this.fpsLabel               = new createjs.Text("-- fps","bold 18px Give You Glory","#000");
        this._uiContainer.addChild(this.fpsLabel);
        this.fpsLabel.x             = 400;
        this.fpsLabel.y             = 0;

        this._debugBox              = new createjs.Text("-- debugBox","bold 18px Give You Glory","#000");
        this._uiContainer.addChild(this._debugBox);
        this._debugBox.x            = 10;
        this._debugBox.y            = 10;

        this._spawnAmountTxt              = new createjs.Text("-- SpawnBox","bold 18px Give You Glory","#000");
        this._uiContainer.addChild(this._spawnAmountTxt);
        this._spawnAmountTxt.x            = 10;
        this._spawnAmountTxt.y            = 40;


        this._circleDepthTxt              = new createjs.Text("-- SpawnBox","bold 18px Give You Glory","#000");
        this._uiContainer.addChild(this._circleDepthTxt);
        this._circleDepthTxt.x            = 10;
        this._circleDepthTxt.y            = 70;

        this._toggleUITxt              = new createjs.Text("Press H to Toggle UI On and Off","bold 18px Give You Glory","#000");
        this._uiContainer.addChild(this._toggleUITxt);
        this._toggleUITxt.x            = 10;
        this._toggleUITxt.y            = 100;


        this._uiToggleBol = true;



    }

    private toggleUI():void
    {
        if( this._uiToggleBol == true)
        {
            this.stage.removeChild(this._uiContainer);
            this._uiToggleBol = false;
        } else {
            this._uiToggleBol = true;
            this.stage.add(this._uiContainer);

        }
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
            case 72:
                this.toggleUI();
                break;
        }
    }

    public update():void
    {
        this.fpsLabel.text = Math.round(createjs.Ticker.getMeasuredFPS())+" fps";
        this._spawnAmountTxt.text = this._stateModel.spawnAmount + ": Spawn Amount < > to change ";
        this._circleDepthTxt.text = this._stateModel.currentCircleDepth + ": Current Circle Depth ";

    }

    public set stateModel( model : StateModel )
    {
        console.log("Set statemdoel in stageView ");
        this._stateModel = model;
    }
}