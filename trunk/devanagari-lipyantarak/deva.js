/**
 * @fileoverview Transliterator for Sanskrit text written in Devanagari Lipi into any other 8 Indian Lipis Bengali, Gurumukhi, 
 * Gujarati, Orya, Tamil, Telugu, Kannada, Malayalam, entirely written in Javascript
 * <br>Compression : change _lipyak namespace to _l, Safe Replace _lipyak.=_l.,.Varnmala=.v,.Utils=.u,
 * .Page=.p,.Htmlpc=.h,.custommap=.c,.transliterate=.t,.empty=.e,.unicode=.u,.
 * @author Bhartiya Bhasha Antah Lipyantaran (bhartiya-bhasha-antah-lipyantaran@googlegroups.com)
 * @author Shaurabh Bharti (sbharti@gmail.com)
 * @author Vinodh Rajan (vinodh@virtualvinodh.com)
 * @created 06 Feb 2012
 */

/**@namespace
 * Main transliterator object
 */
var _lipyak=_lipyak||{};
/**
 * <h1>General Utils</h1>
 * It has functions empty and cookie 
 * @namespace
 * @memberOf _lipyak
 */
_lipyak.Utils = new Object();
/**
 * Checks if any type variable is having nothing, empty
 * @memberOf _lipyak.Utils
 * @param {any} x Any type variable like string, number, object, boolean etc, a false value to boolean is not empty 
 * @return {boolean} returns true if empty else false
 */
_lipyak.Utils.empty = function(x) {
	if (x == undefined || x == NaN || x == null || x == '')
		return true;
	else
		return false;
};
/**
 * Checks if any type variable is having only empty,blank or control characters
 * @memberOf _lipyak.Utils
 * @param {any} x Any type variable like string, number, object, boolean etc, a false value to boolean is not empty 
 * @return {boolean} returns true if blank else false
 */
_lipyak.Utils.blank=function(x){
	if(_lipyak.Utils.empty(x)) return true;
	if(x.length<=0) return true;
	var i;
	for(i=0;i<x.length;i++){
		var c = x.charCodeAt(i);
		//control chars,32=blank,
		if(c<=32){
			continue;
		}
		else break;
	}
	if(i<x.length) return false;
	else return true;
}
/**
 * Cookie functions
 * @namespace
 * @memberOf _lipyak.Utils
 */
_lipyak.Utils.cookie = new Object();
/**
 * Creates a cookie
 * @memberOf _lipyak.Utils.cookie
 * @param {string} name Name of cookie
 * @param {string} value Value of cookie
 * @param {integer} days No. of days for cookie to expire
 */
_lipyak.Utils.cookie.create = function(name, value, days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		var expires = '; expires=' + date.toGMTString();
	} else
		var expires = '';
	document.cookie = name + '=' + value + expires + '; path=/';
};
/**
 * Reads a cookie
 * @memberOf _lipyak.Utils.cookie
 * @param {string} name Cookie name
 * @return {string} Cookie value
 */
_lipyak.Utils.cookie.read = function(name) {
	var nameEQ = name + '=';
	var ca = document.cookie.split(';');
	for ( var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ')
			c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) == 0)
			return c.substring(nameEQ.length, c.length);
	}
	return null;
};
/**
 * Removes a cookie
 * @memberOf _lipyak.Utils.cookie
 * @param {string} name Cookie name
 */
_lipyak.Utils.cookie.erase = function(name) {
	_lipyak.Utils.cookie.create(name, '', -1);
};

/**
 * <h1>Varnmala</h1>
 * All indic alphabets are stored here
 * @namespace
 * @memberOf _lipyak
 */
_lipyak.Varnmala = new Object();
/**
 * @memberOf _lipyak.Varnmala
 * @type {integer} Count of supported indic lipis
 */
_lipyak.Varnmala.lipicount=9;
/**List of indic lipis, stored as ISO 15924 codes, sorted by their first unicode value see http://www.unicode.org/iso15924/iso15924-codes.html
 * @memberOf _lipyak.Varnmala
 * @type {Array.<string>} 
 */
_lipyak.Varnmala.lipilist=new Array('deva', 'beng', 'guru', 'gujr', 'orya', 'taml', 'telu', 'knda', 'mlym');
/**
 * Transliterates a text from a lipi into a new lipi
 * @memberOf _lipyak.Varnmala
 * @param {string} plipi Primary lipi of text
 * @param {string} nlipi New lipi of text
 * @param {string} ptext primary text to be transliterated
 * @return {string} new transliterated text
 */
_lipyak.Varnmala.transliterate= function(plipi, nlipi, ptext) {
	//alert('ptext:' + ptext);
	var ntext = '';
	if (_lipyak.Utils.empty(ptext)) {
		return ptext;
	}
	// return if both lipis are same
	else if (plipi == nlipi) {
		return ptext;
	}
	// if none of lipis are deva, 1st convert to deva and then convert to nlipi
	else if (plipi != 'deva' && nlipi != 'deva') {
		ntext = _lipyak.Varnmala.transliterate(plipi, 'deva', ptext);
		ntext = _lipyak.Varnmala.transliterate('deva', nlipi, ntext);
		return ntext;
	} else {
		//alert(_lipyak.Varnmala[plipi][nlipi].jump);
		var jump = _lipyak.Varnmala[plipi][nlipi].jump;
		var plipimin = _lipyak.Varnmala[plipi].unicode;
		var plipimax = plipimin + 128;
		// for each char of ptext, shift it by map[plipi][nlipi] value stored by calling custommap fn
		for ( var i = 0; i < ptext.length; i++) {
			var c = ptext.charCodeAt(i);
			// if character is not part of plipi
			if (c < plipimin || c > plipimax) {
				ntext += String.fromCharCode(c);
				continue;
			} else {
				var customchar=_lipyak.Varnmala[plipi][nlipi].custommap(String.fromCharCode(c));
				if(customchar){
					ntext+=customchar;
				} else {
					ntext += String.fromCharCode(c+jump);
				}
			}
		}
		//alert('ntext:' + ntext);
		return ntext;
	}
};
/**
 * <h2>Varnmala Lipi Mapping Details</h2>
 * For each lipi : lipi name, unicode, style, 'to lipi' list, 
 * Custom fn for char mapping for each transliteration pair, unicode mapping
 * Usage : if a direct map is missing, use jump
 * Devanagari
 * @memberOf _lipyak.Varnmala
 */
_lipyak.Varnmala.deva = new Object();
_lipyak.Varnmala.deva.unicode=2304;
_lipyak.Varnmala.deva.name='देवनागरी, हिन्दी, मराठी, नेपाली, भोजपुरी';
_lipyak.Varnmala.deva.style=new Object();
_lipyak.Varnmala.deva.style.ol=new Object();
_lipyak.Varnmala.deva.style.ol.w3c='devanagari';
_lipyak.Varnmala.deva.style.ol.ff='-moz-devanagari';
_lipyak.Varnmala.deva.deva = new Object();
_lipyak.Varnmala.deva.deva.jump=0;
_lipyak.Varnmala.deva.deva.custommap=function(c){
	switch(c){
	default: return false;
	}
}
_lipyak.Varnmala.deva.beng = new Object();
_lipyak.Varnmala.deva.beng.jump=128;
_lipyak.Varnmala.deva.beng.custommap=function(c){
	switch(c){
	case '।': return ' ';	//deva danda to latin blank space
	case '॥': return ' ';	//deva double danda to latin blank space
	case 'व': return 'ব';	//deva va to beng ba 
	case 'ॐ': return 'ॐ';	//deva om
	default: return false;
	}
}
_lipyak.Varnmala.deva.guru = new Object();
_lipyak.Varnmala.deva.guru.jump=256;
_lipyak.Varnmala.deva.guru.custommap=function(c){
	switch(c){
	case '।': return ' ';	//deva danda to latin blank space
	case '॥': return ' ';	//deva double danda to latin blank space
	case 'ॐ': return 'ॐ';	//deva om
	case 'ऋ' : return 'ਰਿ';	//deva rri swar
	case 'ष' : return 'ਸ਼';	//deva murdhanya sha
	case 'ृ' : return '੍ਰਿ';	//deva rri swar with varna 
	case 'ऽ' : return 'ऽ';	//deva swar extension 
	default: return false;
	}
}
_lipyak.Varnmala.deva.gujr = new Object();
_lipyak.Varnmala.deva.gujr.jump=384;
_lipyak.Varnmala.deva.gujr.custommap=function(c){
	switch(c){
	case '।': return ' ';	//deva danda to latin blank space
	case '॥': return ' ';	//deva double danda to latin blank space
	default: return false;
	}
}
_lipyak.Varnmala.deva.orya = new Object();
_lipyak.Varnmala.deva.orya.jump=512;
_lipyak.Varnmala.deva.orya.custommap=function(c){
	switch(c){
	case '।': return ' ';	//deva danda to latin blank space
	case '॥': return ' ';	//deva double danda to latin blank space
	case 'ॐ': return 'ॐ';	//deva om
	default: return false;
	}
}
_lipyak.Varnmala.deva.taml = new Object();
_lipyak.Varnmala.deva.taml.jump=640;
_lipyak.Varnmala.deva.taml.custommap=function(c){
	switch(c){
	case '।': return ' ';	//deva danda to latin blank space
	case '॥': return ' ';	//deva double danda to latin blank space
	case 'ऋ': return 'க்ரு';	//deva rhi to tamil combo rhi
	case 'ख': return 'க';	//deva kha to tamil ka
	case 'ग': return 'க';	//deva ga to tamil ka
	case 'घ': return 'க';	//deva gha to tamil ka
	case 'छ': return 'ச';	//deva chha to tamil cha
	case 'झ': return 'ஜ';	//deva jha to tamil ja
	case 'ठ': return 'ட';	//deva tha to tamil ta
	case 'ड': return 'ட';	//deva da to tamil ta
	case 'ढ': return 'ட';	//deva dha to tamil ta
	case 'थ': return 'த';	//deva Tha to tamil Ta
	case 'द': return 'த';	//deva Da to tamil Ta
	case 'ध': return 'த';	//deva Dha to tamil Ta
	case 'फ': return 'ப';	//deva pha to tamil pa
	case 'ब': return 'ப';	//deva ba to tamil pa
	case 'भ': return 'ப';	//deva bha to tamil pa
	default: return false;
	}
}
_lipyak.Varnmala.deva.telu = new Object();
_lipyak.Varnmala.deva.telu.jump=768;
_lipyak.Varnmala.deva.telu.custommap=function(c){
	switch(c){
	case '।': return ' ';	//deva danda to latin blank space
	case '॥': return ' ';	//deva double danda to latin blank space
	case 'ॐ': return 'ॐ';	//deva om
	case '॰': return '॰';	//deva abbr sign
	default: return false;
	}
}
_lipyak.Varnmala.deva.telu[2416]=2416;	//use deva abbr sign
_lipyak.Varnmala.deva.knda = new Object();
_lipyak.Varnmala.deva.knda.jump=896;
_lipyak.Varnmala.deva.knda.custommap=function(c){
	switch(c){
	case '।': return ' ';	//deva danda to latin blank space
	case '॥': return ' ';	//deva double danda to latin blank space
	case 'ॐ': return 'ॐ';	//deva om
	case '॰': return '॰';	//deva abbr sign
	default: return false;
	}
}
_lipyak.Varnmala.deva.mlym = new Object();
_lipyak.Varnmala.deva.mlym.jump=1024;
_lipyak.Varnmala.deva.mlym.custommap=function(c){
	switch(c){
	case '।': return ' ';	//deva danda to latin blank space
	case '॥': return ' ';	//deva double danda to latin blank space
	case 'ॐ': return 'ॐ';	//deva om
	default: return false;
	}
}
/**
 * Bengali
 * @memberOf _lipyak.Varnmala
 */
_lipyak.Varnmala.beng = new Object();
_lipyak.Varnmala.beng.unicode=2432;
_lipyak.Varnmala.beng.name='বাংলা, অসমীয়া, ইমার ঠার';
_lipyak.Varnmala.beng.style=new Object();
_lipyak.Varnmala.beng.style.ol=new Object();
_lipyak.Varnmala.beng.style.ol.w3c='bengali';
_lipyak.Varnmala.beng.style.ol.ff='-moz-bengali';
_lipyak.Varnmala.beng.deva = new Object();
_lipyak.Varnmala.beng.deva.jump=-128;
_lipyak.Varnmala.beng.deva.custommap=function(c){
	switch(c){
	default: return false;
	}
}
_lipyak.Varnmala.beng.beng = new Object();
_lipyak.Varnmala.beng.beng.jump=0;
_lipyak.Varnmala.beng.beng.custommap=function(c){
	switch(c){
	default: return false;
	}
}
/**
 * Gurumukhi
 * @memberOf _lipyak.Varnmala
 */
_lipyak.Varnmala.guru = new Object();
_lipyak.Varnmala.guru.unicode=2560;
_lipyak.Varnmala.guru.name='ਪੰਜਾਬੀ';
_lipyak.Varnmala.guru.style=new Object();
_lipyak.Varnmala.guru.style.ol=new Object();
_lipyak.Varnmala.guru.style.ol.w3c='gurumukhi';
_lipyak.Varnmala.guru.style.ol.ff='-moz-gurumukhi';
_lipyak.Varnmala.guru.deva = new Object();
_lipyak.Varnmala.guru.deva.jump=-256;
_lipyak.Varnmala.guru.deva.custommap=function(c){
	switch(c){
	default: return false;
	}
}
_lipyak.Varnmala.guru.guru = new Object();
_lipyak.Varnmala.guru.guru.jump=0;
_lipyak.Varnmala.guru.guru.custommap=function(c){
	switch(c){
	default: return false;
	}
}
/**
 * Gujarati
 * @memberOf _lipyak.Varnmala
 */
_lipyak.Varnmala.gujr = new Object();
_lipyak.Varnmala.gujr.unicode=2688;
_lipyak.Varnmala.gujr.name='ગુજરાતી';
_lipyak.Varnmala.gujr.style=new Object();
_lipyak.Varnmala.gujr.style.ol=new Object();
_lipyak.Varnmala.gujr.style.ol.w3c='gujarati';
_lipyak.Varnmala.gujr.style.ol.ff='-moz-gujarati';
_lipyak.Varnmala.gujr.deva = new Object();
_lipyak.Varnmala.gujr.deva.jump=-384;
_lipyak.Varnmala.gujr.deva.custommap=function(c){
	switch(c){
	default: return false;
	}
}
_lipyak.Varnmala.gujr.gujr = new Object();
_lipyak.Varnmala.gujr.gujr.jump=0;
_lipyak.Varnmala.gujr.gujr.custommap=function(c){
	switch(c){
	default: return false;
	}
}
/**
 * Orya
 * @memberOf _lipyak.Varnmala
 */
_lipyak.Varnmala.orya = new Object();
_lipyak.Varnmala.orya.unicode=2816;
_lipyak.Varnmala.orya.name='ଓଡ଼ିଆ';
_lipyak.Varnmala.orya.style=new Object();
_lipyak.Varnmala.orya.style.ol=new Object();
_lipyak.Varnmala.orya.style.ol.w3c='oriya';
_lipyak.Varnmala.orya.style.ol.ff='-moz-oriya';
_lipyak.Varnmala.orya.deva = new Object();
_lipyak.Varnmala.orya.deva.jump=-512;
_lipyak.Varnmala.orya.deva.custommap=function(c){
	switch(c){
	default: return false;
	}
}
_lipyak.Varnmala.orya.orya = new Object();
_lipyak.Varnmala.orya.orya.jump=0;
_lipyak.Varnmala.orya.orya.custommap=function(c){
	switch(c){
	default: return false;
	}
}
/**
 * Tamil
 * @memberOf _lipyak.Varnmala
 */
_lipyak.Varnmala.taml = new Object();
_lipyak.Varnmala.taml.unicode=2944;
_lipyak.Varnmala.taml.name='தமிழ்';
_lipyak.Varnmala.taml.style=new Object();
_lipyak.Varnmala.taml.style.ol=new Object();
_lipyak.Varnmala.taml.style.ol.w3c='tamil';
_lipyak.Varnmala.taml.style.ol.ff='-moz-tamil';
_lipyak.Varnmala.taml.deva = new Object();
_lipyak.Varnmala.taml.deva.jump=-640;
_lipyak.Varnmala.taml.deva.custommap=function(c){
	switch(c){
	default: return false;
	}
}
_lipyak.Varnmala.taml.taml = new Object();
_lipyak.Varnmala.taml.taml.jump=0;
_lipyak.Varnmala.taml.taml.custommap=function(c){
	switch(c){
	default: return false;
	}
}
/**
 * Telugu
 * @memberOf _lipyak.Varnmala
 */
_lipyak.Varnmala.telu = new Object();
_lipyak.Varnmala.telu.unicode=3072;
_lipyak.Varnmala.telu.name='తెలుగు';
_lipyak.Varnmala.telu.style=new Object();
_lipyak.Varnmala.telu.style.ol=new Object();
_lipyak.Varnmala.telu.style.ol.w3c='telugu';
_lipyak.Varnmala.telu.style.ol.ff='-moz-telugu';
_lipyak.Varnmala.telu.deva = new Object();
_lipyak.Varnmala.telu.deva.jump=-768;
_lipyak.Varnmala.telu.deva.custommap=function(c){
	switch(c){
	default: return false;
	}
}
_lipyak.Varnmala.telu.telu = new Object();
_lipyak.Varnmala.telu.telu.jump=0;
_lipyak.Varnmala.telu.telu.custommap=function(c){
	switch(c){
	default: return false;
	}
}
/**
 * Kannada
 * @memberOf _lipyak.Varnmala
 */
_lipyak.Varnmala.knda = new Object();
_lipyak.Varnmala.knda.unicode=3200;
_lipyak.Varnmala.knda.name='ಕನ್ನಡ';
_lipyak.Varnmala.knda.style=new Object();
_lipyak.Varnmala.knda.style.ol=new Object();
_lipyak.Varnmala.knda.style.ol.w3c='kannada';
_lipyak.Varnmala.knda.style.ol.ff='-moz-kannada';
_lipyak.Varnmala.knda.deva = new Object();
_lipyak.Varnmala.knda.deva.jump=-896;
_lipyak.Varnmala.knda.deva.custommap=function(c){
	switch(c){
	default: return false;
	}
}
_lipyak.Varnmala.knda.knda = new Object();
_lipyak.Varnmala.knda.knda.jump=0;
_lipyak.Varnmala.knda.knda.custommap=function(c){
	switch(c){
	default: return false;
	}
}
/**
 * Malayalam
 * @memberOf _lipyak.Varnmala
 */
_lipyak.Varnmala.mlym = new Object();
_lipyak.Varnmala.mlym.unicode=3328;
_lipyak.Varnmala.mlym.name='മലയാളം';
_lipyak.Varnmala.mlym.style=new Object();
_lipyak.Varnmala.mlym.style.ol=new Object();
_lipyak.Varnmala.mlym.style.ol.w3c='malayalam';
_lipyak.Varnmala.mlym.style.ol.ff='-moz-malayalam';
_lipyak.Varnmala.mlym.deva = new Object();
_lipyak.Varnmala.mlym.deva.jump=-1024;
_lipyak.Varnmala.mlym.deva.custommap=function(c){
	switch(c){
	default: return false;
	}
}
_lipyak.Varnmala.mlym.mlym = new Object();
_lipyak.Varnmala.mlym.mlym.jump=0;
_lipyak.Varnmala.mlym.mlym.custommap=function(c){
	switch(c){
	default: return false;
	}
}
//alert(_lipyak.Varnmala.transliterate('deva', 'knda', 'प्यार'));

/**
 * <h1>HTML Processing</h1>
 * @namespace
 * @memberOf _lipyak
 */
_lipyak.Htmlpc = new Object();
/**
 * List each html tag and their attributes of and under node recursively, calls attributetext and tagtext for transliteration
 * @memberOf _lipyak.Htmlpc
 * @param {string} plipi Primary lipi
 * @param {string} nlipi New lipi
 * @param {Node} node Root XML node from where html elements are listed
 *  
 */
_lipyak.Htmlpc.htmltags= function(plipi, nlipi, node) {
	var nodeName=node.nodeName.toLowerCase();
	//alert('node:'+nodeName);
	//text node
	if (node.nodeType==3){
		//alert('textnode,parentnode:'+node.parentNode.nodeName);
		_lipyak.Htmlpc.tagtext(plipi, nlipi, node);
		return;
	}
	//attributes of element node
	else if(node.nodeType==1){
		//alert('attributes,node:'+nodeName);
		if(_lipyak.Htmlpc.attributes[nodeName]){
			_lipyak.Htmlpc.attributetext(plipi, nlipi, node, _lipyak.Htmlpc.attributes[nodeName]);
		}
	}
	//node has children
	if(node.hasChildNodes()) {
		// find html tags of children
		var children = node.childNodes;
		//alert('node many:' + node.nodeName + ', count:' + children.length);
		for ( var i = 0; i < children.length; i++) {
			var child = children[i];
			// do not transliterate _lipilist select containing lipi list
			if (_lipyak.Utils.empty(child) || (child.nodeName.toLowerCase() == 'select' && child.className == 'lipioptions')) {
				continue;
			}
			//recursively list children tags of each child 
			else {
				_lipyak.Htmlpc.htmltags(plipi, nlipi, child);
			}
		}
	}
	return;
};
/**
 * Transliterates text of attributes of a tag node
 * @memberOf _lipyak.Htmlpc
 * @param {string} plipi Primary lipi
 * @param {string} nlipi New lipi
 * @param {Node} node Root XML node from where html elements are listed
 * @param {Object} attributes List of attributes for the node tag type
 */
_lipyak.Htmlpc.attributetext= function(plipi, nlipi, node, attributes) {
	//alert('attributetext-node:' + node.nodeName + ', attribute:' + attributes);
	//make style related transliteration, like numbered lists
	_lipyak.Htmlpc.styleset(nlipi, node);
	//transliterate all attributes of node
	for(var i=0;i<attributes.length;i++){
		var attribute = attributes[i];
		if(node[attribute]){
			var ptext = node[attribute];
			if (!_lipyak.Utils.blank(ptext)) {
				var ntext = _lipyak.Varnmala.transliterate(plipi, nlipi, ptext);
				node[attribute]= ntext;
			}
		}
	}
	return;
};
/**
 * Transliterates text of a textnode of a tag
 * @memberOf _lipyak.Htmlpc
 * @param {string} plipi Primary lipi
 * @param {string} nlipi New lipi
 * @param {Node} node Root XML node from where html elements are listed
 */
_lipyak.Htmlpc.tagtext= function(plipi, nlipi, node) {
	var ptext = node.nodeValue;
	//alert('tagtext-ptext:'+ptext + ', node:' + node.nodeName);
	if (!_lipyak.Utils.empty(ptext)) {
		node.nodeValue = _lipyak.Varnmala.transliterate(plipi, nlipi, ptext);
	}
	return;
};
/**
 * Sets locationlisation of style related properties of tag
 * @param {string} nlipi New lipi
 * @param {Node} node Root XML node from where html elements are listed
 */
//sets locationlisation of style related properties of tag
_lipyak.Htmlpc.styleset=function (nlipi, node) {
	var nodeName=node.nodeName.toLowerCase();
	switch(nodeName){
	case 'ol': 
		if(navigator.userAgent.indexOf('Firefox')>0){	//FF
			if(_lipyak.Varnmala[nlipi].style.ol.hasOwnProperty('ff')){
				node.style.listStyleType=_lipyak.Varnmala[nlipi].style.ol.ff;
			}
		}
		else if(navigator.appName == 'Microsoft Internet Explorer'){	//IE
			node.style.listStyleType = 'decimal';
		}
		else {	//W3C
			node.style.listStyleType=_lipyak.Varnmala[nlipi].style.ol.w3c;
		}
	default:
		break;				
	}
};
/** 
 * List of attributes of html tags possibly containing text for translieration 
 * @memberOf _lipyak.Htmlpc
 * @type {Object} 
 */
_lipyak.Htmlpc.attributes= {
	a: ['title','rel','rev'],
	b: ['title'],
	button: ['title','value'],
	form: ['title'],
	h1: ['title'],
	h2: ['title'],
	h3: ['title'],
	h4: ['title'],
	h5: ['title'],
	h6: ['title'],
	i: ['title'],
	img: ['title','alt'],
	input: ['title','alt','value','placeholder'],
	label: ['title'],
	li: ['title'],
	ol: ['title'],
	option: ['title','label','value'],
	select: ['title'],
	table: ['title','summary'],
	td: ['title','abbr'],
	textarea: ['title'],
	th: ['title','abbr'],
	tr: ['title'],
	u: ['title'],
	ul: ['title']
};
//alert(_lipyak.Htmlpc.attributes);

/**
 * Main transliterator for an html page
 * @memberOf _lipyak
 * @param {string} plipi Primary lipi
 * @param {string} nlipi New lipi
 */
_lipyak.lipyantarak=function(plipi, nlipi) {
	// transliterate title 
	if (_lipyak_opts.ttitle) {
		document.title = _lipyak.Varnmala.transliterate(plipi, nlipi, document.title);
	}
	// for elements under document.body tag
	try {
		_lipyak.Htmlpc.htmltags(plipi, nlipi, document.body);
	} catch (err) {
		//alert('लिप्यांतरण में त्रुटि : ' + err.message);
	} finally {
		_lipyak_opts.clipi = nlipi;
	}
	return;
};

/**
 * <h1>Page Functions</h2>
 * @namespace
 */
_lipyak.Page = new Object();
/**
 * Sets input variables if not set
 * @memberOf _lipyak.Page
 */
_lipyak.Page.setDefault= function(){
	//init vars if not set
	//check for correct values of each init vars
	if(_lipyak.Utils.empty(_lipyak_opts)){
		_lipyak_opts=new Object();
	}
	//set primary lipi to devanagari, if not set
	if(_lipyak.Utils.empty(_lipyak_opts.plipi)){
		_lipyak_opts.plipi='deva';
	}
	if(_lipyak.Utils.empty(_lipyak_opts.clipi)){
		_lipyak_opts.clipi='deva';
	}
	if(_lipyak.Utils.empty(_lipyak_opts.ttitle)){
		_lipyak_opts.ttitle=true;
	}
	if(_lipyak.Utils.empty(_lipyak_opts.tclass)){
		_lipyak_opts.tclass=false;
	}
	if(_lipyak.Utils.empty(_lipyak_opts.lipioptionslist)){
		_lipyak_opts.lipioptionslist='deva,beng,guru,gujr,orya,taml,telu,knda,mlym';
	}
}
/**
 * Called by select menu lipi list in html page, triggers transliterator
 * @memberOf _lipyak.Page
 * @param {event} e Html event Object
 */
_lipyak.Page.translipi = function (e) {
	//extract selected lipi value 
	var nlipi='';
	//IE fix
	if(navigator.appName == 'Microsoft Internet Explorer'){
		nlipi=window.event.srcElement.value;
	} else {
		nlipi=e.value;
	}
	if (nlipi == 'na') {
		_lipyak.Utils.cookie.erase('salipi');
		window.location.reload();
	}
	else {
		_lipyak.Page.setDefault();
		//set cookie for next 30 days
		_lipyak.Utils.cookie.create('salipi', nlipi, 30);
		//deva specific lipyantaran
		if(_lipyak_opts.clipi!=_lipyak_opts.plipi){
			window.location.reload();
		}
		
		var plipi=_lipyak_opts.plipi;
		// return if same lipi
		if (plipi == nlipi)
			return;
		//call the main transliterator fn
		_lipyak.lipyantarak(plipi, nlipi);
	}
}
/**
 * Creates lipi list menu in html page for a list of lipis, sets nlipi as selected
 * @memberOf _lipyak.Page
 * @param {string} nlipi New lipi
 */
_lipyak.Page.createLipiMenu= function(nlipi){
	var selectslist = document.getElementsByTagName('select');
	if(selectslist){
		for(var i=0;i<selectslist.length;i++){
			var lipiselect = selectslist[i];
			var classname=lipiselect.className;
			if(!_lipyak.Utils.empty(classname) && classname=='lipioptions'){
				//add onchange listener
				if (window.addEventListener) {	//std
					lipiselect.addEventListener('change', function() {
						_lipyak.Page.translipi(this);
					}, false);
				} else if (window.attachEvent) {	//ie
					lipiselect.attachEvent('onchange', function() {
						_lipyak.Page.translipi(this);
					});
				} else {	//dep
					lipiselect.onchange = function() {	
						_lipyak.Page.translipi(this);
					};
				}
				//default option is set to NA
				var optelem = new Option('Select a New Language', 'na');
				//IE fix
				if(navigator.appName == 'Microsoft Internet Explorer'){
					optelem.innerText = 'Select a New Language';
				}
				//select this option if no lipi is selected in cookie
				if(!_lipyak.Utils.empty(nlipi)){
					optelem.selected='true';
				}
				lipiselect.appendChild(optelem);
				//add lipi options list
				if(_lipyak_opts.lipioptionslist){
					var lipilist = _lipyak_opts.lipioptionslist.split(',');
					for(var j=0;j<lipilist.length;j++){
						if(_lipyak.Varnmala[lipilist[j]]){
							var optelem = new Option(_lipyak.Varnmala[lipilist[j]].name, lipilist[j]);
							//IE fix
							if(navigator.appName == 'Microsoft Internet Explorer'){
								optelem.innerText=_lipyak.Varnmala[lipilist[j]].name;
							}
							//select language option set in cookie
							if(lipilist[j]==nlipi) {
								optelem.selected='true';
							}
							lipiselect.appendChild(optelem);
						}
					}
				}
			}
		}
	}
}
/**
 * Triggers auto transliteration of page
 */
if(_lipyak_opts){
	_lipyak.Page.setDefault();
	var plipi=_lipyak_opts.plipi;
	//lipi stored in cookie, if any
	var nlipi = _lipyak.Utils.cookie.read('salipi');	
	if (!_lipyak.Utils.empty(nlipi)){
		// update cookie further by a month
		_lipyak.Utils.cookie.create('salipi', nlipi, 30);
	}
	//add event to body onload : translierate all body text
	if (window.addEventListener) {	//std
		window.addEventListener('load', function() {
			_lipyak.Page.createLipiMenu(nlipi);
			_lipyak.lipyantarak(plipi, nlipi);
		}, false);
	} else if (window.attachEvent) {	//ie
		window.attachEvent('onload', function() {
			_lipyak.Page.createLipiMenu(nlipi);
			_lipyak.lipyantarak(plipi, nlipi);
		});
	} else {
		window.onload = function() {	//dep
			_lipyak.Page.createLipiMenu(nlipi);
			_lipyak.lipyantarak(plipi, nlipi);
		};
	}
}
