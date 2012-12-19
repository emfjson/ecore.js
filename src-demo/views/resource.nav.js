
var ResourceView = Backbone.View.extend({
    template: _.template('<div class="row-fluid nav-row"><a href="#"><i class="icon-edit-resource"></i><%= uri %></a></div>'),
    events: {
        'click': 'click'
    },
    initialize: function() {
        _.bindAll(this, 'render', 'click');
    },
    render: function() {
        var html = this.template({ uri: this.model.get('uri') });
        this.setElement(html);
        return this;
    },
    click: function() {
        this.trigger('select', this.model);
    }
});

