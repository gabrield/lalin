
var panes = [];
var tabs = [];


var Panes = {
	createNewPane: function() {
		this.addPane();
	},
	createChartPane: function() {
		this.addPane('chart');
	},
	addPane: function(type) {
		// Add a new item on array
		if (!type) { type = 'sensor'; }
		panes.push('pane-'+ (panes.length+1));
		
		// Creates a new pane on page and append the tab ul
		var placeholder = $('#new-pane-placeholder');
		$('<div class="tab-pane" id="tab-pane-'+panes.length+'"></div>').insertBefore(placeholder);
		
		var newPane = '#tab-pane-'+panes.length;
		var $newPane = $(newPane);
		
		if (type=='sensor') {
			$newPane.html(placeholder.html());
		} else {
			$newPane.html(type)
		}

		tabs.push(newPane);
		$newPane.addClass(type+'-pane').resizable({grid: 50});
		this.reloadPanesUI(newPane);
		Dialogs.configPane(newPane);
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
 
var Pane = function($el) {
	return {
		update: function(label,data) {
			$el.find('[data-label="' + label + '"]').text(data);
			return this;
		},
		feedback: function(class_) {
			$el.find("[data-label='status']").
			removeClass('success').
			removeClass('error').
			addClass(class_);
			return this;
		}
	}
}
 
var Dialogs = {
	welcome: function() {
		$('#div-welcome').dialog({
			autoOpen: true,
			modal: true,
			show: 'blind',
			hide: 'explode',
			buttons: {
				'Ok': function() {
					$(this).dialog("close");
					setTimeout(Panes.addPane(),500);
				}
			}
		});    
	},
	configPane: function(paneSelector) {
		$('#div-setup').dialog({
			autoOpen: true,
			modal: true,
			show: 'blind',
			hide: 'explode',
			buttons: {
				'Ok': function() {
					var fields = $(this).find('input');
					Sync.saveSettingsFor(paneSelector, {
						url: fields.first().val(),
						refreshInterval: fields.last().val()
					});
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
