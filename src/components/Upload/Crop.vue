<template>
  <div class="upload-container">
    <el-button type="primary" icon="el-icon-upload" style="margin-left:10px;" @click="imagecropperShow=true">
      上传
    </el-button>

    <image-cropper
      v-show="imagecropperShow"
      :key="imagecropperKey"
      :width="cropOpt.width"
      :height="cropOpt.height"
      :no-circle="cropOpt.noCircle"
      :url="cropOpt.url"
      :storage="cropOpt.storage"
      :params="params"
      field="file"
      lang-type="zh"
      @close="close"
      @crop-upload-success="cropSuccess"
    />
    <div class="image-preview">
      <div v-show="imageUrl && imageUrl.length > 1" class="image-preview-wrapper">
        <img :src="imageUrl">
      </div>
    </div>
  </div>
</template>

<script>
import { getToken } from '@/api/qiniu'
import ImageCropper from '@/components/ImageCropper'

const defaultCropOpt = {
  width: 300,
  height: 300,
  noCircle: true,
  url: 'http://up-z2.qiniup.com',
  storage: 'qiniu'
}

export default {
  name: 'CropUpload',
  components: { ImageCropper },
  props: {
    imageUrl: {
      type: String,
      default: ''
    },
    fileId: {
      type: String,
      default: ''
    },
    // 剪裁图片的宽
    cropOpt: {
      type: Object,
      'default': defaultCropOpt
    }
  },
  data() {
    return {
      params: {},
      imagecropperShow: false,
      imagecropperKey: 0,
      qnUrl: ''
    }
  },
  created() {
    this.getToken()
    for (const i in defaultCropOpt) {
      if (!this.cropOpt[i]) {
        this.cropOpt[i] = defaultCropOpt[i]
      }
    }
  },
  methods: {
    async getToken() {
      const res = await getToken()
      this.params.token = res.data.token
      this.qnUrl = res.data.qnUrl
    },
    cropSuccess(resData) {
      this.imagecropperShow = false
      this.imagecropperKey = this.imagecropperKey + 1
      this.imageUrl = resData.data.url
      this.$emit('update:fileId', resData.data.file_id)
    },
    close() {
      this.imagecropperShow = false
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
            width: 60%;
            float: left;
        }
        .image-preview {
            width: 200px;
            height: 200px;
            position: relative;
            border: 1px dashed #d9d9d9;
            float: left;
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
