var SacretGeometry = (function () {
    function SacretGeometry(container) {
        console.log("hello world");
        this.container = container;
        this.stageView = new StageView(this.container);
        this.stageView.init();
    }
    return SacretGeometry;
})();
//@ sourceMappingURL=Main.js.map
