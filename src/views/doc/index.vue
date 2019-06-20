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
          <el-button v-if="scope.row.published === 1" type="primary" size="small">
            <a target="_blank" :href="frontBaseUrl + '/doc/detail/' + scope.row.id">
              查看
            </a>
          </el-button>
          <el-button v-if="scope.row.published === 0" type="primary" size="small" @click="handlePreview(scope)">
            预览
          </el-button>
          <!-- <el-button type="primary" size="small" @click="handleEdit(scope)">
            编辑
          </el-button> -->
          <el-button v-if="scope.row.docTop" type="primary" size="small" @click="handleTop(scope, 0)">
            取消置顶
          </el-button>
          <el-button v-if="!scope.row.docTop" type="primary" size="small" @click="handleTop(scope, 1)">
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
    <el-dialog :visible.sync="previewVisable" title="预览" :fullscreen="true">
      <iframe :src="previewUrl" style="width: 100%; border: 0;" :height="previewHeight" />
    </el-dialog>
    <el-dialog :visible.sync="topVisible" title="置顶">
      <el-form :model="docTop" label-width="160px" label-position="left">
        <el-form-item label="置顶时间段">
          <el-date-picker
            v-model="docTop.date"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        <el-form-item label="展示次数（0为不限制）">
          <el-input v-model="docTop.threshold" placeholder="展示次数" />
        </el-form-item>
        <el-form-item v-if="docTop.view_count > 0" label="已展示次数">
          <el-input v-model="docTop.view_count" :disabled="true" />
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
import { getDocs, updateDoc, docPreview } from '@/api/doc'
import Pagination from '@/components/Pagination'

const defaultDoc = {
  name: '',
  password: ''
}

const defaultTop = {
  date: '',
  threshold: 0,
  view_count: 0,
  top: true
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
        limit: 10
      },
      previewVisable: false,
      previewUrl: '',
      previewHeight: 0,
      topVisible: false,
      docTop: Object.assign({}, defaultTop)
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
    handlePreview(scope) {
      docPreview(scope.row.id).then(res => {
        this.previewHeight = document.documentElement.clientHeight
        this.previewVisable = true
        this.previewUrl = res.data.url
      })
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
    handleTop(scope, top) {
      if (top === 1) {
        this.topVisible = true
      }
    },
    confirmTop() {
    }
  }
}
</script>
