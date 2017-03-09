
var faviconBlueHREF = "TemplateData/favicon.ico";
var faviconRedHREF = "TemplateData/faviconRed.ico";

var chatInput = document.getElementById('chatInput');
var chatBox = document.getElementById("chatBox");
var gameCanvas = document.getElementById("canvas");
var favicon = document.getElementById('favicon');

var urlRegexString = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s\n]{2,}|www\.[^\s]+\.[^\s]{2,})/g;
var urlRegex = new RegExp(urlRegexString);
var newLineRegexString = '\n';
var newLineRegex = new RegExp(newLineRegexString, 'g');

var tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';

var tagOrComment = new RegExp(
    '<(?:'
    // Comment body.
    + '!--(?:(?:-*[^->])*--+|-?)'
    // Special "raw text" elements whose content should be elided.
    + '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*'
    + '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*'
    // Regular name
    + '|/?[a-z]'
    + tagBody
    + ')>',
    'gi');

function removeTags(html) {
  var oldHtml;
  do {
    oldHtml = html;
    html = html.replace(tagOrComment, '');
  } while (html !== oldHtml);
  return html.replace(/</g, '&lt;');
}

var windowIsActive = true;
window.onfocus = function () { 
	windowIsActive = true; 
	stopFlashFavicon();
}; 

window.onblur = function () { 
	windowIsActive = false;
}; 

var m_username;

function onSubmit(msg) {
	if(!loggedIn) {
		return;
	}

	SendMessage('ChatClient', 'SubmitMessage', msg);
}

function login(username, password) {
	SendMessage('ClientSession', 'RequestLogin', username + " " + password);
}

function loginSuccessful() {
	loggedIn = true;

	chatInput.onblur = function() {
		setTimeout(function() {
			chatInput.focus();
		}, 0);
	};
	chatInput.focus();
}

function createUser(username, password) {
	SendMessage('ClientSession', 'RequestCreateUser', username + " " + password);
}

function sendChatMsg(msg) {
	SendMessage('ChatClient', 'SendChatMessage', msg);
}

function recieveChatMsg(username, playerColor, msg, color, atPlayer) {
	msg = removeTags(msg);
	username = removeTags(username);
	
	var newChatLine = "";

	//username:
	if(username) {
		newChatLine += "<font color=\"" + playerColor + "\">";
		newChatLine += username + ":</font> ";
	}

	//@username
	if(atPlayer) {
		if(!windowIsActive) {
			flashFavicon();
		} else {
			flashFaviconOnce();
		}
	}

	//url regex
	var urlMatches = msg.match(urlRegex);
	if(urlMatches) {
		for(var i = 0; i < urlMatches.length; i++) {
			var url = urlMatches[i];
			if(url.indexOf("http://") < 0 && url.indexOf("https://") < 0) {
				url = "http://" + url;
			}
			var matchInd = msg.indexOf(urlMatches[i]);
			var hyperlinkOpen = "<a href=\"" + url + "\" target=\"_blank\">";
			var hyperlinkClose = "</a>";

			msg = msg.substr(0, matchInd) + hyperlinkOpen 
			+ msg.substr(matchInd, urlMatches[i].length) + hyperlinkClose 
			+ msg.substr(matchInd + urlMatches[i].length);
		}
	}

	//new lines
	msg = msg.replace(newLineRegex, '</br>');

	//msg color
	newChatLine += "<font color=\"" + color + "\">"+msg+"</font></br>";

	chatBox.innerHTML += newChatLine;
	chatBox.scrollTop = chatBox.scrollHeight;
}

var isFaviconRed = false;
var faviconFlashInterval;
function flashFavicon() {
	switchFavicon();
	faviconFlashInterval = setInterval(switchFavicon, 1000);
}

function flashFaviconOnce() {
	switchFavicon();
	setTimeout(switchFavicon, 1000);
}

function switchFavicon() {
	if(isFaviconRed) {
		isFaviconRed = false;
		favicon.href = faviconBlueHREF;
	} else {
		isFaviconRed = true;
		favicon.href = faviconRedHREF;
	}
}

function stopFlashFavicon() {
	if(faviconFlashInterval) {
		clearInterval(faviconFlashInterval);
	}
	isFaviconRed = false;
	favicon.href = faviconBlueHREF;
}

function setUsername(username) {	
	m_username = username;
}

chatInput.onkeydown = function(event) {

  	//enter
	if (event.keyCode == 13) { 
		onSubmit(chatInput.value); 
		chatInput.value = "";
		return false; 
	//left
	} else if (event.keyCode == 37) {
		SendMessage(m_username, 'RotateLeftStart');
		return false; 
	//right
	} else if (event.keyCode == 39) {
		SendMessage(m_username, 'RotateRightStart');
		return false; 
	//up
	} else if (event.keyCode == 38) {
		SendMessage(m_username, 'RotateUpStart');
		return false; 
	//down
	} else if (event.keyCode == 40) {
		SendMessage(m_username, 'RotateDownStart');
		return false; 
	}
};

chatInput.onkeyup = function(event) {
	//left
	if (event.keyCode == 37) {
		SendMessage(m_username, 'RotateLeftStop');
		return false; 
	//right
	} else if (event.keyCode == 39) {
		SendMessage(m_username, 'RotateRightStop');
		return false; 
	//up
	} else if (event.keyCode == 38) {
		SendMessage(m_username, 'RotateUpStop');
		return false; 
	//down
	} else if (event.keyCode == 40) {
		SendMessage(m_username, 'RotateDownStop');
		return false; 
	}
};

/*function hackWebGLKeyboard ()
 {
     var webGLInput = chatInput;
     for (var i in JSEvents.eventHandlers)
     {
         var event = JSEvents.eventHandlers[i];
         if (event.eventTypeString == 'keydown' || event.eventTypeString == 'keypress' || event.eventTypeString == 'keyup')
         {
             webGLInput.addEventListener(event.eventTypeString, event.eventListenerFunc, event.useCapture);
             window.removeEventListener(event.eventTypeString, event.eventListenerFunc, event.useCapture);
         }
     }

     var event = new MouseEvent('click', {
    'view': window,
    'bubbles': true,
    'cancelable': true
  });
  var cb = document.querySelector('input[type=submit][name=btnK]'); 
  var canceled = !cb.dispatchEvent(event);
 }*/

 /*chatInput.onkeypress = function forwardKey (e) {
 	var evt = document.createEvent("KeyboardEvent");
  evt.initKeyboardEvent("keypress", true, true, window,
                    0, 0, 0, 0,
                    0, e.keyCode);
  var canceled = !gameCanvas.dispatchEvent(evt);
 	//chatInput.dispatchEvent(e);
 	//return true;
 }*/