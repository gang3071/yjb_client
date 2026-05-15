import * as cc from 'cc';
import { LocalizadManager, LocalizedConfigPathData  } from './LocalizedManager';
const { ccclass, property } = cc._decorator;

@ccclass('LocalizedConfigPath')
export class LocalizedConfigPath extends cc.Component {
    
    @property({
        tooltip : "",
        displayName : "简体中文",

    })
    private m_chiness : string = null!;

    @property({
        tooltip : "",
        displayName : "繁体",

    })
    private m_fanti : string = null!;

    @property({
        tooltip : "",
        displayName : "英文",

    })
    private m_english : string = null!;

    @property({
        tooltip : "",
        displayName : "日语",

    })
    private m_japanese : string = null!;

    onLoad(){
        LocalizadManager.getInstance().pushConfig(new LocalizedConfigPathData(this.name, {
            chiness : this.m_chiness,
            english : this.m_english,
            fanti : this.m_fanti,
            japanese : this.m_japanese,
        }));
    }
}