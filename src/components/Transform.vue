<template>
  <el-container>
    <el-aside width="300px">
      <h3>设置</h3>
      <el-form size="small">
        <el-form-item label="视图选择器">
          <el-select v-model="selector" filterable>
            <el-option v-for="(item,i) in selectorOptions" :key="i" :value="item" :label="item"/>
          </el-select>
        </el-form-item>
        <el-form-item label="处理样式">
          <el-switch v-model="postCss"/>
        </el-form-item>
        <el-form-item v-if="postCss" label="设计宽度">
          <el-input-number v-model="baseWidth"/>
        </el-form-item>
        <el-form-item label="1像素细线">
          <el-switch v-model="hairline"/>
        </el-form-item>
        <el-form-item label="require图片">
          <el-switch v-model="requireImage"/>
        </el-form-item>
        <el-form-item label="组件名">
          <el-input v-model="name"/>
        </el-form-item>
      </el-form>
      <el-button @click="exportCode">
        下载
      </el-button>
    </el-aside>
    <el-container class="page">
      <h3>蓝湖代码转为react-native代码工具(分别粘贴蓝湖生成的html和css代码到对应的编辑器即可)</h3>
      <el-row style="width: 100%;flex:1;height: 100%;">
        <el-col :span="12" style="height: 100%;">
          <el-row type="flex" style="flex-direction: column;height: 100%;">
            <div style="flex:1;height: 50%">
              <p>HTML</p>
              <div class="edit-view">
                <codemirror v-model="code" :options="cmOptions"/>
              </div>
            </div>
            <div style="flex:1;height: 50%">
              <p>CSS</p>
              <div class="edit-view">
                <codemirror v-model="css" :options="cmOptions"/>
              </div>
            </div>
          </el-row>
        </el-col>
        <el-col :span="12" style="height: 100%;">
          <p>转化RN代码</p>
          <codemirror style="height: 100%;" :value="singleFileStr" :options="cmOptions"/>
        </el-col>
      </el-row>
    </el-container>
  </el-container>
</template>

<script>
import {codemirror} from 'vue-codemirror'
import axios from 'axios'
import transformHTML from '../utils/transformHTML'
import prettier from 'prettier'
import parserEspree from 'prettier/parser-espree'
import htmlTmp from '../template/html'
import cssTmp from '../template/css'
import _ from 'lodash'
import 'codemirror/lib/codemirror.css'
import transformCSS, {printJSONValue} from "@/utils/transformCSS";
import {
  Button,
  Select,
  Checkbox,
  Switch,
  Input,
  InputNumber,
  Drawer,
  Container,
  Aside,
  Form,
  FormItem,
  Option,
  Col,
  Row,
} from 'element-ui';
import exportFile from "@/utils/exportFile";

export default {
  name: 'Transform',
  components: {
    codemirror,
    [Button.name]: Button,
    [Select.name]: Select,
    [Checkbox.name]: Checkbox,
    [Switch.name]: Switch,
    [Input.name]: Input,
    [Drawer.name]: Drawer,
    [Container.name]: Container,
    [Aside.name]: Aside,
    [Form.name]: Form,
    [FormItem.name]: FormItem,
    [Option.name]: Option,
    [InputNumber.name]: InputNumber,
    [Col.name]: Col,
    [Row.name]: Row,
  },
  props: {},
  computed: {
    viewMetadata() {
      return transformHTML(this.code, this.selector.trim() || 'body', this.styleObj, {requireImage: this.requireImage})
    },
    styleList() {
      return _.keys(this.viewMetadata.styles)
    },
    styleObj() {
      return transformCSS(this.css)
    },
    styleStr() {
      return printJSONValue(_.pick(this.styleObj, this.styleList), {css: this.postCss, hairline: this.hairline})
    },
    selectorOptions() {
      return ['body', ..._.keys(this.styleObj).map(t => `.${t}`)]
    },
    componentName() {
      return _.upperFirst(this.name.trim())
    },
    postCSSStr() {
      if (!this.postCss) return ''
      return `const {width,height} = Dimensions.get('window');
const BASE_WIDTH = ${this.baseWidth};
const PX2DP = px => (px * width) / BASE_WIDTH;
const FontSize = (size) => {
  if (PixelRatio === 2) {
    if (width < 360) {
      return size * 0.95;
    }
    if (height < 667) {
      return size;
    } else if (height >= 667 && height <= 735) {
      return size * 1.15;
    }
    return size * 1.25;
  }
  if (PixelRatio === 3) {
    if (width <= 360) {
      return size;
    }
    if (height < 667) {
      return size * 1.15;
    }
    if (height >= 667 && height <= 735) {
      return size * 1.2;
    }
    return size * 1.27;
  }
  if (PixelRatio === 3.5) {
    if (width <= 360) {
      return size;
    }
    if (height < 667) {
      return size * 1.2;
    }
    if (height >= 667 && height <= 735) {
      return size * 1.25;
    }
    return size * 1.4;
  }
  return size;
};
`
    },
    singleFileStr() {
      try {
        return prettier.format(`
      /**
       * User: puti94
       * Time: ${new Date()}.
       */
      import React from 'react'
      import {${_.keys(this.viewMetadata.components).join(',')},StyleSheet,Dimensions,PixelRatio} from 'react-native'
      ${this.postCSSStr}
      export default function ${this.componentName}(){
      return (${this.viewMetadata.text})
      }
      const styles = StyleSheet.create(${this.styleStr});
      `, {parser: 'espree', plugins: [parserEspree]})
      } catch (e) {
        return JSON.stringify(e, null, 4)
      }
    }
  },
  data() {
    return {
      drawer: false,
      requireImage: false,
      postCss: true,
      baseWidth: '375',
      hairline: true,
      name: 'Index',
      code: htmlTmp,
      selector: 'body',
      css: cssTmp,
      cmOptions: {
        tabSize: 4,
        mode: 'text/html',
        theme: 'base16-dark',
        lineNumbers: true,
        scroll: true,
        line: true,
        // more CodeMirror options...
      }
    }
  },
  methods: {
    exportCode() {
      if (this.requireImage) {
        axios.post('/api/download', {
          html: this.singleFileStr,
          name: this.componentName,
          images: _.keys(this.viewMetadata.images).map(key => ({
            path: key,
            name: this.viewMetadata.images[key]
          }))
        })
      } else {
        exportFile(this.singleFileStr, `${this.componentName}.js`)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.el-aside {
  background-color: #f9f9fc;
}

.CodeMirror {
  width: 100%;
  height: 100%;
}

.float-set {
  position: absolute;
  right: 4%;
  top: 100px;
}

.page {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.layout {
  display: flex;
  flex: 1;
  padding: 20px;
  overflow: auto;
}

.edit-view {
  flex: 1;
  height: 90%;
  overflow: auto;
}

.preview-view {
  flex: 1;
  overflow: auto;
  background-color: aliceblue;
}
</style>
