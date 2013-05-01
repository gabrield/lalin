/*
 * The Twitter request code is based on the jquery tweet extension by http://tweet.seaofclouds.com/
 *
 * */
var LAST_UPDATE, accounts, msg, delete_icon;
var accounts, selec, block, nicks,panes,tabs;
var currAc, currPanel;

accounts = Array();
nicks = Array();
selec = Array();
block = Array();
panes = Array();
tabs = Array();

//Reverse collection
jQuery.fn.reverse = function() {
  return this.pushStack(this.get().reverse(), arguments);
}; 

function login() {
      
      // Dialog

      $('#div-login').dialog({
			autoOpen: true,
			modal: true,
			show: 'blind',
			hide: 'explode',
			buttons: {
				'Sair': function() {
					sendUiMsg('quit');
				},
				'Login c/ OAuth': function() {
					sendUiMsg('authorize');
				}
			}
       });    
       
	var main_pane;
    
	accounts.push( { username: 'lukasrms' , password: 'kdmeun0me' } );
	currAc = 0;
	
	// Fills the accounts menu
	for (var i in accounts) {
		$('#menu  #accounts').after("<li><a onclick='javascript:setCurrAccount("+i+")'>"+accounts[i].username+"</a></li>");
		
		main_pane = addPane();
		addTab('Friends','Friends',main_pane);
		addTab('Mentions','Mentions',main_pane);
		addTab('Timeline','Timeline',main_pane);

	}

	return;
}

function addPane() {
		
	// Add a new item on array
	panes.push('pane-'+ (panes.length+1));
	
	// Creates a new pane on page and append the tab ul
	$('#new-pane-placeholder').append('<div class="tab-pane" id="tab-pane-'+panes.length+'"></div>');
	$('#tab-pane-'+panes.length).html('<ul></ul><div id="new-tab-placeholder"></div>');


	tabs.push('#tab-pane-'+panes.length);
	
	$('#tab-pane-'+panes.length).resizable({
			grid: 50
	});

	
	return '#tab-pane-'+panes.length;
}

function createNewPane() {
	var newWidth =  $("#tab-pane-"+panes.length).width() - 
		( ($("#tab-pane-"+panes.length).width()/100) * 40 );
	
	$("#tab-pane-"+panes.length).animate ({ 'width': newWidth }, 'slow');
	
	addPane();
	addTab('new','Nova Aba',"#tab-pane-"+panes.length);
	$("#tab-pane-"+panes.length).css('width','');
	

}

function reloadPanesUI(pane) {
         
         if (pane == undefined) {
               pane = "#tab-pane-1";
         }

	 $(pane).tabs('destroy');
	 $(pane).tabs(); 	 
	 $(pane).tabs().find(".ui-tabs-nav").sortable({axis:'x'});
	 
	 refreshMessages();
}

function addTab(tabUrl,tabName,pane) {

        if (pane == undefined)
            pane = "#tab-pane-1";

        if (tabName == undefined)
            tabName = tabUrl;
	
        if (tabUrl == 'Friends')
	        tabUrl = 'http://127.0.0.1:31415/srv1/statuses/friends_timeline.json' + getSinceParameter();

        if (tabUrl == 'Mentions')
           tabUrl = 'http://127.0.0.1:31415/srv1/statuses/mentions.json' + getSinceParameter();

        if (tabUrl == 'Timeline')
           tabUrl = 'http://127.0.0.1:31415/srv2/1/statuses/public_timeline.json' + getSinceParameter();
        
        if (tabUrl == 'Trends')
           tabUrl = 'http://127.0.0.1:31415/srv3/trends.json';

	// Create a new item on tabs array
	if (tabs[pane] == undefined) 
		tabs[pane] = Array();
	
	tabs[pane].push({ name: tabName, url: tabUrl });

	// Now lets create the new tab button...
	var placeholder;
	placeholder = $(pane).find('ul:first');
	placeholder.append('<li><a href="#tabs-'+((panes.length*10) +tabs[pane].length)+'">'+tabName+'</a></li>');

	// ...and the tab content
	var content = "";
	placeholder = $(pane).find('#new-tab-placeholder');
	
	content = content + '<div class="tweets" id="tabs-'+((panes.length*10)+tabs[pane].length)+'">';
	content = content + 'Loading this tab. Please wait... <ul class="tweet_list" id="twl-b-'+panes.length+''+tabs[pane].length+'"></ul>';
	content = content + '</div></div>';
	placeholder.append(content);
	
	reloadPanesUI(pane);
}

function confirmDeleteTweet(id) {
         
         if (id == undefined)
            id = selec[0] ;


      $('#div-confirm-delete').dialog({
			autoOpen: true,
			modal: false,
			show: 'blind',
			hide: 'explode',
			buttons: {
				'Não': function() {
					$(this).dialog('close');
				},
				'Excluir!': function() {
                                        reallyDeleteTweet(id);    
					$(this).dialog('close');
				}
			}
       });

       return;
}

function confirmBlock(screenname) {
         
         if (screenname == undefined)
            screenname = selec[2] ;


      $('#div-confirm-block').dialog({
			autoOpen: true,
			modal: false,
			show: 'blind',
			hide: 'explode',
			buttons: {
				'Cancelar': function() {
					$(this).dialog('close');
				},
				'Silenc.': function() {
                                        confirmBlockSilenty(screenname);
					$(this).dialog('close');
				},
				'Bloquear': function() {
                                        reallyBlock(screenname);
					$(this).dialog('close');
				}
			}
       });

       return;
}

function confirmBlockSilenty(screenname) {

         if (screenname == undefined)
            screenname = selec[0] ;

      $('#div-confirm-block-silenty').dialog({
			autoOpen: true,
			modal: false,
			show: 'blind',
			hide: 'explode',
			buttons: {
				'Não': function() {
					$(this).dialog('close');
				},
				'Bloquear': function() {
                                        reallyBlockSilenty(screenname);
					$(this).dialog('close');
				}
			}
       });

       return;
}

function confirmUnfollow(screenname) {
         
         if (screenname == undefined)
            screenname = selec[2] ;


      $('#div-confirm-unfollow').dialog({
			autoOpen: true,
			modal: false,
			show: 'blind',
			hide: 'explode',
			buttons: {
				'Não': function() {
					$(this).dialog('close');
				},
				'Deixar de seguir!': function() {
                                        reallyUnfollow(screenname);
					$(this).dialog('close');
				}
			}
       });

       return;
}

// The block feature
function reallyBlock(screenname) {
      $.post("http://127.0.0.1:31415/2/api.twitter.com/1/blocks/create/"+screenname+".json");
       RefreshMessages();

      return;
}

// The block silenty feature
function reallyBlockSilenty(screenname) {
		block.push(screenname);
}

// The delete feature
function reallyDeleteTweet(id) {
      $.post("http://127.0.0.1:31415/2/api.twitter.com/1/statuses/destroy/"+id+".json");
      $("#msg-"+id).fadeOut();

      return;
}

// The unfollow feature
function reallyUnfollow(screenname) {
      $.post("http://"+accounts[currAc].username+':'+accounts[currAc].password+"@api.twitter.com/1/friendships/destroy/"+screenname+".json");
      RefreshMessages();

      return;
}


function gettweets(list,url,kind) { //1

      if (kind == undefined) { //2
            kind = 'Status';
      } //2
      
	  list.before('<ul class="tweet_list">');	

      $.getJSON(url, function(data) { //2
            $.each(data.reverse(), function(i, item) { //3
                  if($("#msg-" + item.id).length == 0) { // 4 <- fix for twitter caching which sometimes have problems with the "since" parameter

                  if (kind == "Status") {
                     msg = item.text;
                  } if (kind == "Trend") {
                    msg = item.name;
                  }

                  // Hashtags
                  var msg_sep = msg.split(" ");
                  msg = '';

                  for(var m in msg_sep){
                      if ( msg_sep[m].charAt(0) == '#') {
                         msg = msg + "<a href='http://search.twitter.com/search?q=%23"+msg_sep[m].replace('#','')+"'>"+msg_sep[m]+"</a>";
                      } else {
                        msg = msg + " " + msg_sep[m];
                      }
                  }

                  // Add the delete button
                  if ( item.user.screen_name == accounts[currAc].username ) {
                     delete_icon = '<span style="float: right" class="ui-widget ui-icon ui-icon-trash" onclick="javascript:confirmDeleteTweet('+item.id+')"></span>';
                  } else {
                    delete_icon = '';
                  }

                  msg = msg.replace(/(\w+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+)/g, '<a href="$1">$1</a>');
                  msg = msg.replace(/[\@]+([A-Za-z0-9-_]+)/g, '<a href="http://twitter.com/$1">@$1</a>');
                  msg = msg.replace(/[&lt;]+[3]/g, "<tt class='heart'>&#x2665;</tt>");

                  //If kind is status
                  if (kind == "Status") {

                      // Verify if the screenname is in silent blocked list
                      if ($.inArray('@'+item.user.screen_name, block) == -1) {
                          list.prepend('<li onclick="javascript:updateSelec('+item.id+')" id="msg-' + item.id + '"><img id="avatar-' + item.id + '" class="profile_image" src="' + item.user.profile_image_url + '" alt="' + item.user.name + '" /><span class="time" title="' + item.created_at + '">' + relative_time(item.created_at) + '</span> <a class="user" id="accounts[currAc].username-'+ item.id + '" href="javascript:addAddress(\'' + item.user.screen_name + '\')">' + item.user.screen_name + '</a><div class="tweet_text" id="text-'+ item.id + '">'+ msg + delete_icon + '</div></li>');
                          nicks.push('@'+item.user.screen_name);
                          nicks = removeDuplicates(nicks);
                      }
                  }
                  if (kind == "Trend") {
                     list.prepend('<li ><div class="tweet_text">'+ msg +'</div></li>');
                  } 
                  }
            }); //3
}); //2

list.after('</ul>');

} //1


function relative_time(time_value) {
	var values = time_value.split(" ");
	time_value = values[1] + " " + values[2] + ", " + values[5] + " " + values[3];
	var parsed_date = Date.parse(time_value);
	var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
	var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);
	delta = delta + (relative_to.getTimezoneOffset() * 60);
	if (delta < 60) {
		return 'agora';
	} else if(delta < 120) {
		return 'um minuto atrás';
	} else if(delta < (45*60)) {
		return (parseInt(delta / 60)).toString() + ' minutos atrás';
	} else if(delta < (90*60)) {
		return 'uma hora atrás';
	} else if(delta < (24*60*60)) {
		return '' + (parseInt(delta / 3600)).toString() + ' horas atrás';
	} else if(delta < (48*60*60)) {
		return 'ontem';
	} else {
		return (parseInt(delta / 86400)).toString() + ' dias atrás';
	}
};

function removeHTMLTags(strInputCode){
	strInputCode = strInputCode.replace(/&(lt|gt);/g, function (strMatch, p1){
	 	return (p1 == "lt")? "<" : ">";
	});
	var strTagStrippedText = strInputCode.replace(/<\/?[^>]+(>|$)/g, "");
	return strTagStrippedText;
}

// Atualiza a variavel selec
function updateSelec(msgid) {
      
      selec = Array();

      selec.push (msgid);
      selec.push ($("#avatar-"+msgid).attr("src") );
      selec.push ($("#accounts[currAc].username-"+msgid).html() );
      selec.push ($("#text-"+msgid).html() );

}


//Follow feature
function follow(screenname) {

       if (screenname == undefined)
                  screenname = selec[2] ;

         showAlert("Você está seguindo "+screenname);
         $.post("http://"+accounts[currAc].username+':'+accounts[currAc].password+"@api.twitter.com/1/friendships/create/"+screenname+".json");
         $("#alert").fadeOut(2000);
         gettweets();
}

//Favorite feature
function favorite(id) {

       if (id == undefined)
                  id = selec[2] ;

         showAlert("Marcado como favorito");
         $.post("http://"+accounts[currAc].username+':'+accounts[currAc].password+"@api.twitter.com/1/favorites/create/"+id+".json");
         $("#alert").fadeOut(2000);
         gettweets();
}

// Reply feature
function reply() {
     $("#status").val('@'+selec[2]+' ');
     $("#status").focus();
      updateStatusCount();
}

// ReTweet feature
function retweet() {
      $("#status").val(removeHTMLTags('RT @'+ selec[2] + ' '+selec[3]));
      $("#status").focus();
      updateStatusCount();
}

// Saved searchs feature
function createSavedSearch(term) {
      
         var ssId;

         $.post("http://"+accounts[currAc].username+':'+accounts[currAc].password+"@api.twitter.com/1/saved_searches/create.json", { query : term },
             function(data) {
                   addTab('http://'+accounts[currAc].username+':'+accounts[currAc].password+'@api.twitter.com/1/saved_searches/show/'+data.id+'.json' + getSinceParameter(),'SS: '+term);
             }
             , 'json');
}

// Shrink url

function shrinkUrl() {
	
	// Select each word of the tweet and shrink
	
	var tweet = $('#status').val().split(' ');
        	$('#status').val('');

	for ( var i in tweet) {
		if (tweet[i].substring(0,7) == 'http://') {
                   $.get('http://migre.me/api.txt?url='+tweet[i],function(data) {
                      $('#status').val( $('#status').val()+data+' ')   });
		} else {
                      $('#status').val( $('#status').val()+tweet[i]+' ');
                }
	}

	updateStatusCount();
	
}

// Search feature

function search() {


      $('#div-buscar').dialog({
			autoOpen: true,
			modal: false,
			show: 'blind',
			hide: 'explode',
			buttons: {
				'Cancelar': function() {
					$(this).dialog('close');
				},
				'Buscar': function() {
					$(this).dialog('close');
					createSavedSearch($("#search-text").val());
				}
			}
       });
       
       $('#search-text').focus();

       return;
}

//get all span.time and recalc from title attribute
function recalcTime() {
	$('span.time').each( 
			function() {
				$(this).text(relative_time($(this).attr("title")));
			}
	)
}


function getSinceParameter() {
	if(LAST_UPDATE == null) {
		return "?callback=?";
	} else {
		return "?since=" + LAST_UPDATE+"&callback=?";
	}
}

function showAlert(message) {
	$("#alert p").text(message);
	$("#alert").fadeIn("fast");
	return;
}

function showMenu() {
	$("#menu").toggle();
}

function sendUiMsg(message) {
	d = new Date();
	d = d.getMilliseconds();
	
	if (d < 100) {
		d = d + 100;
	}
	
	document.title = d+' '+message;
}

function showProfile (screenname) {
         
         if (screenname == undefined)
            screenname = selec[2] ;

      // Getting some stuff from the user
      $.get('"http://127.0.0.1:31415/2/1/users/show/'+screenname+'.json', function(data) {

            $('#div-profile #NAME').html(data.name);
            $('#div-profile #SCREEN_NAME').html(data.screen_name);
            $('#div-profile #BIO').html(data.description);
            $('#div-profile #FOLLOWERS').html(data.followers_count);
            $('#div-profile #FOLLOWING').html(data.friends_count);
            $('#div-profile #UPDATES').html(data.statuses_count);
            $('#div-profile #LASTTWEET').html(data.status.text);

            $('#div-profile .profile_image_big').attr('src',data.profile_image_url.replace('_normal',''));

            $('#div-profile').dialog({
            			autoOpen: true,
            			modal: false,
            			show: 'blind',
            			hide: 'explode',
            			buttons: {
            				'Fechar': function() {
            					$(this).dialog('close');
            				},
            				'Ver updates': function() {
                                addTab('http://'+accounts[currAc].username+':'+accounts[currAc].password+'@api.twitter.com/1/statuses/user_timeline/'+screenname+'.json','@'+screenname);
                                $(this).dialog('close');
            				}
            			}
             });

        });

       return;
}


function refreshMessages() {
	showAlert("Getting new tweets...");
	
	var currentTab;
        for (var i in panes){
            var ni = (i*1) + 1;

            for (var j in tabs["#tab-pane-"+ni] ) {

                var nj = (j*1) + 1;

                currentTab = tabs["#tab-pane-"+ ni][j];
                gettweets($('#twl-b-'+ ( ni +''+nj)), currentTab.url);
            }
        }

	LAST_UPDATE = new Date().toGMTString();	
	$("#alert").fadeOut(2000);
	return;
}

function addAddress(screenname) {
	
	var tweet = $('#status').val().split(' ');
	var lastWord = tweet[tweet.length -1];
	
	if (lastWord == screenname.substring(0,lastWord.length)) {
		screenname = screenname.substring(lastWord.length);
		$("#status").val($("#status").val() + screenname + ' ');
	} else {
		$("#status").val($("#status").val() + ' @' + screenname + ' ');
	}
	$("#status").focus();
	return;
}

function setCurrAccount(num){
	currAc = num;
}

function setStatus(status_text) {

    if (status_text == undefined) 
		status_text = $("#status").val();
	
	var count = 140 - status_text.length;
	
	
	if (count >= 0 ) {
		$.post("http://"+accounts[currAc].username+':'+accounts[currAc].password+"@api.twitter.com/statuses/update.json",
			{ status: status_text, source: "twoot" },
			function(data) { checkStatus(); refreshStatusField(); }, "json" );
	} else {
		// TODO
	}

	return;
}

function refreshStatusField() {
	//maybe show some text below field with last message sent?
	refreshMessages();
	$("#status_count").text("140");
	$('html').animate({scrollTop:0}, 'fast');
	return;
}

function removeDuplicates(a)
{
   var r = new Array();
   o:for(var i = 0, n = a.length; i < n; i++) {
      for(var x = i + 1 ; x < n; x++)
      {
         if(a[x]==a[i]) continue o;
      }
      r[r.length] = a[i];
   }
   return r;
}

function updateStatusCount() {
	
	var count = 140 - $("#status").val().length;
	window.statusCount = count;
	
	if (count >= 0 ) {
		$("#status_count").text(window.statusCount.toString());
	} else {
		$("#status_count").text(window.statusCount.toString()+
			' (Auto)');
	}
	
	// Autocomplete feature
	$('#accounts').html('')
	var tweet = $('#status').val().split(' ');
	var lastWord = tweet[tweet.length -1];
	
	if (lastWord.charAt(0) == '@') {
		for ( var i in nicks) {
			if (lastWord == nicks[i].substring(0,lastWord.length)) {
				$('#accounts').append
					('<a href="javascript:addAddress(\'' + nicks[i] + '\')">' + nicks[i] + '</a> | ');
			}
		}
	}						
	
    return;
}

function checkStatus () {
    var origColor = $('#status').css("background-color");
    if ($('#status').val().length == 140) {
	    $("#status").val("Twoosh!").css("background-color","#52FF55").fadeOut('slow', function() {
	      $("#status").val("").css("background-color", origColor).fadeIn('slow');
	    });
    } else {
        $('#status').val($("#status").val()).css("background-color","#52FF55").fadeOut('slow', function() {
            $('#status').val("").css("background-color", origColor).fadeIn('slow');
        });
    }
}

// set up basic stuff for first load
$(document).ready(function(){

	//get the user's messages
    refreshMessages();

    // menu setting up functions
    $("#menu").accordion( { header: '.header' });
    //$("#menu").click( function() { $("#menu").hide() });

    //add event capture to form submit
    $("#status_entry").submit(function() {
         setStatus($("#status").val());
         return false;
    });

    //set timer to reload messages every 70 secs
	window.setInterval("refreshMessages()", 65000);

	//set timer to recalc timestamps every 60 secs
	window.setInterval("recalcTime()", 60000);

	//Bind r key to request new messages
	$(document).bind('keydown', {combi:'r', disableInInput: true}, refreshMessages);
});
