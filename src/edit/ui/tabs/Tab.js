
Edit.Tab = Backbone.View.extend({
    template: _.template('<li><a href="#tab-<%= id %>" data-toggle="tab"> <%= title %> <i class="icon-remove-circle"></i> </a></li>'),

    events: {
        'click a > i[class="icon-remove-circle"]': 'remove'
    },

    initialize: function(attributes) {
        this.eid = attributes.eid;
        this._rendered = false;
    },
    render: function() {
        if (!this._rendered) {
            var title = this.title();
            var html = this.template({ id: this.eid, title: title });
            this.setElement(html);
            this._rendered = true;
        }
        return this;
    },
    remove: function() {
        this.trigger('remove');
        return Backbone.View.prototype.remove.apply(this);
    },
    title: function() {
        var uri = this.model.get('uri');
        return uri.slice(uri.lastIndexOf('/') + 1, uri.length);
    }
});

