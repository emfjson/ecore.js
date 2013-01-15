
Edit.MetaBrowserView = Backbone.View.extend({
    el: '#browser',

    initialize: function(attributes) {
    },

    render: function() {
        var packages = _.flatten(this.model.get('resources').map(function(m) {
            return m.get('contents').filter(function(e) { return e.isTypeOf('EPackage'); });
        }));
        var view = new Edit.EModelElementColumnView({ model: packages, browser: this });
        this.$el.append(view.render().$el);
        return this;
    }
});

Edit.EModelElementColumnView = Backbone.View.extend({
    template: _.template('<div class="span3 outter-column"><div class="column"></div></div>'),
    initialize: function(attributes) {
        // model is an array
        this.browser = attributes.browser;
    },
    render: function() {
        var el = this.template();
        this.setElement(el);

        _.each(this.model, function(m) {
            var view = new Edit.EModelElementRowView({ model: m, parent: this, browser: this.browser });
            $(this.$el.children()[0]).append( view.render().$el );
        }, this);

        return this;
    }
});

Edit.EModelElementRowView = Backbone.View.extend({
    template: _.template('<div class=""><i class="icon-edit-<%= eClass %>"></i><%= name %></div>'),
    events: {
        'mouseover': 'highlight',
        'mouseout': 'unhighlight',
        'click': 'showContent'
    },
    initialize: function(attributes) {
        this.parent = attributes.parent;
        this.browser = attributes.browser;
        this.contents = this.model.eContents();
    },
    render: function() {
        var el = this.template({ eClass: this.model.eClass.get('name'), name: this.model.get('name') });
        this.setElement(el);

        return this;
    },
    highlight: function() {
        this.$el.css({background: 'whitesmoke'});
    },
    unhighlight: function() {
        this.$el.css({background: 'white'});
    },
    showContent: function() {
        // this.highlight();
        var parent = this.el.parentNode.parentNode.parentNode, // browser
        child = parent.children, // columns
        position = _.indexOf(child, this.el.parentNode.parentNode);

        // removes the nexts.
        for (var i = position + 1; i < child.length; i++) {
            $(child[i]).remove();
        }

        if (this.contents.length > 0) {
            this.contentView = new Edit.EModelElementColumnView({ model: this.contents, browser: this.browser });
            this.contentView.render();
            this.browser.$el.append(this.contentView.$el);
        }

        /*
           if (window.currentProperty) {
           window.currentProperty.$el.children().remove();
           }

           if (!this.propertyView) {
           this.propertyView = new Ecore.Editor.PropertyView({ model: this.model });
           this.propertyView.render();
           window.currentProperty = this.propertyView;
           }
           */

        return this;
    }
});

