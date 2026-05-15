import { assetManager } from "cc";
import { Message } from "../base/core/MessageMgr";
import { StoreMgr } from "../base/core/StoreMgr";
import { UIMgr } from "../base/core/UIMgr";
import { LANGUAGE_DEFAULT } from "../base/localized/LocalizedManager";
import { Tools } from "../base/utils/util/Tools";
import { utils } from "../base/utils/utils";
import { AlterTipsWrap } from "../base/utils/view/AlterTipsWrap";
import { LoadingViewWrap } from "../base/utils/view/LoadingViewWrap";
import { LoadingWrap } from "../base/utils/view/LoadingWrap";
import { MsgBox } from "../base/utils/view/MsgBox";
import { getCurEnv } from "../config/Env";
import { GAME_VER, HTTP_SITE_ID, IP_DIRECT, SERVER_LIST } from "../config/ServerConfig";
import { UIConfig } from "../config/UIConfig";
import { UserInfo } from "../modules/common/UserInfo";
import { game } from "cc";
import { MsgBoxWrap } from "../base/utils/view/MsgBoxWrap";
import { loader } from "cc";
import { director } from "cc";

var urls: any = {};                      // 当前请求地址集合
var reqparams: any = {};                 // 请求参数

export enum HttpEvent {
    NO_NETWORK = "http_request_no_network",                  // 断网
    UNKNOWN_ERROR = "http_request_unknown_error",            // 未知错误
    TIMEOUT = "http_request_timout"                          // 请求超时
}

let languageParamsArr = ["zh-CN","zh-TW","en","jp"]

export class HttpRequest {

    /** 请求超时时间 */
    public timeout: number = 10000;

    public server:string = SERVER_LIST[getCurEnv()]

    public lobbyUrl = ""

    public setUrl (url:string) {
        this.server = "http://" + url + "/"
    }

    /**
     * HTTP GET请求
     * 例：
     * 
     * Get
        var complete = function(response){
            LogWrap.log(response);
        }
        var error = function(response){
            LogWrap.log(response);
        }
        this.get(name, complete, error);
    */
    public get(name: string, completeCallback: Function, errorCallback: Function) {
        this.sendRequest(name, null, false, completeCallback, errorCallback)
    }
    public getWithParams(name: string, params: any, completeCallback: Function, errorCallback: Function) {
        this.sendRequest(name, params, false, completeCallback, errorCallback)
    }

    public getByArraybuffer(name: string, completeCallback: Function, errorCallback: Function) {
        this.sendRequest(name, null, false, completeCallback, errorCallback, 'arraybuffer', false);
    }
    public getWithParamsByArraybuffer(name: string, params: any, completeCallback: Function, errorCallback: Function) {
        this.sendRequest(name, params, false, completeCallback, errorCallback, 'arraybuffer', false);
    }

    /** 
     * HTTP POST请求
     * 例：
     *      
     * Post
        var param = '{"LoginCode":"donggang_dev","Password":"e10adc3949ba59abbe56e057f20f883e"}'
        var complete = function(response){
                var jsonData = JSON.parse(response);
                var data = JSON.parse(jsonData.Data);
            LogWrap.log(data.Id);
        }
        var error = function(response){
            LogWrap.log(response);
        }
        this.post(name, param, complete, error);
    */
    public post(name: string, params: any, completeCallback?: Function, errorCallback?: Function) {
        this.sendRequest(name, params, true, completeCallback, errorCallback);
    }

    /** 取消请求中的请求 */
    public abort(name: string) {
        var xhr = urls[this.server + name];
        if (xhr) {
            xhr.abort();
        }
    }

    /**
     * 获得字符串形式的参数
     */
    private getParamString(params: any) {
        var result = "";
        for (var name in params) {
            let data = params[name];
            if (data instanceof Object) {
                for (var key in data)
                    result += `${key}=${data[key]}&`;
            }
            else {
                result += `${name}=${data}&`;
            }
        }

        return result.substring(0, result.length - 1);
    }

    /** 
     * Http请求 
     * @param name(string)              请求地址
     * @param params(JSON)              请求参数
     * @param isPost(boolen)            是否为POST方式
     * @param callback(function)        请求成功回调
     * @param errorCallback(function)   请求失败回调
     * @param responseType(string)      响应类型
     */
    private sendRequest(name: string,
        params: any,
        isPost: boolean,
        completeCallback?: Function,
        errorCallback?: Function,
        responseType?: string,
        isOpenTimeout = true,
        timeout: number = this.timeout) {
        if (name == null || name == '') {
            console.log("请求地址不能为空")
            return;
        }

        this.server = SERVER_LIST[getCurEnv()]
        var url: string, newUrl: string, paramsStr: string;
        if (name.toLocaleLowerCase().indexOf("http") == 0) {
            url = name;
        }else {
            url = this.server + name;
        }

        let tempParams = null
        // 上传或者修改银行卡信息，类型为4时，需要上传base64图片，改用formData方式，下面总共有3个地方需要改，注意
        let cardCode = params?.type ? params.type : 0
        if (name == "api/v1/complete-recharge" || name == "api/v1/upload-avatar" || ((name == "api/v1/add-bank-card" || name == "api/v1/edit-bank-card") && cardCode!=4)) {
            tempParams = params
            params = null
        }

        if (params) {
            paramsStr = this.getParamString(params);
            if (url.indexOf("?") > -1)
                newUrl = url + "&" + encodeURIComponent(paramsStr);
            else
                newUrl = url + "?" + paramsStr;
        }
        else {
            newUrl = url;
        }

        if (urls[newUrl] != null && reqparams[newUrl] == paramsStr!) {
            console.log(`地址【${url}】已正在请求中，不能重复请求`)
            return;
        }

        console.log(`【${newUrl}】`)

        if (name == "api/v1/slot-action" && params.action) {
            if ("start" == params.action || "stop_1" == params.action || "stop_2" == params.action || "stop_3" == params.action || "out_1_pulse" == params.action) {

            }else {
                LoadingWrap.show()
            }
        }else if (name == "api/v1/jackpot-action" && params.action) {
            if ("reward_switch" == params.action) {
                
            }else {
                LoadingWrap.show()
            }
        }else {
            LoadingWrap.show()
        }
        

        var xhr = new XMLHttpRequest();

        // 防重复请求功能
        urls[newUrl] = xhr;
        reqparams[newUrl] = paramsStr!;

        if (isPost) {
            xhr.open("POST", url);
        }
        else {
            xhr.open("GET", newUrl);
        }


        
        let time = Date.parse((new Date()).toString())/1000
        let rand = utils.getRandomStr(6)

        if (null == params) {
            params = {}
        }
        let _params = params
        _params.appId = 1661408635
        _params.nonceStr = rand
        _params.timestamp = time
        let sortDDD = this.sortData(_params)
        // console.log("===sortDDD==",sortDDD)
        let buildDDD = this.http_build_query(sortDDD,null,null,null)
        // console.log("===buildDDD==",buildDDD)
        let urlDDD = this.urldecode(buildDDD) + "D81668E7B3F24F4DAB32E5B88EAE27AC"
        // console.log("===urlDDD==",urlDDD)
        let sha256DDD = utils.sha256(urlDDD)
        // console.log("===sha256DDD==",sha256DDD)
        if ( name == "api/v1/upload-avatar" || ((name == "api/v1/add-bank-card" || name == "api/v1/edit-bank-card") && cardCode!=4)) {
            // xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=testformdata')
        }else if (name == "api/v1/complete-recharge"){}
        else {
            xhr.setRequestHeader("Content-Type", "multipart/form-data");
        }
        
        xhr.setRequestHeader("Site-Id", HTTP_SITE_ID);
        // 是否是IP直连
        xhr.setRequestHeader("Is-Ip", IP_DIRECT);

        let index = StoreMgr.getInstance().getIntValue("CURR_LANGUAGE",LANGUAGE_DEFAULT)
        xhr.setRequestHeader("Lang",languageParamsArr[index-1]);

        xhr.setRequestHeader("appId", "1661408635");
        //xhr.setRequestHeader("appKey", "D81668E7B3F24F4DAB32E5B88EAE27AC");
        xhr.setRequestHeader("timestamp", time.toString());
        xhr.setRequestHeader("signature", sha256DDD);
        xhr.setRequestHeader("nonceStr", rand);
        xhr.setRequestHeader("Client-Version", GAME_VER);
        
        if ("" != UserInfo.authorization) {
            xhr.setRequestHeader("Authorization", "Bearer " + UserInfo.authorization);
        }
        

        // xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        // if (url == "http://127.0.0.1:4523/m1/1081990-0-default/im/user/info") {
            // xhr.setRequestHeader("token",str)
            // xhr.setRequestHeader("apitoken",apiToken)
            // xhr.setRequestHeader("timestamp",time.toString())
            // xhr.setRequestHeader("rand",rand.toString())
            // xhr.setRequestHeader("id","0")
        // }
        // console.log("token",userInfo.imToken)
        var data: any = {};
        data.url = url;
        data.params = params;

        // 请求超时
        if (isOpenTimeout) {
            xhr.timeout = timeout;
            xhr.ontimeout = () => {
                LoadingWrap.close()
                this.deleteCache(newUrl);

                data.event = HttpEvent.TIMEOUT;

                if (errorCallback) errorCallback(data);
            }
        }

        xhr.onloadend = (a) => {
            if (xhr.status == 500) {
                this.deleteCache(newUrl);

                if (errorCallback == null) return;

                data.event = HttpEvent.NO_NETWORK;          // 断网

                if (errorCallback) errorCallback(data);
            }
        }

        xhr.onerror = () => {
            LoadingWrap.close()
            this.deleteCache(newUrl);

            if (errorCallback == null) return;

            if (xhr.readyState == 0 || xhr.readyState == 1 || xhr.status == 0) {
                data.event = HttpEvent.NO_NETWORK;          // 断网 
            }
            else {
                data.event = HttpEvent.UNKNOWN_ERROR;       // 未知错误
            }

            if (errorCallback) errorCallback(data);
        };

        xhr.onreadystatechange = () => {
            LoadingWrap.close()
            if (xhr.readyState != 4) return;

            this.deleteCache(newUrl);

            if (xhr.status == 200) {
                // LoadingWrap.close()
                if (completeCallback) {
                    if (responseType == 'arraybuffer') {
                        // 加载非文本格式
                        xhr.responseType = responseType;
                        if (completeCallback) completeCallback(xhr.response);
                    }
                    else {
                        // console.log(xhr.response, "xhr.responsexhr.responsexhr.response")
                        // 加载非文本格式
                        var data: any = JSON.parse(xhr.response);
                        console.log("---"+newUrl+"---",data)
                        if (data.code == 200) {
                            if (completeCallback) completeCallback(data.data);
                            if (name == "api/v1/promotion-data") {
                                Message.dispatchEvent("GetPromotionDataSucc",data.data)
                            }
                            if (name == "api/v1/promotion-player") {
                                Message.dispatchEvent("GetPromotionPlayerSucc",data.data)
                            }
                            if (name == "api/v1/promotion-team") {
                                Message.dispatchEvent("GetPromotionTeamSucc",data.data)
                            }
                        }else if (data.code == 401) {
                            // let str = window.location.search.slice(1)
                            // let arr2 = str.split("=")
                            // console.log("-------",decodeURIComponent(arr2[1]))
                            // if (null != arr2[1]) {
                            //     UserInfo.finish()
                            //     return
                            // }
                            // 自动登录时报错直接调用回调
                            if (errorCallback) errorCallback(data);
                            let refresh_token = StoreMgr.getInstance().getStringValue("REFRESH_TOKEN", null)
                            if (refresh_token){
                                UserInfo.authorization = refresh_token
                                Tools.httpReq("refresh", null, (succ)=>{ 
                                    UserInfo.authorization = succ.access_token
                                })}
                        }else if (data.code >= 401021 && data.code <= 401025) {
                            // 登出清理token
                            StoreMgr.getInstance().setStringValue("ACCESS_TOKEN", "")
                            StoreMgr.getInstance().setStringValue("REFRESH_TOKEN", "")
                            utils.backExit(-1)
                            UIMgr.getInstance().closeAll()
                            AlterTipsWrap.show(Tools.GetLocalized("身份验证会话已过期，请重新登录"))
                            LoadingViewWrap.show()
                            UIMgr.getInstance().openSingleView(UIConfig.LoginBg.path,null,UIConfig.LoginBg.zIndex,null,()=>{
                                UIMgr.getInstance().openSingleView(UIConfig.AccLogin.path,null,UIConfig.AccLogin.zIndex)
                            })
                        }else if (data.code == 101) {
                            utils.backExit(-1)
                            UIMgr.getInstance().closeView(UIConfig.SLGame.path)
                            UIMgr.getInstance().closeView(UIConfig.GZGame.path)
                        }else if (data.code == 416) {
                            UIMgr.getInstance().openSingleView(UIConfig.LoginBg.path,null,UIConfig.LoginBg.zIndex,null,()=>{
                                UIMgr.getInstance().openSingleView(UIConfig.LineLogin.path,data.data,UIConfig.LineLogin.zIndex)
                            })
                        }else if (data.code == 417) {
                            AlterTipsWrap.show(data.msg)
                            // LoadingViewWrap.show()
                            UIMgr.getInstance().openSingleView(UIConfig.LoginBg.path,null,UIConfig.LoginBg.zIndex,null,()=>{
                                UIMgr.getInstance().openSingleView(UIConfig.AccLogin.path,null,UIConfig.AccLogin.zIndex)
                            })
                        }else if (data.code == 466) {
                            // 版本号不正确
                            console.log("版本号不正确")
                            MsgBoxWrap.showConfirm(Tools.GetLocalized("游戏已更新，请重启更新"),()=>{
                                assetManager.releaseAll()
                                game.end()
                            })
                        }
                        else {
                            AlterTipsWrap.show(data.msg)
                            if (errorCallback) errorCallback(data);
                        }
                    }
                }
            }
        };

        // 请求
        let s = () => {
            if (params == null || params == "") {
                xhr.send();
            }
            else {
                if (name == "api/v1/complete-recharge" ) {
                    // var formData = new TestFormData();
                    // formData.append('id', tempParams.id);
                    // formData.append('certificate', tempParams.certificate);
                    // console.log("==formData==",formData)
                    // xhr.send(formData.arrayBuffer)
                    xhr.send(tempParams)
                    // xhr.send(`id=${tempParams.id}&certificate=${tempParams.certificate}`);
                }else if (name == "api/v1/upload-avatar") {
                    var formData = new TestFormData();
                    formData.append('avatar', tempParams.avatar);
                    xhr.send(formData.arrayBuffer)
                }else if ((name == "api/v1/add-bank-card" || name == "api/v1/edit-bank-card") && cardCode!=4) {
                    var formData = new TestFormData();
                    if (name == "api/v1/edit-bank-card") formData.append('id', (tempParams.id ? tempParams.id : ""));
                    formData.append('bank_name', tempParams.bank_name);
                    formData.append('account', tempParams.account);
                    formData.append('account_name', tempParams.account_name);
                    formData.append('type', tempParams.type);
                    formData.append('wallet_address', tempParams.wallet_address);
                    formData.append('qr_code', tempParams.qr_code ? tempParams.qr_code : "");
                    console.log("==formData==",formData)
                    xhr.send(formData.arrayBuffer)
                }else {
                    xhr.send(paramsStr!);
                }
                // xhr.send(JSON.stringify(params));
            }
        }
        // 第一次请求调用
        s()
    }

    private deleteCache(url: string) {
        delete urls[url];
        delete reqparams[url];
    }

    private urlencode (str) {
        // return decodeURIComponent((str + '')
        //   .replace(/%(?![\da-f]{2})/gi, function () {
        //     // PHP tolerates poorly formed escape sequences
        //     return '%25'
        //   })
        //   .replace(/\+/g, '%20'))
        str = (str + '')
        return encodeURIComponent(str)
            .replace(/!/g, '%21')
            .replace(/'/g, '%27')
            .replace(/\(/g, '%28')
            .replace(/\)/g, '%29')
            .replace(/\*/g, '%2A')
            .replace(/~/g, '%7E')
            .replace(/%20/g, '+')
    }

     urldecode(encodedString)
    {
        var output = encodedString;
        var binVal, thisString;
        var myregexp = /(%[^%]{2})/;
        function utf8to16(str)
        {
            var out, i, len, c;
            var char2, char3;
    
            out = "";
            len = str.length;
            i = 0;
            while(i < len) 
            {
                c = str.charCodeAt(i++);
                switch(c >> 4)
                { 
                    case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                    out += str.charAt(i-1);
                    break;
                    case 12: case 13:
                    char2 = str.charCodeAt(i++);
                    out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                    break;
                    case 14:
                    char2 = str.charCodeAt(i++);
                    char3 = str.charCodeAt(i++);
                    out += String.fromCharCode(((c & 0x0F) << 12) |
                            ((char2 & 0x3F) << 6) |
                            ((char3 & 0x3F) << 0));
                    break;
                }
            }
            return out;
        }
        let match
        while((match = myregexp.exec(output)) != null
                    && match.length > 1
                    && match[1] != '')
        {
            binVal = parseInt(match[1].substr(1),16);
            thisString = String.fromCharCode(binVal);
            output = output.replace(match[1], thisString);
        }
	
        //output = utf8to16(output);
        output = output.replace(/\\+/g, " ");
        output = utf8to16(output);
        return output;
      }

      //data, prefix = null
    private http_build_query(formdata, numericPrefix, argSeparator, encType) {
        // const queryParts = [];
      
        // for (const [key, value] of Object.entries(data)) {
        //   // 处理数组和对象
        //   if (typeof value === "object" && value !== null) {
        //     // 判断是否为空数组或空对象
        //     if (Array.isArray(value) && value.length === 0) {
        //       continue;
        //     }
        //     if (Object.prototype.toString.call(value[key]) === '[object Object]' && Object.keys(value).length === 0) {
        //       continue;
        //     }
        //     const newPrefix = prefix ? `${prefix}[${encodeURIComponent(key)}]` : encodeURIComponent(key);
        //     queryParts.push(this.http_build_query(value, newPrefix));
        //   }
        //   // 处理 true 值
        //   else if (value === true) {
        //     const encodedKey = encodeURIComponent(prefix ? `${prefix}[${encodeURIComponent(key)}]` : encodeURIComponent(key));
        //     queryParts.push(`${encodedKey}=1`);
        //   } 
        //   // 处理 false 值
        //   else if (value === false) {
        //     const encodedKey = encodeURIComponent(prefix ? `${prefix}[${encodeURIComponent(key)}]` : encodeURIComponent(key));
        //     queryParts.push(`${encodedKey}=0`); // 加上等号
        //   }
        //   // 处理 null 值
        //   else if (value === null) {
        //     // 空值直接跳过
        //     continue;
        //     // const encodedKey = encodeURIComponent(prefix ? `${prefix}[${encodeURIComponent(key)}]` : encodeURIComponent(key));
        //     // queryParts.push(`${encodedKey}=`); // 加上等号
        //   }
        //   // 处理普通值
        //   else {
        //     const encodedKey = encodeURIComponent(prefix ? `${prefix}[${encodeURIComponent(key)}]` : encodeURIComponent(key));
        //     const encodedValue = encodeURIComponent(value);
        //     queryParts.push(`${encodedKey}=${encodedValue}`);
        //   }
        // }
        // // for (let i=0; i<queryParts.length; i++) {
        // //     let arr = queryParts[i].split("=")
        // //     if (arr[0] == "country_code") {
        // //         // arr[1] = " " + a
        // //         queryParts[i] = "country_code="+ " "+arr[1].slice(3)
        // //     }
        // // }
        // // console.log("===",queryParts)
        // return queryParts.join('&');

        // let encodeFunc

        // switch (encType) {
        //     case 'PHP_QUERY_RFC3986':
        //     // encodeFunc = rawurlencode
        //     break

        //     case 'PHP_QUERY_RFC1738':
        //     default:
        //     encodeFunc = this.urldecode()
        //     break
        // }

        let _formdata = formdata

        let value
        let key
        const tmp = []

        var _httpBuildQueryHelper = (key, val, argSeparator) => {
            let k
            const tmp = []
            if (val === true) {
            val = '1'
            } else if (val === false) {
            val = '0'
            }
            if (val !== null) {
            if (typeof val === 'object') {
                for (k in val) {
                if (val[k] !== null) {
                    // 判断是否为空数组或空对象
                    if (Array.isArray(val[k]) && val[k].length === 0) {
                    continue;
                    }
                    if (Object.prototype.toString.call(val[k]) === '[object Object]' && Object.keys(val[k]).length === 0) {
                    continue;
                    }
                    tmp.push(_httpBuildQueryHelper(key + '[' + k + ']', val[k], argSeparator))
                }
                }
                return tmp.join(argSeparator)
            } else if (typeof val !== 'function') {
                return this.urlencode(key) + '=' + this.urlencode(val)
            } else {
                throw new Error('There was an error processing for http_build_query().')
            }
            } else {
            return ''
            }
        }

        if (!argSeparator) {
           argSeparator = '&'
        }
        for (key in _formdata) {
            value = _formdata[key]
            if (numericPrefix && !isNaN(key)) {
            key = String(numericPrefix) + key
            }
            const query = _httpBuildQueryHelper(key, value, argSeparator)
            if (query !== '') {
            tmp.push(query)
            }
        }

        return tmp.join(argSeparator)

      }
    
    
    private sortData(data, sortOrder = "asc") {
        const compareFunction = (a, b) => {
          if (a === b) {
            return 0;
          }
          return sortOrder === "desc" ? (a > b ? -1 : 1) : (a < b ? -1 : 1);
        };
      
        if (Array.isArray(data)) {
          return Object.keys(data).sort(compareFunction).map((value) =>{
            value = data[value];
            return typeof value === "object" && value !== null
            ? this.sortData(value, sortOrder)
            : value
          });
        }
      
        if (typeof data === "object" && data !== null) {
          const sortedObject = {};
          const sortedKeys = Object.keys(data).sort(compareFunction);
      
          for (const key of sortedKeys) {
            sortedObject[key] =
              typeof data[key] === "object" && data[key] !== null
                ? this.sortData(data[key], sortOrder)
                : data[key];
          }
      
          return sortedObject;
        }
      
        return data;
    }
}

export class TestFormData {
    private _boundary_key: string = 'testformdata';
    private _boundary: string;
    private _end_boundary: string;
    private _result: string;
    
    constructor() {
        this._boundary = '--' + this._boundary_key;
        this._end_boundary = this._boundary + '--';
        this._result = "";
    }
    
    public append(key: string, value: string,filename?:string) {
        this._result += this._boundary + '\r\n';
        if (filename){
            this._result += 'Content-Disposition: form-data; name="' + key + '"' + '; filename="'+ filename + '"'+'\r\n\r\n';
        }else{
            this._result += 'Content-Disposition: form-data; name="' + key + '"' + '\r\n\r\n';
        }
        
        this._result += value + '\r\n';
    }
    
    public get arrayBuffer(): ArrayBuffer {
        this._result += '\r\n' + this._end_boundary;

        // 使用 TextEncoder 将字符串编码为 UTF-8
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(this._result);

        return encodedData.buffer; // 返回编码后的 ArrayBuffer

        // let charArr: Array<any> = [];

        // for (var i = 0; i < this._result.length; i++) { // 取出文本的charCode（10进制）
        //     charArr.push(this._result.charCodeAt(i));
        // }
    
        // let array: Uint8Array = new Uint8Array(charArr);
        // return array.buffer;
    }
}

export let httpRequest = new HttpRequest()