
// ==UserScript==
// @name                18
// @version 0.0.1
// @namespace	        https://github.com/sagan/userscripts
// @description	        自动确认常见糟糕网站的18禁警告。支持 Getchu 和 DLSite 等网站。
// @updateURL https://raw.githubusercontent.com/sagan/userscripts/master/18.meta.js
// @downloadURL https://raw.githubusercontent.com/sagan/userscripts/master/18.user.js
// @grant       none
// @run-at document-start
// @include http://www.getchu.com/*
// @include http://www.dlsite.com/*
// @include http://www.dmm.co.jp/*
// @include http://www.amazon.co.jp/*
// @include http://www.t66y.com/
// @include http://www.sexinsex.net/
// @include http://glace.me/
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

function setCookie(_options) {
	var options = {
		expiredays: 36500,
		path: '/',
		value: '1',
	};
	if( _options ) {
		for( var k in _options ) {
			if( _options.hasOwnProperty(k) ) {
				options[k] = _options[k];
			}
		};
	}
    var exdate = new Date();
    exdate.setDate(exdate.getDate()+ (options.expiredays || 0));
    document.cookie = options.name + "=" + escape(options.value)
		+ ((!options.expiredays) ? "" : ";expires=" + exdate.toUTCString())
		+ ((!options.path) ? "" : ";path=" + options.path);
		+ ((!options.domain) ? "" : ";domain=" + options.domain);
}

var cookies = {
	'www.dlsite.com': [{path: '/', name: 'adultchecked', value: '1'}],
	'www.getchu.com': [{path: '/', name: 'getchu_adalt_flag', value: 'getchu.com'}],
	'www.dmm.co.jp': [{path: '/', name: 'setover18', value: '1'}],
	'dmm.com': [{domain: 'dmm.com', path: '/', name: 'ckcy', value: '1'}],
};

var redirects = {
	'www.getchu.com': [{urlPrefix: 'http://www.getchu.com/php/attestation.html?', redirectVar: 'aurl', additionalUrl: '&gc=gc'}],
	'www.t66y.com': [{url: 'http://www.t66y.com/', redirectTo: 'http://www.t66y.com/index.php'}],
	'www.sexinsex.net': [{url: 'http://www.sexinsex.net/', redirectTo: 'http://www.sexinsex.net/bbs/index.php'}],
	'glace.me':[{url: 'http://glace.me/', redirectTo: 'http://glace.me/index2.php'}],
	'www.dmm.co.jp': [{url: 'http://www.dmm.co.jp/', redirectTo: 'http://www.dmm.co.jp/top/'}],
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

function go(url) {
	if( document.body )
		document.body.innerHTML = 'redirecting to <a href="' + url + '">' + url + '</a>';
	location.href = url;
};


(function() {
	var cs = cookies[location.host];
	if( cs ) {
		var existedCookies = getCookies();
		cs.forEach(function(cookie) {
			if( location.pathname.indexOf(cookie.path) == 0 ) {
				if( !existedCookies[cookie.name] ) {
					setCookie(cookie);
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
				go(redirectTo);
			}
		});
	}
	
	if( location.host == 'www.amazon.co.jp' ) {
		domReady(function() {
			var confirmLink = document.querySelector('center a');
			if( confirmLink && confirmLink.href.indexOf('http://www.amazon.co.jp/gp/product/black-curtain-redirect.html') == 0 ) {
				document.body.innerHTML = 'redirecting to <a href="' + confirmLink.href + '">' + confirmLink.href + '</a>';
				go(confirmLink);
			}
		});
	}
})();

