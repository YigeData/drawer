ui.DrawerInteractor = function(comp) {
    ui.DrawerInteractor.superClass.constructor.call(this, comp);
};

def(ui.DrawerInteractor, ui.Interactor, {
    handle_mousemove: function (e) {
        this.handle_touchmove(e);
    },
    handle_touchmove: function (e) {
        var self = this;

        ht.Default.preventDefault(e);
        var drawer = self.getComponent();

        if (drawer.closeIconHitTest(e)) {
            drawer.setCurrentCloseIconState('hover');
            drawer.setCursor('pointer');
        }
        else {
            drawer.setCurrentCloseIconState('normal');
            drawer.setCursor('');
        }
    },
    handle_mousedown: function (e) {
        this.handle_touchstart(e);
    },
    handle_touchstart: function (e) {
        var self = this;

        ht.Default.preventDefault(e);
        if (ht.Default.isLeftButton(e)) {
            var drawer = self.getComponent();
            // drawer.requestFocus();

            if (drawer.closeIconHitTest(e)) {
                drawer.setCurrentCloseIconState('active');
                drawer.close();
            }
        }
    },
    handle_keydown: function(e) {
        var self = this;
        var drawer = self.getComponent();

        ht.Default.preventDefault(e);
        if (drawer.isEscClosable() && ht.Default.isEsc(e)) {
            drawer.close();
        }
    }
});
