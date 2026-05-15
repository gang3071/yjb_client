import * as cc from 'cc';
import { LocalizadManager, LocalizedConfigJsonData  } from './LocalizedManager';
const { ccclass, property } = cc._decorator;

@ccclass('LocalizedConfigJson')
export class LocalizedConfig extends cc.Component {
    @property({
        type : cc.JsonAsset,
        tooltip : "",
        displayName : "english Label File",

    })
    private m_english : cc.JsonAsset = null!;

    @property({
        type : cc.JsonAsset,
        tooltip : "",
        displayName : "chiness Label File",

    })
    private m_chiness : cc.JsonAsset = null!;

    @property({
        type : cc.JsonAsset,
        tooltip : "",
        displayName : "chiness Label File",

    })
    private m_fanti : cc.JsonAsset = null!;

    @property({
        type : cc.JsonAsset,
        tooltip : "",
        displayName : "chiness Label File",

    })
    private m_japanese : cc.JsonAsset = null!;

    onLoad(){
        LocalizadManager.getInstance().pushConfig(new LocalizedConfigJsonData(this.name, {
            chiness : this.m_chiness.json,
            english : this.m_english.json,
            fanti : this.m_fanti.json,
            japanese : this.m_japanese.json,
        }));
    }
}