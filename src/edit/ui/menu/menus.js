
Edit.MenuBar = Backbone.View.extend({
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

Edit.MenuBarButton = Backbone.View.extend({
    template: _.template('<a class="btn btn-<%= size %>"> <%= label %> </a>'),

    events: {
        'click': 'click'
    },

    initialize: function(attributes) {
        _.bindAll(this, 'render', 'click');
        this.size = attributes.size || 'mini';
        this.label = attributes.label;
    },
    render: function() {
        var html = this.template({ label: this.label, size: this.size });
        this.setElement(html);

        return this;
    },
    click: function(e) {
        this.trigger('click', e);
    }
});

Edit.MenuBarDropDownButton = Edit.MenuBarButton.extend({
    template: _.template('<a class="btn btn-<%= size %>" data-toggle="dropdown"> <%= label %> <span class="caret"> </span></a><ul class="dropdown-menu"></ul>'),

    initialize: function(attributes) {
        Edit.MenuBarButton.prototype.initialize.apply(this, [attributes]);

        this.label = attributes.label;
        this.items = attributes.items || [];
    },
    render: function() {
        Edit.MenuBarButton.prototype.render.apply(this);

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

Edit.Separator = Backbone.View.extend({
    template: _.template('<li class="divider"></li>'),

    render: function() {
        var html = this.template();
        this.setElement(html);
        return this;
    }
});

Edit.DropDownItem = Backbone.View.extend({
    template: _.template('<li><a tabindex="-1" href="#"><%= label %></a></li>'),

    events: {
        'click a': 'click'
    },

    initialize: function(attributes) {
        _.bindAll(this, 'render', 'click');
        this.label = attributes.label;
    },
    render: function() {
        var html = this.template({ label: this.label });
        this.setElement(html);

        return this;
    },
    click: function(e) {
        this.trigger('click', e);
    },
    remove: function() {
        Backbone.View.prototype.remove.apply(this);
    }
});

