
Edit.EditorView = Backbone.View.extend({
    template: _.template('<div class="tab-pane" id="tab-<%= id %>"></div>'),

    initialize: function(attributes) {
        _.bindAll(this, 'render', 'remove');
        if (attributes && attributes.$container && attributes.$tabs) {
            this.$container = attributes.container;
            this.$tabs = attributes.tabs;
        }
        this.tab = new Edit.TabView({ eid: this.cid, model: this.model });
        this.tab.on('remove', this.remove);
        this._rendered = false;
    },

    render: function() {
        if (!this._rendered) {
            var html = this.template({ id: this.cid });
            this.setElement(html);

            this.$container.append(this.$el);
            this.$tabs.append(this.tab.render().$el);
            this._rendered = true;
        }

        this.renderContent();

        return this;
    },

    renderContent: function() {},

    show: function() {
        $('a[href="#tab-' +  this.cid + '"]', this.$tabs).tab('show');
    },

    remove: function() {
        this.trigger('remove');
        Backbone.View.prototype.remove.apply(this);
    }

});

