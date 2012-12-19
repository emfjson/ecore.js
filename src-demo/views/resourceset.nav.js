
var ResourceNavigatorView = Backbone.View.extend({
    template: _.template('<div class="nav-header"><div class="nav-header-content"></div></div><div class="nav-content"><span>resources</span></div>'),
    el: '#nav-side',

    buttons: ['icon-plus', 'icon-remove', 'icon-share'],
    actions: {
        'icon-plus': function(e) {
            $('#add-modal').modal('show');
        },
        'icon-remove': function() {},
        'icon-share': function() {}
    },

    initialize: function() {
        _.bindAll(this, 'render');

        this.views = [];
        this.modal = new CreateResourceModal({ model: this.model });
        this.modal.render();
        this.model.on('change', this.render);
    },

    render: function() {
        if (!this.$content) {
            var html = this.template();
            this.$el.append(html);
            this.$content = $('.nav-content', this.$el);
            this.$header = $('.nav-header > div', this.$el);

            _.each(this.buttons, this.addButton, this);
        }
        this.$content.children().remove();
        this.model.get('resources').each(this.addResource, this);

        return this;
    },

    addResource: function(res) {
        var view = new ResourceView({ model: res });
        view.render();
        this.views.push(view);
        this.$content.append(view.$el);
        view.on('select', function() { this.trigger('select', view.model); }, this);
        return this;
    },

    addButton: function(icon) {
        var btn = new ButtonView({ icon: icon });
        var modal = this.modal;
        btn.click = function(e) {
            modal.show();
        };
        btn.render();
        this.$header.append(btn.$el);
        return this;
    }
});

