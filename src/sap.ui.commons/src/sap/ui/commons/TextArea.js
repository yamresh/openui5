/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.TextArea.
sap.ui.define(['jquery.sap.global', './TextField', './library'],
	function(jQuery, TextField, library) {
	"use strict";


	
	/**
	 * Constructor for a new TextArea.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Control to enter or display multible row text.
	 * @extends sap.ui.commons.TextField
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.commons.TextArea
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TextArea = TextField.extend("sap.ui.commons.TextArea", /** @lends sap.ui.commons.TextArea.prototype */ { metadata : {
	
		library : "sap.ui.commons",
		properties : {
	
			/**
			 * Height of text field. When it is set (CSS-size such as % or px), this is the exact size.
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},
	
			/**
			 * Number of Columns. Cols means number of characters per row. This proprty is only used if Width is not used.
			 */
			cols : {type : "int", group : "Dimension", defaultValue : null},
	
			/**
			 * Number of Rows. This proprty is only used if Height is not used.
			 */
			rows : {type : "int", group : "Dimension", defaultValue : null},
	
			/**
			 * Text wrapping. Possible values are: Soft, Hard, Off.
			 */
			wrapping : {type : "sap.ui.core.Wrapping", group : "Appearance", defaultValue : null},
	
			/**
			 * Position of cursor, e.g., to let the user re-start typing at the same position as before the server roundtrip
			 */
			cursorPos : {type : "int", group : "Appearance", defaultValue : null},
	
			/**
			 * text which appears, in case quick-help is switched on
			 */
			explanation : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * ID of label control
			 * @deprecated Since version 1.5.2. 
			 * Please use association AriaLabelledBy instead.
			 */
			labeledBy : {type : "string", group : "Identification", defaultValue : null, deprecated: true}
		}
	}});
	
	///**
	// * This file defines the control behavior.
	// */
	//.TextArea.prototype.init = function(){
	//   // do something for initialization...
	//};
	
	/**
	 * Exit handler
	 */
	TextArea.prototype.exit = function() {
		this._detachEventHandler();
	};
	
	/**
	 * Event handler called before control is rendered
	 */
	TextArea.prototype.onBeforeRendering = function() {
		this._detachEventHandler();
	};
	
	/**
	 * Event handler called after control is rendered
	 */
	TextArea.prototype.onAfterRendering = function () {
		this._attachEventHandler();
	};
	
	/**
	 * attaches the native event handlers
	 */
	TextArea.prototype._attachEventHandler = function() {
		var $this = this.$();
		this.pasteHandlerId = $this.bind('paste', jQuery.proxy(this.handlePaste, this));
		this.inputHandlerId = $this.bind('input', jQuery.proxy(this.handleInput, this)); // for FF
		this.proChHandlerId = $this.bind('propertychange', jQuery.proxy(this.handleInput, this)); // for IE
	};
	
	/**
	 * detaches the native event handlers
	 */
	TextArea.prototype._detachEventHandler = function() {
		// Unbind events
		var $this = this.$();
		if (this.pasteHandlerId) {
			$this.unbind('paste', this.handlePaste);
			this.pasteHandlerId = null;
		}
		if (this.inputHandlerId) {
			$this.unbind('input', this.handlePaste);
			this.inputHandlerId = null;
		}
		if (this.proChHandlerId) {
			$this.unbind('propertychange', this.handlePaste);
			this.proChHandlerId = null;
		}
	};
	
	/**
	 * Event handler called when control is getting the focus
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	TextArea.prototype.onfocusin = function(oEvent){
	
		TextField.prototype.onfocusin.apply(this, arguments);
	
		// Set focus flag
		this.bFocus = true;
	
		oEvent.preventDefault();
	};
	
	/*
	 * Event handler called when control is loosing the focus
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	TextArea.prototype.onsapfocusleave = function(oEvent){
	
		TextField.prototype.onsapfocusleave.apply(this, arguments);
	
		var oFocusDomRef = this.getFocusDomRef();
		if (oFocusDomRef && !!sap.ui.Device.browser.firefox) { // Only for FF -> deselect text
			if (oFocusDomRef.selectionStart != oFocusDomRef.selectionEnd) {
				jQuery(oFocusDomRef).selectText(oFocusDomRef.selectionStart, oFocusDomRef.selectionStart);
			}
		}
	
		// Clear focus flag
		this.bFocus = false;
	
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};
	
	/**
	 * Returns an object representing the serialized focus information.
	 * Overwrites the standard function.
	 * @type Object
	 * @return An object representing the serialized focus information.
	 * @private
	 */
	TextArea.prototype.getFocusInfo = function () {
		return {id:this.getId(), cursorPos:this.getCursorPos()};
	};
	
	/**
	 * Applies the focus info.
	 * Overwrites the standard function.
	 * @param {object} oFocusInfo
	 * @private
	 */
	TextArea.prototype.applyFocusInfo = function (oFocusInfo) {
		this.focus();
		var oFocusDomRef = this.getFocusDomRef();
		jQuery(oFocusDomRef).cursorPos(this.getCursorPos());
	};
	
	/**
	 * Event handler called on Key press
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	TextArea.prototype.onkeypress = function(oEvent){
	
		TextField.prototype.onkeypress.apply(this, arguments);
	
		if (!this.getEditable() || !this.getEnabled() || this.getMaxLength() <= 0) {
			return;
		}
	
		var oKC = jQuery.sap.KeyCodes;
		var iKC = oEvent.which || oEvent.keyCode;
		var oDom = this.getDomRef();
	
		// Check if some text is selected since this is different in Internet Explorer and FireFox
		// If some text is selected, it is overwritten by a key press -> Value will not get too large
		if (document.selection) { //IE
			var oSel = document.selection.createRange();
			if (oSel.text.length > 0) {
				return;
			}
		} else { // FF
			if (oDom.selectionStart != oDom.selectionEnd) {
				return;
			}
		}
	
		// Only real characters and ENTER, no backspace
		if (oDom.value.length >= this.getMaxLength() && ( iKC > oKC.DELETE || iKC == oKC.ENTER || iKC == oKC.SPACE) && !oEvent.ctrlKey) {
			oEvent.preventDefault();
			oEvent.stopPropagation();
		}
	
	};
	
	/**
	 * Event handler called on Key up
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	TextArea.prototype.onkeyup = function(oEvent){
	
	// save cursor position
		var oDomRef = this.getDomRef();
		this.setProperty('cursorPos', jQuery(oDomRef).cursorPos(), true); // no re-rendering!
	
		// call keyup function of TextField to get liveChange event
		TextField.prototype.onkeyup.apply(this, arguments);
	
	};
	
	/**
	 * Event handler called when the enter key is pressed.
	 * @see sap.ui.commons.TextField#onsapenter
	 * @private
	 */
	TextArea.prototype.onsapenter = function (oEvent) {
	// stop bubbling of event when in the textarea so other actions of parent control handlers won't be called.
	// don't do a prevent default because we want the default browser behavior...e.g. new line when pressing enter in the text area.
		oEvent.stopPropagation();
	}
	
	/**
	 * Event handler called on Mouse up
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */;
	TextArea.prototype.onmouseup = function(oEvent){
	
	// Save cursor position
		var oDomRef = this.getDomRef();
		this.setProperty('cursorPos', jQuery(oDomRef).cursorPos(), true); // no re-rendering!
	
	};
	
	/**
	 * Event handler called on Paste
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	TextArea.prototype.handlePaste = function(oEvent){
	
		if (!this.getEditable() || !this.getEnabled() || this.getMaxLength() <= 0) {
			return;
		}
	
		var oDom = this.getDomRef();
	
		if (oDom.value.length >= this.getMaxLength() && oDom.selectionStart == oDom.selectionEnd) {
			// already maxLenght reached and nothing selected -> no paste possible
			oEvent.preventDefault();
			oEvent.stopPropagation();
		}
	
	};
	
	/**
	 * Event handler called on Input
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	TextArea.prototype.handleInput = function(oEvent){
	
		if (oEvent.originalEvent.propertyName && oEvent.originalEvent.propertyName.toLowerCase() != "value") {
			// In Internet Explorer, check for correct property
			return;
		}
	
		if (!this.getEditable() || !this.getEnabled() || this.getMaxLength() <= 0) {
			return;
		}
	
		var oDom = this.getDomRef();
	
		// If text is entered or pasted, cut it if is too long
		if (oDom.value.length > this.getMaxLength()) {
			oDom.value = oDom.value.substring(0,this.getMaxLength());
		}
		// The result is if text is pasted via clipboard or drag and drop the result is cut to fit the
		// maxLength. It's not easy to cut only the pasted text because in FireFox there is no access to the clipboard.
		// An option would be to store the old value after each change and compare it after each change.
		// Then the pasted text must be determined and cut. But this would need a lot of effort and script on
		// every change.
	
	};
	
	/**
	 * Property setter for MaxLength
	 *
	 * @param {int} iMaxLength
	 * @return {sap.ui.commons.TextArea} <code>this</code> to allow method chaining
	 * @public
	 */
	TextArea.prototype.setMaxLength = function(iMaxLength) {
	
		this.setProperty('maxLength', iMaxLength, true); // No re-rendering
	
		var oDom = this.getDomRef();
	
		if (oDom && oDom.value.length > iMaxLength && iMaxLength > 0 ) {
			oDom.value = oDom.value.substring(0,iMaxLength);
		}
	
		var sValue = this.getValue();
		if (sValue.length > iMaxLength && iMaxLength > 0 ) {
			this.setProperty('value', sValue.substring(0,iMaxLength));
		}
	
		return this;
	};
	
	/**
	 * Property setter for the cursor position
	 *
	 * @param {int} iCursorPos
	 * @return {sap.ui.commons.TextArea} <code>this</code> to allow method chaining
	 * @public
	 */
	TextArea.prototype.setCursorPos = function(iCursorPos) {
	
		this.setProperty('cursorPos', iCursorPos, true); // no re-rendering!
	
		if (this.bFocus) {
			jQuery(this.getDomRef()).cursorPos(iCursorPos);
		}
	
		return this;
	};

	return TextArea;

}, /* bExport= */ true);
