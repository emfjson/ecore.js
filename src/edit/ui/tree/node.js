/**
 * @name TreeNodeView
 * @class
 *
 */
Edit.TreeNodeView = Backbone.View.extend(/** @lends TreeNodeView.prototype */ {
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
        this.previous = attributes.previous;
        this.display = attributes.display;
        this.margin = attributes.margin;
        this.children = [];
        _.bindAll(this, 'render', 'onClick', 'expand', 'collapse', 'highlight', 'unhighlight');
    },
    render: function() {
        var html = this.template();
        this.setElement(html);

        this.$el.append(this._createOrderElement())
            .append(this._createLabelElemnt())
            .append(this._createEditElement())
            .append(this._createDeleteElement());

        return this;
    },
    highlight: function() {
        this.$el[0].style.background = 'rgba(255, 255, 102, 0.6)';
        this.$el[0].style.cursor = 'pointer';
    },
    unhighlight: function() {
        this.$el[0].style.background = 'rgba(255, 255, 255, 1)';
        this.$el[0].style.cursor = 'none';
    },
    onClick: function() {
        if (this.expanded) {
            this.collapse();
        } else {
            this.expand();
        }
    },
    expand: function() {
        var previous, current;
        this.expanded = true;

        _.each(this.model.eContents(), function(model) {
            current = new Edit.TreeNodeView({ model: model, parent: this, display: this.display, margin: this.margin + 24 });
            if (!previous) previous = current;
            previous.next = current;
            current.previous = current;
            previous = current;
            this.children.push(current);
            current.render();
            if (this.next && this.next !== this) {
                this.display.$tbody[0].insertBefore(current.$el[0], this.next.$el[0]);
            } else {
                this.display.$tbody.append(current.$el);
            }
        }, this);
    },
    collapse: function() {
        this.expanded = false;
        _.each(this.children, function(c) { c.remove(); });
    },
    remove: function() {
        _.each(this.children, function(c) { c.remove(); });
        Backbone.View.prototype.remove.apply(this);
        return this;
    },
    _createOrderElement: function() {
        var td = document.createElement('td');
        td.className = 'tree-td';
        if (this.parent) {
            var reorder = document.createElement('a');
            reorder.className += ' icon-reorder';
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

        table.label.innerHTML = this.model.get('name');
        td.addEventListener('click', this.onClick);

        return td;
    },
    _createEditElement: function() {
        var td = document.createElement('td');
        td.style.background = '#F5F5F5';
        td.style.color = '#CCCCCC';
        td.style.padding = 0;
        var copy = document.createElement('div');
        copy.className = 'icon-edit';
        td.appendChild(copy);
        return td;
    },
    _createDeleteElement: function() {
        var td = document.createElement('td');
        td.style.background = '#F5F5F5';
        td.style.color = '#CCCCCC';
        td.style.padding = 0;
        var del = document.createElement('div');
        del.className = 'icon-remove';
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

        td_btn.appendChild(btn);
        tr.appendChild(td_btn);
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
