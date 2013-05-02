
var panes = [];
var tabs = [];

var Panes = {
	createNewPane: function() {
		var newWidth =  $("#tab-pane-"+panes.length).width() - 
		( ($("#tab-pane-"+panes.length).width()/100) * 40 );
	
		$("#tab-pane-"+panes.length).animate ({ 'width': newWidth }, 'slow');
		
		this.addPane();
		$("#tab-pane-"+panes.length).css('width','');
		
	},
	addPane: function() {
		// Add a new item on array
		panes.push('pane-'+ (panes.length+1));
		
		
		// Creates a new pane on page and append the tab ul
		var placeholder = $('#new-pane-placeholder');
		$('<div class="tab-pane" id="tab-pane-'+panes.length+'"></div>').insertAfter(placeholder);
		$('#tab-pane-'+panes.length).html(placeholder.html());


		tabs.push('#tab-pane-'+panes.length);
		
		$('#tab-pane-'+panes.length).resizable({
				grid: 50
		});

	
		this.reloadPanesUI('#tab-pane-'+panes.length);
	},
	reloadPanesUI: function(pane) {
         
		if (pane == undefined) {
			pane = "#tab-pane-1";
		}

		$(pane).tabs('destroy');
		$(pane).tabs(); 	 
		$(pane).tabs().find(".ui-tabs-nav").sortable({axis:'x'});
	 
	}
};
 
 
var Dialogs = {
	welcome: function() {
		var that = this;
		$('#div-welcome').dialog({
			autoOpen: true,
			modal: true,
			show: 'blind',
			hide: 'explode',
			buttons: {
				'Ok': function() {
					$(this).dialog("close");
					setTimeout(that.setup,500);
				}
			}
		});    
	},
	setup: function() {
		$('#div-setup').dialog({
			autoOpen: true,
			modal: true,
			show: 'blind',
			hide: 'explode',
			buttons: {
				'Ok': function() {
					$(this).dialog("close");
				}
			}
		});    
	}
}




$(document).ready(function(){

	$("#menu").accordion( { header: '.header' });
	
	Dialogs.welcome();
   
	//$(document).bind('keydown', {combi:'r', disableInInput: true}, refreshMessages);
});
