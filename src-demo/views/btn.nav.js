
var ButtonView = Backbone.View.extend({
    template: _.template('<a id="<%= id %>" style="cursor: pointer"><i class="<%= icon %>"></i></a>'),
    events: {
        'click': 'click'
    },
    initialize: function(attributes) {
        _.bindAll(this, 'render', 'click');
        this.icon = attributes.icon;
    },
    render: function() {
        var html = this.template({ id: this.id, icon: this.icon });
        this.setElement(html);
        return this;
    },
    click: function() {}
});

