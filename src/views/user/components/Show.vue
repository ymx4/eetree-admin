<template>
  <div>
    <el-link type="primary" @click="dialogVisible=true">{{ value.nickname }}</el-link>

    <el-dialog :visible.sync="dialogVisible" title="用户信息">
      <el-form :model="value" label-width="80px">
        <div v-if="address" class="divider-title">注册信息</div>
        <el-form-item label="用户名">
          <div class="form-show-item">{{ value.name }}</div>
        </el-form-item>
        <el-form-item label="昵称">
          <div class="form-show-item">{{ value.nickname }}</div>
        </el-form-item>
        <el-form-item label="手机">
          <div class="form-show-item">{{ value.mobile }}</div>
        </el-form-item>
        <div v-if="address">
          <el-divider />
          <div class="divider-title">收货地址</div>
          <el-form-item label="姓名">
            <div class="form-show-item">{{ address.name }}</div>
          </el-form-item>
          <el-form-item label="手机">
            <div class="form-show-item">{{ address.mobile }}</div>
          </el-form-item>
          <el-form-item label="地址">
            <div class="form-show-item">{{ address.address }}</div>
          </el-form-item>
          <el-form-item label="邮编">
            <div class="form-show-item">{{ address.postcode }}</div>
          </el-form-item>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ShowUser',
  props: {
    value: {
      type: Object,
      default: function() {
        return {
          name: '',
          nickname: '',
          mobile: ''
        }
      }
    },
    address: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      dialogVisible: false
    }
  }
}
</script>
<style lang="scss" scoped>
  .form-show-item{
    text-align: left;
  }
  .divider-title{
    margin-bottom: 20px;
    font-size: 16px;
  }
</style>
