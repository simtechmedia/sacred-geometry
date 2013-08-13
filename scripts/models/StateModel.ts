class StateModel
{
    public stateChagneSignal : Signal = new Signal();
    public modelUpdated : Signal = new Signal();

    public static STATE_START       : String = "STATE_START";
    public static STATE_CREATE      : String = "STATE_CREATE";
    public static STATE_RESIZING    : String = "STATE_RESIZING";

    private _currentState : String ;

    private _spawnAmount;

    private _circlesArray : Array = [];

    constructor()
    {

    }

    public init()
    {
        this._currentState = StateModel.STATE_START;
        this._spawnAmount = 5;
    }

    public set currentState( state : String )
    {
        this._currentState = state;
        this.stateChagneSignal.dispatch(this._currentState);
    }

    public get currentState () : String
    {
        return this._currentState;
    }

    public set spawnAmount( num : number )
    {
        this._spawnAmount = num;
        this.modelUpdated.dispatch(null);
    }

    public get spawnAmount() : number
    {
        return this._spawnAmount;
    }

    public spawnAmountAdd() : void
    {
        this.spawnAmount = this.spawnAmount + 1;
    }

    public spawnAmountSubtract():void
    {
        if(this._spawnAmount >= 1)
        {
            this.spawnAmount = this.spawnAmount-1;
        }
    }
}