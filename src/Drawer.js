/**
 * 抽屉组件
 */
ui.Drawer = function () {
    ui.Drawer.superClass.constructor.call(this);
};

def(ui.Drawer, ht.ui.ViewGroup, {

    ms_ac: [
        'direction', 'size', 'title', 'headerHeight', 'currentCloseIconState', 'modal', 'contentView', 'footer', 'gap'
    ],
    ui_ac: [
        'maskBackground', 
        'is:headerVisible', 'titleFont', 'titleColor',
        'is:closeVisible', 'drawable:closeIcon', 'drawable:hoverCloseIcon', 'drawable:activeCloseIcon', 'iconWidth', 'iconHeight',
        'is:clickModalClosable', 'is:escClosable',
        'openDelay', 'closeDelay', 'is:open', 'is:destroyOnClose', 'is:lockScroll'
    ],

    _focusable: true,
    _direction: 'rtl',
    _size: '30%',
    _headerHeight: 24,
    _currentCloseIconState: 'normal',
    _modal: true,
    _gap: 5,

    __padding: 16,
    __boxShadow: '0px 16px 48px 16px rgba(0, 0, 0, 0.08)',
    __background: 'rgb(255,255,255)',
    __maskBackground: 'rgba(0, 0, 0, 0.2)',
    __headerVisible: true,
    __titleFont: '18px sans-serif',
    __titleColor: '#303133',
    __closeVisible: true,
    __closeIcon: ['ht.ui.drawable.ImageDrawable', 'drawer-closeIcon', 'uniform', '#a8abb2'],
    __hoverCloseIcon: ['ht.ui.drawable.ImageDrawable', 'drawer-closeIcon', 'uniform', '#5BB5F9'],
    __activeCloseIcon: ['ht.ui.drawable.ImageDrawable', 'drawer-closeIcon', 'uniform', '#4C94CB'],
    __iconWidth: 10,
    __iconHeight: 10,
    __clickModalClosable: true,
    __escClosable: true,
    __openDelay: 0,
    __closeDelay: 0,
    __open: false,
    __destroyOnClose: false,
    __lockScroll: true,

    getInteractorClasses: function() {
        return [ui.DrawerInteractor];
    },

    figurePreferredSize: function () {
        var self = this,
            size = {
                width: self.getPaddingLeft() + self.getPaddingRight() +
                    self.getBorderLeft() + self.getBorderRight(),
                height: self.getPaddingTop() + self.getPaddingBottom() +
                    self.getBorderTop() + self.getBorderBottom()
            },
            direction = self.getDirection();
        var headerHeight = self.getHeaderHeight();
        var headerVisible = self.isHeaderVisible();
        var title = self.getTitle();
        var titleFont = self.getTitleFont();
        var contentView = self.getContentView();
        var gap = self.getGap();
        var footer = self.getFooter();
        var closeVisible = self.isCloseVisible();
        var iconWidth = self.getIconWidth();

        switch (direction) {
            case 'rtl':
            case 'ltr': {
                var max = 0;
                if (headerVisible) {
                    var sum = 0;
                    if (ht.Default.isString(title)) {
                        var titleSize = ht.Default.getTextSize(titleFont, title);
                        sum += titleSize.width;
                    }
                    else if (title instanceof ht.ui.View) {
                        var titlePreferredSize = self.getViewPreferredSize(title);
                        if (titlePreferredSize) sum += titlePreferredSize.width;
                    }
                    if (closeVisible) sum += iconWidth;
                    max = Math.max(max, sum);
                }
                if (contentView) {
                    var contentPreferredSize = self.getViewPreferredSize(contentView);
                    if (contentPreferredSize) max = Math.max(max, contentPreferredSize.width);
                }
                if (footer) {
                    var footerPreferredSize = self.getViewPreferredSize(footer);
                    if (footerPreferredSize) max = Math.max(max, footerPreferredSize.width);
                }
                size.width = size.width + max;
                break;
            }
            case 'ttb': 
            case 'btt': {
                if (headerVisible) {
                    if (title instanceof ht.ui.View) {
                        var titlePreferredSize = self.getViewPreferredSize(title);
                        if (titlePreferredSize) headerHeight = titlePreferredSize.height;
                    }
                    size.height = size.height + headerHeight;
                }
                if (contentView) {
                    if (headerVisible) size.height = size.height + gap;
                    var contentViewPreferredSize = self.getViewPreferredSize(contentView);
                    size.height = size.height + (contentViewPreferredSize ? contentViewPreferredSize.height : 0);
                }
                if (footer) {
                    if (headerVisible || contentView) size.height = size.height + gap;
                    var footerPreferredSize = self.getViewPreferredSize(footer);
                    size.height = size.height + (footerPreferredSize ? footerPreferredSize.height : 0);
                }
                break;
            }
        }

        return size;
    },

    getViewPreferredSize: function(view) {
        var preferredSize = view.getPreferredSize();
        var minSize = view.getMinSize();
        var maxSize = view.getMaxSize();
        var width, height;

        if (preferredSize.width != null) width = preferredSize.width;
        if (preferredSize.height != null) height = preferredSize.height;
        if (width !== null) {
            if (minSize.width != null) width = Math.max(width, minSize.width);
            if (maxSize.width != null) width = Math.min(width, maxSize.width);
        }
        if (height != null) {
            if (minSize.height != null) height = Math.max(height, minSize.height);
            if (maxSize.height != null) height = Math.min(height, maxSize.height);
        }

        if (width != null || height != null) return {
            'width': width,
            'height': height
        };
    },

    validateImpl: function (x, y, width, height) {
        var self = this;
        ui.Drawer.superClass.validateImpl.call(self, x, y, width, height);

        var g = self.getRootContext();

        g.save();
        g.translate(x, y);

        var headerVisible = self.isHeaderVisible(),
            headerHeight = self.getHeaderHeight(),
            contentView = self.getContentView(),
            footer = self.getFooter(),
            gap = self.getGap();

        // header
        if (headerVisible) {
            var title = self.getTitle(),
                closeVisible = self.isCloseVisible(),
                iconWidth = self.getIconWidth(),
                iconHeight = self.getIconHeight();

            // title
            if (ht.Default.isString(title)) {
                self.drawTitle(g, title, self.getTitleFont(), self.getTitleColor(), 0, 0, width, headerHeight);
            }
            else if (title instanceof ht.ui.View) {
                var preferredSize = title.getPreferredSize();
                headerHeight = preferredSize.height;
                self.layoutChild(title, 0, 0, width - (closeVisible ? iconWidth : 0), headerHeight);
            }

            // closeIcon
            if (closeVisible) {
                self.drawCloseIcon(self.getCurrentCloseIconDrawable(), width - iconWidth, ( headerHeight - iconHeight) / 2, iconWidth, iconHeight, null, self);
                self._closeIconRect = {
                    x: width - iconWidth,
                    y: ( headerHeight - iconHeight) / 2,
                    width: iconWidth,
                    height: iconHeight
                };
            }
        }

        // content
        if (contentView) {
            var layoutParams = contentView.getLayoutParams();
            var marginTop = 0, marginRight = 0, marginBottom = 0, marginLeft = 0;
            if (layoutParams) {
                layoutParams.marginTop && (marginTop = layoutParams.marginTop);
                layoutParams.marginRight && (marginRight = layoutParams.marginRight);
                layoutParams.marginBottom && (marginBottom = layoutParams.marginBottom);
                layoutParams.marginLeft && (marginLeft = layoutParams.marginLeft);
            }

            self.layoutChild(
                contentView, 
                marginLeft, 
                headerVisible ? headerHeight + gap : 0 + marginTop, 
                width - marginLeft - marginRight, 
                height - marginTop - marginBottom - (headerVisible ? headerHeight + gap : 0) - (footer ? (footer.getPreferredSize() ? footer.getPreferredSize().height + gap : 0) : 0)
            );
        }

        // footer
        if (footer) {
            var footerPreferredSize = footer.getPreferredSize(),
                footerHeight = footerPreferredSize.height || 0;
            self.layoutChild(footer, 0, height - footerHeight, width, footerHeight);
        }

        g.restore();
    },

    drawTitle: function(g, title, font, color, x, y, width, height) {
        ht.Default.drawText(g, title, font, color, x, y, width, height, 'left', 'middle');
    },

    drawCloseIcon: function(drawable, x, y, width, height, data, view) {
        drawable.draw(x, y, width, height, data, view);
    },

    closeIconHitTest: function(e) {
        var self = this,
            rect = self._closeIconRect,
            lp = e instanceof Event ? self.lp(e) : e;

        return ht.Default.containsPoint(rect, lp);
    },

    getCurrentCloseIconDrawable: function() {
        var self = this,
            state = self.getCurrentCloseIconState();

        if (state === 'normal') return self.getCloseIconDrawable();
        else if (state === 'hover') return self.getHoverCloseIconDrawable();
        else if (state === 'active') return self.getActiveCloseIconDrawable();
    },

    /**
     * @override
     */
    initView: function() {
        var self = this;
        ui.Drawer.superClass.initView.call(self);

        var maskDiv = self._maskDiv = ht.Default.createElement('div');
        var style = maskDiv.style;

        style.position = 'fixed';
        style.left = '0px';
        style.top = '0px';
        style.width = '100%';
        style.height = '100%';
        style.background = self.getMaskBackground();
        style.border = '0px';

        var maskDownFunc = function(e) {
            if (self.isClickModalClosable() && ht.Default.getTarget(e) === this) {
                self.close();
            }
        }
        maskDiv.addEventListener('mousedown', maskDownFunc);
        
        self.setTranisition();
    },

    setTranisition: function() {
        var self = this,
            view = self.getView(),
            style = view.style,
            maskDiv = self._maskDiv,
            maskStyle = maskDiv.style,
            delay = self.getOpenDelay();

        self.setTranisitionDelay(delay);
        style.transitionDuration = '0.3s';
        style.transitionProperty = 'all';
        style.transitionTimingFunction = 'ease';
        maskStyle.transitionDuration = '0.3s';
        maskStyle.transitionProperty = 'all';
        maskStyle.transitionTimingFunction = 'ease';

        view.addEventListener('transitionend', function(e) {
            if (e.propertyName === 'transform') {
                var isOpen = self.isOpen();
                var maskDiv = self._maskDiv;
    
                if (!isOpen) {
                    if (self.isDestroyOnClose()) {
                        self.removeFromDOM();
                    }
                    else {
                        maskDiv.style.display = 'none';
                        self.setVisible(false);
                    }
                    self.fireViewEvent('closed');
                    style.transform = null;
                    window.removeEventListener('resize', self.updateBoundsFunc, false);
                }
                else {
                    self.fireViewEvent('opened');
                    document.body.style.overflow = self.isLockScroll() ? 'hidden' : null;
                }
            }
        });
    },

    setTranisitionDelay: function(value) {
        var self = this,
            view = self.getView(),
            maskDiv = self._maskDiv;

        view.style.transitionDelay = value + 'ms';
        maskDiv.style.transitionDelay = value + 'ms';
    },

    /**
     * @override
     */
    onPropertyChanged: function(e) {
        var self = this,
            property = e.property,
            newValue = e.newValue;
        ui.Drawer.superClass.onPropertyChanged.call(self, e);

        var view = self.getView();
        var maskDiv = self._maskDiv;
        if (property === 'maskBackground') {
            maskDiv.style.background = newValue;
        }
        else if (property === 'modal') {
            if (!newValue) {
                maskDiv.parentNode && maskDiv.parentNode.removeChild(maskDiv);
            }
            else {
                document.body.insertBefore(maskDiv, view);
            }
        }
        else if (property === 'direction') {
            self.updateBounds();
        }
        else if (property === 'lockScroll') {
            if (self.isOpen()) {
                document.body.style.overflow = newValue ? 'hidden' : null;
            }
        }
    },

    /**
     * @override
     */
    setContentView: function(value, layoutParams) {
        var self = this;
        var oldContentView = self._contentView;

        if (oldContentView) self.removeView(oldContentView);
        if (value) {
            self.addView(value, layoutParams);
        }
        self.setPropertyValue('contentView', value);
    },

    /**
     * @override
     */
    setTitle: function(value) {
        var self = this;
        self.setPropertyValue('title', value);
        var oldTitle = self._title;

        if (oldTitle instanceof ht.ui.View) {
            self.removeView(oldTitle);
        }

        if (value instanceof ht.ui.View) {
            self.addView(value);
        }
    },

    /**
     * @override
     */
    setFooter: function(value) {
        var self = this;
        var oldFooter = self._footer;
        oldFooter && self.removeView(oldFooter);

        if (value instanceof ht.ui.View) {
            self.setPropertyValue('footer', value);
    
            self.addView(value);
        }
    },

    /**
     * @override
     */
    addToDOM: function() {
        var self = this,
            view = self.getView();

        self.updateBoundsFunc = self.updateBounds.bind(this);

        self.updateBoundsFunc();
        window.addEventListener('resize', self.updateBoundsFunc, false);

        if (self.getModal()) {
            document.body.appendChild(self._maskDiv);
        }
        document.body.appendChild(view);
    },

    /**
     * @override
     */
    getSize: function() {
        var size = this._size;
        var preferredSize = this.getPreferredSize();
        var direction = this.getDirection();

        if (size == null) {
            switch (direction) {
                case 'rtl':
                case 'ltr': return preferredSize.width;
                case 'ttb': 
                case 'btt': return preferredSize.height;
            }
        }
        return size;
    },

    updateBounds: function() {
        var self = this;
        var size = self.getSize();
        var direction = self.getDirection();

        var windowInfo = ht.Default.getWindowInfo(),
            clientWidth = windowInfo.width,
            clientHeight = windowInfo.height;

        var reactWidth, reactHeight;
        if (ht.Default.isString(size) && /^\d+%$/.test(size)) {
            reactWidth = clientWidth * (parseFloat(size) / 100);
            reactHeight = clientHeight * (parseFloat(size) / 100);
        }
        else if (ht.Default.isNumber(size)) {
            reactWidth = size;
            reactHeight = size;
        }

        var x = 0, y = 0, width = clientWidth, height = clientHeight;

        switch (direction) {
            case 'rtl': x = clientWidth - reactWidth; width = reactWidth; break;
            case 'ltr': width = reactWidth; break;
            case 'ttb': height = reactHeight; break;
            case 'btt': y = clientHeight - reactHeight; height = reactHeight; break;
        }

        self.setX(x);
        self.setY(y);
        self.setWidth(width);
        self.setHeight(height);
    },

    /**
     * @override
     */
    removeFromDOM: function() {
        var self = this;
        ui.Drawer.superClass.removeFromDOM.call(self);

        var maskDiv = self._maskDiv;
        maskDiv.parentNode && maskDiv.parentNode.removeChild(maskDiv);
    },

    open: function() {
        var self = this,
            isOpen = self.isOpen(),
            view = self.getView(),
            style = view.style,
            maskDiv = self._maskDiv;

        if (isOpen) return;
        if (!self.isInDOM()) self.addToDOM();
        else {
            maskDiv && (maskDiv.style.display = 'block');
            self.setVisible(true);
            window.addEventListener('resize', self.updateBounds, false);
        }

        self.fireViewEvent('open');
        style.transform = self.getTransform();
        maskDiv && (maskDiv.style.opacity = 0);
        self.setTranisitionDelay(self.getOpenDelay());
        self.setOpen(!isOpen);
        ht.Default.callLater(function() {
            style.transform = null;
            maskDiv && (maskDiv.style.opacity = 1);
        });
        self.requestFocus();
    },

    close: function() {
        var self = this,
            isOpen = self.isOpen(),
            view = self.getView(),
            style = view.style,
            maskDiv = self._maskDiv;

        if (!isOpen) return;
        var handleClose = function() {
            self.fireViewEvent('close');
            self.setTranisitionDelay(self.getCloseDelay());
            var transform = self.getTransform();
            style.transform = transform;
            self.setOpen(!isOpen);
            maskDiv && (maskDiv.style.opacity = 0);
        }
        if (ht.Default.isFunction(self.beforeClose)) {
            self.beforeClose(handleClose);
        }
        else handleClose();
    },

    handleClose: function() {
        this.close();
    },

    getTransform: function() {
        var self = this,
            direction = self.getDirection(),
            transform = null;

        switch(direction) {
            case 'rtl': transform = 'translateX(100%)'; break;
            case 'ltr': transform = 'translateX(-100%)'; break;
            case 'ttb': transform = 'translateY(-100%)'; break;
            case 'btt': transform = 'translateY(100%)'; break;
        }

        return transform;
    },

    getVersion: function() {
        return '5.0';
    }

});