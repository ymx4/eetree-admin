<template>
  <div class="app-container">
    <el-table v-loading="listLoading" :data="list" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="作者">
        <template slot-scope="scope">
          {{ scope.row.user.nickname }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="标题">
        <template slot-scope="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间">
        <template slot-scope="scope">
          {{ scope.row.created_at }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <!-- <el-button type="primary" size="small" @click="handleEdit(scope)">
            编辑
          </el-button> -->
          <el-button v-if="scope.row.published === 0" type="primary" size="small" @click="handlePublish(scope, 1)">
            上线
          </el-button>
          <el-button v-if="scope.row.published === 1" type="warning" size="small" @click="handlePublish(scope, 0)">
            下线
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getDocs" />

  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { getDocs, updateDoc } from '@/api/doc'
import Pagination from '@/components/Pagination'

const defaultDoc = {
  name: '',
  password: ''
}

export default {
  name: 'DocPublish',
  components: { Pagination },
  data() {
    return {
      listLoading: true,
      doc: Object.assign({}, defaultDoc),
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
    this.getDocs()
  },
  methods: {
    async getDocs() {
      this.listLoading = true
      const res = await getDocs({ page: this.listQuery.page })
      this.list = res.data
      this.listQuery.page = res.meta.current_page
      this.listQuery.limit = res.meta.per_page
      this.total = res.meta.total
      this.listLoading = false
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.doc = deepClone(scope.row)
    },
    async handlePublish(scope, publish) {
      await updateDoc(scope.row.id, { publish })
      for (let index = 0; index < this.list.length; index++) {
        if (this.list[index].id === scope.row.id) {
          this.list[index].published = publish
          break
        }
      }
      this.$message({
        type: 'success',
        message: '操作成功!'
      })
    }
  }
}
</script>
