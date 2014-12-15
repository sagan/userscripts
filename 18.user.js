
// ==UserScript==
// @name                18
// @namespace	        https://github.com/sagan/userscripts
// @description	        自动确认常见糟糕网站的18禁警告。
// @grant       none
// @run-at document-start
// @include		http://www.getchu.com/*
// @include		http://www.dlsite.com/*
// @include		http://www.t66y.com/
// @include     http://www.sexinsex.net/
// @include     http://www.amazon.co.jp/*
// ==/UserScript==

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
        if (pair && decodeURIComponent(pair[0]) == variable) {
            var index = vars[i].indexOf('=');
			return vars[i].substring(index + 1);
        }
    }
}

function getCookies() {
	var $COOKIE = (document.cookie || '').split(/;\s*/).reduce(function(re, c) {
		var tmp = c.match(/([^=]+)=(.*)/);
		if (tmp) re[tmp[1]] = unescape(tmp[2]);
		return re;
	}, {});
	return $COOKIE;
}

// delete a cookie: setCookie(cookie_names[i], 1, '/', 0);
// set a temporary cookie: setCookie(cookie_names[i], 1, '/', null);
function setCookie(c_name, value, path, expiredays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate()+expiredays);
    document.cookie = c_name + "=" + escape(value)
		+ ((expiredays==null) ? "" : ";expires=" + exdate.toUTCString())
		+ ((path==null) ? "" : ";path=" + path);
}

var cookies = {
	'www.dlsite.com': [{host:'www.dlsite.com', path: '/', name: 'adultchecked', value: '1'}],
	'www.getchu.com': [{host:'www.getchu.com', path: '/', name: 'getchu_adalt_flag', value: 'getchu.com'}],
};

var redirects = {
	'www.getchu.com': [{urlPrefix: 'http://www.getchu.com/php/attestation.html?', redirectVar: 'aurl', additionalUrl: '&gc=gc'}],
	'www.t66y.com': [{url: 'http://www.t66y.com/', redirectTo: 'http://www.t66y.com/index.php'}],
	'www.sexinsex.net': [{url: 'http://www.sexinsex.net/', redirectTo: 'http://www.sexinsex.net/bbs/index.php'}],
};

function domReady(func) {
	if(typeof jQuery != "undefined") jQuery(document).ready(func);
	else {
		var oldonload = window.onload;
		if (typeof window.onload != 'function') {
			window.onload = func;
		} else {
				window.onload = function() {
					oldonload();
					func();
				}
		}
	}
};


(function() {
	var cs = cookies[location.host];
	if( cs ) {
		var existedCookies = getCookies();
		cs.forEach(function(cookie) {
			if( location.host == cookie.host && location.pathname.indexOf(cookie.path) == 0 ) {
				if( !existedCookies[cookie.name] ) {
					setCookie(cookie.name, 	cookie.value, cookie.path, 36500);
				}
			}
		});
	}
	
	var rs = redirects[location.host];
	if( rs ) {
		rs.forEach(function(redirect) {
			var redirectTo;
			if( redirect.urlPrefix ) {
				if( location.href.indexOf(redirect.urlPrefix) == 0 ) {
					redirectTo = getQueryVariable(redirect.redirectVar);
					if (redirect.additionalUrl)
						redirectTo += redirect.additionalUrl;
				}
			} else if( redirect.url ) {
				if( location.href == redirect.url ) {
					redirectTo = redirect.redirectTo;
				}
			}
			if( redirectTo ) {
				console.log('18: found matched redirectTo rule:', redirectTo);
				location.href = redirectTo;
			}
		});
	}
	
	if( location.host == 'www.amazon.co.jp' ) {
		domReady(function() {
			var confirmLink = document.querySelector('center a');
			if( confirmLink && confirmLink.href.indexOf('http://www.amazon.co.jp/gp/product/black-curtain-redirect.html') == 0 ) {
				document.body.innerHTML = 'redirecting to <a href="' + confirmLink.href + '">' + confirmLink.href + '</a>';
				location.href = confirmLink;
			}
		});
	}
})();

