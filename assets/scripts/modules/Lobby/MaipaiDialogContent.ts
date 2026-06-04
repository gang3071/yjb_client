import * as cc from 'cc';
import { _decorator, Component, Label, RichText } from 'cc';
import { LocalizadManager, LANGUAGE_EVENT } from '../../base/localized/LocalizedManager';
const { ccclass, property } = _decorator;

/**
 * 麦牌弹窗内容控制器 - 多语言支持
 * 挂载到 ScrollView 节点上
 */
@ccclass('MaipaiDialogContent')
export class MaipaiDialogContent extends Component {

    /** 内容文字 - 手动绑定（可选） */
    @property(cc.Label)
    labContent: cc.Label = null;

    @property(cc.RichText)
    richContent: cc.RichText = null;

    private contentLabel: cc.Label = null;
    private contentRichText: cc.RichText = null;

    start() {
        console.log("=== MaipaiDialogContent start ===");
        console.log("挂载节点:", this.node.name);

        // 如果没有手动绑定，尝试自动查找
        if (!this.labContent && !this.richContent) {
            this.autoFindContent();
        } else {
            this.contentLabel = this.labContent;
            this.contentRichText = this.richContent;
            console.log("使用编辑器绑定的组件");
        }

        // 首次更新内容
        this.updateContent();

        // 监听语言切换事件
        LocalizadManager.getInstance().addListener(LANGUAGE_EVENT.UPDATE, this, this.onLanguageChange);
    }

    onDestroy() {
        LocalizadManager.getInstance().removeListener(LANGUAGE_EVENT.UPDATE, this, this.onLanguageChange);
    }

    /** 语言切换回调 */
    onLanguageChange() {
        console.log("收到语言切换事件");
        this.updateContent();
    }

    /** 自动查找内容组件 - 从 ScrollView 节点开始 */
    autoFindContent() {
        console.log("自动查找内容组件");

        // ScrollView 标准结构: ScrollView -> view -> content
        const viewNode = this.node.getChildByName('view');
        if (viewNode) {
            const contentNode = viewNode.getChildByName('content');
            if (contentNode) {
                console.log("找到 content 节点");
                console.log("content 子节点数量:", contentNode.children.length);

                // 优先查找 RichText（支持富文本）
                this.contentRichText = contentNode.getComponent(cc.RichText);
                if (this.contentRichText) {
                    console.log("✅ 在 content 节点找到 RichText 组件");
                    return;
                }

                // 查找子节点中的 RichText
                this.contentRichText = contentNode.getComponentInChildren(cc.RichText);
                if (this.contentRichText) {
                    console.log("✅ 在子节点找到 RichText 组件");
                    return;
                }

                // 如果没有 RichText，再找 Label
                this.contentLabel = contentNode.getComponent(cc.Label);
                if (this.contentLabel) {
                    console.log("⚠️ 在 content 节点找到 Label 组件（建议改用 RichText）");
                    return;
                }

                this.contentLabel = contentNode.getComponentInChildren(cc.Label);
                if (this.contentLabel) {
                    console.log("⚠️ 在子节点找到 Label 组件（建议改用 RichText）");
                    return;
                }

                console.error("❌ 未找到任何文本组件！");
            } else {
                console.error("❌ 未找到 content 节点");
            }
        } else {
            console.error("❌ 未找到 view 节点");
        }
    }

    /** 更新内容 - 多语言 */
    updateContent() {
        const lang = LocalizadManager.getInstance().getLanauge();
        const content = this.getContent(lang);

        console.log("=== 更新弹窗内容 ===");
        console.log("语言:", lang, this.getLangName(lang));
        console.log("内容长度:", content.length);
        console.log("前100字符:", content.substring(0, 100));

        // 优先使用 RichText（支持富文本格式）
        if (this.contentRichText) {
            this.contentRichText.string = content;
            console.log("✅ 内容已设置到 RichText");
            console.log("RichText 节点:", this.contentRichText.node.name);
            console.log("RichText.string 前50字符:", this.contentRichText.string.substring(0, 50));
        } else if (this.contentLabel) {
            this.contentLabel.string = content;
            console.log("✅ 内容已设置到 Label（不支持富文本样式）");
        } else {
            console.error("❌ 未找到任何 Label 或 RichText 组件！");
        }
    }

    /** 获取语言名称（调试用） */
    getLangName(lang: number): string {
        const names = ["", "简体中文", "繁体中文", "English", "日本語"];
        return names[lang] || "未知";
    }

    /** 获取内容 - 根据语言 */
    getContent(lang: number): string {
        // 1=简体中文, 2=繁体中文, 3=英文, 4=日文

        // 检测是否使用 RichText
        const useRichText = !!this.contentRichText;

        if (lang === 1) {
            // 简体中文
            if (useRichText) {
                return `<b><size=36><color=#FFD700>核心操作说明</color></size></b>

<b><size=32><color=#00FF00>一键开奖功能（天井跳过）</color></size></b>
当机器内存分数超过777枚时
点击下方确定购买
系统将以每转3枚的分数
扣除剩余天井转数
启动自动后直接进入开奖演出
详细机台特性及模式请参考攻略

<b><size=32><color=#00FF00>下分流程</color></size></b>
玩家点击下方移分OFF后
回到机台页面点击看表
待机器内表分数自动移出后
玩家可正常操作下分或弃台`;
            } else {
                return `核心操作说明

一键开奖功能（天井跳过）
当机器内存分数超过777枚时
点击下方确定购买
系统将以每转3枚的分数
扣除剩余天井转数
启动自动后直接进入开奖演出
详细机台特性及模式请参考攻略

下分流程
玩家点击下方移分OFF后
回到机台页面点击看表
待机器内表分数自动移出后
玩家可正常操作下分或弃台`;
            }
        }

        if (lang === 2) {
            // 繁体中文
            if (useRichText) {
                return `<b><size=36><color=#FFD700>核心操作説明</color></size></b>

<b><size=32><color=#00FF00>一鍵開獎功能（天井跳過）</color></size></b>
當機器內存分數超過777枚時
點擊下方確定購買
系統將以每轉3枚的分數
扣除剩餘天井轉數
啟動自動後直接進入開獎演出
詳細機台特性及模式請參考攻略

<b><size=32><color=#00FF00>下分流程</color></size></b>
玩家點擊下方移分OFF後
回到機台頁面點擊看錶
待機器內錶分數自動移出後
玩家可正常操作下分或棄台`;
            } else {
                return `核心操作説明

一鍵開獎功能（天井跳過）
當機器內存分數超過777枚時
點擊下方確定購買
系統將以每轉3枚的分數
扣除剩餘天井轉數
啟動自動後直接進入開獎演出
詳細機台特性及模式請參考攻略

下分流程
玩家點擊下方移分OFF後
回到機台頁面點擊看錶
待機器內錶分數自動移出後
玩家可正常操作下分或棄台`;
            }
        }

        if (lang === 3) {
            // 英文
            if (useRichText) {
                return `<b><size=36><color=#FFD700>Core Operation Guide</color></size></b>

<b><size=32><color=#00FF00>One-Click Prize (Ceiling Skip)</color></size></b>
When machine credits exceed 777
Click Confirm Purchase below
System deducts remaining ceiling spins
at 3 credits per spin
Starts auto-play and enters prize mode
See strategy guide for machine details

<b><size=32><color=#00FF00>Withdrawal Process</color></size></b>
Click Move OFF below
Return to machine page and check meter
Wait for internal meter credits to transfer
Then proceed with withdrawal or exit`;
            } else {
                return `Core Operation Guide

One-Click Prize (Ceiling Skip)
When machine credits exceed 777
Click Confirm Purchase below
System deducts remaining ceiling spins
at 3 credits per spin
Starts auto-play and enters prize mode
See strategy guide for machine details

Withdrawal Process
Click Move OFF below
Return to machine page and check meter
Wait for internal meter credits to transfer
Then proceed with withdrawal or exit`;
            }
        }

        if (lang === 4) {
            // 日文
            if (useRichText) {
                return `<b><size=36><color=#FFD700>コア操作ガイド</color></size></b>

<b><size=32><color=#00FF00>ワンクリック当選機能（天井スキップ）</color></size></b>
機械内のクレジットが777枚を超えた場合
下の購入確定をクリック
システムは1回転3枚のクレジットで
残りの天井回転数を差し引きます
自動開始後、直接当選演出に入ります
詳細な機種特性とモードは攻略を参照

<b><size=32><color=#00FF00>出金手順</color></size></b>
下の移分OFFをクリック後
機台ページに戻りメーターを確認
機械内のメータークレジットが自動移出後
出金または退出が可能になります`;
            } else {
                return `コア操作ガイド

ワンクリック当選機能（天井スキップ）
機械内のクレジットが777枚を超えた場合
下の購入確定をクリック
システムは1回転3枚のクレジットで
残りの天井回転数を差し引きます
自動開始後、直接当選演出に入ります
詳細な機種特性とモードは攻略を参照

出金手順
下の移分OFFをクリック後
機台ページに戻りメーターを確認
機械内のメータークレジットが自動移出後
出金または退出が可能になります`;
            }
        }

        // 默认返回繁体中文
        return this.getContent(2);
    }
}
