/**
 * @name TabPanel
 * @class
 */
Edit.TabPanel = Backbone.View.extend(/** @lends TabPanel.prototype */ {
    template: _.template('<ul class="nav nav-tabs"></ul> <div class="tab-content"></div>'),

    initialize: function(attributes) {
        this.editors = [];
    },
    render: function() {
        if (!this.$content && !this.$tabs) {
            var html = this.template();
            this.$el.addClass('tabbable');

            this.$el.append(html);

            this.$content = $('.tab-content', this.$el);
            this.$tabs = $('.nav-tabs', this.$el);
        }

        _.each(this.editors, function(e) { e.render(); });

        return this;
    },
    add: function(editor) {
        if (this.$content && this.$tabs) {
            editor.$container = this.$content;
            editor.$tabs = this.$tabs;
            this.editors.push(editor);

            editor.on('remove', function() { this.suppress(editor); }, this);
        }
    },
    get: function(editor) {
        return _.find(this.editors, function(e) { return e === editor; });
    },
    getByModel: function(model) {
        return _.find(this.editors, function(e) { return e.model === model; });
    },
    suppress: function(editor) {
        this.editors = _.without(this.editors, editor);
    },
    show: function(model) {
        this.getByModel(model).show();
    },
    open: function(model) {
        var editor = this.getByModel(model);
        if (!editor) {
            editor = new Edit.TabEditor({ model: model });
            this.add(editor);
            editor.render();
        }
        editor.show();
    }
});

