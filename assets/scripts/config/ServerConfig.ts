/** 服务区域 */
export const enum SERVER_EREA {
    // 大陆
    CN = 0,
    // 台湾
    TW_1 = 1, 
    // 台湾_钱钱来 暂时不用了
    // TW_QQL = 2,
    // 台湾_暴连888
    TW_BL = 3,
    // 台湾线下版本
    TW_MC = 4,
    // 田桥仔自动登录
    AUTO_tqz = 5,
    AUTO_OP375 = 6,
    AUTO_OP818 = 7,
    // 日文正式版 MANTABGaming
    JP_1 = 8,
    // 金富翁
    AUTO_JFW = 9,
    AUTO_03F76 = 10,
    // 台湾线下版本
    TW_MC_YXW = 11,
    // 台湾2
    TW_2 = 12,
    AUTO_TEST_8 = 84,
    // 台湾_线下测试
    TW_MC_YXW_TEST = 85,
    AUTO_TEST_7 = 86,
    TEST_2 = 87,
    AUTO_TEST_6 = 88,
    // 横版测试版
    YJB_H = 89,
    // 日文测试版本
    JP_TEST_2 = 90,
    JP_TEST = 92,
    // 自动登陆测试版本
    AUTO_TEST_5 = 91,
    AUTO_TEST_4 = 93,
    AUTO_TEST_3 = 94,
    AUTO_TEST_2 = 95,
    AUTO_TEST = 96,
    // 台湾_线下测试
    TW_MC_TEST = 97,
    // 鱼机测试
    FISH_TEST = 98,
    // 测试
    TEST = 99
}
/** 当前服务区域配置(根据打包修改) */
export const NOW_SERVER_EREA : SERVER_EREA = SERVER_EREA.JP_1;
/** 通用版本 */
const DEFAULT_VERSION = "1.1.0"
/** 测试服版本号 */
const DEFAULT_TEST_VERSION = "1.0.0"

/** LOGO类型 */
export const enum LOGO_TYPE {
    // 一级棒
    YJB = 0,
    // 钱钱来
    QQL = 1,
    // 暴连888
    BL = 2,
    // 机器版本
    MC = 3,
    // VIP
    VIP = 4,
    // 机器版本
    YXW = 5,
}

const DEFAULT_WEB_URL = "https://api.1ting.cn/"
const TEST_WEB_URL = "https://api-test.1ting.cn/"

/** 区域打包配置文件 */
const SERVER_CONFIG = {
    // 大陆
    [0] : {
        "server" : { 
            [0] : DEFAULT_WEB_URL,
            [1] : DEFAULT_WEB_URL,
        },
        "site_id" : "7e3c09b8-38ed-4092-b8ec-872fdec78499",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.YJB,
        "line_id" : "",
        "line_url" : "",
        "ver" : DEFAULT_VERSION,
        "area" : "86",
    },
    // 台湾
    [1] : {
        "server" : {
            [0] : DEFAULT_WEB_URL,
            [1] : DEFAULT_WEB_URL,
        },
        "site_id" : "998c6764-ed3c-4c84-807a-45d0d5706e20",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.YJB,
        "line_id" : " ",
        "line_url" : "https://tw.greatboom.net",
        "ver" : DEFAULT_VERSION,
        "area" : "886",
    },
    // 台湾_钱钱来
    [2] : {
        "server" : {
            [0] : DEFAULT_WEB_URL,
            [1] : DEFAULT_WEB_URL,
        },
        "site_id" : "59da26e1-6549-471b-e7fc-037744d18b82",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.QQL,
        "line_id" : "",
        "line_url" : "",
        "ver" : DEFAULT_VERSION,
        "area" : "886",
    },
    // 台湾_暴连888
    [3] : {
        "server" : {
            [0] : DEFAULT_WEB_URL,
            [1] : DEFAULT_WEB_URL,
        },
        "site_id" : "22f82dce-cc5c-4feb-9247-4a5499ebcc5a",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.BL,
        "line_id" : "2006983720",
        "line_url" : "https://888.j8j8.site",
        "ver" : DEFAULT_VERSION,
        "area" : "886",
    },
    // 台湾线下版本
    [4] : {
        "server" : {
            [0] : DEFAULT_WEB_URL,
            [1] : DEFAULT_WEB_URL,
        },
        "site_id" : "028852eb-0526-492a-9ca4-572e3e560c55",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.VIP,
        "line_id" : "",
        "line_url" : "",
        "ver" : DEFAULT_VERSION,
        "area" : "886",
    },
    // 自动登录正式版
    [5] : {
        "server" : {
            [0] : DEFAULT_WEB_URL,
            [1] : DEFAULT_WEB_URL,
        },
        "site_id" : "757a0a15-d5c8-44ab-c36d-ffad0baa9432",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.YJB,
        "line_id" : "",
        "line_url" : "",
        "ver" : DEFAULT_VERSION,
        "area" : "886",
    },
    [6] : {
        "server" : {
            [0] : DEFAULT_WEB_URL,
            [1] : DEFAULT_WEB_URL,
        },
        "site_id" : "9d513244-044d-472a-c3da-ea60a059d149",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.YJB,
        "line_id" : "",
        "line_url" : "",
        "ver" : DEFAULT_VERSION,
        "area" : "886",
    },
    [7] : {
        "server" : {
            [0] : DEFAULT_WEB_URL,
            [1] : DEFAULT_WEB_URL,
        },
        "site_id" : "a166a0f3-0d7d-4dac-ec1f-075f75ae80d2",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.YJB,
        "line_id" : "",
        "line_url" : "",
        "ver" : DEFAULT_VERSION,
        "area" : "886",
    },
    // 日文正试版本
    [8] : {
        "server" : {
            [0] : DEFAULT_WEB_URL,
            [1] : DEFAULT_WEB_URL,
        },
        "site_id" : "d9a9103d-729f-4c3e-9d48-fad051c28fff",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.YJB,
        "line_id" : "",
        "line_url" : "",
        "ver" : DEFAULT_VERSION,
        "area" : "81",
    },
    // 金富翁
    [9] : {
        "server" : {
            [0] : DEFAULT_WEB_URL,
            [1] : DEFAULT_WEB_URL,
        },
        "site_id" : "37c983fb-5c60-446d-84dd-42faa1e0dc77",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.YJB,
        "line_id" : "",
        "line_url" : "",
        "ver" : DEFAULT_TEST_VERSION,
        "area" : "886",
    },
    [10] : {
        "server" : {
            [0] : DEFAULT_WEB_URL,
            [1] : DEFAULT_WEB_URL,
        },
        "site_id" : "8978949f-77ff-4bd8-e4d6-feb6ef503f76",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.YJB,
        "line_id" : "",
        "line_url" : "",
        "ver" : DEFAULT_VERSION,
        "area" : "886",
    },
    // 台湾线下版本
    [11] : {
        "server" : {
            [0] : TEST_WEB_URL,
            [1] : TEST_WEB_URL,
        },
        "site_id" : "7e3c09b8-38ed-4092-b8ec-872fdec78499",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.YXW,
        "line_id" : "",
        "line_url" : "",
        "ver" : DEFAULT_VERSION,
        "area" : "886",
    },
    // 台湾2
    [12] : {
        "server" : {
            [0] : DEFAULT_WEB_URL,
            [1] : DEFAULT_WEB_URL,
        },
        "site_id" : "7d3c5cdc-6964-4c51-ccb4-675538a85d63",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.YJB,
        "line_id" : " ",
        "line_url" : "https://tw.greatboom.net",
        "ver" : DEFAULT_VERSION,
        "area" : "886",
    },
    // 测试自动登陆版本
    [84] : {
        "server" : {
            [0] : TEST_WEB_URL,
            [1] : TEST_WEB_URL,
        },
        "site_id" : "bafb5040-3fd7-4752-c92e-63c0003fa46d",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.YJB,
        "line_id" : "",
        "line_url" : "",
        "ver" : DEFAULT_TEST_VERSION,
        "area" : "886",
    },
    // 台湾_线下版本测试服
    [85] : {
        "server" : {
            [0] : TEST_WEB_URL,
            [1] : TEST_WEB_URL,
        },
        "site_id" : "ef0d7254-fc68-43b6-d900-b7c375cfe631",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.YXW,
        "line_id" : "",
        "line_url" : "",
        "ver" : DEFAULT_TEST_VERSION,
        "area" : "886",
        "is_check_mode" : false,
    },
    // 测试自动登陆版本
    [86] : {
        "server" : {
            [0] : TEST_WEB_URL,
            [1] : TEST_WEB_URL,
        },
        "site_id" : "60a05225-7df3-4cfa-b1e1-b185397934d2",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.YJB,
        "line_id" : "",
        "line_url" : "",
        "ver" : DEFAULT_TEST_VERSION,
        "area" : "886",
    },
    // 测试包
    [87] : {
        "server" : {
            [0] : "https://api-test.1ting.cn/",
            [1] : "https://api-test.1ting.cn/",
        },
        "site_id" : "7e3c09b8-38ed-4092-b8ec-872fdec78499",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.YJB,
        "line_id" : "",
        "line_url" : "",
        "ver" : DEFAULT_TEST_VERSION,
        "area" : "886",
    },
    // 测试自动登陆版本
    [88] : {
        "server" : {
            [0] : TEST_WEB_URL,
            [1] : TEST_WEB_URL,
        },
        "site_id" : "fe73e11d-a85c-4f86-d2f2-a8364fc17c56",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.YJB,
        "line_id" : "",
        "line_url" : "",
        "ver" : DEFAULT_TEST_VERSION,
        "area" : "886",
    },
    // 横版测试服
    [89] : {
        "server" : {
            [0] : "https://h-api.qtalk666.top/",
            [1] : "https://h-api.qtalk666.top/",
        },
        "site_id" : "7e3c09b8-38ed-4092-b8ec-872fdec78499",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.YJB,
        "line_id" : "",
        "line_url" : "",
        "ver" : DEFAULT_TEST_VERSION,
        "area" : "81",
    },
    // 日文测试版本
    [90] : {
        "server" : {
            [0] : TEST_WEB_URL,
            [1] : TEST_WEB_URL,
        },
        "site_id" : "9e807d04-0537-4995-f877-327bb992030a",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.YJB,
        "line_id" : "",
        "line_url" : "",
        "ver" : DEFAULT_TEST_VERSION,
        "area" : "81",
    },
    // 日文测试版本
    [92] : {
        "server" : {
            [0] : TEST_WEB_URL,
            [1] : TEST_WEB_URL,
        },
        "site_id" : "7d011a72-bdb8-46ef-a296-ef0d7b799bc3",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.YJB,
        "line_id" : "",
        "line_url" : "",
        "ver" : DEFAULT_TEST_VERSION,
        "area" : "81",
    },
    // 测试自动登陆版本
    [91] : {
        "server" : {
            [0] : TEST_WEB_URL,
            [1] : TEST_WEB_URL,
        },
        "site_id" : "60a05225-7df3-4cfa-b1e1-b185397934d2",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.YJB,
        "line_id" : "",
        "line_url" : "",
        "ver" : DEFAULT_TEST_VERSION,
        "area" : "886",
    },
    // 测试自动登陆版本
    [93] : {
        "server" : {
            [0] : TEST_WEB_URL,
            [1] : TEST_WEB_URL,
        },
        "site_id" : "10968cab-6468-4a91-d456-e9da63f9f94d",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.YJB,
        "line_id" : "",
        "line_url" : "",
        "ver" : DEFAULT_TEST_VERSION,
        "area" : "886",
    },
    // 测试自动登陆版本
    [94] : {
        "server" : {
            [0] : TEST_WEB_URL,
            [1] : TEST_WEB_URL,
        },
        "site_id" : "7d011a72-bdb8-46ef-a296-ef0d7b799bc3",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.YJB,
        "line_id" : "",
        "line_url" : "",
        "ver" : DEFAULT_TEST_VERSION,
        "area" : "886",
    },
    // 测试自动登陆版本
    [95] : {
        "server" : {
            [0] : TEST_WEB_URL,
            [1] : TEST_WEB_URL,
        },
        "site_id" : "f0b4e68f-7ced-4e08-e8d2-506c3e4c41ca",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.YJB,
        "line_id" : "",
        "line_url" : "",
        "ver" : DEFAULT_TEST_VERSION,
        "area" : "886",
    },
    // 测试自动登陆版本
    [96] : {
        "server" : {
            [0] : TEST_WEB_URL,
            [1] : TEST_WEB_URL,
        },
        "site_id" : "d45063a6-6bdc-47c0-b643-b2c3e2a11591",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.YJB,
        "line_id" : "",
        "line_url" : "",
        "ver" : DEFAULT_TEST_VERSION,
        "area" : "886",
    },
    // 台湾_线下版本测试服
    [97] : {
        "server" : {
            [0] : TEST_WEB_URL,
            [1] : TEST_WEB_URL,
        },
        "site_id" : "ef0d7254-fc68-43b6-d900-b7c375cfe631",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.VIP,
        "line_id" : "",
        "line_url" : "",
        "ver" : DEFAULT_TEST_VERSION,
        "area" : "886",
        "is_check_mode" : false,
    },
    //鱼机测试
    [98] : {
        "server" : {
            [0] : "http://47.83.1.198:8787/",
        },
        "site_id" : "7e3c09b8-38ed-4092-b8ec-872fdec78499",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.YJB,
        "line_id" : "2006519611",
        "line_url" : "https://tw.greatboom.net",
        "ver" : DEFAULT_TEST_VERSION,
        "area" : "886",
    },
    // 测试
    [99] : {
        "server" : {
            [0] : TEST_WEB_URL,
        },
        "site_id" : "7e3c09b8-38ed-4092-b8ec-872fdec78499",
        "wss" : "wss://",
        "Is-Ip" : "0",
        "logo" : LOGO_TYPE.YJB,
        "line_id" : "2006519611",
        "line_url" : "https://tw.greatboom.net",
        "ver" : DEFAULT_TEST_VERSION,
        "area" : "86",
    }
}

/** 服务器地址 */
export const SERVER_LIST = SERVER_CONFIG[NOW_SERVER_EREA]["server"];
/** Site ID */
export const HTTP_SITE_ID = SERVER_CONFIG[NOW_SERVER_EREA]["site_id"];
/** ws 类型 */
export const WSS_TYPE = SERVER_CONFIG[NOW_SERVER_EREA]["wss"];
/** 是否IP直连 */
export const IP_DIRECT = SERVER_CONFIG[NOW_SERVER_EREA]["Is-Ip"];
/** LOGO 显示 */
export const SHOW_LOGO = SERVER_CONFIG[NOW_SERVER_EREA]["logo"];
/** LINE ID */
export const LINE_ID = SERVER_CONFIG[NOW_SERVER_EREA]["line_id"];
/** LINE URl */
export const LINE_URL = SERVER_CONFIG[NOW_SERVER_EREA]["line_url"];
/** 是否审核模式 */
export const IS_CHECK_MODE = SERVER_CONFIG[NOW_SERVER_EREA]["is_check_mode"];
/** 当前版本号 */
export const GAME_VER = SERVER_CONFIG[NOW_SERVER_EREA]["ver"];
/** 国家电话区号 */
export const COUNTRY_CODE = SERVER_CONFIG[NOW_SERVER_EREA]["area"]; 