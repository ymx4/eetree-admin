<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddUser">
      添加用户
    </el-button>

    <el-table v-loading="listLoading" :data="list" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="用户名">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间">
        <template slot-scope="scope">
          {{ scope.row.created_at }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="角色">
        <template slot-scope="scope">
          {{ scope.row.roleStr }}
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

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getUsers" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑':'添加'">
      <el-form :model="user" label-width="80px" label-position="left">
        <el-form-item label="用户名">
          <el-input v-model="user.name" placeholder="用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="user.password" placeholder="密码" />
          <div v-if="dialogType==='edit'" class="sub-title" style="color:#E6A23C;">留空则不修改密码</div>
        </el-form-item>
        <el-form-item label="角色">
          <el-checkbox-group v-model="checkedRoles">
            <el-checkbox v-for="role in rolesData" :key="role.id" :label="role.id">{{ role.name }}</el-checkbox>
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
import { getUsers, addUser, deleteUser, updateUser, getRoles } from '@/api/admin'
import Pagination from '@/components/Pagination'

const defaultUser = {
  name: '',
  password: '',
  roles: []
}

export default {
  name: 'AdminUser',
  components: { Pagination },
  data() {
    return {
      listLoading: true,
      user: Object.assign({}, defaultUser),
      roles: [],
      list: [],
      dialogVisible: false,
      dialogType: 'new',
      checkedRoles: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 10
      }
    }
  },
  computed: {
    rolesData() {
      return this.roles
    }
  },
  created() {
    this.getRoles()
    this.getUsers()
  },
  methods: {
    async getRoles() {
      const res = await getRoles()
      this.roles = res.data
    },
    async getUsers() {
      this.listLoading = true
      const res = await getUsers({ page: this.listQuery.page })
      this.list = this.handleUserList(res.data)
      this.listQuery.page = res.meta.current_page
      this.listQuery.limit = res.meta.per_page
      this.total = res.meta.total
      this.listLoading = false
    },
    handleUserList(list) {
      list.forEach(element => {
        let roleStr = ''
        if (element.roles.length > 0) {
          const roleName = arrPluck(element.roles, 'name')
          roleStr = roleName.join(',')
        }
        element.roleStr = roleStr
      })
      return list
    },
    handleAddUser() {
      this.user = Object.assign({}, defaultUser)
      this.checkedRoles = []
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.user = deepClone(scope.row)
      this.checkedRoles = []
      this.$nextTick(() => {
        this.user.roles.forEach(element => {
          this.checkedRoles.push(element.id)
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
          await deleteUser(row.id)
          this.list.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(err => { console.error(err) })
    },
    fields(user) {
      return {
        name: user.name,
        password: user.password,
        roles: this.checkedRoles
      }
    },
    getUserRole() {
      this.user.roles = []
      if (this.checkedRoles.length > 0) {
        this.checkedRoles.forEach(roleId => {
          for (let index = 0; index < this.roles.length; index++) {
            if (this.roles[index].id === roleId) {
              this.user.roles.push(this.roles[index])
              break
            }
          }
        })
      }
    },
    async confirmSubmit() {
      const isEdit = this.dialogType === 'edit'
      this.getUserRole()
      if (isEdit) {
        await updateUser(this.user.id, this.fields(this.user))
        for (let index = 0; index < this.list.length; index++) {
          if (this.list[index].id === this.user.id) {
            this.list.splice(index, 1, Object.assign({}, this.user))
            break
          }
        }
      } else {
        const { data } = await addUser(this.fields(this.user))
        this.user.id = data.id
        this.user.created_at = data.created_at
        this.list.push(this.user)
      }
      this.list = this.handleUserList(this.list)

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
