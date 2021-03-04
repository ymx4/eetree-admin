<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.orderNo" placeholder="订单号" style="width: 200px;" class="filter-item" />
      <el-select v-model="listQuery.status" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option label="所有类型" value="all" />
        <el-option
          v-for="statusOpt in statusOpts"
          :key="statusOpt.k"
          :label="statusOpt.l"
          :value="statusOpt.k"
        />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="订单号">
        <template slot-scope="scope">
          {{ scope.row.order_no }}<template v-if="scope.row.paylog"><br>商户单号：{{ scope.row.paylog.out_trade_no }}</template>
          <el-tag v-if="scope.row.deleted_at" size="mini" effect="dark" type="danger">已删除</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="用户">
        <template slot-scope="scope">
          <show-user v-model="scope.row.user" :address="scope.row.address" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="商品">
        <template slot-scope="scope">
          <el-link type="primary" :href="scope.row.orderItems[0].project_goods.project.url" target="_blank">
            {{ scope.row.orderItems[0].project_goods.project.title }}
          </el-link> >> {{ scope.row.orderItems[0].project_goods.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="总金额">
        <template slot-scope="scope">
          {{ scope.row.price }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态">
        <template slot-scope="scope">
          {{ scope.row.status_label }}
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getOrders" />

  </div>
</template>

<script>
import { getOrders } from '@/api/order'
import Pagination from '@/components/Pagination'
import ShowUser from '../user/components/Show'
import { getEnums } from '@/api/common'

export default {
  name: 'OrderList',
  components: { Pagination, ShowUser },
  data() {
    return {
      listLoading: true,
      list: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        orderNo: '',
        status: 'all'
      },
      statusOpts: []
    }
  },
  created() {
    this.getOrders()
    this.getStatusOpts()
  },
  methods: {
    handleFilter() {
      this.listQuery.page = 1
      this.getOrders()
    },
    async getOrders() {
      this.listLoading = true
      const res = await getOrders({
        page: this.listQuery.page,
        orderNo: this.listQuery.orderNo,
        status: this.listQuery.status
      })
      this.list = res.data
      this.listQuery.page = res.meta.current_page
      this.listQuery.limit = res.meta.per_page
      this.total = res.meta.total
      this.listLoading = false
    },
    async getStatusOpts() {
      const res = await getEnums('order.status')
      res.data.forEach(element => {
        if (element.k !== 0) {
          this.statusOpts.push(element)
        }
      })
    }
  }
}
</script>
