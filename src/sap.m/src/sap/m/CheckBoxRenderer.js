/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/ValueStateSupport'],
	function(jQuery, ValueStateSupport) {
	"use strict";


	/**
	 * CheckBox renderer.
	 * @namespace
	 */
	var CheckBoxRenderer = {
	};
	
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oCheckBox an object representation of the control that should be rendered
	 */
	CheckBoxRenderer.render = function(oRm, oCheckBox){
		// get control properties
		var bEnabled = oCheckBox.getEnabled();
		var bEditable = oCheckBox.getEditable();
		var bInteractible = oCheckBox.getEnabled() && oCheckBox.getEditable();
	
		// CheckBox wrapper
		oRm.write("<div");
		oRm.addClass("sapMCb");
		
		if (bInteractible) {
			oRm.addClass("sapMPointer");
		}
		
		if (!bEditable) {
			oRm.addClass("sapMCbRo");
		}
		
		if (!bEnabled) {
			oRm.addClass("sapMCbBgDis");
		}
		
		oRm.writeControlData(oCheckBox);
		oRm.writeClasses();
	
		var sTooltip = ValueStateSupport.enrichTooltip(oCheckBox, oCheckBox.getTooltip_AsString());
		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}
	
		oRm.write(">");		// DIV element
	
		// write the HTML into the render manager
		oRm.write("<div id='");
		oRm.write(oCheckBox.getId() + "-CbBg'");
	
		// CheckBox style class
		oRm.addClass("sapMCbBg");
	
		if (bEnabled && bEditable && sap.ui.Device.system.desktop) {
			oRm.addClass("sapMCbHoverable");
		}
	
		if (!oCheckBox.getActiveHandling()) {
			oRm.addClass("sapMCbActiveStateOff");
		}
	
		if (bEnabled) {
			oRm.writeAttribute("tabindex", oCheckBox.getTabIndex());
		}
	
		oRm.addClass("sapMCbMark"); // TODO: sapMCbMark is redundant, remove it and simplify CSS
	
		if (oCheckBox.getSelected()) {
			oRm.addClass("sapMCbMarkChecked");
		}
		oRm.writeClasses();
	
		oRm.write(">");		// DIV element
	
		oRm.write("<input type='CheckBox' id='");
		oRm.write(oCheckBox.getId() + "-CB'");
	
		if (oCheckBox.getSelected()) {
			oRm.writeAttribute("checked", "checked");
		}
	
		if (oCheckBox.getName()) {
			oRm.writeAttributeEscaped('name', oCheckBox.getName());
		}
	
		if (!bEnabled) {
			oRm.write(" disabled=\"disabled\"");
		}
		
		if (!bEditable) {
			oRm.write(" readonly=\"readonly\"");
		}
	
		oRm.write(" /></div>");
		oRm.renderControl(oCheckBox._oLabel);
		oRm.write("</div>");
	};
	

	return CheckBoxRenderer;

}, /* bExport= */ true);
