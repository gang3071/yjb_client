/**
 * 加载zip
 * 解压zip(不要全部解压，按需加载)
 * 写从zip获取内容的全局方法
 */


let zipMap = {}// 存放加载的zip原始内容
let unzipMap = {}// 存放解压后的内容 解压一个就加一个
let ccJsMd5 = "a6e3d";// 存放压缩包里面的cc.js的md5值
let assetsMd5 = "1782749627";// 存放压缩包里面的cc.js的md5值
//blob 转base64
let blobToBase64 = function (blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			resolve(reader.result); // 返回 Base64 字符串
		};
		reader.onerror = reject; // 处理错误
		reader.readAsDataURL(blob); // 读取 Blob 并转换为 Base64
	});
}

//blob 转dataUrl
let blobToDataUrl = function (blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result); // 返回 Data URL
		reader.onerror = reject; // 处理错误
		reader.readAsDataURL(blob); // 读取 Blob 为 Data URL
	});
}

//从压缩包中获取cc.js去启动游戏
let applyCCjsFunc = function () {
	var debug = window._CCSettings.debug;
	async function loadScript(moduleName, cb) {
		const scriptContent = await window.getZippedFileContent(moduleName, "js"); // 从 zipMap 中获取脚本内容
		if (!scriptContent) {
			console.error(`Script not found: ${moduleName}`);
			return;
		}

		// 创建一个新的 script 元素
		const domScript = document.createElement('script');
		domScript.textContent = scriptContent; // 将内容赋值给 script 元素

		// 这样可以立即执行它
		document.body.appendChild(domScript);
		document.body.removeChild(domScript);
		// 调用回调函数
		cb && cb();
	}

	loadScript(debug ? 'cocos2d-js.js' : 'cocos2d-js-min.' + ccJsMd5 + '.js', function () {
		if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
			loadScript(debug ? 'physics.js' : 'physics-min.js', window.boot);
		}
		else {
			window.boot();
		}
	});
}

//正常启动游戏
let normalFunc = function () {
	var debug = window._CCSettings.debug;
	function loadScript(moduleName, cb) {
		function scriptLoaded() {
			document.body.removeChild(domScript);
			domScript.removeEventListener('load', scriptLoaded, false);
			cb && cb();
		};
		var domScript = document.createElement('script');
		domScript.async = true;
		domScript.src = moduleName;
		domScript.addEventListener('load', scriptLoaded, false);
		document.body.appendChild(domScript);
	}

	loadScript(debug ? 'cocos2d-js.js' : 'cocos2d-js-min.' + ccJsMd5 + '.js', function () {
		if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
			loadScript(debug ? 'physics.js' : 'physics-min.js', window.boot);
		}
		else {
			window.boot();
		}
	});
}

// 异步加载 ZIP 文件并显示内容
let loadZip = async function () {
	try {
		const response = await fetch("cc.zip");// 使用 fetch 加载 ZIP 文件
		if (!response.ok) throw new Error("Failed to load ZIP file");
		const arrayBuffer = await response.arrayBuffer();// 将文件内容读取为 ArrayBuffer
		const zip = await JSZip.loadAsync(arrayBuffer);// 使用 JSZip 解析 ZIP 文件
		
		zip.forEach((relativePath, zipEntry) => {
			zipMap[relativePath] = zipEntry
		});

		console.log("------loadZip---------",zipMap)
		// let jsContent = unzipMap[url]
		// if (!jsContent) {
			// jsContent = await zipMap["cc.ff8e5.js"].async("text");
			// unzipMap["cc.ff8e5.js"] = jsContent
		// }
		// return jsContent;
		// applyCCjsFunc()
		// console.log("------loadZip---------",unzipMap["cc.ff8e5.js"])
	} catch (error) {
		console.error("Error loading ZIP file:", error);
		// location.reload(); // 刷新页面
		let callObj = {
			event: "hideLoading",
			data: {},
		}
		// window.android.jsCallJava(JSON.stringify(callObj))应该是要告诉app报错了
	}
}

//获取压缩map里面的内容 目前处理 json img js audio
window.getZippedFileContent = async function (url, fileType) {
	// url = url.replace(/^assets\//, "");//将url里面的assets/去掉
	url = url.split("/").pop()
	if (!zipMap[url]) {//如果压缩包里面没有这个文件走正常逻辑
		return false;
	}

	if (fileType == "json") {
		let jsonContent = unzipMap[url]
		if (!jsonContent) {
			jsonContent = await zipMap[url].async("text");
			unzipMap[url] = jsonContent
		}
		return jsonContent;
	} else if (fileType == "img") {
		let imgContent = unzipMap[url]
		if (!imgContent) {
			imgContent = await zipMap[url].async("base64");
			unzipMap[url] = imgContent
		}
		return imgContent;
	} else if (fileType == "js") {
		let jsContent = unzipMap[url]
		if (!jsContent) {
			jsContent = await zipMap[url].async("blob");
			unzipMap[url] = jsContent
		}
		return jsContent;
	} else if (fileType == "audio") {
		let audioContent = unzipMap[url]
		if (!audioContent) {
			audioContent = await zipMap[url].async("arraybuffer");
			unzipMap[url] = audioContent
		}
		return audioContent;
	}
	return false;
}

//启动游戏
loadZip();