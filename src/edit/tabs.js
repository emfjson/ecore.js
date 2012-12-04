
    Ecore.Editor.Tabbable = Backbone.View.extend({
        el: '#edit-tabs',
        template: _.template('<div class="tabbable"><ul class="nav nav-tabs"></ul><div class="tab-content"></div></div>'),

        initialize: function() {
            this.tabs = [];
        },

        render: function() {
            this.remove();
            var html = this.template();
            this.$el.append(html);
            this.$tabs = $('ul', this.$el);
            this.$content = $('div[class*="tab-content"]', this.$el);

            _.each(this.tabs, function(tab) {
                tab.render();
            }, this);

            return this;
        },

        addTab: function(tab) {
            tab.parent = this;
            tab.on('close', this.close);
            this.tabs.push(tab);

            return this;
        },

        close: function(tab) {
            tab.remove();
            this.tabs = _.without(this.tabs, tab);

            return this;
        },

        remove: function() {
            this.$el.children().remove();

            return this;
        }
    });

    Ecore.Editor.Tab = Backbone.View.extend({
        templateContent: _.template('<div class="tab-pane" id="tab-<%= id %>"></div>'),

        events: {
        },

        intialize: function(attributes) {
            _.bindAll(this);
        },

        render: function() {
            var html = this.templateContent({ id: this.cid });
            this.setElement(html);
            this.parent.$content.append(this.$el);

            this.tab = new TabTab({ id: this.cid, label: this.model.label() });
            this.tab.on('close', function() {
                this.trigger('close', this);
            }, this);
            this.tab.render();

            this.$tab = this.tab.$el;
            this.parent.$tabs.append(this.$tab);

            var view = this;
            this.$tab.on('shown', function() {
                view.renderContent();
            });

            return this;
        },

        renderContent: function() { },

        show: function() {
            this.$tab.show();
        },

        remove: function() {
            this.$tab.remove();
            this.tab.off();
            delete this.tab;
            this.$el.remove();
        }
    });

    var TabTab = Backbone.View.extend({
        template: _.template('<li><a href="#tab-<%= id %>" data-toggle="tab"> <%= label %> <i class="icon-remove-circle"></i> </a></li>'),

        events: {
            'click': 'show',
            'click i[class*="icon-remove"]': 'close'
        },

        initialize: function(attributes) {
            this._id = attributes.id;
            this.label = attributes.label;
        },

        render: function() {
            this.remove();
            var html = this.template({ id: this._id, label: this.label });
            this.setElement(html);

            return this;
        },

        close: function() {
            this.trigger('close', this);
        },

        show: function() {
            this.$el.tab('show');
        },

        remove: function() {

        }

    });

