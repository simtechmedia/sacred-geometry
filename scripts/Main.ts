// Libraries
///<reference path="org/opus/signals/Signal.ts" />
///<reference path="org/opus/signals/SignalBinding.ts" />
///<reference path="libs/jquery.d.ts" />
///<reference path="libs/jqueryui.d.ts" />
///<reference path="libs/easeljs.d.ts" />
///<reference path="libs/tweenjs.d.ts" />


///<reference path="views/StageView.ts" />

/**
 * Created with JetBrains PhpStorm.
 * User: sim
 * Date: 7/07/13
 * Time: 6:10 PM
 * To change this template use File | Settings | File Templates.
 */
class SacretGeometry {

    private container : HTMLElement;

    private stageView : StageView;

    constructor( container : HTMLElement )  {
        console.log("hello world");

        this.container = container;

        // Stage Views handles keyboard listeners and resizes etc
        this.stageView       = new StageView(this.container);
        this.stageView.init();
    }
}