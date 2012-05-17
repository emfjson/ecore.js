# ecore.js 0.1
# (c) 2012 Guillaume Hillairet.
#
# ecore.js: Consuming ecore models in JavaScript.
#

# Establish the root object, `window` in the browser, or `global` on the server.
root = this

ecore = {}
root['ecore'] = ecore

# Represents a persistent collection.
class Resource
    constructor: (@url, @content) ->

# ResourceSet holds a Collection of Resource, and provides methods for loading
# Resource.
class ResourceSet
    @resources = []
    @indexes = {}
    load: (url, callback) ->
        if _.isString(url) and callback and typeof callback is 'function'
            httpGet url, (result) ->
                resource = new Resource url, result
                @resources = [] unless @resources
                @resources.push resource
                callback resource

refAttribute = '$ref'
indexAttribute = '_index'
indexes = {}

# Return the Index of the current object, based
# on its parent Index and is current position in
# the given property.
getIndex = (parent, property, position) ->
    index = parent[indexAttribute] + '/@' + property
    index = index + '.' + position  if position >= 0
    index

# Traverse the current object tree and assign to
# each object an Index.
# The root object has for Index /.
buildIndexes = (object, func) ->
    current = false
    index = false
    keys = _.without(_.keys(object), refAttribute, indexAttribute)
    _.each keys, (key) ->
        if _.isArray(object[key])
            i = 0
            l = object[key].length
            while i < l
                current = object[key][i]
                index = func.apply(this, [ object, key, i ])
                current[indexAttribute] = index
                indexes[index] = current
                buildIndexes current, func
                i++
        else if typeof (object[key]) is 'object'
            current = object[key]
            index = func.apply(this, [ object, key ])
            current[indexAttribute] = index
            indexes[index] = current
            buildIndexes object[key], func
    true

# Resolves references based on Index assigned to each
# objects.
resolveReferences = (object) ->
    keys = _.without(_.keys(object), indexAttribute)
    _.each keys, (key) ->
        unless _.isUndefined(object[key])
            if _.has(object[key], refAttribute)
                ref = object[key][refAttribute]
                object[key] = indexes[ref] unless _.isUndefined(ref)
        resolveReferences object[key] if typeof (object[key]) is 'object'
    true

# Load data.
httpGet = (url, callback) ->
    if $
        $.getJSON url, (data) ->
            root = data
            if root
                root[indexAttribute] = '/'
                indexes['/'] = root
                buildIndexes root, getIndex
                resolveReferences root
                root
        callback root

ecore.Resource = Resource
ecore.ResourceSet = ResourceSet

