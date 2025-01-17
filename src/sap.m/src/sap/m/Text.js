/*!
 * ${copyright}
 */

// Provides control sap.m.Text.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control'],
	function(jQuery, library, Control) {
	"use strict";


	
	/**
	 * Constructor for a new Text.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The Text control is used to display some continuous text.
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.IShrinkable
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.Text
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Text = Control.extend("sap.m.Text", /** @lends sap.m.Text.prototype */ { metadata : {
	
		interfaces : [
			"sap.ui.core.IShrinkable"
		],
		library : "sap.m",
		properties : {
	
			/**
			 * Text to be displayed.
			 */
			text : {type : "string", defaultValue : '', bindable : "bindable"},
	
			/**
			 * Available options for the text direction are LTR and RTL. By default the control inherits the text direction from its parent control.
			 */
			textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : sap.ui.core.TextDirection.Inherit},
	
			/**
			 * Set this property to false to disable the automatic text wrapping.
			 */
			wrapping : {type : "boolean", group : "Appearance", defaultValue : true},
	
			/**
			 * Sets the horizontal alignment of the text.
			 */
			textAlign : {type : "sap.ui.core.TextAlign", group : "Appearance", defaultValue : sap.ui.core.TextAlign.Begin},
	
			/**
			 * By default, the Text control uses the full width available. Set this property to restrict the width to a custom value.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},
	
			/**
			 * Limits the number of lines for wrapping texts.
			 * 
			 * Note: The multi-line overflow indicator depends on the browser line clamping support. For such browsers, this will be shown as ellipsis, for the other browsers the overflow will just be hidden.
			 * @since 1.13.2
			 */
			maxLines : {type : "int", group : "Appearance", defaultValue : null}
		}
	}});
	
	/**
	 * Default line height value as a number when line-height is normal.
	 * This value is required during max-height calculation for the browsers that do not support line-clamping.
	 * It is better to define line-height in CSS instead of "normal" to get consistent maxLines results since normal line-height
	 * not only vary from browser to browser but they also vary from one font face to another and can also vary within a given face.
	 *
	 * Default value is 1.2
	 *
	 * @since 1.22
	 * @protected
	 * @type {number}
	 */
	Text.prototype.normalLineHeight = 1.2;
	
	/**
	 * Determines per instance whether line height should be cached or not.
	 * Default value is true.
	 *
	 * @since 1.22
	 * @protected
	 * @type {boolean}
	 */
	Text.prototype.cacheLineHeight = true;
	
	/**
	 * Ellipsis(…) text to indicate more text when clampText function is used.
	 * Can be overwritten with 3dots(...) if fonts do not support this UTF-8 character.
	 *
	 * @since 1.13.2
	 * @protected
	 * @type {string}
	 */
	Text.prototype.ellipsis = '…';
	
	/**
	 * Defines whether browser supports native line clamp or not
	 *
	 * @since 1.13.2
	 * @returns {boolean}
	 * @protected
	 * @readonly
	 * @static
	 */
	Text.hasNativeLineClamp = (function() {
		return (typeof document.documentElement.style.webkitLineClamp != "undefined");
	})();
	
	
	// suppress invalidation of text property setter
	Text.prototype.setText = function(sText) {
		this.setProperty("text", sText , true);
	
		// check text dom ref
		var oDomRef = this.getTextDomRef();
		if (oDomRef) {
			oDomRef.textContent = this.getText(true);
		}
	
		return this;
	};
	
	// returns the text value and normalize line-ending character for rendering
	Text.prototype.getText = function(bNormalize) {
		var sText = this.getProperty("text");
	
		// handle line ending characters for renderer
		if (bNormalize) {
			return sText.replace(/\r\n/g, "\n");
		}
	
		return sText;
	};
	
	// required adaptations after rendering
	Text.prototype.onAfterRendering = function() {
		// check visible, max-lines and line-clamping support
		if (this.getVisible() &&
			this.hasMaxLines() &&
			!this.canUseNativeLineClamp()) {
	
			// set max-height for maxLines support
			this.clampHeight();
		}
	};
	
	/**
	 * Determines whether max lines should be rendered or not
	 *
	 * @since 1.22
	 * @protected
	 * @returns {HTMLElement|null}
	 */
	Text.prototype.hasMaxLines = function() {
		return (this.getWrapping() && this.getMaxLines() > 1);
	};
	
	/**
	 * Returns the text node container's DOM reference.
	 * This can be different then getDomRef when inner wrapper is needed.
	 *
	 * @since 1.22
	 * @protected
	 * @returns {HTMLElement|null}
	 */
	Text.prototype.getTextDomRef = function() {
		if (!this.getVisible()) {
			return null;
		}
	
		if (this.hasMaxLines()) {
			return this.getDomRef("inner");
		}
	
		return this.getDomRef();
	};
	
	/**
	 * Decides whether the control can use native line clamp feature or not.
	 * In RTL mode native line clamp feature is not supported
	 *
	 * @since 1.20
	 * @protected
	 * @return {Boolean}
	 */
	Text.prototype.canUseNativeLineClamp = function() {
		// has line clamp feature
		if (!Text.hasNativeLineClamp) {
			return false;
		}
	
		// is text direction rtl
		var oDirection = sap.ui.core.TextDirection;
		if (this.getTextDirection() == oDirection.RTL) {
			return false;
		}
	
		// is text direction inherited as rtl
		if (this.getTextDirection() == oDirection.Inherit && sap.ui.getCore().getConfiguration().getRTL()) {
			return false;
		}
	
		return true;
	};
	
	/**
	 * Caches and returns the computed line height of the text.
	 *
	 * @since 1.22
	 * @protected
	 * @see sap.m.Text#cacheLineHeight
	 * @param {HTMLElement} [oDomRef] DOM reference of the text container.
	 * @returns {Number} returns calculated line-height
	 */
	Text.prototype.getLineHeight = function(oDomRef) {
		// return cached value if possible and available
		if (this.cacheLineHeight && this._iLineHeight) {
			return this._iLineHeight;
		}
	
		// check whether dom ref exist or not
		oDomRef = oDomRef || this.getTextDomRef();
		if (!oDomRef) {
			return 0;
		}
	
		// check line-height
		var oStyle = window.getComputedStyle(oDomRef),
			sLineHeight = oStyle.lineHeight,
			fLineHeight;
	
		// calculate line-height in px
		if (/px$/i.test(sLineHeight)) {
			// we can rely on calculated px line-height value
			fLineHeight = parseFloat(sLineHeight);
		} else if (/^normal$/i.test(sLineHeight)) {
			// use default value to calculate normal line-height
			fLineHeight = parseFloat(oStyle.fontSize) * this.normalLineHeight;
		} else {
			// calculate line-height with using font-size and line-height
			fLineHeight = parseFloat(oStyle.fontSize) * parseFloat(sLineHeight);
		}
	
		// on rasterizing the font, sub pixel line-heights are converted to integer
		// this can differ from browser font rendering engine, in this case
		// we should create one line text on the fly and check the height
		var iLineHeight = Math.floor(fLineHeight);
	
		// cache line height
		if (this.cacheLineHeight && iLineHeight) {
			this._iLineHeight = iLineHeight;
		}
	
		// return
		return iLineHeight;
	};
	
	/**
	 * Returns the max height according to max lines and line height calculation.
	 * This is not calculated max-height!
	 *
	 * @since 1.22
	 * @protected
	 * @param {HTMLElement} [oDomRef] DOM reference of the text container.
	 * @returns {Number}
	 */
	Text.prototype.getClampHeight = function(oDomRef) {
		oDomRef = oDomRef || this.getTextDomRef();
		return this.getMaxLines() * this.getLineHeight(oDomRef);
	};
	
	/**
	 * Sets the max-height to support maxLines property
	 *
	 * @since 1.22
	 * @protected
	 * @param {HTMLElement} [oDomRef] DOM reference of the text container.
	 * @returns {Number} calculated max height value
	 */
	Text.prototype.clampHeight = function(oDomRef) {
		oDomRef = oDomRef || this.getTextDomRef();
		if (!oDomRef) {
			return 0;
		}
	
		// calc the max height and set on dom
		var iMaxHeight = this.getClampHeight(oDomRef);
		if (iMaxHeight) {
			oDomRef.style.maxHeight = iMaxHeight + "px";
		}
	
		return iMaxHeight;
	};
	
	/**
	 * Clamps the wrapping text according to max lines and returns the found ellipsis position.
	 * Parameters can be used for better performance.
	 *
	 * @param {HTMLElement} [oDomRef] DOM reference of the text container.
	 * @param {number} [iStartPos] Start point of the ellipsis search.
	 * @param {number} [iEndPos] End point of the ellipsis search.
	 * @returns {number|undefined} Returns found ellipsis position or undefined
	 * @since 1.20
	 * @protected
	 */
	Text.prototype.clampText = function(oDomRef, iStartPos, iEndPos) {
		// check DOM reference
		oDomRef = oDomRef || this.getTextDomRef();
		if (!oDomRef) {
			return;
		}
	
		// init
		var iEllipsisPos;
		var sText = this.getText(true);
		var iMaxHeight = this.getClampHeight(oDomRef);
	
		// init positions
		iStartPos = iStartPos || 0;
		iEndPos = iEndPos || sText.length;
	
		// do not set content if not needed
		oDomRef.textContent = sText.slice(0, iEndPos);
	
		// if text overflow
		if (oDomRef.scrollHeight > iMaxHeight) {
	
			// cache values
			var oStyle = oDomRef.style,
				sHeight = oStyle.height,
				sEllipsis = this.ellipsis,
				iEllipsisLen = sEllipsis.length;
	
			// set height during ellipsis search
			oStyle.height = iMaxHeight + "px";
	
			// implementing binary search to find the position of ellipsis
			// complexity O(logn) so 1024 characters text can be found within 10 steps!
			while ((iEndPos - iStartPos) > iEllipsisLen) {
	
				// check the middle position and update text
				iEllipsisPos = (iStartPos + iEndPos) >> 1;
				oDomRef.textContent = sText.slice(0, iEllipsisPos - iEllipsisLen) + sEllipsis;
	
				// check overflow
				if (oDomRef.scrollHeight > iMaxHeight) {
					iEndPos = iEllipsisPos;
				} else {
					iStartPos = iEllipsisPos;
				}
			}
	
			// last check maybe we overflowed on last character
			if (oDomRef.scrollHeight > iMaxHeight && iStartPos > 0) {
				iEllipsisPos = iStartPos;
				oDomRef.textContent = sText.slice(0, iEllipsisPos - iEllipsisLen) + sEllipsis;
			}
	
			// reset height
			oStyle.height = sHeight;
		}
	
		// return the found position
		return iEllipsisPos;
	};

	return Text;

}, /* bExport= */ true);
