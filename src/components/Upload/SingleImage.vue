<template>
  <div class="upload-container">
    <el-upload
      :data="dataObj"
      :multiple="false"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :on-success="handleImageSuccess"
      class="image-uploader"
      drag
      action="https://up-z2.qiniup.com"
    >
      <i class="el-icon-upload" />
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
      </div>
    </el-upload>
    <div class="image-preview">
      <div v-show="cloud.url.length>1" class="image-preview-wrapper">
        <img :src="cloud.url">
        <div class="image-preview-action">
          <i class="el-icon-delete" @click="rmImage" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getToken } from '@/api/qiniu'

export default {
  name: 'SingleImageUpload',
  props: {
    cloud: {
      type: Object,
      default: function() {
        return { url: '' }
      }
    },
    value: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      cloud_id: 0,
      dataObj: { token: '' }
    }
  },
  methods: {
    rmImage() {
      this.$emit('input', 0)
      this.cloud.url = ''
    },
    handleImageSuccess(response) {
      this.cloud.url = response.data.url
      this.$emit('input', response.data.cloud_id)
    },
    beforeUpload(file) {
      const _self = this
      return new Promise((resolve, reject) => {
        getToken().then(response => {
          _self.dataObj.token = response.data.token
          _self.dataObj['x:name'] = file.name
          resolve(true)
        }).catch(err => {
          console.log(err)
          reject(false)
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
    @import "~@/styles/mixin.scss";
    .upload-container {
        width: 100%;
        position: relative;
        @include clearfix;
        .image-uploader {
            width: 40%;
            float: left;
        }
        .image-preview {
            width: 50%;
            height: auto;
            min-height: 200px;
            position: relative;
            border: 1px dashed #d9d9d9;
            float: left;
            margin-left: 50px;
            .image-preview-wrapper {
                position: relative;
                width: 100%;
                height: 100%;
                img {
                    width: 100%;
                    height: 100%;
                }
            }
            .image-preview-action {
                position: absolute;
                width: 100%;
                height: 100%;
                left: 0;
                top: 0;
                cursor: default;
                text-align: center;
                color: #fff;
                opacity: 0;
                font-size: 20px;
                background-color: rgba(0, 0, 0, .5);
                transition: opacity .3s;
                cursor: pointer;
                text-align: center;
                line-height: 200px;
                .el-icon-delete {
                    font-size: 36px;
                }
            }
            &:hover {
                .image-preview-action {
                    opacity: 1;
                }
            }
        }
    }

</style>
