
var Sync = {
    items: {},
    now: function() {
        $.each(this.items, function(key, value) {
            $.getJSON(value.url, function(data){
                if (data && data.length > 0) {
                    Pane($(key)).update('current', data[0].value).
                    update('status', 'OK').
                    feedback('success');
                } else {
                    Pane($(key)).
                    update('status', 'Falha').
                    feedback('error');
                }
            });
        });
    },
    saveSettingsFor: function(paneSelector, settings) {
        this.items[paneSelector] = settings;
        Pane($(paneSelector)).update('status', settings.refreshInterval);
    }
}

setInterval('Sync.now()', 2000);
