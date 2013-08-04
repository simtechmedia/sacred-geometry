class View {

    public _container ;

    public _stage : any;

    constructor( container ){
        this._container = container
    }


    public set stage ( stage : any )   {
        this._stage      = stage;
    }

    public get stage(): any
    {
        return this._stage;
    }
}