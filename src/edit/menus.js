
    var MenuBar = Ecore.Editor.MenuBar = Backbone.View.extend({
        template: _.template('<div class="span12 action-bar btn-group"></div>'),
        initialize: function(attributes) {
            this.buttons = attributes.buttons;
        },
        render: function(){
            var html = this.template();
            this.$el.append(html);

            _.each(this.buttons, this.renderButton, this);

            return this;
        },
        renderButton: function(button) {
            button.render();
            $('div[class*="action-bar"]', this.$el).append(button.$el);

            return this;
        }
    });

    // var add = new MenuBarButton({label: 'add', click: function() {}});
    // var bar = new MenuBar({buttons: [add]});

    var MenuBarButton = Ecore.Editor.MenuBarButton = Backbone.View.extend({
        template: _.template('<a class="btn btn-mini"> <%= label %> </a>'),
        events: {
            'click': 'click'
        },
        initialize: function(attributes) {
            _.bindAll(this, 'render', 'click');
            this.label = attributes.label;
            this.clickHandle = attributes.click;
        },
        render: function() {
            var html = this.template({ label: this.label });
            this.setElement(html);

            return this;
        },
        click: function() {
            return this.clickHandle();
        }
    });

    var MenuBarDropDownButton = Ecore.Editor.MenuBarDropDownButton = MenuBarButton.extend({
        template: _.template('<a class="btn btn-mini" data-toggle="dropdown"> <%= label %> <span class="caret"> </span></a><ul class="dropdown-menu"></ul>'),
        initialize: function(attributes) {
            _.bindAll(this, 'render', 'click');
            this.label = attributes.label;
            this.items = attributes.items || [];
            this.clickHandle = attributes.click;
        },
        render: function() {
            var html = this.template({ label: this.label });
            this.setElement(html);

            this.removeItem();
            _.each(this.items, this.renderItem, this);

            return this;
        },
        renderItem: function(item) {
            item.render();
            // append to ul.
            $(this.$el[1]).append(item.$el);

            return this;
        },
        removeItem: function(item) {
            this.items.length = 0;
            $(this.$el[1]).children().remove();

            return this;
        },
        addItem: function(item) {
            this.items.push(item);

            return this;
        }
    });

    var Separator = Ecore.Editor.Separator = Backbone.View.extend({
        template: _.template('<li class="divider"></li>'),
        render: function() {
            var html = this.template();
            this.setElement(html);
            return this;
        }
    });

    var DropDownItem = Ecore.Editor.DropDownItem = Backbone.View.extend({
        template: _.template('<li><a tabindex="-1" href="#"><%= label %></a></li>'),
        events: {
            'click a': 'click'
        },
        initialize: function(attributes) {
            _.bindAll(this, 'render', 'click');
            this.label = attributes.label;
            this.handleClick = attributes.click;
        },
        render: function() {
            var html = this.template({label: this.label});
            this.setElement(html);

            return this;
        },
        click: function() {
            return this.handleClick();
        },
        remove: function() {
        }
    });


