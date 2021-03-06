<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.q" placeholder="昵称" style="width: 200px;" class="filter-item" />
      <el-select v-model="listQuery.searchType" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option label="所有类型" value="all" />
        <el-option
          v-for="userType in userTypes"
          :key="userType.k"
          :label="userType.l"
          :value="userType.k"
        />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" type="primary" @click="handleAddUser">
        添加用户
      </el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="头像">
        <template slot-scope="scope">
          <img style="max-width:100px;" :src="scope.row.avatar">
        </template>
      </el-table-column>
      <el-table-column align="center" label="用户名">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.is_admin">{{ scope.row.user_type_label }}</el-tag>
          <a :href="frontBaseUrl + 'user/' + scope.row.id" target="_blank">{{ scope.row.name }}</a>
        </template>
      </el-table-column>
      <el-table-column align="center" label="昵称">
        <template slot-scope="scope">
          {{ scope.row.nickname }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="手机号">
        <template slot-scope="scope">
          {{ scope.row.mobile }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="总收入">
        <template slot-scope="scope">
          {{ scope.row.revenue }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间">
        <template slot-scope="scope">
          {{ scope.row.created_at }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">
            编辑
          </el-button>
          <el-button v-if="scope.row.can_delete" type="danger" size="small" @click="handleDelete(scope)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getUsers" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑':'添加'">
      <el-form :model="user" label-width="80px" label-position="left">
        <el-form-item v-if="dialogType==='new'" label="用户名">
          <el-input v-model="user.name" placeholder="用户名" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="user.nickname" placeholder="昵称" />
        </el-form-item>
        <el-form-item v-if="!user.is_super && dialogType==='edit'" label="类型">
          <el-select v-model="user.user_type">
            <el-option
              v-for="userType in userTypes"
              :key="userType.k"
              :label="userType.l"
              :value="userType.k"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="user.password" type="password" placeholder="密码" />
          <div v-if="dialogType==='edit'" class="sub-title" style="color:#E6A23C;">留空则不修改密码</div>
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
import { deepClone, frontBaseUrl } from '@/utils'
import { getUsers, addUser, deleteUser, updateUser } from '@/api/user'
import { getEnums } from '@/api/common'
import Pagination from '@/components/Pagination'

const defaultUser = {
  name: '',
  nickname: '',
  password: '',
  user_type: 0
}

export default {
  name: 'UserList',
  components: { Pagination },
  data() {
    return {
      frontBaseUrl: frontBaseUrl(),
      listLoading: true,
      user: Object.assign({}, defaultUser),
      list: [],
      dialogVisible: false,
      dialogType: 'new',
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        q: '',
        searchType: 'all'
      },
      userTypes: []
    }
  },
  created() {
    this.getUsers()
    this.getUserTypes()
  },
  methods: {
    handleFilter() {
      this.listQuery.page = 1
      this.getUsers()
    },
    async getUsers() {
      this.listLoading = true
      const res = await getUsers({
        page: this.listQuery.page,
        q: this.listQuery.q,
        sType: this.listQuery.searchType
      })
      this.list = res.data
      this.listQuery.page = res.meta.current_page
      this.listQuery.limit = res.meta.per_page
      this.total = res.meta.total
      this.listLoading = false
    },
    async getUserTypes() {
      const res = await getEnums('user.types')
      res.data.forEach(element => {
        if (element.k !== 1) {
          this.userTypes.push(element)
        }
      })
    },
    handleAddUser() {
      this.user = Object.assign({}, defaultUser)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.user = deepClone(scope.row)
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
        nickname: user.nickname,
        password: user.password,
        user_type: user.user_type
      }
    },
    async confirmSubmit() {
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        const { data } = await updateUser(this.user.id, this.fields(this.user))
        this.user = data
        for (let index = 0; index < this.list.length; index++) {
          if (this.list[index].id === this.user.id) {
            this.list.splice(index, 1, Object.assign({}, this.user))
            break
          }
        }
      } else {
        const { data } = await addUser(this.fields(this.user))
        this.user = data
        this.list.unshift(this.user)
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
