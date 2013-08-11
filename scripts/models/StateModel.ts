class StateModel
{
    public stateChagneSignal : Signal = new Signal();

    public static STATE_START       : String = "STATE_START";
    public static STATE_CREATE      : String = "STATE_CREATE";
    public static STATE_RESIZING    : String = "STATE_RESIZING";

    private _currentState : String ;


    constructor()
    {

    }

    public init()
    {
        this._currentState = StateModel.STATE_START;
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
}