<template>
  <div class="upload-container">
    <el-button type="primary" icon="el-icon-upload" style="position: absolute;bottom: 15px;margin-left: 40px;" @click="imagecropperShow=true">
      Change Avatar
    </el-button>

    <image-cropper
      v-show="imagecropperShow"
      :key="imagecropperKey"
      :width="300"
      :height="300"
      url="https://httpbin.org/post"
      lang-type="en"
      @close="close"
      @crop-upload-success="cropSuccess"
    />
  </div>
</template>

<script>
import { getToken } from '@/api/qiniu'
import ImageCropper from '@/components/ImageCropper'

export default {
  name: 'CropUpload',
  components: { ImageCropper },
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      tempUrl: '',
      token: '',
      imagecropperShow: false,
      imagecropperKey: 0
    }
  },
  computed: {
    imageUrl() {
      return this.value
    }
  },
  created() {
    this.getToken()
  },
  methods: {
    async getToken() {
      const res = await getToken()
      this.token = res.data.token
    },
    cropSuccess(resData) {
      this.imagecropperShow = false
      this.imagecropperKey = this.imagecropperKey + 1
      this.value = resData.files.avatar
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
