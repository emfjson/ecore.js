/*

 TreeNodeView

<li>
    <div class="tree-node">
        <div class="tree-selected">
            <span class="icon-chevron-right"></span>
            <span class="icon-edit-EPackage folder"></span>
            <span> 222 </span>
        </div>
        <ul>
        </ul>
    </div>
</li>

*/

Edit.TreeNodeView = Backbone.View.extend({
    template: _.template('<li><div class="<%= kind %>"><div></div><ul></ul></div></li>'),
    chevronTemplate: _.template('<span class="chevron icon-chevron-right"></span>'),
    iconTemplate: _.template('<span class="icon-edit-<%= icon %>"> </span>'),
    labelTemplate: _.template('<span> <%= label %> </span>'),

    isSelected: false,
    isExpanded: false,

    events: {
        'click div span[class~="chevron"]': 'expand',
        'click': 'select',
        'mouseover': 'highlight',
        'mouseout': 'unhighlight'
    },

    initialize: function(attributes) {
        _.bindAll(this, 'render', 'expand', 'select', 'highlight', 'unhighlight');
        this.children = [];
        this.tree = attributes.tree;
    },
    kind: function() {
        var contents = this.model ? this.model.eContents() : [];
        return contents.length > 0 ? 'tree-node' : 'tree-leaf';
    },
    render: function() {
        if (!this.model) return this;

        var kind = this.kind();
        if (!this.$node) {
            var html = this.template({ kind: kind });
            this.setElement(html);

            this.$node = $('div > div', this.$el);
            this.$children = $('div > ul', this.$el);
        }

        // clear content
        this.$node.children().remove();
        this.$children.children().remove();

        // make content
        var icon = this.model.eClass.get('name');
        var label = Edit.LabelProvider.getLabel(this.model);
        var chevronHTML = this.chevronTemplate();
        var iconHTML = this.iconTemplate({ icon: icon });
        var labelHTML = this.labelTemplate({ label: label });

        if (kind === 'tree-node') {
            this.$node.append(chevronHTML);
        }

        this.$node.append(iconHTML) .append(labelHTML);
        this.$chevron = $('span[class~="chevron"]', this.$node);

        return this;
    },
    highlight: function(eve) {
        if (eve) eve.stopImmediatePropagation();
        if (this.$el && this.$node) {
            this.$node.addClass('tree-over');
        }
    },
    unhighlight: function(eve) {
        if (eve) eve.stopImmediatePropagation();
        if (this.$el && this.$node) {
            this.$node.removeClass('tree-over');
        }
    },
    select: function(eve) {
        if (eve) eve.stopImmediatePropagation();
        if (this.$el && this.$node) {
            this.$node.addClass('tree-selected');
        }
        this.tree.setSelection(this);
    },
    deselect: function() {
        if (this.$el && this.$node) {
            this.$node.removeClass('tree-selected');
        }
    },
    addChildren: function(child) {
        if (!child) return;
        var view = new Edit.TreeNodeView({ model: child, tree: this.tree });
        view.render();
        this.$children.append(view.$el);
        this.children.push(view);
        return view;
    },
    expand: function(eve) {
        if (eve) eve.stopImmediatePropagation();
        if (!this.$children) return this;

        if (this.isExpanded) {
            this.$children.children().remove();
            this.$chevron
                .removeClass('icon-chevron-down')
                .addClass('icon-chevron-right');
            this.children.length = 0;
            this.isExpanded = false;
        } else {
            var contents = this.model.eContents();
            if (contents.length === 0) return this;

            this.$chevron
                .removeClass('icon-chevron-right')
                .addClass('icon-chevron-down');
            this.$children.children().remove();
            this.children.length = 0;
            _.each(contents, this.addChildren, this);
            this.isExpanded = true;
        }

        return this;
    }
});

