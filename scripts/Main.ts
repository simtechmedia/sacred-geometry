// Libraries
///<reference path="org/opus/signals/Signal.ts" />
///<reference path="org/opus/signals/SignalBinding.ts" />
///<reference path="libs/jquery.d.ts" />
///<reference path="libs/jqueryui.d.ts" />
///<reference path="libs/easeljs.d.ts" />
///<reference path="libs/tweenjs.d.ts" /> 
///<reference path="libs/greensock.d.ts" />

///<reference path="views/components/View.ts" />
///<reference path="views/components/StageView.ts" />
///<reference path="views/components/DrawView.ts" />
///<reference path="views/shapes/StageShape.ts" />
///<reference path="views/shapes/CenterCircle.ts" />
///<reference path="views/shapes/HintCircle.ts" />
///<reference path="views/shapes/CircleShape.ts" />
///<reference path="views/shapes/HighlightCircle.ts" />
///<reference path="views/components/DrawView.ts" />
///<reference path="views/vo/Point.ts" />
///<reference path="views/vo/DisplayVO.ts" />

///<reference path="models/StateModel.ts" />


/**
 * Created with JetBrains PhpStorm.
 * User: sim
 * Date: 7/07/
 * Time: 6:10 PM
 * To cha nge this template use File | Settings | File Templates        .
 */
class SacretGeometry {

    private container   : HTMLElement;
    private stageView   : StageView;
    private drawView    : DrawView;
    private stateModel  : StateModel;

    constructor( container : HTMLElement )  {

        this.container              = container ;

        this.stateModel             = new StateModel();
        this.stateModel.init();

        // Stage Views handles keyboard listeners and resizes etc
        this.stageView              = new StageView(this.container);
        this.stageView.stateModel   = this.stateModel;
        this.stageView.init();

        // Draw View
        this.drawView               = new DrawView(this.container);
        this.drawView.stateModel    = this.stateModel;
        this.drawView.stage         = this.stageView.stage;
        this.drawView.init();

    }
}  