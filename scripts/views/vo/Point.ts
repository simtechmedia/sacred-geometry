class Point
{
    public x : number;
    public y : number;
    constructor( _x : number, _y : number )
    {
        this.x = _x;
        this.y = _y;
    }

    public distanceToPoint ( point : Point  ) : number
    {
        var xs  ;
        var ys  ;

        xs = point.x - this.x;
        xs = xs * xs;

        ys = point.y - this.y;
        ys = ys * ys;

        return Math.sqrt( xs + ys );
    }


}
