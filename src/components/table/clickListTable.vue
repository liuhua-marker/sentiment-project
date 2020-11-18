<template>
  <el-card class="app-click-table">
    <div v-if="options.title" class="title clearfix">
      <span class="fl">
        {{ options.title }}
      </span>
    </div>

    <div v-if="options.header">
      <el-table
        v-if="showTable"
        ref="listTable"
        v-loading="loading"
        :height="height(options.height)"
        :data="tableData"
        :default-sort="{ prop: 'sortFuckElmentUiNum' }"
        border
        @select="handleSelectionChange"
        @select-all="handleSelectionChange"
        @row-click="handleSelectionChange "
      >
        <!--  :span-method="objectSpanMethod" -->
        <!--        <el-table-column width="1" prop="sortFuckElmentUiNum"></el-table-column>-->

        <el-table-column
          v-if="options.multipleTable"
          type="selection"
          width="55"
          align="center"
        />
        <el-table-column
          v-if="options.index.num"
          label="序号"
          align="center"
          :width="options.index.width"
        >
          <template slot-scope="scope">
            <span v-if="isAdd">{{ scope.$index + 1 }}</span>
            <span v-else>
              {{ scope.$index + (page.pageNo - 1) * page.pageSize + 1 }}
            </span>
          </template>
        </el-table-column>
        <!--列表项循环 start-->
        <el-table-column
          v-for="item in options.header"
          :key="item.label"
          :prop="item.propName"
          :label="item.label"
          :class-name="item.class"
          :width="item.width"
          :min-width="item.minWidth"
          :align="item.align || 'center'"
          :show-overflow-tooltip="true"
        >
          <template slot="header" slot-scope="scope">
            <el-select
              v-if="item.headerSort"
              v-model="item.headerSort.headerVal"
              placeholder="项目状态"
              style="width: 150px"
              size="mini"
              @change="
                (v) => {
                  handleCommand(item.headerSort.commandName, scope.row, v)
                }
              "
            >
              <el-option
                v-for="option in item.headerSort.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <span v-else>{{ item.label }}</span>
          </template>

          <template slot-scope="scope">
            <span
              v-if="item.html"
              :class="item.commandName ? 'cursor-pointer' : ''"
              @click="handleCommand(item.commandName, scope.row, scope.$index)"
              v-html="item.html(scope.row)"
            />
            <span
              v-else-if="item.Switch"
              @click="handleCommand(item.commandName, scope.row, scope.$index)"
            >
              <el-switch
                :disabled="item.disabled"
                :active-value="item.activeVal || 1"
                :inactive-value="item.inactiveVal || 0"
                v-model="scope.row[item.propName]"
              />
            </span>
            <el-select
              v-else-if="item.select"
              v-model="scope.row[item.propName]"
              :disabled="item.disabled"
            >
              <el-option
                v-for="optionItem in item.options"
                :key="optionItem.value"
                :label="optionItem.label"
                :value="optionItem.value"
              ></el-option>
            </el-select>
            <el-input
              @change="handleCommand(item.commandName, scope.row, scope.$index)"
              v-else-if="item.input"
              v-model="scope.row[item.propName]"
            ></el-input>
            <span
              v-else
              :class="[
                { 'cursor-pointer': item.commandName && !item.Switch },
                item.className ? item.className(scope.row) : '',
              ]"
              @click="handleCommand(item.commandName, scope.row, scope.$index)"
            >
              {{
                item.formatter
                  ? item.formatter(scope.row[item.propName], scope.row)
                  : scope.row[item.propName] || scope.row[item.propName] == 0
                  ? scope.row[item.propName]
                  : ''
              }}
            </span>
          </template>
        </el-table-column>
        <!--列表项循环 end-->
      </el-table>
    </div>

    <!--分页 start-->
    <el-pagination
      v-if="!options.noPage && options.header"
      :disabled="!page.total"
      class="serach-pagination"
      background
      layout="total, prev, pager, next, jumper"
      :current-page="page.pageNo"
      :page-sizes="page.pageSizes"
      :page-size="page.pageSize"
      :pager-count="5"
      :total="page.total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <!--分页 end-->
    <!-- page.pageCount -->
    <!-- 加载更多 -->
    <div v-if="options.loadMore" class="load_more_panel">
      <div class="more_btn_panel">
        <el-button
          v-if="page.total && page.pageSize * page.pageNo < page.total"
          class="more_btn"
          @click="handleCurrentChange(++page.pageNo, true)"
          >加载更多
        </el-button>
      </div>
      <div class="page_panel">
        共{{ page.total }}条 每页
        <el-select
          v-model="page.pageSize"
          style="width: 70px"
          size="mini"
          @change="handleSizeChange"
        >
          <el-option
            v-for="option in page.pageSizes"
            :key="option"
            :label="option"
            :value="option"
          />
        </el-select>
        条
      </div>
    </div>
  </el-card>
</template>

<script>
// import { getDataByUrl } from '@/service/components/common.js'

export default {
  name: 'clickListTable',
  components: {},
  props: ['options', 'data', 'selectList'],
  data() {
    return {
      tableData: [],
      loading: false,
      showTable: true,
      page: {
        total: 0,
        pageSize: 10,
        pageNo: 1,
        pageSizes: [10],
        pageCount: 6,
      },
      params: {},
      isAdd: false,
      hasSelectList: [],
    }
  },
  watch: {
    options: {
      deep: true,
      immediate: true,
      handler(val) {
        this.tableData = this.options.listData || []
      },
    },
    selectList: {
      deep: true,
      immediate: true,
      handler(val) {
        this.hasSelectList = val || []
        this.$nextTick(() => {
            this.toggleSelection(val)
        //   this.hasSelectList.forEach((row) => {
        //     this.$refs.dataTable.toggleRowSelection(row, true)
        //   })
        })
      },
    },
  },
  mounted() {
    if (this.options.listData) {
      this.tableData = this.options.listData
    }
    if (this.data) {
      this.tableData = this.data
    }
  },
  methods: {
    refresh() {
      this.showTable = false
      setTimeout(() => {
        this.showTable = true
      })
      // this.$refs.listTable.doLayout()
    },
    initPage() {
      this.page = {
        total: 0,
        //				pageSize: this.$route.query.pageSize?this.$route.query.pageSize-0:10,
        //				pageNo: this.$route.query.pageNo?this.$route.query.pageNo-0:1,
        pageSize: 10,
        pageNo: 1,
        pageSizes: [10, 20, 50],
      }
      this.isAdd = false
      return this
    },
    search(_params) {
      // 清除status的检测
      if (window.intelVal) {
        clearInterval(window.intelVal)
      }

      if (_params) {
        this.params = _params
      }
      // 获取列表数据
      if (this.options && this.options.listApi) {
        this.loading = true
        var params = {
          ...this.options.listApi.params,
          ...this.params,
        }
        if (!this.options.noPage || this.options.loadMore) {
          if (_params) {
            params.pageSize = this.page.pageSize
            params.pageNo = 1
          } else {
            params.pageSize = this.page.pageSize
            params.pageNo = this.page.pageNo
          }
        }
        if (this.options.listApi.serviceFN) {
          this.getDataByFN(params)
        }
      }
    },
    getDataByFN(params) {
      this.options.listApi
        .serviceFN(params)
        .then((ret) => {
          this.loading = false
          if (ret.code !== 200) {
            this.$message({
              type: 'error',
              message: ret.msg || '未知错误',
            })
            this.tableData = []
            return
          }
          this.serviceCallBack(ret, '', params)
        })
        .catch((err) => {
          this.loading = false
          console.error(err)
        })
    },
    serviceCallBack(ret, isOutSideRet, params) {
      // 处理列表数据
      this.loading = false

      if (ret.row || ret.data || ret.rows) {
        var arr = ret.row || ret.data || ret.rows
        if (arr.length === 0 && this.page.pageNum > 1) {
          this.page.pageNum--
          this.search(this.params)
          return
        }
        if (this.isAdd) {
          this.tableData = [...this.tableData, ...arr]
          this.tableData.forEach((el, index) => {
            el.sortFuckElmentUiNum = index
          })
        } else {
          arr.forEach((el, index) => {
            el.sortFuckElmentUiNum = index
          })
          this.tableData = arr
        }
        if (ret.total !== undefined) {
          this.page.total = ret.total
        }
      } else {
        this.$message({
          type: 'error',
          message: ret.message || '未知错误',
        })
      }
      this.$emit('loadComplete', ret)
      if (!isOutSideRet) {
        this.$emit('command', 'listLoaded', this.page.total)
      }
    },
    handleCommand(command, row, index) {
      if (command) {
        this.$emit('command', command, row, index)
      }
    },

    handleSelectionChange(v) {
      this.$emit('command', 'tableSelecteRow', v, this.tableData)
    },

    handleCurrentChange(pageNo, isAdd) {
      this.isAdd = isAdd
      this.page.pageNo = pageNo
      this.search()
    },
    handleSizeChange(size) {
      console.log(size)
      this.isAdd = false
      this.page.pageSize = size
      this.page.pageNo = 1
      this.search()
    },
    height(height) {
      // console.error(height)
      if (!height) {
        return undefined
      } else if (height === 'autoHeight') {
        return undefined
      } else {
        return height
      }
    },
    initData() {
      this.tableData = []
    },
    contrast(tableData, cont, type) {
      let arr = []
      tableData.forEach((item, i) => {
        cont.some((itemCont) => {
          if (item[type] === itemCont[type]) {
            arr.push(item)
          }
        })
      })
      return arr
    },
    clearSelection() {
      this.$refs.listTable.clearSelection()
    },
    toggleSelection(v, type) {
      //   console.log(JSON.stringify(v[0]))
      // console.log(JSON.stringify(this.tableData[0]))
      // console.log(this.tableData[0]===v[0])
      // this.$refs.listTable.toggleAllSelection()
      // return

      if (v && v.length > 0) {
        let _v = this.contrast(this.tableData, v, type)

        _v.forEach((row) => {
          this.$nextTick(() => {
            this.$refs.listTable.toggleRowSelection(row, true)
          })
          // this.$refs.listTable.toggleRowSelection(row,true);
        })
        // this.handleSelectionChange(v)
      }
    },
  },
}
</script>

<style lang="scss">
.title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
}
.app-click-table {
  /*padding: 0 10px;*/
  .el-switch.is-disabled {
    opacity: 1;
  }

  .el-switch.is-disabled .el-switch__core {
    cursor: pointer;
  }

  .el-table__header th {
    color: #999 !important;
    background: #f0f6f9;
  }

  .el-table__body-wrapper {
    .el-table__row td {
      &:nth-child(1) {
        overflow: hidden;
      }

      .el-dropdown {
        margin-left: 6px;
      }
    }
  }
}

.load_more_panel {
  display: flex;
}

.more_btn_panel {
  width: 82%;
  text-align: center;

  .el-button.el-button--default {
    background: rgba(240, 246, 249, 1);
    border-color: rgba(240, 246, 249, 1);
    color: #666;
    margin-left: 91px;
  }
}

.page_panel {
  font-size: 12px;
  /*width: 11%;*/
  text-align: right;
  padding: 5px 0;
}

.list_show_top {
  display: flex;
  padding: 10px 0;
  font-size: 16px;
  margin-bottom: 20px;
  color: #161616;
}

.serach-pagination {
  padding: 20px;
  padding-bottom: 0;
  text-align: right;
}

.cursor-pointer {
  cursor: pointer;
  color: #1890ff;
}
</style>
