/**
 * jquery.stylesheet
 * Stylesheet injector utility with workarounds
 * for IE's 31 stylesheet limitation.
 *
 * Copyright (c) 2012 Jensen Tonne
 * www.jstonne.com
 *
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

$.stylesheet = (function() {

	var self = function(url, attr) {

		var options = {};

		$.extend(
			options,
			defaultOptions,

			($.isPlainObject(url)) ?
				url ||
				{
					url: url,
					attr: attr || {}
				}
		);

		if (options.url===undefined) {
			return false;
		}

		return self.insert(options);
	};

	var IE_MAX_STYLE = 31,
		IE_MAX_IMPORT = 31,
		IE_MAX_RULE = 4095;

	$.extend(self, {

		defaultOptions: {
			attr: {
				type: "text/css",
				rel: "stylesheet",
				media: "all"
			},

			// @TODO: bleedImports & bleedRules
			bleedImports: false,
			bleedRules: false
		},

		setup: function(options) {
			$.extend(self.defaultOptions, options);
		},

		availability: function() {

			// @TODO: Also calculate bleedImports
			var stat = {},
				links = $('link[rel*="stylesheet"]')
				styles = $('style');

			stat.groups = IE_MAX_STYLE - links.length - styles.length;

			stat.slots = stat.groups * IE_MAX_IMPORT;

			if (self.currentGroup) {
				stat.slots += IE_MAX_IMPORT - self.currentGroup.imports.length;
			}

			return stat;
		},

		insert: function(options) {

			if ($.browser.msie) {

				return insertIE(options);

			} else {

				$('<link>')
					.attr(options.attr)
					.appendTo('head');

				return true;
			}
		},

		insertIE: function(options) {

			var failed;

			if (self.currentGroup===undefined)

				var group;

				try {

					group = document.createStyleSheet();
					group.type = "text/css";
					group.media = "all";
					group.class = "jquery_stylesheet";

				} catch(e) {

					failed = true;

					if (options.verbose) {
						console.error('There is not enough slots left to create a new stylesheet group.');
					}
				}

				if (failed) return false;

				self.currentGroup = group;
			}

			try {

				self.currentGroup.addImport(options.url);

			} catch(e) {

				failed = true;

				if (options.verbose) {
					console.info('Slots exceeded. Creating a new stylesheet group.');
				}
			}

			if (failed) {

				self.currentGroup = undefined;

				return insertIE(options);
			}

			return true;
		}

	});

	return self;

});
