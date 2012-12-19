

var ModalView = Backbone.View.extend({
    template: _.template('<div id="<%= id =>" class="modal hide fade"></div>'),
    templateHeader: _.template('<div class="modal-header"></div>'),
    templateBody: _.template('<div class="modal-body"></div>'),
    templateFooter: _.template('<div class="modal-footer"><a href="#" class="btn">Close</a><a href="#" class="btn confirm">Confirm</a></div>'),

    render: function() {
        var html = this.template({ id: this.cid });
        var header = this.templateHeader();
        var body = this.templateBody();
        var footer = this.templateFooter();

        this.setElement(html);
        this.$el.append(header);
        this.$el.append(body);
        this.$el.append(footer);

        this.$header = $('div[class="modal-header"]', this.$el);
        this.$body = $('div[class="modal-body"]', this.$el);
        this.$footer = $('div[class="modal-footer"]', this.$el);

        return this;
    },

    show: function() {
        this.$el.modal('show');
    }

});

var CreateResourceModal = ModalView.extend({
    templateForm: _.template('<form class="form-horizontal"></form>'),
    templateControlURI: _.template('<div class="control-group"><label class="control-label" for="inputURI">URI</label><div class="controls"><input type="text" id="inputURI" placeholder="URI"></div></div>'),
    templateControlElement: _.template('<div class="control-group"><label class="control-label" for="inputElement">Element</label><div class="controls"><select type="text" id="selectElement"></select></div>'),
    templateHeaderContent: _.template('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h3>Create Resource</h3></div>'),
    templateOptions: _.template('<% _.each(options, function(option) { %> <option><%= option.get("name") %></option> <% }); %>'),

    events: {
        'click .modal-footer a[class~="confirm"]': 'onConfirm'
    },

    initialize: function() {
        _.bindAll(this, 'onConfirm');
    },

    render: function() {
        ModalView.prototype.render.apply(this);

        var html = this.templateForm();
        var header = this.templateHeaderContent();
        var cURI = this.templateControlURI();
        var cElt = this.templateControlElement();

        this.$header.append(header);
        this.$body.append(html);
        this.$form = $('form', this.$body);
        this.$form.append(cURI).append(cElt);

        this.$select = $('#selectElement', this.$form);
        this.classes = this.model.elements('EClass');
        this.classes = _.filter(this.classes, function(c) { return !c.get('abstract'); });

        var options = this.templateOptions({ options: this.classes });
        this.$select.append(options);

        return this;
    },

    createResource: function(uri, eClass) {
        var res = this.model.create({ uri: uri });
        res.get('contents').add(eClass.create());
        this.model.trigger('change add', res);
    },

    onConfirm: function() {
        var uri = $('#inputURI', this.$form).val();
        var element = $('option:selected', this.$select).val();

        if (uri && uri.length && element) {
            var eClass = _.find(this.classes, function(c) { return c.get('name') === element; } );
            if (eClass) this.createResource(uri, eClass);
        }

        this.$el.modal('hide');
    }

});

