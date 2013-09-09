class StateModel
{
    public stateChagneSignal : Signal = new Signal();

    public static STATE_START       : String = "STATE_START";
    public static STATE_CREATE      : String = "STATE_CREATE";
    public static STATE_RESIZING    : String = "STATE_RESIZING";

    private _currentState : String ;

    private _spawnAmount;

    private _circlesArray           = [];   // Multidim Array of the circles
    private _circlesNumArray        : number[];   // Array of how many circles in each depth
    private _currentCircleDepth     : number;       // How deep the circles go

    constructor() {
    }

    public init() {
        this._currentState              = StateModel.STATE_START;
        this._spawnAmount               = 6;
        this._currentCircleDepth        = 0;
        this._circlesNumArray           = [];
    }
    public get currentState () : String { return this._currentState; }
    public set currentState( state : String )
    {
        this._currentState = state;
        //this.stateChagneSignal.dispatch(this._currentState);
    }

    public get circlesArray ( ) : any { return this._circlesArray ; }

    public get currentCircleDepth() : number { return this._currentCircleDepth }
    public set currentCircleDepth( num : number ){ this._currentCircleDepth = num }

    public spawnAmountAdd() : void
    {
        this.spawnAmount = this.spawnAmount + 1;
        this.stateChagneSignal.dispatch(this._currentState);

    }

    public spawnAmountSubtract():void
    {
        if(this._spawnAmount >= 1)
        {
            this.spawnAmount = this.spawnAmount-1;
            this.stateChagneSignal.dispatch(this._currentState);

        }
    }

    public get spawnAmount() : number { return this._spawnAmount; }
    public set spawnAmount( num : number )
    {
        this._spawnAmount = num;
        this.stateChagneSignal.dispatch(this._currentState);
    }

    public get circlesNumArray () : number[]
    {
        return this._circlesNumArray;
    }
}