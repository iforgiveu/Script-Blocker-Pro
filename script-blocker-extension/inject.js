// -*- coding: utf-8 -*-
// inject.js - 脚本拦截器核心//jsd
(function () {
    'use strict';
	let href=window.location.href;
    console.log('[脚本拦截器] 🚀 已注入到页面',href, performance.now());
	//return;
	//let code = EventTarget.prototype.addEventListener.toString();
	//console.log(code.substring(0, 900));
	
    // ==================优先执行：保护F12可用====================
    (function () {
		//return;
		
		const antiF12Keywords = [
            //'keyCode==123',
            '==123',
            '123==',
            //'e.keyCode==123',
            'e.key==="F12"',
            //'Key==123',
			'F12',
            //'.keyCode==123',
            'disableDevTools',
            'debugger',
			'touch"!==t.pointerType',
			'touch"!==e.pointerType',
			'||e.event).keyCode',
			'.event).keyCode||',
			'(e.ctrlKey) && (e.keyCode',
			'非法调试',
			'function (e) { e.preventDefault(); }',
			'{e.preventDefault();}',
            'setInterval(function(){(debug'
        ];
		const preciseRules={'keydown':[/['"]key['"]\s*===?\s*['"]I['"]/i,/['"](ault|event)['"]\]/i,/keyCode\s*===?\s*123/,],
		'keyup':[/['"]key['"]\s*===?\s*['"]I['"]/i,/\bshiftKey\b/,/['"](ault|event)['"]\]/i,/keyCode\s*===?\s*123/,],
		'contextmenu':[
		/['"](ault|event|Default)['"]\]/i,/return\s+false/,/return\s+false/,
        /^return e\.preventDefault\(\)$/,
        /^function\(.{3,6}return e\.preventDefault\(\).{0,2}\}$/,
		///^(?:function\(.{3,6})?return e\.preventDefault\(\)(?:.{0,2}\})?$/,
        /^e\.preventDefault\(\)$/,
        /\{\s*e\.preventDefault\(\)\s*;\s*\}/,
        /function\s*\(\s*(?:_0x\w+|\w+)\s*\)\s*\{\s*\1\[.*?\]\s*\(\s*\)/,],
		'mousewheel':[
		/=!(0|1)\b/g,
		// /.+/,
		],
		};
	(()=>{const whitelista=["player/?url"];
	if (whitelista.some(host => href.includes(host))) return;
	const originalFunctionConstructor=Function.prototype.constructor;
	Function.prototype.constructor=function(...args){if(args.length===0){return originalFunctionConstructor.apply(this,args);}const lastArg=args[args.length-1];
	//console.log('[脚本拦截器] 🔪',args);
	if(typeof lastArg==='string'){if(lastArg.trim()==='debugger'){
	//console.trace('[脚本拦截器] 🚫 拦截纯 debugger 函数，直接返回空函数');
	return function(){};}
	if(/\bdebugger\b/.test(lastArg)){args[args.length-1]=lastArg.replace(/\bdebugger\b/g,'');
	//console.log('[脚本拦截器] 🔪 已切除混杂代码中的 debugger',args);
	}}
	return originalFunctionConstructor.apply(this,args);};
	Object.defineProperty(Function.prototype.constructor,'prototype',{value:Function.prototype,/*writable:false,*/configurable:false,enumerable:false});
	})();
	(()=>{//视口变化检测伪装，原生函数伪装
	Object.defineProperty(window, 'outerWidth', {
        get: function() { return window.innerWidth; },
        configurable: false
    });
    Object.defineProperty(window, 'outerHeight', {
        get: function() { return window.innerHeight; },
        configurable: false
    });
	
	Object.defineProperty(Function.prototype, 'constructor',{configurable:false});
	Object.defineProperty(Function.prototype.constructor,'toString',{value:function(){return'function Function() { [native code] }';},writable:false,configurable:false});
	const originalToString=Function.prototype.toString;Function.prototype.toString=function(){if(this===Function.prototype.constructor){return'function Function() { [native code] }';}return originalToString.call(this);};
	//Object.defineProperty(Date.prototype, 'toString', { value: Date.prototype.toString, writable: false, configurable: false });//不要使用
	//Object.defineProperty(RegExp.prototype, 'toString', { value: RegExp.prototype.toString, writable: false, configurable: false });//不要使用
	Object.defineProperty(window,'Firebug',{value:{chrome:{isInitialized:false}},writable:false,configurable:false});
	Object.defineProperty(window.history,'go',{value:function(){},writable:false,configurable:false});
	Object.defineProperty(window.history,'back',{value:function(){},writable:false,configurable:false});
	Object.defineProperty(window,'close',{value:function(){/* console.log('?') */},writable:false,configurable:false});
	localStorage.setItem("devtool", "open");
	//Object.defineProperty(window,'devtoolsFormatters',{value:0,writable:false,configurable:false});
	})();

        // 1. 立即禁用现有的监听器
        document.onkeydown = null;
        document.oncontextmenu = null;
        window.onkeydown = null;
        window.oncontextmenu = null;
		//window.endebug = function() {};
        //window.setInterval = null
        for (let i = 1; i < 100; i++) {
            clearInterval(i); // 直接清除
        }

        // 2. 阻止事件监听器添加
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener=function(type,listener,options){
		if(preciseRules[type]){
		const listenerStr=listener?listener.toString():"";let isBlocked=false;
		//console.trace('[脚本拦截器] 🔒 排查 ：', type, '\n', listenerStr);
		//console.log('[脚本拦截器] 🔒 排查 ：', type, '\n', listenerStr);
		let matchedRule="";for(const kw of antiF12Keywords){if(listenerStr.includes(kw)){isBlocked=true;matchedRule=`明文关键词:${kw}`;break;}}
		if(!isBlocked){
		try{const rulesForType=preciseRules[type];for(const regex of rulesForType){if(regex.test(listenerStr)){isBlocked=true;matchedRule=`正则:${regex}`;break;}}}catch (e) {}}
		if(type==='contextmenu'){const listenerStr=listener?listener.toString():"";if(listenerStr.length<120&&/_0x[a-f0-9]+\(/i.test(listenerStr)){isBlocked=true;matchedRule="右键极简混淆特征";}}
		if(isBlocked){console.log(`[脚本拦截器] 🔪 阻止 addEventListener:【 ${type}  触发规则: ${matchedRule}】\n代码: ${listenerStr}`);return;}}
		return originalAddEventListener.call(this,type,listener,options);};

        // 3. 阻止直接赋值
        Object.defineProperty(document, 'onkeydown', {
            set: function (value) {
                if (value) {
                    const fnStr = value.toString();
					//console.log('[onkeydown]',fnStr);
                    for (const kw of antiF12Keywords) {
                        if (fnStr.includes(kw)) {
                            console.log('[脚本拦截器] 🔒 阻止 document.onkeydown', kw, '\n', fnStr);
                            return;
                        }
                    }
                }
                this._onkeydown = value;
            },
            get: function () {
                return this._onkeydown || null;
            },
			configurable: false
        });

        Object.defineProperty(document, 'oncontextmenu', {
            set: function (value) {
                if (value) {
                    const fnStr = value.toString();
                    for (const kw of antiF12Keywords) {
                        if (fnStr.includes(kw)) {
                            console.log('[脚本拦截器] 🔒 阻止 document.oncontextmenu');
                            return;
                        }
                    }
                }
                this._oncontextmenu = value;
            },
            get: function () {
                return this._oncontextmenu || null;
            },
			configurable: false
        });


    })();
const currentUrla = window.location.href;
    // ==================== 正常的规则获取和初始化 ====================
function waitForConfig(timeout=100){return new Promise((resolve,reject)=>{const selector='html > meta[name="script-blocker-status"]';const existing=document.querySelector(selector);if(existing){const status=existing.content;if(status==='ready'){resolve({status:'ready',meta:existing});return;}else if(status==='error'){reject({status:'error',message:currentUrla});return;}}
let timeoutId=setTimeout(()=>{observer.disconnect();reject({status:'timeout',message:currentUrla});},timeout);const observer=new MutationObserver((mutations)=>{for(const mutation of mutations){for(const node of mutation.addedNodes){if(node.nodeName==='META'&&node.getAttribute('name')==='script-blocker-status'){const status=node.content;if(status==='ready'){observer.disconnect();clearTimeout(timeoutId);resolve({status:'ready',meta:node});return;}else if(status==='error'){observer.disconnect();clearTimeout(timeoutId);reject({status:'error',message:currentUrla});return;}else{observer.disconnect();clearTimeout(timeoutId);reject({status:'unknown',message:currentUrla});return;}}}}});observer.observe(document.documentElement,{childList:true,subtree:false,attributes:true,attributeFilter:['content']});});}
    // 从 meta 标签获取规则和白名单
    (async function() {
	let quit
	const startTime=performance.now();await waitForConfig(500).then(({status,meta})=>{quit=0
	console.log('[脚本拦截器] ✅ 配置已就绪，等待耗时:',performance.now()-startTime,'ms  ',performance.now());}).catch(({status,message})=>{if(status==='error'){console.warn('[脚本拦截器] ❌ 配置为空:',message);}else if(status==='timeout'){console.warn('[脚本拦截器] ⏰ 等待配置超时:',message);}else{console.warn('[脚本拦截器] ⚠️ 未知状态:',message);}
	quit=1});if(quit)return;
	function getConfigFromMeta() {
        // 获取规则（原有代码）
        const rulesMeta = document.querySelector('meta[name="script-blocker-rules"]');
        let rules = [];
        if (rulesMeta) {
            try {
                rules = JSON.parse(rulesMeta.getAttribute('content') || '[]');
            } catch (e) {}
        }
        // 获取全局白名单
        const globalMeta = document.querySelector('meta[name="script-blocker-global"]');
        let globalWhitelist = [];
        if (globalMeta) {
            try {
                globalWhitelist = JSON.parse(globalMeta.getAttribute('content') || '[]');
            } catch (e) {}
        }
        // 获取次级白名单
        const secondaryMeta = document.querySelector('meta[name="script-blocker-secondary"]');
        let secondaryWhitelist = [];
        if (secondaryMeta) {
            try {
                secondaryWhitelist = JSON.parse(secondaryMeta.getAttribute('content') || '[]');
            } catch (e) {}
        }
        return {
            rules,
            globalWhitelist,
            secondaryWhitelist
        };
    }

    // 使用
    const config = getConfigFromMeta();
    const rules = config.rules;
    const globalWhitelist0 = config.globalWhitelist;
    const secondaryWhitelist0 = config.secondaryWhitelist;

    // 通配符匹配函数
    function wildcardMatch(text, pattern) {
        const regexPattern = pattern
            .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
            .replace(/\*/g, '.*');
        const regex = new RegExp(`^${regexPattern}$`, 'i');
        const partialRegex = new RegExp(regexPattern, 'i');
        return regex.test(text) || partialRegex.test(text);
    }

    // 检查当前网站是否匹配规则
    const currentUrl = window.location.href;
    const currentHost = window.location.hostname||currentUrl;
	

    const extrasecwhitelist = ['bilibili', 'deepseek.com', 'douyin']//额外指定的白名单
    const extraglowhitelist = ['index.m3u8']//额外指定的白名单
    // 合并去重
    const globalWhitelist = [...new Set([...extraglowhitelist, ...globalWhitelist0])];
    const secondaryWhitelist = [...new Set([...extrasecwhitelist, ...secondaryWhitelist0])];

    console.log('[脚本拦截器] 🌐 当前网站:', currentHost);
    //console.log('[脚本拦截器] 📍 完整地址:', currentUrl);
    console.log('[脚本拦截器] 📋 加载的规则数:', rules.length);

    // 全局白名单检查
    const inGlobalWhitelist = globalWhitelist.some(pattern =>
            wildcardMatch(currentHost, pattern) || wildcardMatch(currentUrl, pattern));
    if (inGlobalWhitelist) {
        console.log('🙄\n一级白名单网站:', currentUrl, ",退出拦截");
        return;
    }
    // 次级白名单检查
    const inSecondaryWhitelist = secondaryWhitelist.some(pattern =>
            wildcardMatch(currentHost, pattern) || wildcardMatch(currentUrl, pattern));
    if (inSecondaryWhitelist) {
        console.log('🙄\n次级白名单网站:', currentUrl, ",仅部分拦截");
    }

    let keywordsToBlock = [];

    // 检查网站是否匹配单个规则
    function matchSite(rule) {
        const matchType = rule.matchType || 'simple';
        const sitePatterns = rule.sitePatterns || [];

        for (const pattern of sitePatterns) { //每个匹配的网址
            if (!pattern)
                continue;

            if (matchType === 'simple') {
                if (wildcardMatch(currentHost, pattern)) {
                    console.log(`[脚本拦截器] ✅ 通配符匹配: "${pattern}"`);
                    return true;
                }
            } else if (matchType === 'contains') {
                if (currentHost.includes(pattern)) {
                    console.log(`[脚本拦截器] ✅ 包含匹配: "${pattern}"`);
                    return true;
                }
            } else if (matchType === 'regex') {
                try {
                    const regex = new RegExp(pattern, 'i');
                    if (regex.test(currentUrl) || regex.test(currentHost)) {
                        console.log(`[脚本拦截器] ✅ 正则匹配: "${pattern}"`);
                        return true;
                    }
                } catch (e) {}
            }
        }
        return false;
    }

    // 合并所有匹配规则的关键词
    let matchedRules = [];
    for (const rule of rules) {
        if (!rule.enabled)
            continue;
        if (matchSite(rule)) {
            matchedRules.push(rule);
        }
    }

    if (matchedRules.length > 0) {
        const allKeywords = [];
        matchedRules.forEach(rule => {
            console.log(`[脚本拦截器] 📋 匹配规则: ${rule.name || '未命名规则'}`);
            if (rule.keywords && rule.keywords.length > 0) {
                allKeywords.push(...rule.keywords);
            }
        });
        keywordsToBlock = [...new Set(allKeywords)];
        console.log('[脚本拦截器] 🔑 合并后的拦截关键词:', keywordsToBlock.join('、'));
    } else {
        console.log('[脚本拦截器] ⏭️ 当前网站无匹配规则，退出');
        return;
    }
    // 保存原始方法
    const originalSetTimeout = window.setTimeout;
    const originalSetInterval = window.setInterval;
    const originalEval = window.eval;
    const originalFunction = window.Function;
    const originalCreateElement = document.createElement;
	const originalCreateElementNS=document.createElementNS;
    const originalAppendChild = Node.prototype.appendChild;
    const originalInsertBefore = Node.prototype.insertBefore;
    const originalReplaceChild = Node.prototype.replaceChild;
    const originalWrite = document.write;
    const originalWriteln = document.writeln;
	


    // ==================== 工具函数 ====================
	const noop = function () {};
	const ajoke = function(){return ajoke2;};
	const ajoke2 = function(){return ajoke3;};
	const ajoke3 = function(){return noop;};
	const safeConsole = {};
	const trBind = function() {return noop;};
	const fakePrototype = { bind: trBind };
	const fakeConstructor = function() {};fakeConstructor.prototype = fakePrototype;
	const keyss = ['log', 'warn', 'info', 'error', 'exception', 'table', 'trace'];
	keyss.forEach(key => {
		safeConsole[key] = noop; // 把所有方法都替换为空函数
	});
	[ajoke, ajoke2, ajoke3].forEach(fn => {
		fn.console = safeConsole;
		Object.defineProperty(fn, 'constructor', {
			value: fakeConstructor,
			writable: true,
			configurable: true,
			enumerable: false
		});
	});

    const processedNodes = new WeakSet();
    const blockedScripts = new Set();
    function getSafeSrc(node) {
        return node.src && typeof node.src === 'string' ? node.src : '';
    }

    function truncateContent(content, maxLength = 666) { //截断
        if (!content)
            return '';
        if (content.length <= maxLength)
            return content;
        return content.substring(0, maxLength) + '...';
    }

    // 获取元素的DOM路径
    function getElementPath(element) {
        if (!element)
            return 'none';
        const path = [];
        let current = element;
        let level = 0;

        while (current && current.nodeType === 1 && level < 5) {
            let desc = current.nodeName.toLowerCase();
            if (current.id)
                desc += `#${current.id}`;
            if (current.className) {
                const classes = current.className.split(' ').slice(0, 3).join('.');
                if (classes)
                    desc += `.${classes}`;
            }
            if (current.src && current.src.length < 50) {
                const srcShort = current.src.split('/').pop();
                if (srcShort)
                    desc += `[src:${srcShort}]`;
            }
            path.unshift(desc);
            current = current.parentElement;
            level++;
        }
        return path.join(' > ');
    }

    // 获取调用栈
    function getCallStack() {
        try {
            throw new Error();
        } catch (e) {
            return e.stack.split('\n').slice(2).join('\n    ');
        }
    }

    // 详细日志函数
    function logBlock(interceptor, keyword, content, source = '', element = null) {
        const key = `${interceptor}:${keyword}:${Date.now()}:${Math.random()}`;
        if (blockedScripts.has(key))
            return;
        blockedScripts.add(key);
        console.group(`[脚本拦截器] 🚫 ${interceptor} 拦截:		${keyword}		`, performance.now());
        console.log(`   于: ${window.location.href}`);
        console.log(`   关键词: "${keyword}"`);
        console.log(`   来源类型: ${source || '未知'}`);

        if (element) {
			if(interceptor==='setInterval')console.log(`   触发间隔(ms): ${element}`);
			else if(interceptor==='setTimeout')console.log(`   倒计时(ms): ${element}`);
			else{
            console.log(`   元素类型: ${element.nodeName}`);
            if (element.id)
                console.log(`   元素ID: ${element.id}`);
            if (element.className)
                console.log(`   元素类名: ${element.className}`);

            if (source.includes('内联事件')) {
                const match = source.match(/内联事件: (\w+)/);
                if (match)
                    console.log(`   事件名称: ${match[1]}`);
            }

            if (element.src)
                console.log(`   元素src: ${truncateContent(element.src, 100)}`);
            if (element.href)
                console.log(`   元素href: ${truncateContent(element.href, 100)}`);
            if (element.data)
                console.log(`   元素data: ${truncateContent(element.data, 200)}`);
            //if (element.data) console.log(`   元素data: ${element.data}`);

            console.log(`   DOM位置: ${getElementPath(element)}`);
        }};

        const stack = getCallStack();
        if (stack)
            console.log(`   调用栈:\n    ${stack}`);
        //console.trace(`   调用栈:\n`);

        console.log(`   内容预览: ${truncateContent(content)}`);
        console.groupEnd();
    }

    // ==================== 完整的 checkNode 函数 ====================
    const obwhitelist = /"\] = function\(\)\{with \(this\) \{\(async \(u, \{ p, r, s \}\) => \{try \{r\(u, s, \[undefined,undefined,undefined,[\s\S]*?p\.GM_[\s\S]*?\/\/ ==UserScript==/;
	function checkNode(node) {
        if (!node || processedNodes.has(node))
            return null;

        // 1. textContent 和 src
        let content = node.textContent || '';
        let src = getSafeSrc(node);
		if (obwhitelist.test(content)) {
			//console.log('【油猴测试ing】',node);
			return {source: '油猴'};}
        for (const kw of keywordsToBlock) {
            if (content.includes(kw)) {
				//console.log('【测试】',node);
				return {
                    kw,
                    content,
                    type: 'content',
                    source: '文本内容'
                };
            }
            if (src.includes(kw)) {
                return {
                    kw,
                    content: src,
                    type: 'src',
                    source: 'src属性'
                };
            }
        }

        // 2. 检查内联事件属性
        if (node.nodeType === 1) {
            const eventAttrs = [
                'onclick', 'ondblclick', 'onmousedown', 'onmouseup', 'onmouseover',
                'onmousemove', 'onmouseout', 'onmouseenter', 'onmouseleave',
                'onload', 'onunload', 'onerror', 'onresize', 'onscroll',
                'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset',
                'onselect', 'oninput', 'onkeydown', 'onkeypress', 'onkeyup',
                'oncontextmenu', 'onpaste', 'oncopy', 'oncut', 'ondrag',
                'ondrop', 'ontouchstart', 'ontouchmove', 'ontouchend',
                'onanimationstart', 'onanimationend', 'onanimationiteration',
                'ontransitionstart', 'ontransitionend', 'ontransitionrun',
                'onwheel', 'onauxclick', 'ongotpointercapture', 'onlostpointercapture',
                'onpointerdown', 'onpointermove', 'onpointerup', 'onpointercancel',
                'onpointerover', 'onpointerout', 'onpointerenter', 'onpointerleave'
            ];

            for (const attr of eventAttrs) {
                const attrValue = node.getAttribute(attr);
                if (attrValue && typeof attrValue === 'string') {
                    for (const kw of keywordsToBlock) {
                        if (attrValue.includes(kw)) {
                            return {
                                kw,
                                content: attrValue,
                                type: 'event',
                                source: `内联事件: ${attr}`,
                                attr: attr
                            };
                        }
                    }
                }
            }
        }

        // 3. 检查 data: 和 javascript: 伪协议
        if (node.nodeType === 1) {
            if (node.href && typeof node.href === 'string' && node.href.startsWith('javascript:')) {
                const jsCode = node.href.substring(11);
                for (const kw of keywordsToBlock) {
                    if (jsCode.includes(kw)) {
                        return {
                            kw,
                            content: jsCode,
                            type: 'pseudo',
                            source: 'javascript:伪协议'
                        };
                    }
                }
            }

            if (node.src && typeof node.src === 'string' && node.src.startsWith('javascript:')) {
                const jsCode = node.src.substring(11);
                for (const kw of keywordsToBlock) {
                    if (jsCode.includes(kw)) {
                        return {
                            kw,
                            content: jsCode,
                            type: 'pseudo',
                            source: 'iframe javascript:伪协议'
                        };
                    }
                }
            }

            if (node.src && typeof node.src === 'string' && node.src.startsWith('data:text/javascript')) {
                const jsCode = decodeURIComponent(node.src.split(',')[1] || '');
                for (const kw of keywordsToBlock) {
                    if (jsCode.includes(kw)) {
                        return {
                            kw,
                            content: jsCode,
                            type: 'data',
                            source: 'data:javascript协议'
                        };
                    }
                }
            }
        }

        // 4. 检查 <object> 和 <embed> 标签
        if (node.nodeName === 'OBJECT' || node.nodeName === 'EMBED') {

            const data = node.data || getSafeSrc(node) || '';
            if (data.match(/\.js$/i)) {
                for (const kw of keywordsToBlock) {
                    if (data.includes(kw)) {
                        return {
                            kw,
                            content: data,
                            type: 'plugin',
                            source: `${node.nodeName} 插件`
                        };
                    }
                }
            }
        }

        // 5. 检查 <meta> 刷新/重定向
        if (node.nodeName === 'META') {
            const httpEquiv = node.getAttribute('http-equiv');
            const metaContent = node.getAttribute('content');
            if (httpEquiv && httpEquiv.toLowerCase() === 'refresh' && metaContent) {
                if (metaContent.includes('javascript:')) {
                    for (const kw of keywordsToBlock) {
                        if (metaContent.includes(kw)) {
                            return {
                                kw,
                                content: metaContent,
                                type: 'meta',
                                source: 'meta refresh'
                            };
                        }
                    }
                }
            }
        }

        // 6. 检查 <base> 标签
        if (node.nodeName === 'BASE') {
            const href = node.href || '';
            for (const kw of keywordsToBlock) {
                if (href.includes(kw)) {
                    return {
                        kw,
                        content: href,
                        type: 'base',
                        source: 'base href'
                    };
                }
            }
        }

        return null;
    }
    // ==================== 1. createElement ====================
	(function(){
	//return//废弃
	if(inSecondaryWhitelist)return;
	console.log('[脚本拦截器] 🍧 部署 createElement 拦截器');
	document.createElement=function(tagName){const element=originalCreateElement.call(document,tagName);if(tagName&&tagName.toLowerCase()==='script'){Object.defineProperty(element,'src',{set:function(value){let srcValue = value.toString();for(const kw of keywordsToBlock){if(value&&srcValue.includes(kw)){logBlock('createElement',kw,value,'createElement(Src拦截)');return;}}
	element.setAttribute('src',value);},get:function(){return element.getAttribute('src');},configurable:true});let currentText='';Object.defineProperty(element,'text',{set:function(code){for(const kw of keywordsToBlock){if(code&&code.includes(kw)){logBlock('createElement',kw,code,'createElement(Text拦截)');return;}}
	currentText=code;element.textContent=code;},get:function(){return currentText;},configurable:true});}
	return element;};

	document.createElementNS=function(namespaceURI,qualifiedName,options){const element=originalCreateElementNS.call(this,namespaceURI,qualifiedName,options);if(qualifiedName&&qualifiedName.toLowerCase()==='script'){Object.defineProperty(element,'src',{set:function(value){let srcValue = value.toString();for(const kw of keywordsToBlock){if(value&&srcValue.includes(kw)){logBlock('createElementNS',kw,value,'createElementNS(Src拦截)');return;}}
	element.setAttribute('src',value);},get:function(){return element.getAttribute('src');},configurable:true});let currentText='';Object.defineProperty(element,'text',{set:function(code){for(const kw of keywordsToBlock){if(code&&code.includes(kw)){logBlock('createElementNS',kw,code,'createElementNS(Text拦截)');return;}}
	currentText=code;element.textContent=code;},get:function(){return currentText;},configurable:true});}
	return element;};
	
	})();




    // ==================== 2. MutationObserver ====================
     (()=>{
	if(currentHost.includes('yichengwlkj.com'))return;
	console.log('[脚本拦截器] 👁️ 部署 MutationObserver 拦截器');
	
	const observer = new MutationObserver(function (mutations) {
		
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (node) {
                if (processedNodes.has(node))
                    return;
                const named = node.nodeName;
                if (named === "BODY" || named === "HEAD" || named === "HTML")
                    return;
				if(named==="IFRAME"){
					//if(node.src)console.log(`[Iframe监控] 📍 DOM: ${getElementPath(node)} | src: ${truncateContent(node.src, 200)}`);
					if(node.srcdoc&&typeof node.srcdoc==='string'){/* console.log(`[Iframe监控] 📍 DOM: ${getElementPath(node)} | 发现 srcdoc 属性`); */
					const killKeywords=['Detection','detectLoop','Detector','detect'];let isBlocked=false;let matchedKw='';if(/<title[^>]*>[\s\S]*?Detection Frame[\s\S]*?<\/title>/i.test(node.srcdoc)){isBlocked=true;matchedKw='<title>包含 Detection Frame';}
					else{const scriptMatches=node.srcdoc.match(/<script[^>]*>([\s\S]*?)<\/script>/gi)||[];for(const scriptTag of scriptMatches){for(const kw of killKeywords){if(scriptTag.includes(kw)){isBlocked=true;matchedKw=`script内包含 ${kw}`;break;}}
					if(isBlocked)break;}}
					if(isBlocked){console.group(`[脚本拦截器] 🚫 拦截恶意 Iframe 创建`);console.log(` 于: ${window.location.href}`);console.log(` 原因: ${matchedKw}`);console.log(` DOM位置: ${getElementPath(node)}`);console.log(` 恶意 srcdoc 预览: ${truncateContent(node.srcdoc, 800)}`);console.groupEnd();node.remove();processedNodes.add(node);return;}}
					/*try{const checkInternal=()=>{try{const doc=node.contentDocument||node.contentWindow.document;if(doc&&doc.documentElement){const innerHtml=doc.documentElement.innerHTML;
					//if(innerHtml.length>0){console.log(`[Iframe监控] 🚀 内部动态内容已加载 | DOM: ${getElementPath(node)}`);console.log(`内容预览:\n${truncateContent(innerHtml, 1000)}`);}
					}}catch(e){}};if(node.contentDocument&&node.contentDocument.readyState==='complete'){checkInternal();}else{node.addEventListener('load',checkInternal,{once:true});}}catch(e){}*/ 
					}

                const result = checkNode(node);
                if (result&&result.source!='油猴') {
                    let sourceDesc = '';
                    if (result.type === 'event') {
                        sourceDesc = `内联事件: ${result.attr}`;
                    } else if (result.type === 'pseudo') {
                        sourceDesc = result.source;
                    } else if (result.type === 'data') {
                        sourceDesc = result.source;
                    } else if (result.type === 'plugin') {
                        sourceDesc = result.source;
                    } else if (result.type === 'meta') {
                        sourceDesc = result.source;
                    } else if (result.type === 'base') {
                        sourceDesc = result.source;
                    } else {
                        sourceDesc = result.type === 'src' ? '外部脚本节点' : '内联脚本节点';
                    }
					node.remove();
                    processedNodes.add(node);
					logBlock('MutationObserver', result.kw, result.content, sourceDesc, node);
                    return;
                }

                //if (node.nodeName === 'SCRIPT') {
                if (node.nodeName.toLowerCase()==='script') {
                    if(result&&result.source==='油猴'){}
					else{
					let src = getSafeSrc(node)
                        let text = node.textContent || '';
                    for (const kw of keywordsToBlock) {
                        if (src.includes(kw)) {
							node.remove();
                            processedNodes.add(node);
							logBlock('MutationObserver', kw, src, '外部脚本标签', node);
                            break;
                        }
                        if (text.includes(kw)) {
                            node.remove();
                            processedNodes.add(node);
							logBlock('MutationObserver', kw, text, '内联脚本标签', node);
                            break;
                        }
                    }}
                }

                processedNodes.add(node);
            });
        });
    });
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    }); })();

    // ==================== 3. appendChild ====================

	console.log('[脚本拦截器] 📦 部署 appendChild 拦截器');
    Node.prototype.appendChild = function (node) {
        // 1. 先检查 node 是否为空
        if (!node)
            return originalAppendChild.call(this, node);
        // 2. 检查 node 是否是真正的节点对象
        if (typeof node !== 'object' || !node.nodeName) {
            // 如果不是节点，直接调用原生方法
            return originalAppendChild.call(this, node);
        }
        // 3. 检查是否已处理
        if (processedNodes.has(node))
            return originalAppendChild.call(this, node);
        // 4. 安全检查后再调用 checkNode
        const result = checkNode(node);
        if (result) {
            logBlock('appendChild', result.kw, result.content,
                result.type === 'src' ? 'appendChild添加的外部脚本' : 'appendChild添加的内联脚本', node);
            processedNodes.add(node);
            return document.createComment(`blocked by script blocker: ${result.kw}`);
        }
        //console.log('少时诵诗书',node);
        return originalAppendChild.call(this, node);
    }; 

    // ==================== 4. insertBefore ====================
	console.log('[脚本拦截器] 🥨 部署 insertBefore 拦截器');
	Node.prototype.insertBefore = function (newNode, referenceNode) {
        if (!newNode)
            return originalInsertBefore.call(this, newNode, referenceNode);
        if (typeof newNode !== 'object' || !newNode.nodeName) {
            return originalInsertBefore.call(this, newNode, referenceNode);
        }
        if (processedNodes.has(newNode))
            return originalInsertBefore.call(this, newNode, referenceNode);

        const result = checkNode(newNode);
        if (result) {
            logBlock('insertBefore', result.kw, result.content,
                result.type === 'src' ? 'insertBefore添加的外部脚本' : 'insertBefore添加的内联脚本', newNode);
            processedNodes.add(newNode);
            //return newNode;
            // ✅ 返回一个注释节点，位置和 referenceNode 相同
            let comment = document.createComment(`blocked by script blocker: ${result.kw}`);
            return originalInsertBefore.call(this, comment, referenceNode);

        }
        return originalInsertBefore.call(this, newNode, referenceNode);
    };

    // ==================== 5. replaceChild ====================
	console.log('[脚本拦截器] 🧀 部署 replaceChild 拦截器');
	Node.prototype.replaceChild = function (newChild, oldChild) {
        if (!newChild)
            return originalReplaceChild.call(this, newChild, oldChild);
        if (typeof newChild !== 'object' || !newChild.nodeName) {
            return originalReplaceChild.call(this, newChild, oldChild);
        }
        if (processedNodes.has(newChild))
            return originalReplaceChild.call(this, newChild, oldChild);

        const result = checkNode(newChild);
        if (result) {
            logBlock('replaceChild', result.kw, result.content,
                result.type === 'src' ? 'replaceChild添加的外部脚本' : 'replaceChild添加的内联脚本', newChild);
            processedNodes.add(newChild);
            // ✅ 用注释节点替换，返回 oldChild 
            let comment = document.createComment(`blocked by script blocker: ${result.kw}`);
            return originalReplaceChild.call(this, comment, oldChild);
        }
        return originalReplaceChild.call(this, newChild, oldChild);
    }; 

    // ==================== 6. document.write ====================
    console.log('[脚本拦截器] ✍️ 部署 document.write 拦截器');
	let write1=0;
    document.write = function (str) {
        //return;
		if (typeof str === 'string') {
            let dwdefaultbl=['调试']
			if(write1)console.trace('[write检查]：', str);
			const keywordsToBlockss = [...new Set([...dwdefaultbl, ...keywordsToBlock])];
			for (const kw of keywordsToBlockss) {
                if (str.includes(kw) /* && str.includes('<script') */) {
                    logBlock('document.write', kw, str, 'document.write写入');
                    return;
                }
            }
        }
        originalWrite.call(document, str);
    };

    document.writeln = function (str) {
        if(write1)console.trace('[writeln检查]：', str);
        if (typeof str === 'string') {
            for (const kw of keywordsToBlock) {
                if (str.includes(kw)&& str.includes('<script')) {
                    logBlock('document.writeln', kw, str, 'document.writeln写入');
                    return;
                }
            }
        }
        originalWriteln.call(document, str);
    };

// 工具函数：解析十六进制和Unicode转义
function decodeString(str) {
    try {
        return str.replace(/\\x([0-9a-fA-F]{2})|\\u([0-9a-fA-F]{4})/g, (match, hex, unicode) => {
            return String.fromCharCode(parseInt(hex || unicode, 16));
        });
    } catch (e) {
        return str;
    }
}
	// ==================== 7. eval ====================
    (()=>{
	//return;
	let evalwhitelist=["map.baidu.com"]
	if (evalwhitelist.some(host => currentHost === host))return;
	let evaldeblacklist=["window",'Window','self.window','window ',' window'];
	/*const ruiShuReg = /var\s+_\$\w+\s*=\s*\[\d+\]\s*;\s*Array\.prototype\.push\.apply\s*\(\s*_\$\w+\s*,\s*arguments\s*\)/;*/
	console.log('[脚本拦截器] 🧠 部署 eval 拦截器');
    window.eval = function (code) {
        //console.trace('[🧠eval监控] 类型',typeof code,'\n',code);
        if (typeof code === 'string') {
            let coded = decodeString(code);
			//if(/\bdebugger\b/.test(coded)&&ruiShuReg.test(coded)){code=code.replace(debugReg,'');coded=coded.replace(/\bdebugger\b/,'');console.log('[eval执行]: 已移除瑞树debugger关键字：',coded);return originalEval.call(this,code);}//不要使用这个，瑞树的疑似会自检测是否成功反调试/被篡改并上报，只切除debugger的话会被拉黑后续不再返回数据
			if (evaldeblacklist.some(host => coded === host)){//完整匹配到任意一个则拦截
				logBlock('eval', coded, code, 'eval执行(字符串)');
                    return
					;}
			for (const kw of keywordsToBlock) {
				if (coded.includes(kw)) {
                    logBlock('eval', kw, code, 'eval执行(字符串)');
                    return;
                }
            }
        };
        if (typeof code === 'function') {
            const funcStr = code.toString();
			//console.log('[eval]',funcStr);
			for (const kw of keywordsToBlock) {
                if (funcStr.includes(kw)) {
                    logBlock('eval', kw, funcStr, 'eval执行(函数)');
                    return;
                }
            }
        }
        return originalEval.call(this, code);
    };

    Object.defineProperty(window, 'eval', { 
        value: window.eval,
        writable: false, // 禁止修改
        configurable: false // 禁止重新配置
    });})();

    // ==================== 8. Function ====================
	(function () {
		if (inSecondaryWhitelist)return; 
		console.log('[脚本拦截器] 💦 部署 Function 拦截器');
			const proxyFunction = function (...args) {
			const code = args[args.length - 1] || '';
				//console.trace('[脚本拦截器] 💦 Function 监控：',code,'\n',args);
				if (typeof code === 'string') {
					const coded = args.map(String).join(' ');
					const isStringPatching = /["']bugger["']/i.test(coded); // 
					const isNestedFunction = /(?:new\s+)?\bFunction\s*\(/.test(coded);

					if (isStringPatching||isNestedFunction) {
						//console.log('[脚本拦截器]Function:',isStringPatching,isNestedFunction);
						//logBlock('Function',coded.substring(0,30), args, 'new Function构造函数:疑似套娃拼接 debugger');
						//return function () {};	
						return ajoke;	
						}
					let funcdebl=['function() {}.constructor(','function(){}.constructor('];
					const keywordsToBlocks = [...new Set([...funcdebl, ...keywordsToBlock])];
					for (const kw of keywordsToBlocks) {
						if (code.includes(kw)) {
							logBlock('Function', kw, code, 'new Function构造函数');
							//return function () {};
							return ajoke;
							}}}
			// 放行
			//console.log('[脚本拦截器] 💦 Function 拦截：无害：',args);
			return originalFunction.apply(this, args);};
		// 修复身份认证
		proxyFunction.prototype = originalFunction.prototype;
		Object.defineProperty(proxyFunction, Symbol.hasInstance, {
			value: function (instance) {
				return instance instanceof originalFunction;
			},
			configurable: true
		});
		//window.Function = proxyFunction;
		// 锁定：
		Object.defineProperty(window, 'Function', {
			value: proxyFunction,
			writable: false,      // 禁止修改
			configurable: false,  // 禁止删除和重新配置！
		});
	})();
	

    // ==================== 9. setTimeout ====================
	let showTimeout = 0;
    (()=>{
	console.log('[脚本拦截器] 🍛 部署 setTimeout 拦截器');
    window.setTimeout = function (handler, timeout, ...args) {
        //const timerIded = originalsetTimeout.apply(this, [handler, timeout, ...args]);
		if (typeof handler === 'string') {
            for (const kw of keywordsToBlock) {
                if (handler.includes(kw)) {
                    //console.log(`[setTimeout] 拦截新增 ID: ${timerIded}，倒计时:${timeout}`);
					logBlock('setTimeout', kw, handler, '字符串形式setTimeout',timeout);
                    return 0;
                }
            }
        }

        if (typeof handler === 'function') {
			const handlerStr = handler.toString();
			if(showTimeout)console.trace('[setTimeout]:',handlerStr,timeout);
/* 			if (timeout>=10000){
			logBlock('setTimeout', timeout, handlerStr, '等待时间过长');
                    return 0;} */
			
            let defaultbl=['detectLoop()','404.','devtool','502.','location.href="about:blank"',"location.href='about:blank'",
			/['"]\w['"],\s*['"]\w['"]\)\s*\)\s*\)\s*,/i,
			/(?:eval|Function)\s*\(\s*(?:['"][^'"]*?['"]\s*\+?\s*){2,}/i,
			/(?:clear|disable|override)\s*\(\s*(?:console|log|debug|devtool)/i,
			'concat(encodeURIComponent',
			//'{return t.apply(this,s)}catch(e){throw e',
			//'!e||e&&!1!==e.deep',
			'setInterval(function(','setInterval(()=>',
			'baidu.com'];
			let whitel=['devtools&&','.emit("init",'];
			let isnormal = handlerStr.includes('vuejs/vue-devtools')||(whitel.every(kw=>handlerStr.includes(kw))); 
			//console.log('[setTimeout]:',handlerStr,timeout);
				/*let Intervalwhitelist=["tieba.baidu.com"];
					if (Intervalwhitelist.some(host => currentHost === host)){
						let toRemove=['setInterval(function(', 'setInterval(()=>'];
						defaultbl = defaultbl.filter(item => !toRemove.includes(item));
					};*/
			const keywordsToBlocks = [...new Set([...defaultbl, ...keywordsToBlock])];
			for (let kw of keywordsToBlocks) {
                if (isnormal)break;
				let isMatch = false;
						if (kw instanceof RegExp) {
							isMatch = kw.test(handlerStr);
						} else {
							isMatch = handlerStr.includes(kw);
						}
				if (isMatch) {
					logBlock('setTimeout', kw.toString(), handlerStr, '函数形式setTimeout',timeout);
                    return 0;
                }
            }
        }
		//activeTimeout++;
		//const timerIded = originalSetTimeout.call(this, handler, timeout, ...args);
		//console.log(`[setTimeout] 新增 ID: ${timerId}，倒计时：${timeout} 已添加计数:${activeTimeout}\n`, handler);
        return originalSetTimeout.call(this, handler, timeout, ...args);
    }; })();

// ==================== 10. setInterval ====================
let activeIntervals = 0;
let showsetIn = 1;
let showsetInall = 0;
const SET_INTERVAL_CONFIG = {
    enableSlowMonitor: true,   // 是否开启【卡顿拦截】(卡顿检测)
    enableSpamFilter: true,    // 是否开启【频控拦截】(连续添加3次拉黑)
    slowThreshold: 100,        // 慢执行阈值(毫秒)
    maxSlowHits: 2,            // 连续慢执行几次触发清理
    spamTriggerCount: 3,       // 连续添加相同函数几次触发拉黑
    blacklistDuration: 60 * 60 * 1000 // 拉黑时长：1小时(毫秒)
};

(() => {
    console.log('[脚本拦截器] ⏱️ 部署 setInterval 拦截器', performance.now());
    
    const timerStates = new Map(); 
    const spamTracker = new Map(); 
    const spamBlacklist = new Map(); 

    // ---------------- 模块一：频控拦截 ----------------
    const SpamFilterModule = {
        check(handler) {
            if (!SET_INTERVAL_CONFIG.enableSpamFilter || typeof handler !== 'function') return false;
            const handlerStr = handler.toString();
            
            if (spamBlacklist.has(handlerStr)) {
                if (Date.now() < spamBlacklist.get(handlerStr)) {
                    return true; 
                } else {
                    spamBlacklist.delete(handlerStr); 
                }
            }

            const count = (spamTracker.get(handlerStr) || 0) + 1;
            spamTracker.set(handlerStr, count);

            if (count >= SET_INTERVAL_CONFIG.spamTriggerCount) {
                spamBlacklist.set(handlerStr, Date.now() + SET_INTERVAL_CONFIG.blacklistDuration);
                spamTracker.delete(handlerStr); 
                console.warn(`[频控拦截] 🚫 检测到恶意循环注册，函数已列入黑名单`);
                this.cleanHistoricalTimers(handlerStr);
                return true;
            }

            setTimeout(() => {
                if (spamTracker.get(handlerStr) === count) spamTracker.delete(handlerStr);
            }, 5000);

            return false;
        },
        cleanHistoricalTimers(handlerStr) {
            for (const [id, state] of timerStates.entries()) {
                if (state.originalHandlerStr === handlerStr) {
                    clearInterval(id);
                    timerStates.delete(id);
                    activeIntervals--;
                }
            }
        }
    };

    // ---------------- 模块二：卡顿拦截 ----------------
    const createMonitorWrapper = (handler, timerId, context, args) => {
        const startTime = performance.now();
		try {
			if (typeof handler === 'function') {
                handler.apply(context, args);
            } else if (typeof handler === 'string') {
                eval(handler);
            }
        } catch (e) {
            console.error('[脚本拦截器] 定时器执行出错:', e);
        }
        
        const duration = performance.now() - startTime;
        
        if (duration > SET_INTERVAL_CONFIG.slowThreshold) {
            // console.warn(`[智能拦截] ⚠️ 定时器耗时过长: ${duration.toFixed(2)}ms`);
            const state = timerStates.get(timerId);
            if (state) {
                state.hits++;
                if (state.hits >= SET_INTERVAL_CONFIG.maxSlowHits) {
                    console.log(`[智能拦截] 🔥 连续卡顿，强制清除 ID: ${timerId}`);
                    clearInterval(timerId);
                    timerStates.delete(timerId);
                    activeIntervals--;
                }
            }
        } else {
            const state = timerStates.get(timerId);
            if (state && state.hits > 0) state.hits = 0;
        }
    };

    // ----------------  Proxy代理  ----------------
    window.setInterval = new Proxy(originalSetInterval, {
        apply(target, thisArg, argumentsList) {
            let [handler, interval, ...args] = argumentsList;
			if(href.includes('98dou.cn'))return 0;//
            // --- 1. 静态特征扫描 ---
            if (typeof handler === 'string') {
                for (const kw of keywordsToBlock) {
                    if (handler.includes(kw)) {
                        logBlock('setInterval', kw, handler, '字符串形式恶意代码',interval);
                        return 0;
                    }
                }
            }
            
            if (typeof handler === 'function') {
                const handlerStr = handler.toString();
                
                if (SpamFilterModule.check(handler)) return 0;
				if(showsetInall)console.log(`[⏱ SetInterval监控]  间隔：${interval} \n${handlerStr}\n----\n`,handler);
                const hasObfuscatedVars=/_0x[a-f0-9]{4,}/i.test(handlerStr);
                const hasDangerKeywords=/debugger|(?<![a-z])Function\s*\(/i.test(handlerStr);
                const hasMaliciousStructure=/return\s+(_0x|function\s*\()/i.test(handlerStr);
                const hasdetected=/^(?=.*\bdetected\b)(?=.*\bonOpen\b\(\)).*$/i.test(handlerStr);
                const isExtremelyLong=handlerStr.length>1000;
                let isMalicious=false;let reason='';
                if(hasDangerKeywords&&hasObfuscatedVars){isMalicious=true;reason='混淆代码含高危关键词';}
                else if(hasObfuscatedVars&&hasMaliciousStructure){isMalicious=true;reason='混淆代码含套娃结构';}
                else if(hasObfuscatedVars&&isExtremelyLong){isMalicious=true;reason='混淆代码体积异常';}
                else if(hasdetected){isMalicious=true;reason='DevToolsDetector代码';}
                if(isMalicious){logBlock('setInterval',reason,handlerStr,'函数形式恶意混淆代码');return 0;}

                let defaultbl = [/\w+\[[\s\S]*?\]\([\s\S]*?\w+\[[\s\S]*?\]\([\s\S]*?\w+\[[\s\S]*?\]\(/i, /(?:eval|Function)\s*\(\s*['"]debugger['"]\s*\)/i, /new\s+Array\s*\(\s*\d+\s*\)\s*\.\s*fill\s*\(|(?:1e[4-9]|[1-9]\d{4,})\s*\)/,
				/(?:\!\[\]|\[\])[\s\S]*?\+|\[\s*\[\s*\[\s*\]\s*\]/,
				/=\w{1,3}\.outerWidth-\w{1,3}\.innerWidth/,
				/=\w{1,3}\.outerHeight-\w{1,3}\.innerHeight/,
				"'d','e'),'b'),'u'),'g'),'g'",'setTimeout(function(', 'setTimeout(()=>', 'debugger', 'devtool', 'clearLog', 'console.clear',
				'window.outerWidth-window.innerWidth',
				'window.outerHeight-window.innerHeight',
				'=(new Date)-origTime',
				'checkPerformance.bind',
				'if (!(e.isSuspend||'];
                let timeoutwhitelist=["map.baidu.com"];
                if (timeoutwhitelist.some(host => currentHost === host)){
                    let toRemove=['setTimeout(function(', 'setTimeout(()=>'];
                    defaultbl = defaultbl.filter(item => !toRemove.includes(item));
                };
                const keywordsToBlocks = [...new Set([...defaultbl, ...keywordsToBlock])];
                
                for (const kw of keywordsToBlocks) {
                    let isMatch = false;
                    if (kw instanceof RegExp) { isMatch = kw.test(handlerStr); } 
                    else { isMatch = handlerStr.includes(kw); }
                    if (isMatch) {
                        logBlock('setInterval', kw.toString(), handlerStr, '函数形式恶意代码',interval);
                        return 0;
                    }
                }
            };

            // --- 2. 动态包装与注册 ---
            const originalHandlerStr = typeof handler === 'function' ? handler.toString() : String(handler);
            // 获取 timerId
            let timerId = null;
            const placeholder = function(...innerArgs) {
                // 监控
                createMonitorWrapper(handler, timerId, this, innerArgs);
            };

            timerId = Reflect.apply(target, thisArg, [placeholder, interval, ...args]);

            // 记录状态
            timerStates.set(timerId, { hits: 0, originalHandlerStr: originalHandlerStr });
            activeIntervals++;
            if(showsetIn) console.log(`[SetInterval监控] 新增 ID: ${timerId}，间隔：${interval} 已添加计数:${activeIntervals}\n`, handler);
            
            return timerId;
        }
    });
    
    for (let i = 1; i < 100; i++) { clearInterval(i); }
})();

// ==================== 11. iframe 逃逸拦截 ====================
const OriginalIframe=window.HTMLIFrameElement;if(OriginalIframe){
const iframeblockedRules=[
'https://game.weixin.qq.com/',//前缀
'https://report.error-report.com/modal?eventId=',//前缀
/*/^https:\/\/.*\.weixin\.qq\.com\//,//正则
(url)=>url.includes('adsystem'),//包含*/
];function shouldBlockUrl(url){if(typeof url!=='string')return false;return iframeblockedRules.some(rule=>{if(typeof rule==='string'){return url.startsWith(rule);}else if(rule instanceof RegExp){return rule.test(url);}else if(typeof rule==='function'){try{return rule(url);}catch(e){console.error('[脚本拦截器] 规则函数执行出错:',e);return false;}}return false;});}Object.defineProperty(OriginalIframe.prototype,'src',{get:function(){return this.getAttribute('src');},set:function(value){if(shouldBlockUrl(value)){console.warn('[脚本拦截器] 🚫 阻止 🍵iframe.src 设置:',value);return;}this.setAttribute('src',value);},configurable:true});const originalSetAttribute=OriginalIframe.prototype.setAttribute;OriginalIframe.prototype.setAttribute=function(name,value){if(name==='src'&&shouldBlockUrl(value)){console.warn('[脚本拦截器] 🚫 阻止 🍵iframe.setAttribute(src)设置:',value);return;}return originalSetAttribute.call(this,name,value);};}
(() => {
if(window.self===window.top){if(typeof window.__addIframeHook__==='function'){console.log('[脚本拦截器] 🍵 部署 iframe 逃逸拦截');window.__addIframeHook__(function(win){win.Function=window.Function;win.eval=window.eval;win.setTimeout=window.setTimeout;win.setInterval=window.setInterval;;try{win.document=window.document;}catch(e){};});}else{console.warn('[Inject] 🍵未检测到lockconsole的addIframeHook，补足iframe 逃逸拦截');
const descriptor=Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype,'contentWindow');const originalGetter=descriptor.get;Object.defineProperty(HTMLIFrameElement.prototype,'contentWindow',{get:function(){const win=originalGetter.call(this);try{if(win&&!win.__isIndependentHook__){Object.defineProperty(win,'__isIndependentHook__',{value:true,configurable:false});win.Function=window.Function;win.eval=window.eval;win.setTimeout=window.setTimeout;win.setInterval=window.setInterval;try{win.document=window.document;}catch(e){}}}catch(e){}return win;},configurable:false});
}}})();


    console.log('[脚本拦截器] ✅ 所有拦截器部署完成，共 ' + keywordsToBlock.length + ' 个关键词',performance.now());
})();
})();
