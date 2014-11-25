//     Ecore.js
//     Ecore Implementation in JavaScript.
//
//     ©2014 Guillaume Hillairet.
//     EPL License (http://www.eclipse.org/legal/epl-v10.html)

(function() {

"use strict";

// The root object, `window` in the browser, or `global` on the server.
var root = this;

// Load underscore from the `window` object in the browser or via the require function
// on the server.
var _ = root._;
if (!_ && (typeof require !== 'undefined')) _ = require('underscore');

