<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="お客様" prop="customerId">
        <el-select
          v-model="form.customerId"
          placeholder="お客様名前を入力してください"
          filterable
          remote
          clearable
          :remote-method="queryCustomer"
          :loading="customerLoading"
        >
          <el-option
            v-for="item in customerOptions"
            :key="item.customerId"
            :label="item.customerName"
            :value="item.customerId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="案件名" prop="caseName">
        <el-input
          v-model="queryParams.caseName"
          placeholder="请输入案件名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="勤務形態" prop="caseWorkStyle">
        <el-select
          v-model="queryParams.caseWorkStyle"
          placeholder="请选择勤務形態"
          clearable
        >
          <el-option
            v-for="dict in dict.type.case_work_style"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['case:case:add']"
          >案件登録</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['case:case:remove']"
          >案件削除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['case:case:export']"
          >案件印刷</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="caseList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="案件ID" align="center" prop="caseId" />
      <el-table-column label="お客様" align="center" prop="customerName" />
      <el-table-column label="案件名" align="center" prop="caseName" />
      <el-table-column
        label="案件開始日時"
        align="center"
        prop="caseStartTime"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.caseStartTime, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="案件終了日時"
        align="center"
        prop="caseEndTime"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.caseEndTime, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="案件ステータス"
        align="center"
        prop="caseStatus"
      />
      <el-table-column
        label="自社人数"
        align="center"
        prop="companyStaffCount"
      />
      <el-table-column label="勤務形態" align="center" prop="caseWorkStyle">
        <template slot-scope="scope">
          <dict-tag
            :options="dict.type.case_work_style"
            :value="scope.row.caseWorkStyle"
          />
        </template>
      </el-table-column>
      <el-table-column label="案件最寄り駅" align="center" prop="caseStation" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="goDetail(scope.row)"
            v-hasPermi="['case:case:edit']"
            >詳細</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改案件情報对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="お客様" prop="customerId">
          <el-select
            v-model="form.customerId"
            placeholder="お客様名前を入力してください"
            filterable
            remote
            clearable
            :remote-method="queryCustomer"
            :loading="customerLoading"
          >
            <el-option
              v-for="item in customerOptions"
              :key="item.customerId"
              :label="item.customerName"
              :value="item.customerId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="案件名" prop="caseName">
          <el-input v-model="form.caseName" placeholder="请输入案件名" />
        </el-form-item>
        <el-form-item label="現場地" prop="siteLocation">
          <el-input v-model="form.siteLocation" placeholder="请输入現場地" />
        </el-form-item>
        <el-form-item label="案件開始日時" prop="caseStartTime">
          <el-date-picker
            clearable
            v-model="form.caseStartTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择案件開始日時"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="案件終了日時" prop="caseEndTime">
          <el-date-picker
            clearable
            v-model="form.caseEndTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择案件終了日時"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="自社人数" prop="companyStaffCount">
          <el-input
            v-model="form.companyStaffCount"
            placeholder="请输入自社人数"
          />
        </el-form-item>
        <el-form-item label="案件概要" prop="caseSummary">
          <el-input
            v-model="form.caseSummary"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>
        <el-form-item label="勤務形態" prop="caseWorkStyle">
          <el-select v-model="form.caseWorkStyle" placeholder="请选择勤務形態">
            <el-option
              v-for="dict in dict.type.case_work_style"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="案件最寄り駅" prop="caseStation">
          <el-input
            v-model="form.caseStation"
            placeholder="请输入案件最寄り駅"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">確　定</el-button>
        <el-button @click="cancel">キャンセル</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getCustomersByName } from "@/api/customer/customer";
import {
  listCase,
  getCase,
  delCase,
  addCase,
  updateCase,
} from "@/api/case/case";

export default {
  name: "Case",
  dicts: ["case_work_style"],
  activated() {
    this.getList();
  },
  data() {
    return {
      queryParams: {
        pageNum: 1,
        pageSize: 10,
      },
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      customerLoading: true,
      // 总条数
      total: 0,
      // 案件情報表格数据
      caseList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        customerId: null,
        caseName: null,
        caseStatus: null,
        caseWorkStyle: null,
      },
      customerOptions: [],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        customerId: [
          { required: true, message: "お客様ID不能为空", trigger: "blur" },
        ],
        caseName: [
          { required: true, message: "案件名不能为空", trigger: "blur" },
        ],
        caseStatus: [
          {
            required: true,
            message: "案件ステータス不能为空",
            trigger: "change",
          },
        ],
        caseSummary: [
          { required: true, message: "案件概要不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    queryCustomer(query) {
      if (!query) return;
      this.customerLoading = true;
      getCustomersByName({ name: query }).then((res) => {
        this.customerOptions = res.rows;
        this.customerLoading = false;
      });
    },
    /** 查询案件情報列表 */
    getList() {
      this.loading = true;
      listCase(this.queryParams).then((response) => {
        this.caseList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        caseId: null,
        customerId: null,
        caseName: null,
        siteLocation: null,
        caseStartTime: null,
        caseEndTime: null,
        caseStatus: null,
        companyStaffCount: null,
        createTime: null,
        updateTime: null,
        caseSummary: null,
        caseWorkStyle: null,
        caseStation: null,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.caseId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.$router.push("/case/case-detail/index");
    },
    /** 修改按钮操作 */
    goDetail(row) {
      this.$router.push({
        name: "CaseDetail",
        params: {
          caseId: row.caseId,
        },
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.caseId != null) {
            updateCase(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addCase(this.form).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const caseIds = row.caseId || this.ids;
      this.$modal
        .confirm('是否确认删除案件情報编号为"' + caseIds + '"的数据项？')
        .then(function () {
          return delCase(caseIds);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "case/case/export",
        {
          ...this.queryParams,
        },
        `case_${new Date().getTime()}.xlsx`
      );
    },
  },
};
</script>
