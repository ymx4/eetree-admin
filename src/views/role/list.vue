<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddRole">
      添加角色
    </el-button>

    <el-table v-loading="listLoading" :data="list" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="权限">
        <template slot-scope="scope">
          {{ scope.row.permissionStr }}
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

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑':'添加'">
      <el-form :model="role" label-width="80px" label-position="left">
        <el-form-item label="名称">
          <el-input v-model="role.name" placeholder="名称" />
        </el-form-item>
        <el-form-item label="权限">
          <el-checkbox-group v-model="checkedPermissions">
            <el-checkbox v-for="permission in permissionsData" :key="permission.id" :label="permission.id">{{ permission.name }}</el-checkbox>
          </el-checkbox-group>
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
import { arrPluck, deepClone } from '@/utils'
import { getRoles, addRole, deleteRole, updateRole } from '@/api/role'
import { getPermissions } from '@/api/permission'
import { getMenus } from '@/api/menu'

const defaultRole = {
  name: '',
  password: '',
  permissions: []
}

export default {
  data() {
    return {
      listLoading: true,
      role: Object.assign({}, defaultRole),
      permissions: [],
      list: [],
      dialogVisible: false,
      dialogType: 'new',
      checkedPermissions: []
    }
  },
  computed: {
    permissionsData() {
      return this.permissions
    }
  },
  created() {
    this.getMenus()
    this.getPermissions()
    this.getRoles()
  },
  methods: {
    async getMenus() {
      const res = await getMenus()
      this.menus = res.data
    },
    async getPermissions() {
      const res = await getPermissions()
      this.permissions = res.data
    },
    async getRoles() {
      this.listLoading = true
      const res = await getRoles()
      this.list = this.handleRoleList(res.data)
      this.listLoading = false
    },
    handleRoleList(list) {
      list.forEach(element => {
        let permissionStr = ''
        if (element.permissions.length > 0) {
          const permissionName = arrPluck(element.permissions, 'name')
          permissionStr = permissionName.join(',')
        }
        element.permissionStr = permissionStr
      })
      return list
    },
    handleAddRole() {
      this.role = Object.assign({}, defaultRole)
      this.checkedPermissions = []
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.role = deepClone(scope.row)
      this.checkedPermissions = []
      this.$nextTick(() => {
        this.role.permissions.forEach(element => {
          this.checkedPermissions.push(element.id)
        })
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('确定要删除吗', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await deleteRole(row.id)
          this.list.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(err => { console.error(err) })
    },
    fields(role) {
      return {
        name: role.name,
        password: role.password,
        permissions: this.checkedPermissions
      }
    },
    getRolePermission() {
      this.role.permissions = []
      if (this.checkedPermissions.length > 0) {
        this.checkedPermissions.forEach(permissionId => {
          for (let index = 0; index < this.permissions.length; index++) {
            if (this.permissions[index].id === permissionId) {
              this.role.permissions.push(this.permissions[index])
              break
            }
          }
        })
      }
    },
    async confirmSubmit() {
      const isEdit = this.dialogType === 'edit'
      this.getRolePermission()
      if (isEdit) {
        await updateRole(this.role.id, this.fields(this.role))
        for (let index = 0; index < this.list.length; index++) {
          if (this.list[index].id === this.role.id) {
            this.list.splice(index, 1, Object.assign({}, this.role))
            break
          }
        }
      } else {
        const { data } = await addRole(this.fields(this.role))
        this.role.id = data.id
        this.role.created_at = data.created_at
        this.list.push(this.role)
      }
      this.list = this.handleRoleList(this.list)

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
