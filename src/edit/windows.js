
    function draggable(element) {
        var header = $('div [class*="window-header"]', $(element));

        header.mousedown(function(e) {
            element.innerX = e.clientX + window.pageXOffset - element.offsetLeft;
            element.innerY = e.clientY + window.pageYOffset - element.offsetTop;

            window.addEventListener('mousemove', move, false);
            window.addEventListener('mouseup', function() {
                window.removeEventListener('mousemove', move, false);
            }, true);

            function move(e) {
                var position = element.style.position;
                element.style.position = 'absolute';
                element.style.left = e.clientX + window.pageXOffset - element.innerX + 'px';
                element.style.top = e.clientY + window.pageYOffset - element.innerY + 'px';
                element.style.position = position;
            }
        });
    }

    function resizable(wd, element) {
        var resizer = $('div[class*="window-resize"]', $(element));

        resizer.mousedown(function(e) {
            element.startX = e.clientX; // + window.pageXOffset - element.offsetLeft;
            element.startY = e.clientY; // + window.pageYOffset - element.offsetTop;

            window.addEventListener('mousemove', move, false);
            window.addEventListener('mouseup', function() {
                window.removeEventListener('mousemove', move, false);
            }, true);

            function move(e) {
                element.ow = element.offsetWidth;
                element.oh = element.offsetHeight;

                var dX = e.clientX - element.startX;
                var dY = e.clientY - element.startY;

                element.startX += dX; // + window.pageXOffset - element.offsetLeft;
                element.startY += dY; // + window.pageYOffset - element.offsetTop;

                var position = element.style.position;
                element.style.position = 'absolute';
                var old = element.ow;
                element.style.width = (element.ow + dX * 0.9) + 'px';
//                element.style.height = (element.oh + dY) + 'px';
                element.style.position = position;
            }
        });
    }

    // Window
    //

    Ecore.Editor.Window = Backbone.View.extend({
        _template: _.template('<div class="row-fluid"><div class="window-header"><span class="window-title"><%= title %></span><span class="window-actions"></span></div><div class="window-content"></div><div class="window-footer"></div></div>'),

        _resizeHandleTemplate: _.template('<div class="window-resize" style="z-index: 1000;"></div>'),

        _closeActionTemplate: _.template('<a href="#" class="window-action"><i class="icon-remove action-close"></i></a>'),
        _minimizeActionTemplate: _.template('<a href="#" class="window-action"><i class="icon-minus action-min"></i></a>'),
        _maximizeActionTemplate: _.template('<a href="#" class="window-action"><i class="icon-plus action-max"></i></a>'),

        events: {
            'click i[class*="action-close"]': 'close',
            'click i[class*="action-min"]': 'minimize',
            'click i[class*="action-max"]': 'maximize'
        },

        initialize: function(attributes) {
            _.bindAll(this, 'render', 'remove', 'close', 'minimize', 'maximize');
            this.parts = attributes.parts;
            this.title = attributes.title || 'Window';
            this.height = attributes.height;
            this.draggable = attributes.draggable;
        },

        render: function() {
            this.remove();

            if (this.$header) return;

            var html = this._template({ title: this.title });

            this.$el.addClass('window');
            this.$el.append(html);
            this.$header = $('div > div[class*="window-header"]', this.$el);

            $('span[class*="window-actions"]', this.$el)
                .append(this._minimizeActionTemplate())
                .append(this._maximizeActionTemplate())
                .append(this._closeActionTemplate());

             $('div[class*="window-footer"]', this.$el).append(this._resizeHandleTemplate());

            this.$content = $('div > div[class*="window-content"]', this.$el);
            if (this.height)  {
                this.$content.css('height', this.height);
            }

            if (this.content) {
                this.content.render();
                this.$content.append(this.content.$el);
            }

            if (this.draggable) {
                draggable( this.$el.get()[0] );
            }

            resizable(this, this.$el.get()[0]);

            return this;
        },

        remove: function() {

        },

        close: function() {
            console.log('closing');
        },

        maximize: function() {
            this.$el.css('left', '0');
            this.$el.css('right', '0');
        },

        minimize: function() {

        }
    });

    Ecore.Editor.SimpleWindow = Ecore.Editor.Window.extend({
        header: _.template('<div></div>'),
        initialize: function(attributes) {
            this.title = attributes.title || 'Window';
            this.height = attributes.height;
            this.draggable = attributes.draggable;
            this.content = attributes.content;
        }
    });

