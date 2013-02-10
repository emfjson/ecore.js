
var TextValue = Backbone.View.extend({
    template: _.template('<div contenteditable><%= value %></div>'),

    render: function() {
        var html = this.template({ value: this.model });
        this.setElement(html);

        var view = this;
        this.$el.on('change', function() {
            view.trigger('change', view.$el.text());
        });

        return this;
    }
});

var DateValue = Backbone.View.extend({});

var SelectValue = Backbone.View.extend({
    templateOptions: _.template('<% _.each(options, function(option) { %> <option> <%= option.eClass ? Ecore.Edit.LabelProvider.getLabel(option) : option %></option> <% }); %>'),

    initialize: function(attributes) {
        this.value = attributes.value;
        this.options = attributes.options;
    },

    render: function() {
        var html = this.templateOptions({ options: this.options });
        this.$el.append(html);

        if (this.value === true || this.value === false) {
            this.$el.val(''+this.value);
        } else {
            var val = this.value ? this.value.eClass ? Edit.LabelProvider.getLabel(this.value) : this.value : null;
            this.$el.val(val);
        }

        var view = this;
        this.$el.change(function() {
            var changed = $('option:selected', view.$el).val();
            view.trigger('change', changed);
        });

        return this;
    }
});

var SingleValueSelect = SelectValue.extend({
    template: _.template('<select></select>'),

    initialize: function(attributes) {
        SelectValue.prototype.initialize.apply(this, [attributes]);
    },

    render: function() {
        var html = this.template();
        this.setElement(html);
        SelectValue.prototype.render.apply(this);
        return this;
    }
});

var MultiValueSelect = SelectValue.extend({
    template: _.template('<select multiple="multiple"></select>'),
    templateActions: _.template('<div class="btn-group"></div>'),
    templateAddAction: _.template('<a class="btn-mini"><i class="icon-plus"></i></a>'),
    templateDelAction: _.template('<a class="btn-mini"><i class="icon-remove"></i></a>'),

    initialize: function(attributes) {
        SelectValue.prototype.initialize.apply(this, [attributes]);
    },

    render: function() {
        var html = this.template();
        this.setElement(html);

        SelectValue.prototype.render.apply(this);

        var div = $(document.createElement('div'));
        div.append(this.$el);
        this.setElement(div);

        return this;
    }
});

