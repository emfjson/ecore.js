/**
 * @name TreeNode
 * @class
 *
 */
Edit.TreeNode = Backbone.View.extend(/** @lends TreeNode.prototype */ {
    template: _.template('<tr class="tree-item-tr"></tr>'),
    table: '<table style="border-collapse; collapse; margin-left: 0px;"><tbody><tr></tr></tbody></table>',
    td: '<td class="tree-td"></td>',

    events: {
        'mouseover': 'highlight',
        'mouseout': 'unhighlight'
    },

    initialize: function(attributes) {
        this.tree = attributes.tree;
        this.parent = attributes.parent;
        this.margin = attributes.margin;
        this.children = [];
        _.bindAll(this, 'render', 'onClick', 'expand', 'collapse', 'highlight', 'unhighlight');
    },
    render: function() {
        var html = this.template();
        this.remove();
        this.setElement(html);

        if (this.model) {
            this.$el.append(this._createLabelElemnt());
        } else {
            this.$el.append(this._createAddElement());
        }

        return this;
    },
    highlight: function() {
        this.$el[0].style.background = 'rgba(255, 255, 102, 0.6)';
        this.$el[0].style.cursor = 'pointer';
    },
    unhighlight: function() {
        this.$el[0].style.background = 'rgba(255, 255, 255, 1)';
        this.$el[0].style.cursor = 'auto';
    },
    onClick: function() {
        this.tree.setSelection(this);
        if (this.expanded) {
            this.collapse();
        } else {
            this.expand();
        }
    },
    select: function(e) {
        if (e) e.stopImmediatePropagation();
        if (this.$el) {
            this.$el.addClass('tree-selected');
        }
        this.tree.setSelection(this);
    },
    deselect: function() {
        if (this.$el) {
            this.$el.removeClass('tree-selected');
        }
    },
    expand: function() {
        this.expanded = true;
        var contents = this.model.eContents();
        _.each(contents, this.addNode, this);
    },
    addNode: function(model) {
        var previous = _.last(this.children);
        var view = new Edit.TreeNode({
            model: model,
            tree: this.tree,
            parent: this,
            margin: this.margin + 24
        });

        if (previous) previous.next = view;

        this.children.push(view);
        view.render();

        if (this.next && this.next !== this) {
            this.tree.$tbody[0].insertBefore(view.$el[0], this.next.$el[0]);
        } else {
            this.tree.$tbody.append(view.$el);
        }
    },
    collapse: function() {
        this.expanded = false;
        _.each(this.children, function(c) { c.remove(); });
        this.children.length = 0;
    },
    remove: function() {
        _.each(this.children, function(c) { c.remove(); });
        Backbone.View.prototype.remove.apply(this);
        this.children.length = 0;
        return this;
    },


    // private methods


    _createAddElement: function() {
        var td = document.createElement('td');
        td.className = 'tree-td';
        var add = document.createElement('a');
        add.className = 'icon-plus icon-large';
        td.appendChild(add);
        return td;
    },
    _createOrderElement: function() {
        var td = document.createElement('td');
        td.className = 'tree-td';
        if (this.parent) {
            var reorder = document.createElement('a');
            reorder.className += ' icon-reorder icon-large';
            reorder.style.color = 'grey';
            td.appendChild(reorder);
        }
        return td;
    },
    _createLabelElemnt: function() {
        var td = document.createElement('td');
        td.className = 'tree-td';
        var table = this._createInnerTable();
        td.appendChild(table.table);

        var label = Edit.LabelProvider.getLabel(this.model);
        table.label.innerHTML = label;
        td.addEventListener('click', this.onClick);

        return td;
    },
    _createEditElement: function() {
        var td = document.createElement('td');
        td.style.background = '#F5F5F5';
        td.style.color = '#CCCCCC';
        td.style.padding = 0;
        var copy = document.createElement('div');
        copy.className = 'icon-edit icon-large';
        td.appendChild(copy);
        return td;
    },
    _createDeleteElement: function() {
        var td = document.createElement('td');
        td.style.background = '#F5F5F5';
        td.style.color = '#CCCCCC';
        td.style.padding = 0;
        var del = document.createElement('div');
        del.className = 'icon-remove icon-large';
        td.appendChild(del);

        return td;
    },
    _createInnerTable: function() {
        var table = document.createElement('table');
        table.style.marginLeft = this.margin + 'px';
        table.style.borderCollapse = 'collapse';
        var tbody = document.createElement('tbody');
        var tr = document.createElement('tr');
        var td_btn = document.createElement('td');
        td_btn.className = 'tree-td';
        var btn = document.createElement('a');
        btn.className = 'icon-caret-right';
        btn.style.color = 'grey';
        btn.style.cursor = 'pointer';
        var td_label = document.createElement('td');
        td_label.className = 'tree-td';
        var div_label = document.createElement('div');
        div_label.className = 'tree-label';
        var td_icon = document.createElement('td');
        td_icon.className = 'tree-td';
        var span_icon = document.createElement('span');
        span_icon.className = 'icon-edit-' + this.model.eClass.get('name');

        td_btn.appendChild(btn);
        tr.appendChild(td_btn);
        tr.appendChild(td_icon);
        td_icon.appendChild(span_icon);
        td_label.appendChild(div_label);
        tr.appendChild(td_label);
        tbody.appendChild(tr);
        table.appendChild(tbody);

        return { table: table, label: div_label };
    }

});

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

*/
