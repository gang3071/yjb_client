import * as cc from 'cc';
import { TouchUtils } from './util/TouchUtils';
import { AlterTipsWrap } from "./view/AlterTipsWrap"
import { LoadingViewWrap } from './view/LoadingViewWrap';
import { MsgBoxWrap } from './view/MsgBoxWrap';
import { ImgBase64 } from '../../modules/Lobby/ImgBase64';
import { UIMgr } from '../core/UIMgr';
import { UIConfig } from '../../config/UIConfig';
import { audioMgr } from '../../modules/common/AudioMgr';
import { UserInfo } from '../../modules/common/UserInfo';
import { Tools } from './util/Tools';


export class utils {
    static s_serverOffsetTime = 0;

    static setColorAlpha( color : cc.Color, alph : number){
        return cc.color(color.r, color.g, color.b, alph)
    }
    
    static setServerOffsetTime( offset : number){
        this.s_serverOffsetTime = offset;
    }
    
    static server_time(){
        let curtime = utils.time();
        return curtime + this.s_serverOffsetTime;
    }

    static setUILocalZOrder( node : cc.Node, zorder : number){
        node.setSiblingIndex(zorder);
        // let uitransform = node.getComponent(cc.UITransform);
        // cc.assert(uitransform, "can't find UITransform");
        // if(uitransform)
        //     uitransform.priority = zorder;
    }

    static getNodeSize( node : cc.Node ): cc.Size{
        let uitransform = node.getComponent(cc.UITransform);
        if(uitransform == null)
            return cc.size(0, 0);

        return uitransform.contentSize;
    }

    static setNodeSize( node : cc.Node, size : cc.Size){
        let uitransform = node.getComponent(cc.UITransform);
        if(uitransform == null)
            return
        uitransform.contentSize = size;
    }

    static setNodeWidth( node : cc.Node, width : number){
        let uitransform = node.getComponent(cc.UITransform);
        if(uitransform == null)
            return
        uitransform.contentSize = cc.size(width, uitransform.contentSize.height);
    }

    static setNodeHeight( node : cc.Node, height : number){
        let uitransform = node.getComponent(cc.UITransform);
        if(uitransform == null)
            return
        uitransform.contentSize = cc.size(uitransform.contentSize.width, height);
    }

    static setPositionX( node : cc.Node, x : number){
        node.setPosition(x, node.position.y, node.position.z)
    }

    static setPositionY( node : cc.Node, y : number){
        node.setPosition(node.position.x, y, node.position.z)
    }

    static setNodeAnchorPoint( node : cc.Node, anchorPoint : cc.Vec2){
        let uitransform = node.getComponent(cc.UITransform);
        if(uitransform == null)
            return
        uitransform.setAnchorPoint(anchorPoint);
    }

    static convertToNodeSpaceAR(node : cc.Node, worldPoint: cc.Vec3){
        let uitransform = node.getComponent(cc.UITransform);
        if(uitransform == null)
            return cc.v3(0, 0, 0)
        return uitransform.convertToNodeSpaceAR(worldPoint);
    }

    static convertToWorldSpaceAR(node : cc.Node, nodePoint: cc.Vec3){
        let uitransform = node.getComponent(cc.UITransform);
        if(uitransform == null)
            return cc.v3(0, 0, 0)
        return uitransform.convertToWorldSpaceAR(nodePoint);
    }

    static randomInt( min : number, max : number){
        return Math.floor(Math.random() * (max - min + 1) ) + min
    }

    //16进制的颜色0XFFFFFF转换
    static toColor4b(value : number, alpha : number) : cc.Color{
        let b = value % 256
        let temp = Math.floor(value / 256)
        let g = temp % 256
        let r = Math.floor(temp / 256)

        return new cc.Color(r, g, b, alpha || 255)
    }

    static isPhoneNumber(phone : string) : boolean{
        var reg =/^0?1[3|4|5|6|7|8][0-9]\d{8}$/
        return reg.test(phone)
    }

    static isName(name : string) : boolean{
        var reg =/^[\u4E00-\u9FA5]{2,4}$/
        return reg.test(name)
    }

    static isIdNumber(id : string) : boolean {
        var p = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
        var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
        var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
        var code = id.substring(17);
        if(p.test(id)) {
            var sum = 0;
            for(var i = 0; i < 17; i++) {
                let val = Number(id[i]);
                sum += val*factor[i];
            }
            if(parity[sum % 11] == code.toUpperCase()) {
                return true;
            }
        }
        return false;
    }

    static subUtfStr( str : string, index : number, size : number, endStr : string)
    {    
        if (str.length * 2 <= size) {
            return str;
        }
        let sumlen = 0;
        for (let i = 0; i < str.length; i++) {
            sumlen = str.charCodeAt(i) > 128 ? sumlen + 1 : sumlen + 0.5;
        }
    
        let strlen = 0;
        let strText = "";
        let sign = false;
    
        for (let i = 0; i < str.length; i++) {
            strText += str.charAt(i);
            strlen = str.charCodeAt(i) > 128 ? strlen + 1 : strlen + 0.5;
    
            if(index > 0 && strlen >= index && !sign) {
                sign = true;
                index = strText.length;
            }
            if (strlen >= size) {
                return strlen == sumlen ? strText.substring(index, strText.length) : strText.substring(index, strText.length) + endStr;
            }
        }
        return strText;
    }

    static formatUrl2SSLUrl(str_url : string){
        let url = str_url;
        if (typeof url == "string") {
            url = url.replace('http://', 'https://');
        }
        return url;
    }

    static isUrl(str_url : string) : boolean
    {
        var strRegex = "((https|http|ftp|rtsp|mms)?://)"
            + "(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" //ftp的user@
            + "(([0-9]{1,3}\\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
            + "|" // 允许IP和DOMAIN（域名）
            + "([0-9a-z_!~*'()-]+\\.)*" // 域名- www.
            + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\\." // 二级域名
            + "[a-z]{2,6})" // first level domain- .com or .museum
            + "(:[0-9]{1,4})?" // 端口- :80
            + "((/?)|" // a slash isn't required if there is no file name
            + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)";
        var re=new RegExp(strRegex);
        if (re.test(str_url)){
            return true;
        }
        else{
            return false;
        }
    }

    static addClickCallback( widget : cc.Node | cc.Button | null, callback : (...param:any[])=>void){
        TouchUtils.addClickCallback(widget, callback)
    }

    static addClickCallbackFunc(widget : cc.Node | cc.Button | null, owner : Object, funcName : string){
        TouchUtils.addClickCallbackFunc(widget, owner, funcName)
    }

    public static parseGetParams() : Map<string, string>{
        let params = new Map;

        if(window.location)
        {
            let search = location.search;
            if(!search || search == "")
                return params;

            search = search.slice(1);
            let arr = search.split("&");
            for(let i = 0; i < arr.length; i++){
                let item = arr[i];
                let temp = item.split("=");
                params.set(temp[0], temp[1]);
            }
        }

        return params;
    }

    public static getQuery(key : string, def : string)
    {
        if (window.location)
        {
            let search = location.search;
            if (search == "") {
                return def;
            }
            search = search.slice(1);
            let searchArr = search.split("&");
            let length = searchArr.length;
            for (let i = 0; i < length; i++) {
                let str = searchArr[i];
                let arr = str.split("=");
                if (arr[0] == key) {
                    return decodeURIComponent(arr[1]);
                }
            }
        }
        return def;
    }

    
    static getChildByName(node : cc.Node, strName : string) : cc.Node | null
    {
        let arr = strName.split(".")
        let parent : cc.Node | null = node

        for(var i = 0; i < arr.length; i++)
        {
            var curName = arr[i]
            parent = parent.getChildByName(curName);
            if(parent === null){
                return null;
            }
        }
        return parent

    }

    static getChildComponent(node : cc.Node, childname : string, comName : string) : cc.Component | null
    {
        let tempNode = this.getChildByName(node, childname)
        if(tempNode != null){
            return tempNode.getComponent(comName)
        }
        return null;
    }

    private static  s_objectUniquedIdCount = 0;
    static getObjectUniquedId(o : any)
    {
        if ( typeof o.__objectuniqueid == "undefined" ) {
            Object.defineProperty(o, "__objectuniqueid", {
                value: ++this.s_objectUniquedIdCount,
                enumerable: false,
                writable: false
            });
        }
        return o.__objectuniqueid;
    }

    static setObjectUniquedId( o : any, value : number){
        if ( typeof o.__objectuniqueid == "undefined" ) {
            Object.defineProperty(o, "__objectuniqueid", {
                value: value,
                enumerable: false,
                writable: false
            });
        }
        return o.__objectuniqueid;
    }

    static removeSuffix( path : string) : string{
        let idx = path.lastIndexOf(".");
        if(idx != -1){
            return path.substring(0, idx);
        }

        return path;
    }

    static getSuffix( path : string) : string{
        let idx = path.lastIndexOf(".");
        if(idx != -1){
            return path.substr(idx+1);
        }

        return path;
    }

    static clone(Obj : any){
        var buf : any;
        if(Obj instanceof Array){
            buf= new Array;
            var i=Obj.length;
            while(i--){
                buf[i]=this.clone(Obj[i]);
            }
            return buf;
        }
        else if( Obj instanceof Map){
            buf = new Map;
            Obj.forEach((v, k)=>{
                buf.set(k, v )
            })
            return buf;
        }
        else if(Obj instanceof Object){
            buf={};
            for(var k in Obj){
                buf[k]=this.clone(Obj[k]);
            }
            return buf;
        }else{
            return Obj;
        }
    }

    public static formatStr(str : string,  ...args: any) : string {
        var result = str;
        if (args.length > 0) {
            if (args.length == 1 && typeof (args[0]) == "object") {
                let obj = args[0];
                for (var key in obj) {
                    
                    let value = obj[key];
                    if(typeof(value) == "string")
                        value = value.toString();

                    if(obj[key]!=undefined){
                        var reg = new RegExp("({" + key + "})", "g");
                        result = result.replace(reg, value);
                    }
                }
            }
            else {
                for (var i = 0; i < args.length; i++) {
                    if (args[i] != undefined) {
                        var reg= new RegExp("({)" + i + "(})", "g");
                        let value = args[i];
                        if(typeof(value) == "string")
                            value = value.toString();
                        result = result.replace(reg, value);
                    }
                }
            }
        }
        return result;
    }
    
    public static getRotation( direct : cc.Vec2 ) : number{
        direct.normalize();

        let x = direct.x;
        let y = direct.y;   
        if(y == 0){
            if(x > 0) return 0;
            if(x < 0) return 180;
        }

        if(x == 0){
            if(y > 0) return 90;
            if(y < 0) return 270;
        }

        if( y > 0 && x < 0){
           return 180 - Math.asin(y)*180/Math.PI;
        }else if( y > 0 && x > 0){
            return Math.asin(y)*180/Math.PI;
        }
        else if( y < 0 && x < 0){
           return 180 + Math.asin(-1*y)*180/Math.PI;
        }
        else if( y < 0 && x > 0){
            return 360 - Math.asin(-1*y)*180/Math.PI;
        }

        return 0;
    }

    public static time():number{
        let date = new Date();
        return Math.floor(date.getTime()/1000);
    }

    public static timeus():number{
        let date = new Date();
        return date.getTime();
    }

    public static get AlertTips(){
        return AlterTipsWrap;
    }

    public static get MsgBox(){
        return MsgBoxWrap;
    }

    public static get LoadingView(){
        return LoadingViewWrap;
    }

    public static changeNodeLayer( node : cc.Node, layer :number){
        node.layer = layer;
        node.children.forEach(( chNode : cc.Node)=>{
            utils.changeNodeLayer(chNode, layer);
        })
    }

    //返回 0 代表版本相等  > 0 代表 versionA > versionB  否则代表 versionA < versionB
    public static versionCmp( versionA : string, versionB : string) : number{
        let vA = versionA.split(".");
        let vB = versionB.split(".");

        for(let i = 0; i < vA.length; i++){
            let a = parseInt(vA[i]);
            let b = parseInt(vB[i] || "0");

            if( a === b){
                continue
            }else{
                return a - b;
            }
        }

        if(vB.length > vA.length){
            return -1;
        }else{
            return 0;
        }
    }

    public static getIDCardAge( idcard : string){
        if(idcard == "") return 0;

        let birthtime = idcard.substr(6, 8);
        let year = parseInt(birthtime.substr(0, 4));
        let month = parseInt(birthtime.substr(2, 2));
        let day = parseInt(birthtime.substr(4, 2));

        let date = new Date();

        let age = date.getFullYear() - year;

        if(date.getMonth() > month){
            age++;
        }

        return age;
    }

    

    public static _stringToArray (string: string) {
        // 用于判断emoji的正则们
        var rsAstralRange = '\\ud800-\\udfff';
        var rsZWJ = '\\u200d';
        var rsVarRange = '\\ufe0e\\ufe0f';
        var rsComboMarksRange = '\\u0300-\\u036f';
        var reComboHalfMarksRange = '\\ufe20-\\ufe2f';
        var rsComboSymbolsRange = '\\u20d0-\\u20ff';
        var rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;
        var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + ']');

        var rsFitz = '\\ud83c[\\udffb-\\udfff]';
        var rsOptVar = '[' + rsVarRange + ']?';
        var rsCombo = '[' + rsComboRange + ']';
        var rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')';
        var reOptMod = rsModifier + '?';
        var rsAstral = '[' + rsAstralRange + ']';
        var rsNonAstral = '[^' + rsAstralRange + ']';
        var rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}';
        var rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]';
        var rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*';
        var rsSeq = rsOptVar + reOptMod + rsOptJoin;
        var rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';
        var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

        var hasUnicode = function (val: any) {
            return reHasUnicode.test(val);
        };

        var unicodeToArray = function (val: any) {
            return val.match(reUnicode) || [];
        };

        var asciiToArray = function (val: any) {
            return val.split('');
        };

        return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
    }

    /**
     * 格式化名字，XXX...
     * @param {string} name 需要格式化的字符串 
     * @param {number}limit 
     * @returns {string} 返回格式化后的字符串XXX...
     */
     public static formatName (name: string, limit: number) {
        limit = limit || 6;
        var nameArray = this._stringToArray(name);
        var str = '';
        var length = nameArray.length;
        if (length > limit) {
            for (var i = 0; i < limit; i++) {
                str += nameArray[i];
            }

            str += '...';
        } else {
            str = name;
        }

        return str;
    }

        /**
     * 获取字符串长度
     * @param {string} render 
     * @returns 
     */
    public static getStringLength (render: string) {
        let strArr: string = render;
        let len: number = 0;
        for (let i: number = 0, n = strArr.length; i < n; i++) {
            let val: number = strArr.charCodeAt(i);
            if (val <= 255) {
                len = len + 1;
            } else {
                len = len + 2;
            }
        }

        return Math.ceil(len / 2);
    }

        /**
     * 判断是否是新的一天
     * @param {Object|Number} dateValue 时间对象 todo MessageCenter 与 pve 相关的时间存储建议改为 Date 类型
     * @returns {boolean}
     */
    public static isNewDay (dateValue: Date | number | string) {
        // todo：是否需要判断时区？
        var oldDate: any = new Date(dateValue);
        var curDate: any = new Date();

        //@ts-ignore
        var oldYear = oldDate.getYear();
        var oldMonth = oldDate.getMonth();
        var oldDay = oldDate.getDate();
        //@ts-ignore
        var curYear = curDate.getYear();
        var curMonth = curDate.getMonth();
        var curDay = curDate.getDate();

        if (curYear > oldYear) {
            return true;
        } else {
            if (curMonth > oldMonth) {
                return true;
            } else {
                if (curDay > oldDay) {
                    return true;
                }
            }
        }

        return false;
    }

        /**
     * 判断当前时间是否在有效时间内
     * @param {String|Number} start 起始时间。带有时区信息
     * @param {String|Number} end 结束时间。带有时区信息
     */
    public static isNowValid (start: string | number | Date, end: string | number | Date) {
        var startTime = new Date(start);
        var endTime = new Date(end);
        var result = false;

        if (startTime.getDate() + '' !== 'NaN' && endTime.getDate() + '' !== 'NaN') {
            var curDate = new Date();
            result = curDate < endTime && curDate > startTime;
        }

        return result;
    }

    /**
     * 返回相隔天数
     * @param start 
     * @param end 
     * @returns 
    */
    public static getDeltaDays (start: Date | number | string, end: Date | number | string) {
        start = new Date(start);
        end = new Date(end);

        let startYear: number= start.getFullYear();
        let startMonth: number= start.getMonth() + 1;
        let startDate: number= start.getDate();
        let endYear: number= end.getFullYear();
        let endMonth: number= end.getMonth() + 1;
        let endDate: number= end.getDate();

        start = new Date(startYear + '/' + startMonth + '/' + startDate + ' GMT+0800').getTime();
        end = new Date(endYear + '/' + endMonth + '/' + endDate + ' GMT+0800').getTime();

        let deltaTime = end - start;
        return Math.floor(deltaTime / (24 * 60 * 60 * 1000));
    }

    /**
     * 用于数值到达另外一个目标数值之间进行平滑过渡运动效果
     * @param {number} targetValue 目标数值 
     * @param {number} curValue 当前数值
     * @param {number} ratio    过渡比率
     * @returns 
    */
    public static lerp (targetValue: number, curValue: number, ratio: number = 0.25) {
        let v: number = curValue;
        if (targetValue > curValue) {
            v = curValue + (targetValue - curValue) * ratio;
        } else if (targetValue < curValue) {
            v = curValue - (curValue - targetValue) * ratio;
        }

        return v;
    }

    public static sliceStr (str:string) {
        if (8 < str.length) {
            return str.slice(0,8) + "..."
        }
        return str
    }

    /**
     * 获取指定长度随机字符串
     */
    public static getRandomStr (len:number) {
        let chars =
          'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz' 
        let maxPos = chars.length
        let pwd = ''
        for (let i = 0; i < len; i++) {
          pwd += chars.charAt(Math.floor(Math.random() * maxPos))
        }
        return pwd
    }

    public static sha256(s) {
        const chrsz = 8
        const hexcase = 0
    
        function safe_add(x, y) {
            const lsw = (x & 0xFFFF) + (y & 0xFFFF)
            const msw = (x >> 16) + (y >> 16) + (lsw >> 16)
            return (msw << 16) | (lsw & 0xFFFF)
        }
    
        function S(X, n) {
            return (X >>> n) | (X << (32 - n))
        }
    
        function R(X, n) {
            return (X >>> n)
        }
    
        function Ch(x, y, z) {
            return ((x & y) ^ ((~x) & z))
        }
    
        function Maj(x, y, z) {
            return ((x & y) ^ (x & z) ^ (y & z))
        }
    
        function Sigma0256(x) {
            return (S(x, 2) ^ S(x, 13) ^ S(x, 22))
        }
    
        function Sigma1256(x) {
            return (S(x, 6) ^ S(x, 11) ^ S(x, 25))
        }
    
        function Gamma0256(x) {
            return (S(x, 7) ^ S(x, 18) ^ R(x, 3))
        }
    
        function Gamma1256(x) {
            return (S(x, 17) ^ S(x, 19) ^ R(x, 10))
        }
    
        function core_sha256(m, l) {
            const K = [0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2]
            const HASH = [0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19]
            const W = new Array(64)
            let a, b, c, d, e, f, g, h, i, j
            let T1, T2
            m[l >> 5] |= 0x80 << (24 - l % 32)
            m[((l + 64 >> 9) << 4) + 15] = l
            for (i = 0; i < m.length; i += 16) {
                a = HASH[0]
                b = HASH[1]
                c = HASH[2]
                d = HASH[3]
                e = HASH[4]
                f = HASH[5]
                g = HASH[6]
                h = HASH[7]
                for (j = 0; j < 64; j++) {
                    if (j < 16) {
                        W[j] = m[j + i]
                    } else {
                        W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16])
                    }
                    T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j])
                    T2 = safe_add(Sigma0256(a), Maj(a, b, c))
                    h = g
                    g = f
                    f = e
                    e = safe_add(d, T1)
                    d = c
                    c = b
                    b = a
                    a = safe_add(T1, T2)
                }
                HASH[0] = safe_add(a, HASH[0])
                HASH[1] = safe_add(b, HASH[1])
                HASH[2] = safe_add(c, HASH[2])
                HASH[3] = safe_add(d, HASH[3])
                HASH[4] = safe_add(e, HASH[4])
                HASH[5] = safe_add(f, HASH[5])
                HASH[6] = safe_add(g, HASH[6])
                HASH[7] = safe_add(h, HASH[7])
            }
            return HASH
        }
    
        function str2binb(str) {
            const bin = []
            const mask = (1 << chrsz) - 1
            for (let i = 0; i < str.length * chrsz; i += chrsz) {
                bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i % 32)
            }
            return bin
        }
    
        function Utf8Encode(string) {
            string = string.replace(/\r\n/g, '\n')
            let utfText = ''
            for (let n = 0; n < string.length; n++) {
                const c = string.charCodeAt(n)
                if (c < 128) {
                    utfText += String.fromCharCode(c)
                } else if ((c > 127) && (c < 2048)) {
                    utfText += String.fromCharCode((c >> 6) | 192)
                    utfText += String.fromCharCode((c & 63) | 128)
                } else {
                    utfText += String.fromCharCode((c >> 12) | 224)
                    utfText += String.fromCharCode(((c >> 6) & 63) | 128)
                    utfText += String.fromCharCode((c & 63) | 128)
                }
            }
            return utfText
        }
    
        function binb2hex(binarray) {
            const hex_tab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef'
            let str = ''
            for (let i = 0; i < binarray.length * 4; i++) {
                str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) +
                    hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF)
            }
            return str
        }
        s = Utf8Encode(s)
        return binb2hex(core_sha256(str2binb(s), s.length * chrsz))
    }

    public static keepTwoDecimalStr (num: number) {
        // return num
        const result = Number(num.toString().match(/^\d+(?:\.\d{0,2})?/));
        let s = result.toString();
        let rs = s.indexOf('.');
        if (rs < 0) {
          rs = s.length;
          s += '.';
        }
        while (s.length <= rs + 2) {
          s += '0';
        }
        return s;
    };

    public static backExit (machineId:number) {
        console.log("===windows==", machineId)
        UserInfo.closeGameSocket(machineId)
        if (-1 == machineId) {
            let videoElementArr = document.querySelectorAll("video")
            for (let i=0; i<videoElementArr.length; i++) {
                let arr2 = (videoElementArr[i].id).split("_")
                let videoId = Number(arr2[1])
                this.removeVideo(videoId)
            }
            return
        }
        this.removeVideo(machineId)
    }

    public static removeVideo(id){
        //@ts-ignore
        if (window["closeWebRTCVideo_"+id]) {
          //@ts-ignore
          window["closeWebRTCVideo_"+id]()
        }

  
        if (document.getElementById("videoScript_"+id)) {
            document.getElementById("videoScript_"+id).remove()
        }
      
        if (document.getElementById("video_"+id)) {
            document.getElementById("video_"+id).remove()
        }
    }

    //将秒数转换为小时、分钟和秒的格式
    public static secondsToHMS (seconds:number) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        let padNumber = (num: number) => {
            return num < 10 ? `0${num}` : `${num}`
        }

        // 格式化输出，确保每部分都是两位数字
        const formattedHours = padNumber(hours);
        const formattedMinutes = padNumber(minutes);
        const formattedSeconds = padNumber(remainingSeconds);

        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }

    //H横屏  V竖屏
    public static setOrientation (dir:string) {

        let frameSize = cc.screen.windowSize;
        
        // return
        if (dir == 'V') {
            // cc.director.getScene().getChildByName("Canvas").getChildByName("Camera").angle = 0
            cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT)
            if (frameSize.width > frameSize.height)
                cc.screen.windowSize = new cc.Size(frameSize.height, frameSize.width)
            // this.canvas.designResolution = new Size(720,1280)
            cc.view.setDesignResolutionSize(1080, 1920, cc.ResolutionPolicy.SHOW_ALL)
        }
        else {
            // cc.director.getScene().getChildByName("Canvas").getChildByName("Camera").angle = 90
            cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE)
            if (frameSize.height > frameSize.width)
                cc.screen.windowSize = new cc.Size(frameSize.height, frameSize.width)
            // this.canvas.designResolution =  new Size(1280,720)
            cc.view.setDesignResolutionSize(1920, 1080, cc.ResolutionPolicy.SHOW_ALL);
        }
        setTimeout(() => {
            frameSize = cc.screen.windowSize;
            console.log('frameSize: ' + frameSize.width + '   ' + frameSize.height)
            window.dispatchEvent(new Event('resize'))
        }, 300);
    }


    public static createGameRule (url:string) {

    }
    

    public static createVideo (machineId:number) {
        // 特殊原因，暂时特殊处理
        document.getElementById("videoPosition_1").appendChild(document.getElementById("videoParent"))
        let testVideo = document.createElement("video");
        testVideo.style.opacity = "none"
        testVideo.style.width = "100"
        testVideo.style.height = "100"
        testVideo.style.position = "absolute"
        // testVideo.style.top = "0"
        // testVideo.style.left = "0"
        testVideo.style.overflow = "hidden"
        testVideo.style.height = "100% !important"
        testVideo.style.width = "100% !important"
        testVideo.style.display = "no"
        // testVideo.id = "video_"+machineId
        testVideo.id = "video_"+machineId
        testVideo.muted = true
        testVideo.autoplay = true
        testVideo.controls = true
        testVideo.playsInline = true
        
        // document.getElementById("GameCanvas").appendChild(testVideo)
        document.getElementById("videoParent").appendChild(testVideo)
        
        // document.body.appendChild(testVideo)
    }

    public static createKeFu (url:string) {

        // 创建一个新的div元素
        const newDiv = document.createElement('div');
    
        // 创建一个新的 iframe 元素
        const newIframe = document.createElement('iframe');
        // 设置 iframe 的属性
        newIframe.src = url; // 设置 iframe 的 URL
        newIframe.style.width = '100%';
        newIframe.style.height = '100%';
        newIframe.style.border = 'none';
    
        // 将 iframe 添加到 div 中
        newDiv.appendChild(newIframe);
    
        // 设置div的属性和内容
        newDiv.id = 'kefu';
        newDiv.style.display = "flex";
        newDiv.style.justifyContent = "center";
        newDiv.style.alignItems = "center";
        newDiv.style.position = "fixed";
        newDiv.style.top = "0";
        newDiv.style.left = "0";
        newDiv.style.width = "100%";
        newDiv.style.height = "100%";
        newDiv.style.zIndex = "1000";
        // newDiv.textContent = '这是一个动态创建的div';
    
        // 将新创建的div添加到body中，或者添加到页面的其他元素中
        document.body.appendChild(newDiv);
    
    
        var element = document.getElementById('close-img');
        if (element) {
            element.parentNode.removeChild(element);
        }



        var img=document.createElement("img");
        img.id = "close-img"
        img.src=ImgBase64.gameRuleBtn;
    
        img.style.position = "absolute"
        img.style.top = "10px"
        img.style.right = "10px"
        img.style.width = "30px"
        img.style.height = "30px"
        img.style.zIndex = "1001";
    
        newDiv.appendChild(img);
    
        // 将按钮添加到文档中
        // document.body.appendChild(button);
    
        // 可选：添加点击事件
        img.addEventListener('click', () => {
            UIMgr.getInstance().closeView(UIConfig.GameViewBG.path)
            LoadingViewWrap.close()
            parent.postMessage("cocos-close", "*")
            var element = document.getElementById('kefu');
            if (element) {
                element.parentNode.removeChild(element);
            }
        });
    
    }

    public static createGameView (url:string) {
        cc.director.pause()
        // 创建一个新的div元素
        const newDiv = document.createElement('div');
    
        // 创建一个新的 iframe 元素
        const newIframe = document.createElement('iframe');
        // 设置 iframe 的属性
        newIframe.src = url; // 设置 iframe 的 URL
        newIframe.style.width = '100%';
        newIframe.style.height = '100%';
        newIframe.style.border = 'none';
    
        // 将 iframe 添加到 div 中
        newDiv.appendChild(newIframe);
    
        // 设置div的属性和内容
        newDiv.id = 'gameview';
        newDiv.style.display = "flex";
        newDiv.style.justifyContent = "center";
        newDiv.style.alignItems = "center";
        newDiv.style.position = "fixed";
        newDiv.style.top = "0";
        newDiv.style.left = "0";
        newDiv.style.width = "100%";
        newDiv.style.height = "100%";
        newDiv.style.zIndex = "1000";
        // newDiv.textContent = '这是一个动态创建的div';
    
        // 将新创建的div添加到body中，或者添加到页面的其他元素中
        document.body.appendChild(newDiv);
    
    
        var element = document.getElementById('close-img');
        if (element) {
            element.parentNode.removeChild(element);
        }
        var img=document.createElement("img");
        img.id = "close-img"
        img.src=ImgBase64.exit;
    
        img.style.position = "absolute"
        img.style.top = "10px"
        img.style.right = "10px"
        img.style.width = "30px"
        img.style.height = "30px"
        img.style.zIndex = "1001";
    
        newDiv.appendChild(img);
    
        // 将按钮添加到文档中
        // document.body.appendChild(button);
    
        // 可选：添加点击事件
        img.addEventListener('click', () => {
            UIMgr.getInstance().closeView(UIConfig.GameViewBG.path)
            cc.director.resume()
            LoadingViewWrap.close()
            parent.postMessage("cocos-close", "*")
            Tools.httpReq("exit-game", {}, () => {})
            //audioMgr.replayMusic()
            var element = document.getElementById('gameview');
            if (element) {
                element.parentNode.removeChild(element);
            }
        });
    
    }
    
    public static createScrit (ip:string,streamId:string,machineId:number) {
        let videoId = "video_"+ machineId
        let testScript = document.createElement("script");
        testScript.id = "videoScript_"+machineId
        testScript.type = "module"
        testScript.textContent = `
        import { WebRTCAdaptor } from "./js/webrtc_adaptor.js"
        import { getUrlParameter, isMobile, tryToPlay, tryToVODPlay } from "./js/fetch.stream.js";
        
        var playOrder = getUrlParameter("playOrder");
        if (playOrder == null) {
            playOrder = ["webrtc", "hls"];
        }
        else {
            playOrder = playOrder.split(',');
        }
        //make play order global to let the other module access it
        window.playOrder = playOrder;
        
        var head = document.getElementsByTagName('head')[0];
        if (playOrder.includes("hls") || playOrder.includes("vod")) {
            //include videojs -> js
      
            var js = document.createElement("script");
            js.type = "text/javascript";
            js.src = "js/external/video.js"; //   js/external/video.js
            head.appendChild(js);
      
            //include videojs -> css
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "css/external/video-js.css";
            head.appendChild(link);
      
            // These files should call after videojs file loaded completely
            js.onload = function() {
                
                var videoJsQualityLevel = document.createElement("script");
                videoJsQualityLevel.type = "text/javascript";
                videoJsQualityLevel.src = "js/external/videojs-contrib-quality-levels.min.js";
                head.appendChild(videoJsQualityLevel);
      
                var videoJsQualitySelector = document.createElement("script");
                videoJsQualitySelector.type = "text/javascript";
                videoJsQualitySelector.src = "js/external/videojs-hls-quality-selector.min.js";
                head.appendChild(videoJsQualitySelector);
      
            }
      
        }
      
        if (playOrder.includes("dash")) 
        {
            var js = document.createElement("script");
            js.type = "text/javascript";
            js.src = "js/external/dash.all.min.js";
            head.appendChild(js);
        }
      
        // var is360 = getUrlParameter("is360");
        // if (is360 == "true") {
        //     var hlsJS = document.createElement("script");
        //     hlsJS.type = "text/javascript";
        //     hlsJS.src = "js/external/hls.js";
        //     head.appendChild(hlsJS);
            
        //     var aframeJS = document.createElement("script");
        //     aframeJS.type = "text/javascript";
        //     aframeJS.src = "js/external/aframe.min.js";
      
        //     aframeJS.onload = function() {
        //         var aScene = document.createElement("a-scene");
        //         aScene.innerHTML = "<a-videosphere src=\"#remoteVideo\" rotation=\"0 90 0\" style=\"background-color: antiquewhite\"></a-videosphere>";
        //         var body = document.getElementsByTagName('body')[0];
        //         body.appendChild(aScene);
        //     }
        //     head.appendChild(aframeJS);
            
      
        //     is360 = true;
        // }
        // else {
        //     is360 = false;
        // }
        var is360 = false
        window.is360 = is360;
        
        var handleConnectivityCallDateTimeMs = 0;
      
      
        // var streamId = getUrlParameter("id");
        // if (streamId == null) {
        //     //check name variable for compatibility with older versions
        //     streamId = getUrlParameter("name");
        // }
        // streamId = "98VXBOaNaxmr1684838896694";
        var streamId = '${streamId}'
        var playType = getUrlParameter("playType");
        if (playType == null || playType == "mp4,webm") {
            playType = ["mp4", "webm"];
        }
        else if (playType == "webm,mp4") {
            playType = ["webm", "mp4"];
        }
        else if (playType == "mp4") {
            playType = ["mp4"];
        }
        else if (playType == "webm") {
            playType = ["webm"];
        }
        else if (playType == "mov") {
            playType = ["mov"];
        }
      
        var token = getUrlParameter("token");
        var pAutoplay = getUrlParameter("autoplay");
        var autoPlay = true;
        if (pAutoplay == "false" || isMobile()) {
            autoPlay = false;
        }
        var mute = getUrlParameter("mute");
        if (mute == "true" || mute == null) {
            mute = true;
        }
        else {
            mute = false;
        }
      
        var targetLatency = getUrlParameter("targetLatency");
        if (targetLatency == "null") {
            targetLatency = 3;
        }
      
        var hlsExtension = "m3u8";
        var dashExtension = "mpd";
        var subscriberId = getUrlParameter("subscriberId");
        var subscriberCode = getUrlParameter("subscriberCode");
      
        var unMuteButton = document.getElementById("unmuteButton");
        // var placeHolder = document.getElementById("video_info");
        var player = document.getElementById('${videoId}');
      
        var iceConnected = false;
      
      
        //This function creates a-scene elements only if is360 parameter is true.
        //This makes a-scene doesn't run in the background if it is not needed.
        function createVrVideo() {
            var vrScene = document.createElement("a-scene");
            vrScene.style.display = "none";
            vrScene.innerHTML = '<a-videosphere  style="background-color: antiquewhite"></a-videosphere>';
            var remoteVideoNode = document.getElementById('${videoId}');
            remoteVideoNode.parentNode.insertBefore(vrScene, remoteVideoNode.nextSibling);
        }
      
        // This function mutes or unmutes the 360 video stream.
        // This is necessary because the browser doesn't allow videos to be played automatically and unmuted by default.
        // Exceptions are possible: https://developers.google.com/web/updates/2017/09/autoplay-policy-changes
        function changeVideoMuteStatus() {
            // Checks the current "mute" status of the video
            if (player.muted) {
                // Unmute the video and change the button's text
                player.muted = false;
                document.getElementById("unmuteButton").innerText = "Mute";
            }
            else {
                player.muted = true;
                document.getElementById("unmuteButton").innerText = "Unmute";
            }
        }
      
        var webRTCAdaptor = null;
    
        var streamsFolder = "streams";
      
        function genericCallback(currentTech) {
      
            // placeHolder.innerHTML = "Stream will start playing automatically<br/>when it is live";
            setTimeout(function () {

                if (webRTCAdaptor == null) {
                    initializeWebRTCPlayer(streamId, token, webrtcNoStreamCallback);
                }
                else {
                    webRTCAdaptor.getStreamInfo(streamId);
                }
                return
                var index = playOrder.indexOf(currentTech);
      
                if (currentTech == "webrtc") {
                    if (!iceConnected) {
                        if (index == -1 || index == (playOrder.length - 1)) {
                            index = 0;
                        }
                        else {
                            index++;
                        }
                    }
                }
                else {
                    if (index == -1 || index == (playOrder.length - 1)) {
                        index = 0;
                    }
                    else {
                        index++;
                    }
                }
      
                var tech = playOrder[index];
      
                if (tech == "webrtc") {
                    // It means there is no HLS stream, so try to play WebRTC stream
                    if (webRTCAdaptor == null) {
                        initializeWebRTCPlayer(streamId, token, webrtcNoStreamCallback);
                    }
                    else {
                        webRTCAdaptor.getStreamInfo(streamId);
                    }
                }
                else if (tech == "hls") {
                    tryToPlay(streamId, token, hlsExtension, subscriberId, subscriberCode, hlsNoStreamCallback);
                }
                else if (tech == "dash") {
                    var dashFile = streamId + "/" + streamId;
                    tryToPlay(dashFile, token, dashExtension, subscriberId, subscriberCode, dashNoStreamCallback);
                }
            }, 3000);
        }
      
        function webrtcNoStreamCallback() {
            /**
         * If HLS is in the play order then try to play HLS, if not wait for WebRTC stream
         * In some cases user may want to remove HLS from the order and force to play WebRTC only
         * in these cases player only waits for WebRTC streams
         */
            genericCallback("webrtc");
        }
      
        function hlsNoStreamCallback() {
            genericCallback("hls");
        }
      
        function vodNoStreamCallback() {
            // placeHolder.innerHTML = "Stream will start playing automatically<br/>when it is live";
            setTimeout(function () {
                if (playOrder.includes("vod")) {
                    tryToVODPlay(streamId, token, subscriberId, subscriberCode, vodNoStreamCallback, playType);
                }
            }, 3000);
      
        }
      
        function dashNoStreamCallback() {
            genericCallback("dash");
        }
      
        function setHLSElementsVisibility(show) {
            // document.getElementById("video_container").style.display = show == true ? "block" : "none";
        }
      
        function hideWebRTCElements() {
            setWebRTCElementsVisibility(false);
            document.getElementById("play_button").style.display = "none";
        }
      
        function setWebRTCElementsVisibility(show) {
            if (document.getElementById('${videoId}')) {
                document.getElementById('${videoId}').style.display = show == true ? "block" : "none";
            }
        }
      
        function setPlaceHolderVisibility(show) {
            // placeHolder.style.display = show == true ? "block" : "none";
        }
      
        function show360ElementsVisibility() {
            unMuteButton.style.display = "block";
        }
      
        function playWebRTCVideo() {
            setWebRTCElementsVisibility(true);
      
            if (is360) {
                unMuteButton.style.display = "block";
            }
      
            if (mute) {
                document.getElementById('${videoId}').muted = true;
                unMuteButton.innerText = "Unmute";
            }
            else {
                document.getElementById('${videoId}').muted = false;
                unMuteButton.innerText = "Mute";
            }
            if (autoPlay) {
                document.getElementById('${videoId}').play().then(function (value) {
                    //autoplay started
                    document.getElementById("play_button").style.display = "none";
      
                }).catch(function (error) {
                    document.getElementById("play_button").style.display = "block";
                    console.log("User interaction needed to start playing");
                });
            }
        }
      
      
        function initializePlayer(streamId, extension, token, subscriberId, subscriberCode) {
            hideWebRTCElements();
            startPlayer(streamId, extension, token, subscriberId, subscriberCode)
        }
    
        function closeWebRTCVideo () {
          console.log("==closeWebRTCVideo==",streamId,webRTCAdaptor)
          webRTCAdaptor.leave(streamId)
          webRTCAdaptor.closeWebSocket()
        }
      
        window.initializePlayer = initializePlayer
        window.playWebRTCVideo = playWebRTCVideo
        window['changeVideoMuteStatus_'+'${machineId}'] = changeVideoMuteStatus
        window['closeWebRTCVideo_'+'${machineId}'] = closeWebRTCVideo
      
        function startPlayer(streamId, extension, token, subscriberId, subscriberCode) {
      
            var errorCalled = false;
            var type;
            var liveStream = false;
            if (extension == "mp4") {
                type = "video/mp4";
                liveStream = false;
            }
            else if (extension == "webm") {
                type = "video/webm";
                liveStream = false;
            }
            else if (extension == "mov") {
                type = "video/mp4";
                alert("Browsers do not support to play mov format");
                liveStream = false;
            }
            else if (extension == "avi") {
                type = "video/mp4";
                alert("Browsers do not support to play avi format");
                liveStream = false;
            }
            else if (extension == "m3u8") {
                type = "application/x-mpegURL";
                liveStream = true;
            }
            else if (extension == "mpd") {
                type = "application/dash+xml";
                liveStream = true;
            }
            else {
                console.log("Unknown extension: " + extension);
                return;
            }
      
            var preview = streamId;
            if (streamId.endsWith("_adaptive")) {
                preview = streamId.substring(0, streamId.indexOf("_adaptive"));
            }
      
            var player = document.getElementById('${videoId}');
      
            if (!is360) {
                // If it's not dash, play with videojs
                if (extension != dashExtension) {
      
                    player = videojs('video-player', {
                        poster: "previews/" + preview + ".png",
                        liveui: true,
                        liveTracker: {
                            trackingThreshold: 0
                        },
                        html5: {
                        vhs: {
                                  limitRenditionByPlayerDimensions: false
                            }
                        }
                    });
      
                    player.on('error', function (e) {
                        console.log("There is an error with chunks");
                        // We need to add this kind of check. If we don't add this kind of checkpoint, it will create an infinite loop
                        if(!errorCalled){
                             setTimeout(() => {
                                errorCalled = true;
                                 tryToPlay(streamId, token, extension, subscriberId, subscriberCode, hlsNoStreamCallback);
                            }, 2500)
                        }
                    })
      
                    videojs.Hls.xhr.beforeRequest = function (options) {
                        options.uri = options.uri + "?token=" + token + "&subscriberId=" + subscriberId + "&subscriberCode=" + subscriberCode;
                        return options;
                    };
      
                    player.src({
                        src: "streams/" + streamId + "." + extension,
                        type: type,
                        withCredentials: true,
                    });
            
      
                    player.poster("previews/" + preview + ".png");
      
                    if (mute) {
                        player.muted(true);
                    }
                    else {
                        player.muted(false);
                    }
      
                    if (autoPlay) {
                        player.ready(function () {
                            // If it's already added to player, no need to add again
                            if(typeof player.hlsQualitySelector === "function"){
                                player.hlsQualitySelector({
                                      displayCurrentQuality: true,
                                  });
                            }
      
                            // If there is no adaptive option in m3u8 no need to show quality selector
                              let qualityLevels = player.qualityLevels();
                            qualityLevels.on('addqualitylevel', function (event) {
                            let qualityLevel = event.qualityLevel;
                            if (qualityLevel.height) {
                                qualityLevel.enabled = true;
                            } else {
                                qualityLevels.removeQualityLevel(qualityLevel);
                                qualityLevel.enabled = false;
                            }
                            });
      
                            player.play();
                        });
                    }
                }
                else {
                    player = dashjs.MediaPlayer().create();
      
                    player.updateSettings({ 'streaming': { 'lowLatencyEnabled': true } });
      
                    player.updateSettings({
                        'streaming': {
                            'liveDelay': targetLatency,
                            'liveCatchUpMinDrift': 0.05,
                            'liveCatchUpPlaybackRate': 0.5,
                            "liveCatchupLatencyThreshold": 30,
                        }
                    });
      
                    player.initialize(document.querySelector("#video-player"), "streams/" + streamId + "." + extension + "?token=" + token, false);
      
                    if (mute) {
                        player.setMute(true);
                    }
                    else {
                        player.setMute(false);
                    }
      
                    if (autoPlay && player.isReady()) {
                        player.play();
                    }
      
                    setInterval(function () {
                        console.log("live latency: " + player.getCurrentLiveLatency());
                    }, 2000);
                }
            }
            else {
                show360ElementsVisibility();
                if (extension == hlsExtension) {
      
                    // We need to call again due to creating 360 video elements
                    player = document.getElementById('${videoId}');
      
                    if (mute) {
                        player.muted = true;
                    }
                    else {
                        player.muted = false;
                    }
      
                    var hls = new Hls({
                        debug: false
                    });
      
                    hls.loadSource("streams/" + streamId + "." + extension + "?token=" + token + "&subscriberId=" + subscriberId + "&subscriberCode=" + subscriberCode);
                    hls.attachMedia(player);
                    hls.on(Hls.Events.MEDIA_ATTACHED, function () {
                        player.play();
                    });
      
                    hls.on(Hls.Events.ERROR, function (event, data) {
                        if (data.fatal) {
                            console.log("There is an error with chunks");
                            tryToPlay(streamId, token, extension, subscriberId, subscriberCode, hlsNoStreamCallback);
                        }
                    });
                }
                else {
                    // We need to call again due to creating 360 video elements
                    player = document.getElementById('${videoId}');
      
                    player.src = "streams/" + streamId + "." + extension + "?token=" + token + "&subscriberId=" + subscriberId + "&subscriberCode=" + subscriberCode;
      
                    if (mute) {
                        player.muted = true;
                    }
                    else {
                        player.muted = false;
                    }
      
                    if (autoPlay) {
                        player.play();
                    }
                }
      
                if (autoPlay) {
                    document.getElementById('${videoId}').play().then(function (value) {
                        //autoplay started
                        document.getElementById("play_button").style.display = "none";
                        unMuteButton.innerText = "Unmute";
                    }).catch(function (error) {
                        unMuteButton.innerText = "Mute";
                        document.getElementById("play_button").style.display = "block";
                        console.log("User interaction needed to start playing");
                    });
                }
            }
      
      
            if (!is360) {
                setHLSElementsVisibility(true);
                setWebRTCElementsVisibility(false);
                if (typeof player.ready != "undefined") {
                    player.ready(function () {
                        var player = this;
                        player.on('ended', function () {
                            console.log("is360: " + is360 + " Playing has been finished");
                            hideWebRTCElements();
                            setHLSElementsVisibility(false);
                            setPlaceHolderVisibility(true);
                            tryToPlay(streamId, token, extension, subscriberId, subscriberCode, hlsNoStreamCallback);
                        });
                    });
                }
      
            }
            else if (is360) {
                setHLSElementsVisibility(false);
                player.addEventListener("ended", (e) => {
                    console.log("is360: " + is360 + " Playing has been finished");
                    hideWebRTCElements();
                    setHLSElementsVisibility(false);
                    setPlaceHolderVisibility(true);
                    tryToPlay(streamId, token, extension, subscriberId, subscriberCode, hlsNoStreamCallback);
                });
                setWebRTCElementsVisibility(true);
            }
            else {
                console.log("player ready is not available. List playing may not be continous");
            }
            setPlaceHolderVisibility(false);
        }
        
        function handleWebRTCConnectivity(noStreamCallback) 
        {
            return
            var currentTimeMs = (new Date()).getTime();
            //call if it's more than 3 seconds older
            if (currentTimeMs >  (handleConnectivityCallDateTimeMs + 3000)) 
            {
                handleConnectivityCallDateTimeMs = currentTimeMs;
                if (iceConnected) 
                {
                    //webrtc connection was successful and try to play again with webrtc
                    setTimeout(function () {
                        webRTCAdaptor.getStreamInfo(streamId);
                    }, 3000);
                    console.log("Trying to play with webrtc again");
                }
                else 
                {
                    //webrtc connection was not succesfull, switch the next play type(playOrder) if available 
                    if (typeof noStreamCallback != "undefined") {
                        noStreamCallback();
                        console.log("Trying to play with other tech than webrtc if available");
                    }
                }
                //make the flag false to try other technologies
                iceConnected = false;		
            }
        }
      
      
        function initializeWebRTCPlayer(streamId, token, subscriberId, subscriberCode, noStreamCallback) {
      
            if (is360) {
                show360ElementsVisibility();
            }
            setHLSElementsVisibility(false);
      
            var pc_config = {
                'iceServers': [{
                    'urls': 'stun:stun1.l.google.com:19302'
                },
                {
                    'urls': 'turn:35.241.75.192:3478',
                    'username': 'YprcKcJ9',
                    'credential': 'qDJIS4uD9MhZ'
                }],
                iceTransportPolicy: "relay"
            };
      
            var sdpConstraints = {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: true
      
            };
            var mediaConstraints = {
                video: false,
                audio: false
            };
      
            var appName = location.pathname.substring(0, location.pathname.lastIndexOf("/") + 1);
            var path = location.hostname + ":" + location.port + appName + "websocket";
            var websocketURL = "wss://" + path;
      
            if (location.protocol.startsWith("https")) {
                websocketURL = "wss://" + path;
            }
            websocketURL =  "wss://" + '${ip}' + "/WebRTCAppEE/websocket";
            iceConnected = false;
            console.log("===22==",websocketURL)
            //webRTCAdaptor is a global variable
            webRTCAdaptor = new WebRTCAdaptor({
                websocket_url: websocketURL,
                mediaConstraints: mediaConstraints,
                peerconnection_config: pc_config,
                sdp_constraints: sdpConstraints,
                candidateTypes: ["tcp", "udp"],
                remoteVideoId: '${videoId}',
                isPlayMode: true,
                debug: true,
                callback: function (info, description) {
                    //console.log("==info==",info)
                    if (info == "initialized") {
                        console.log("initialized");
                        iceConnected = false;
                        webRTCAdaptor.getStreamInfo(streamId);
                    }
                    else if (info == "streamInformation") {
                        console.log("stream information");
                        webRTCAdaptor.play(streamId, token, "",[] ,subscriberId, subscriberCode);
                    }
                    else if (info == "play_started") {
                        //joined the stream
                        console.log("play started");
                        setPlaceHolderVisibility(false);
                        setHLSElementsVisibility(false);
                        playWebRTCVideo();
                    } else if (info == "play_finished") {
                        //leaved the stream
                        console.log("play finished");
                        setHLSElementsVisibility(false);
                        hideWebRTCElements();
                        setPlaceHolderVisibility(true);
                        //if play_finished event is received, it has two meanings
                        //1. stream is really finished 
                        //2. ice connection cannot be established and server reports play_finished event
                        //check that publish may start again
                        //below method handle the cases above
                        handleWebRTCConnectivity(noStreamCallback);
                    }
                    else if (info == "closed") 
                    {
                        setHLSElementsVisibility(false);
                        hideWebRTCElements();
                        setPlaceHolderVisibility(true);
                        
                        console.log("Websocket connecton closed: " + (typeof description != "undefined" ? 
                                    JSON.stringify(description) : ""));
                        
                        handleWebRTCConnectivity(noStreamCallback);	
      
                        
                    }
                    else if (info == "bitrateMeasurement") {
      
                        if (!document.getElementById('${videoId}').paused) {
                            document.getElementById("play_button").style.display = "none";
                        }
      
                        console.debug(description);
                        // if (description.audioBitrate + description.videoBitrate > description.targetBitrate) {
                        //     document.getElementById("networkWarning").style.display = "block";
                        //     setTimeout(function () {
                        //         document.getElementById("networkWarning").style.display = "none";
                        //     }, 3000);
                        // }
                    }
                    else if (info == "ice_connection_state_changed") {
                        console.debug("ice connection state changed to " + description.state);
                        if (description.state == "connected" || description.state == "completed") {
                            //it means the ice connection has been established
                            iceConnected = true;
                        }
                    }
                    else if (info == "resolutionChangeInfo") {
                        console.log("Resolution is changed to " + description["streamHeight"]);
                        let getVideo = document.getElementById('${videoId}');
                        // let overlay = document.getElementById('video-overlay');
                        getVideo.pause();
                        // overlay.style.display = "block";
                        setTimeout(function () { getVideo.play();}, 2000);
                        // setTimeout(function () { getVideo.play(); overlay.style.display = "none"; }, 2000);
                    }
                    else if (info == "server_will_stop") {
                        console.log("Server will stop soon");
                        //No need to handle this event because "closed" event will be called soon
                    }
      
                },
                callbackError: function (error) {
                    //some of the possible errors, NotFoundError, SecurityError,PermissionDeniedError
      
                    console.log("error callback: " + JSON.stringify(error));
      
                    if (error == "no_stream_exist" || error == "WebSocketNotConnected" 
                            || error == "not_initialized_yet" || error == "data_store_not_available") 
                    {
                        //handleWebRTCConnectivity(noStreamCallback);
                        webRTCAdaptor.closeWebSocket();
                    }
                    else if (error == "notSetRemoteDescription") {
                        /*
                        * If getting codec incompatible or remote description error, it will redirect HLS player.
                        */
                        tryToPlay(streamId, token, hlsExtension, subscriberId, subscriberCode, hlsNoStreamCallback);
                    }
                    else if (error == "highResourceUsage") {
                        //disconnect when server reports high resource usage
                        //it will fire the "closed" callback and and it'll reconnect again.
                        //this is important when it's auto-scaling in the backend
                        webRTCAdaptor.closeWebSocket();
                    }
                    
                }
            });
        }
      
        function main() {
            if (typeof streamId != "undefined") {
      
                if (streamId.startsWith(streamsFolder)) {
                    /*
                    * If streamId starts with streams, it's hls or mp4 file to be played
                    */
                    var lastIndexOfDot = streamId.lastIndexOf(".")
                    var streamPath = streamId.substring(streamsFolder.length + 1, lastIndexOfDot);
                    var extension = streamId.substring(lastIndexOfDot + 1);
                    initializePlayer(streamPath, extension, token);
                }
                else {
                    /*
                     * Check that which one is in the first order
                    */
                    if (playOrder[0] == "webrtc") {
                        initializeWebRTCPlayer(streamId, token, subscriberId, subscriberCode, webrtcNoStreamCallback);
                    }
                    else if (playOrder[0] == "hls") {
                        tryToPlay(streamId, token, hlsExtension, subscriberId, subscriberCode, hlsNoStreamCallback);
                    }
                    else if (playOrder[0] == "vod") {
                        tryToVODPlay(streamId, token, subscriberId, subscriberCode, vodNoStreamCallback, playType);
                    }
                    else if (playOrder[0] == "dash") {
                        tryToPlay(streamId, token, dashExtension, subscriberId, subscriberCode, dashNoStreamCallback);
                    }
                    else {
                        alert("Unsupported play order requested. Supported formats are webrtc and hls. Use something like playOrder=webrtc,hls");
                    }
                }
            }
            else {
                alert("No stream specified. Please add ?id={STREAM_ID}  to the url");
            }
        }
          main();
        `
        document.body.appendChild(testScript);
      }
}