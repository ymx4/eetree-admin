<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddPermission">
      添加权限
    </el-button>

    <el-table v-loading="listLoading" :data="list" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="路径">
        <template slot-scope="scope">
          {{ scope.row.http_path }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Http Method">
        <template slot-scope="scope">
          {{ scope.row.http_method }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">
            编辑
          </el-button>
          <el-button v-if="scope.row.id != 1" type="danger" size="small" @click="handleDelete(scope)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getPermissions" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑':'添加'">
      <el-form :model="permission" label-width="160px" label-position="left">
        <el-form-item label="名称">
          <el-input v-model="permission.name" placeholder="名称" />
        </el-form-item>
        <el-form-item label="路径，以回车分隔">
          <el-input
            v-model="permission.http_path"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="路径，以回车分隔"
          />
        </el-form-item>
        <el-form-item label="Http Method">
          <el-select v-model="permission.http_method">
            <el-option
              v-for="item in httpMethods"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
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
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { getPermissions, addPermission, deletePermission, updatePermission } from '@/api/admin'
import Pagination from '@/components/Pagination'

const defaultPermission = {
  name: '',
  http_path: '',
  http_method: ''
}

export default {
  name: 'AdminPermission',
  components: { Pagination },
  data() {
    return {
      httpMethods: ['ANY', 'GET', 'POST', 'PUT', 'DELETE'],
      listLoading: true,
      permission: Object.assign({}, defaultPermission),
      list: [],
      dialogVisible: false,
      dialogType: 'new',
      total: 0,
      listQuery: {
        page: 1,
        limit: 10
      }
    }
  },
  created() {
    this.getPermissions()
  },
  methods: {
    async getPermissions() {
      this.listLoading = true
      const res = await getPermissions({ page: this.listQuery.page })
      this.list = res.data
      this.listQuery.page = res.meta.current_page
      this.listQuery.limit = res.meta.per_page
      this.total = res.meta.total
      this.listLoading = false
    },
    handleAddPermission() {
      this.permission = Object.assign({}, defaultPermission)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.permission = deepClone(scope.row)
    },
    handleDelete({ $index, row }) {
      this.$confirm('确定要删除吗', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await deletePermission(row.id)
          this.list.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(err => { console.error(err) })
    },
    fields(permission) {
      return {
        name: permission.name,
        http_path: permission.http_path,
        http_method: permission.http_method
      }
    },
    async confirmSubmit() {
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        await updatePermission(this.permission.id, this.fields(this.permission))
        for (let index = 0; index < this.list.length; index++) {
          if (this.list[index].id === this.permission.id) {
            this.list.splice(index, 1, Object.assign({}, this.permission))
            break
          }
        }
      } else {
        const { data } = await addPermission(this.fields(this.permission))
        this.permission.id = data.id
        this.list.push(this.permission)
      }

      this.dialogVisible = false
      this.$notify({
        title: 'Success',
        message: '操作成功',
        type: 'success'
      })
    }
  }
}
</script>
