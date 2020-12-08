<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.projectTitle" placeholder="项目名" style="width: 200px;" class="filter-item" />
      <el-input v-model="listQuery.name" placeholder="商品名" style="width: 200px;" class="filter-item" />
      <el-select v-model="listQuery.searchType" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option label="所有" value="all" />
        <el-option label="推广中" value="promote" />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
    </div>
    <el-table v-loading="listLoading" :data="list" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="商品名">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="项目名">
        <template slot-scope="scope">
          {{ scope.row.project.title }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="所有者">
        <template slot-scope="scope">
          {{ scope.row.user.nickname }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="价格">
        <template slot-scope="scope">
          {{ scope.row.price }}
        </template>
      </el-table-column>
      <el-table-column v-if="listQuery.searchType === 'promote'" align="center" label="推广已展示">
        <template slot-scope="scope">
          {{ scope.row.goodsPromote.view_count }}次
        </template>
      </el-table-column>
      <el-table-column v-if="listQuery.searchType === 'promote'" align="center" label="推广已购买">
        <template slot-scope="scope">
          {{ scope.row.goodsPromote.pay_count }}次
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间">
        <template slot-scope="scope">
          {{ scope.row.created_at }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button v-if="scope.row.goodsPromote" type="warning" size="small" @click="handlePromote(scope)">
            取消推广
          </el-button>
          <el-button v-else type="primary" size="small" @click="handlePromote(scope)">
            推广
          </el-button>
          <el-button type="primary" size="small" @click="handleXform(scope)">
            绑定表单
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :visible.sync="promoteVisible" title="推广">
      <el-form :model="goodsPromote" label-width="160px" label-position="left">
        <el-form-item label="置顶时间段">
          <el-date-picker
            v-model="goodsPromote.date"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="购买阀值（0为不限制）">
          <el-input v-model="goodsPromote.threshold" placeholder="购买阀值" />
        </el-form-item>
        <el-form-item v-if="goodsPromote.pay_count > 0" label="已购买次数">
          <el-input v-model="goodsPromote.pay_count" :disabled="true" />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="promoteVisible=false">
          取消
        </el-button>
        <el-button type="primary" @click="confirmPromote">
          提交
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="xformVisible" title="绑定表单">
      <el-form ref="xformForm" :model="goods.xform" label-width="80px" label-position="left">
        <el-form-item label="表单">
          <el-select v-model="goods.xform.id" filterable :filter-method="getXforms">
            <el-option
              v-for="xform in xforms"
              :key="xform.id"
              :label="xform.name"
              :value="xform.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="xformVisible=false">
          取消
        </el-button>
        <el-button type="primary" @click="confirmXform">
          提交
        </el-button>
      </div>
    </el-dialog>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getGoods" />

  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { getGoods, updateGoods, goodsPromote, goodsUnPromote } from '@/api/goods'
import { getXforms } from '@/api/xform'
import Pagination from '@/components/Pagination'

const defaultPromote = {
  date: '',
  threshold: 0,
  pay_count: 0
}

export default {
  name: 'GoodsList',
  components: { Pagination },
  data() {
    return {
      listLoading: true,
      xformReset: true,
      list: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        name: '',
        projectTitle: '',
        promote: 'all'
      },
      promoteVisible: false,
      promoteId: 0,
      goodsPromote: Object.assign({}, defaultPromote),
      xformVisible: false,
      goods: {
        xform: { id: 0, name: '无' }
      },
      xforms: [],
      xformLoading: false
    }
  },
  created() {
    this.getGoods()
  },
  methods: {
    handleFilter() {
      this.listQuery.page = 1
      this.getGoods()
    },
    async getGoods() {
      this.listLoading = true
      const res = await getGoods({
        page: this.listQuery.page,
        name: this.listQuery.name,
        projectTitle: this.listQuery.projectTitle,
        sType: this.listQuery.searchType
      })
      this.list = res.data
      this.listQuery.page = res.meta.current_page
      this.listQuery.limit = res.meta.per_page
      this.total = res.meta.total
      this.listLoading = false
    },
    async handlePromote(scope) {
      this.promoteId = scope.row.id
      if (scope.row.goodsPromote) {
        await goodsUnPromote(this.promoteId)
        this.list[scope.$index].goodsPromote = null
        this.$message({
          type: 'success',
          message: '取消成功!'
        })
      } else {
        this.promoteVisible = true
        if (scope.row.goodsPromote) {
          this.goodsPromote = deepClone(scope.row.goodsPromote)
        } else {
          this.goodsPromote = deepClone(defaultPromote)
        }
      }
    },
    async confirmPromote() {
      await goodsPromote(this.promoteId, this.goodsPromote)
      for (let index = 0; index < this.list.length; index++) {
        if (this.list[index].id === this.promoteId) {
          this.list[index].goodsPromote = deepClone(this.goodsPromote)
          this.list[index].goodsPromote.is_promote = 1
          break
        }
      }
      this.$message({
        type: 'success',
        message: '操作成功!'
      })
      this.promoteVisible = false
    },
    async getXforms(title) {
      if (!title && !this.xformReset) {
        return
      }
      const res = await getXforms({ title })
      this.xforms = res.data
      if (title) {
        this.xformReset = true
      } else {
        this.xformReset = false
        this.xforms.unshift({ id: 0, name: '无' })
      }
    },
    async handleXform(scope) {
      this.goods = scope.row
      if (!this.goods.xform) {
        this.goods.xform = { id: 0, name: '无' }
      }
      this.getXforms()
      if (this.goods.xform) {
        let xformExist = false
        this.xforms.forEach(xform => {
          if (xform.id === this.goods.xform.id) {
            xformExist = true
          }
        })
        if (!xformExist) {
          this.xforms.unshift(this.goods.xform)
        }
      }
      this.xformVisible = true
    },
    async confirmXform() {
      await updateGoods(this.goods.id, { xform_id: this.goods.xform.id })
      this.$message({
        type: 'success',
        message: '操作成功!'
      })
      this.xformVisible = false
    }
  }
}
</script>
