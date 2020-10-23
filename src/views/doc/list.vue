<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" placeholder="标题" style="width: 200px;" class="filter-item" />
      <el-select v-model="listQuery.searchType" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option label="所有" value="all" />
        <el-option label="置顶文档" value="top" />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
    </div>
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
      <el-table-column v-if="listQuery.searchType === 'top'" align="center" label="置顶已展示">
        <template slot-scope="scope">
          {{ scope.row.docTop.view_count }}次
        </template>
      </el-table-column>
      <el-table-column v-if="listQuery.searchType === 'top'" align="center" label="置顶已点击">
        <template slot-scope="scope">
          {{ scope.row.docTop.click_count }}次
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间">
        <template slot-scope="scope">
          {{ scope.row.created_at }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button v-if="scope.row.published === 1" type="primary" size="small">
            <a target="_blank" :href="frontBaseUrl + 'doc/detail/' + scope.row.id">
              查看
            </a>
          </el-button>
          <!-- <el-button type="primary" size="small" @click="handleEdit(scope)">
            编辑
          </el-button> -->
          <el-button v-if="scope.row.docTop && scope.row.docTop.is_top === 1" type="warning" size="small" @click="handleTop(scope)">
            取消置顶
          </el-button>
          <el-button v-else type="primary" size="small" @click="handleTop(scope)">
            置顶
          </el-button>
          <el-button v-if="scope.row.published === 0" type="primary" size="small" @click="handlePublish(scope, 1)">
            上线
          </el-button>
          <el-button v-if="scope.row.published === 1" type="warning" size="small" @click="handlePublish(scope, 0)">
            下线
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :visible.sync="topVisible" title="置顶">
      <el-form :model="docTop" label-width="160px" label-position="left">
        <el-form-item label="置顶时间段">
          <el-date-picker
            v-model="docTop.date"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="首页置顶">
          <el-switch v-model.number="docTop.page_index" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="分类页置顶">
          <el-switch v-model.number="docTop.page_category" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="点击阀值（0为不限制）">
          <el-input v-model="docTop.threshold" placeholder="点击阀值" />
        </el-form-item>
        <el-form-item v-if="docTop.click_count > 0" label="已点击次数">
          <el-input v-model="docTop.click_count" :disabled="true" />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="topVisible=false">
          取消
        </el-button>
        <el-button type="primary" @click="confirmTop">
          提交
        </el-button>
      </div>
    </el-dialog>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getDocs" />

  </div>
</template>

<script>
import { deepClone, frontBaseUrl } from '@/utils'
import { getDocs, updateDoc, docTop, docUnTop } from '@/api/doc'
import Pagination from '@/components/Pagination'

const defaultDoc = {
  name: '',
  password: ''
}

const defaultTop = {
  date: '',
  page_index: 0,
  page_category: 0,
  threshold: 0,
  click_count: 0,
  is_top: 1
}

export default {
  name: 'DocPublish',
  components: { Pagination },
  data() {
    return {
      frontBaseUrl: frontBaseUrl(),
      listLoading: true,
      doc: Object.assign({}, defaultDoc),
      list: [],
      dialogVisible: false,
      dialogType: 'new',
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        title: '',
        searchType: 'all'
      },
      topVisible: false,
      topId: 0,
      docTop: Object.assign({}, defaultTop)
    }
  },
  created() {
    this.getDocs()
  },
  methods: {
    handleFilter() {
      this.listQuery.page = 1
      this.getDocs()
    },
    async getDocs() {
      this.listLoading = true
      const res = await getDocs({
        page: this.listQuery.page,
        title: this.listQuery.title,
        sType: this.listQuery.searchType
      })
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
    },
    async handleTop(scope) {
      this.topId = scope.row.id
      if (scope.row.docTop && scope.row.docTop.is_top === 1) {
        await docUnTop(this.topId)
        this.list[scope.$index].docTop.is_top = 0
        this.$message({
          type: 'success',
          message: '取消成功!'
        })
      } else {
        this.topVisible = true
        if (scope.row.docTop) {
          this.docTop = deepClone(scope.row.docTop)
        } else {
          this.docTop = deepClone(defaultTop)
        }
      }
    },
    async confirmTop() {
      await docTop(this.topId, this.docTop)
      for (let index = 0; index < this.list.length; index++) {
        if (this.list[index].id === this.topId) {
          this.list[index].docTop = deepClone(this.docTop)
          this.list[index].docTop.is_top = 1
          break
        }
      }
      this.$message({
        type: 'success',
        message: '操作成功!'
      })
      this.topVisible = false
    }
  }
}
</script>
