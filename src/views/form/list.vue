<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" placeholder="名称" style="width: 200px;" class="filter-item" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" type="primary" @click="handleAddXform">
        添加
      </el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleExport(scope)">
            数据导出
          </el-button>
          <el-button type="primary" size="small" @click="handleEdit(scope)">
            编辑
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getXforms" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑':'添加'">
      <el-form :model="xform" label-width="160px" label-position="left">
        <el-form-item label="名称">
          <el-input v-model="xform.name" placeholder="名称" />
        </el-form-item>
        <el-form-item label="表单项">
          <el-button type="primary" @click="showFormMaker">
            编辑
          </el-button>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">
          取消
        </el-button>
        <el-button type="primary" @click="confirmSubmit">
          提交
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogFormVisible" title="表单项" class="form-maker" :fullscreen="true">
      <form-maker ref="formMaker" :is-admin="is_super" @close="getData" />
    </el-dialog>
  </div>
</template>

<script>
import { deepClone, frontBaseUrl } from '@/utils'
import { getXforms, addXform, deleteXform, updateXform } from '@/api/xform'
import { secret } from '@/api/common'
import store from '@/store'
import Pagination from '@/components/Pagination'

const defaultXform = {
  name: ''
}

export default {
  name: 'XformList',
  components: { Pagination },
  data() {
    return {
      frontBaseUrl: frontBaseUrl(),
      is_super: store.getters.is_super,
      listLoading: true,
      xform: Object.assign({}, defaultXform),
      list: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        title: ''
      },
      dialogVisible: false,
      dialogType: 'new',
      dialogFormVisible: false
    }
  },
  created() {
    this.getXforms()
  },
  methods: {
    handleFilter() {
      this.listQuery.page = 1
      this.getXforms()
    },
    async getXforms() {
      this.listLoading = true
      const res = await getXforms({
        page: this.listQuery.page,
        title: this.listQuery.title
      })
      this.list = res.data
      this.listLoading = false
    },
    handleAddXform() {
      this.xform = Object.assign({}, defaultXform)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.xform = deepClone(scope.row)
      this.dialogVisible = true
    },
    handleDelete({ $index, row }) {
      this.$confirm('确定要删除吗', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await deleteXform(row.id)
          this.list.splice($index, 1)
          for (let index = 0; index < this.list.length; index++) {
            if (this.list[index].order > row.order) {
              this.list[index].order--
            }
          }
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(err => { console.error(err) })
    },
    showFormMaker() {
      this.dialogFormVisible = true
      if (this.xform.data && this.xform.data !== '') {
        this.$nextTick(() => {
          this.$refs.formMaker.refreshJson(deepClone(this.xform.data))
        })
      }
    },
    getData(formData) {
      if (formData) {
        this.xform.data = formData
      }
      this.dialogFormVisible = false
    },
    fields(xform) {
      return {
        name: xform.name,
        data: xform.data
      }
    },
    async confirmSubmit() {
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        await updateXform(this.xform.id, this.fields(this.xform))
        for (let index = 0; index < this.list.length; index++) {
          if (this.list[index].id === this.xform.id) {
            this.list.splice(index, 1, Object.assign({}, this.xform))
            break
          }
        }
      } else {
        const { data } = await addXform(this.fields(this.xform))
        this.xform.id = data.id
        for (let index = 0; index < this.list.length; index++) {
          if (this.list[index].order >= this.xform.order) {
            this.list[index].order++
          }
        }
        this.list.push(this.xform)
      }
      this.list.sort(function(a, b) {
        let sort = a.order - b.order
        if (sort === 0) {
          sort = a.id - b.id
        }
        return sort
      })

      this.dialogVisible = false
      this.$notify({
        title: 'Success',
        message: '操作成功',
        type: 'success'
      })
    },
    async handleExport(scope) {
      await secret()
      window.open(this.frontBaseUrl + 'export-xform/' + scope.row.id)
    }
  }
}
</script>
<style scoped>
  .form-maker >>> .el-dialog__header{
    display: none;
  }
  .form-maker >>> .el-dialog__body{
    padding: 0;
  }
</style>
