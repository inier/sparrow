const uuid = require('@lukeed/uuid');
import * as cheerio from 'cheerio';
import storage from '../../../../storage';
import Container from '../Container'; 
import * as _ from 'lodash';
import Base from '../Base';

export default class Column extends Base{
  public uuid = '';
  public components:any = [];
  public $fragment: any;
  name: string = 'column';
  previewType: number = 0;
  unique: string | number;
  config: any = null;
  boxStrs: string = '';
  storage: any = {};
  type: string = 'inline';
  path: string = '/box/Row/Column';

  constructor (data: any, storage: any) {
    super(storage);
    this.storage = storage;
    this.uuid = uuid().split('-')[0]; 

    const {span} = data;
    const { config } = data;
    if (config) {
      this.config = config;
    } else {
      this.config = _.cloneDeep(require('./config').default);
      if (span) {
        this.config.model.attr.span = span;
      }
    }
    
    this.setAttrsToStr();

    this.$fragment = cheerio.load(`
      <el-col ${this._attrStr}>
        <box 
          data-id="${this.uuid}"
          :uuid="'${this.uuid}'" 
          class="block-item" 
          label="column"
        >
          <div class="column drag-box" data-id="${this.uuid}"></div>
        </box>
      </el-col>
    `, {
      xmlMode: true,
      decodeEntities: false
    });
  }


  public setPreview () {
    const type = this.storage.get('preview_view_status') || 0;
    this.previewType = type;
    if (this.previewType === 0) {
      this.$fragment = cheerio.load(`
        <el-col ${this._attrStr}>
          <box 
            data-id="${this.uuid}"
            :uuid="'${this.uuid}'" 
            class="block-item" 
            label="column"
          >
            <div class="column drag-box" data-id="${this.uuid}"></div>
          </box>
        </el-col>
      `, {
        xmlMode: true,
        decodeEntities: false
      });
    } else {
      this.$fragment = cheerio.load(`
        <el-col ${this._attrStr}>
          <div class="column drag-box"></div>
        </el-col>
      `, {
        xmlMode: true,
        decodeEntities: false
      });
    }
    this.renderBox();

  }  

  public renderBox () {
    this.$fragment('.drag-box').empty();
    this.components.forEach(component => {
      this.$fragment('.drag-box').append(component.getFragment(this.previewType).html());
    });

    if (this.components.length  === 0) {
      this.$fragment('.drag-box').append(`<div class="empty-container">empty</div>`)
    }
  }

  getConfig() {
    return this.config;
  }

  
  getFragment () {
    this.renderBox();
    return this.$fragment;
  }

  getFragmentOther () {
    if (this.components[0]) {
      return this.components[0].getFragmentOther(); 
    }
    return null;
  }
}