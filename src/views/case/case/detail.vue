<template>
  <div class="app-container case-detail">
    <!-- 案件基本信息 -->
    <el-card class="info-card" shadow="hover">
      <div slot="header" class="card-header">
        <i class="el-icon-document"></i>
        <span>案件基本情報</span>
      </div>

      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="140px"
        class="case-form"
      >
        <el-row :gutter="20">
          <!-- お客様 -->
          <el-col :span="8">
            <el-form-item label="お客様" prop="customerId">
              <el-select
                v-model="form.customerId"
                filterable
                remote
                clearable
                placeholder="お客様名を入力してください"
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
          </el-col>

          <!-- 案件名 -->
          <el-col :span="8">
            <el-form-item label="案件名" prop="caseName">
              <el-input v-model="form.caseName" placeholder="案件名を入力" />
            </el-form-item>
          </el-col>

          <!-- 現場地 -->
          <el-col :span="8">
            <el-form-item label="現場地" prop="siteLocation">
              <el-input
                v-model="form.siteLocation"
                placeholder="現場地を入力"
              />
            </el-form-item>
          </el-col>

          <!-- 案件開始日 -->
          <el-col :span="8">
            <el-form-item label="案件開始日" prop="caseStartTime">
              <el-date-picker
                v-model="form.caseStartTime"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="日付を選択"
              />
            </el-form-item>
          </el-col>

          <!-- 案件終了日 -->
          <el-col :span="8">
            <el-form-item label="案件終了日" prop="caseEndTime">
              <el-date-picker
                v-model="form.caseEndTime"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="日付を選択"
              />
            </el-form-item>
          </el-col>

          <!-- 自社人数 -->
          <el-col :span="8">
            <el-form-item label="自社人数" prop="companyStaffCount">
              <el-input-number
                v-model="form.companyStaffCount"
                :min="0"
                controls-position="right"
              />
            </el-form-item>
          </el-col>

          <!-- 勤務形態 -->
          <el-col :span="8">
            <el-form-item label="勤務形態" prop="caseWorkStyle">
              <el-select
                v-model="form.caseWorkStyle"
                placeholder="選択してください"
              >
                <el-option
                  v-for="dict in dict.type.case_work_style"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 最寄り駅 -->
          <el-col :span="8">
            <el-form-item label="最寄り駅" prop="caseStation">
              <el-input v-model="form.caseStation" placeholder="駅名を入力" />
            </el-form-item>
          </el-col>

          <!-- 案件概要 -->
          <el-col :span="24">
            <el-form-item label="案件概要" prop="caseSummary">
              <el-input
                type="textarea"
                :rows="4"
                v-model="form.caseSummary"
                placeholder="案件概要を入力"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    <el-card
      :data="form.employeeSkills"
      class="info-card skill-card"
      shadow="hover"
    >
      <div slot="header" class="card-header">
        <i class="el-icon-notebook-2"></i>
        <span>案件内社員管理</span>
        <el-button
          type="primary"
          size="small"
          icon="el-icon-plus"
          class="add-employee-btn"
          @click="handleAddEmployee"
        >
          追加
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="form.employeeList"
        empty-text="データがありません"
        border
        style="width: 100%"
        class="employee-table"
      >
        <el-table-column type="index" label="No." width="60" align="center" />

        <el-table-column label="社員ID" min-width="80">
          <template slot-scope="scope">
            <span>
              {{ scope.row.employeeId || "-" }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="社員名" min-width="80">
          <template slot-scope="scope">
            <span>
              {{ scope.row.employeeName || "-" }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="案件内役割" min-width="80">
          <template slot-scope="scope">
            <el-select
              v-model="scope.row.role"
              placeholder="選択してください"
              style="width: 100%"
            >
              <el-option
                v-for="dict in dict.type.case_role"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="参画開始日" min-width="80">
          <template slot-scope="scope">
            <span>
              {{ scope.row.joinDate || "-" }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              icon="el-icon-delete"
              class="delete-btn"
              @click="handleDeleteSkill(scope.$index)"
            >
              退場
            </el-button>
            <el-button
              type="text"
              size="small"
              icon="el-icon-delete"
              class="delete-btn"
              @click="handleDeleteSkill(scope.$index)"
            >
              削除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 操作ボタン -->
    <div class="form-actions">
      <el-button
        v-if="isEditMode"
        type="primary"
        :loading="submitLoading"
        @click="handleUpdate"
      >
        更新
      </el-button>
      <el-button
        v-else
        type="success"
        :loading="submitLoading"
        @click="handleCreate"
      >
        登録
      </el-button>
      <el-button @click="handleBack">キャンセル</el-button>
    </div>
    <div>
      <!-- 一覧表示ダイアログ -->
      <el-dialog
        title="待機社員一覧"
        :visible.sync="dialogVisible"
        width="1400px"
        append-to-body
        class="fixed-height-dialog"
      >
        <el-form
          :model="queryParams"
          ref="queryForm"
          size="small"
          :inline="true"
          label-width="68px"
          style="margin-bottom: 16px"
        >
          <el-form-item label="技術">
            <el-select
              v-model="queryParams.technologyIds"
              multiple
              placeholder="技術を選択してください"
              style="width: 240px"
            >
              <el-option
                v-for="tech in technologyList"
                :key="tech.technologyId"
                :label="tech.technologyName"
                :value="tech.technologyId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="日本語" style="margin-right: 16px">
            <el-select
              v-model="queryParams.employeeJapaneseLevels"
              placeholder="请选择日本語レベル"
              clearable
              multiple
            >
              <el-option
                v-for="dict in dict.type.japanese_level"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="職務経験" style="margin-left: 13px">
            <el-input-number
              v-model="queryParams.employeeWorkExperience"
              :min="0"
              :max="50"
              :precision="0"
              controls-position="right"
              placeholder="年数"
              style="width: 150px"
            />
            <span style="margin-left: 8px">年以上</span>
          </el-form-item>
          <el-form-item label-width="0" style="margin-left: 30px">
            <el-button
              type="primary"
              icon="el-icon-search"
              size="mini"
              @click="handleQuery"
            >
              検索
            </el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
              リセット
            </el-button>
          </el-form-item>
        </el-form>
        <el-table
          v-loading="loading"
          :data="employeeFreeList"
          border
          style="width: 100%"
        >
          <el-table-column
            label="従業員ID"
            align="center"
            prop="employeeId"
            width="120"
          />
          <el-table-column
            label="従業員名"
            align="center"
            prop="employeeName"
          />
          <el-table-column label="性別" align="center" prop="employeeGender">
            <template slot-scope="scope">
              <dict-tag
                :options="dict.type.sys_user_sex"
                :value="scope.row.employeeGender"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="ステータス"
            align="center"
            prop="employeeWorkStatus"
          >
            <template slot-scope="scope">
              <dict-tag
                :options="dict.type.employee_status"
                :value="scope.row.employeeWorkStatus"
              />
            </template>
          </el-table-column>
          <el-table-column label="年齢" align="center" prop="employeeAge" />
          <el-table-column
            label="日本語レベル"
            align="center"
            prop="employeeJapaneseLevel"
          >
            <template slot-scope="scope">
              <dict-tag
                :options="dict.type.japanese_level"
                :value="scope.row.employeeJapaneseLevel"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="職務経験"
            align="center"
            prop="employeeWorkExperience"
          />
        </el-table>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getFreeList"
        />
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false"> 閉じる </el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { getAllTechnology } from "@/api/technology/technology";
import { getCase, addCase, updateCase } from "@/api/case/case";
import { getCustomersByName } from "@/api/customer/customer";
import { getFreeEmployeeList } from "@/api/employee/employee";
export default {
  name: "CaseDetail",
  dicts: [
    "case_work_style",
    "case_role",
    "employee_status",
    "japanese_level",
    "sys_user_sex",
  ],
  data() {
    return {
      technologyList: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        technologyIds: [],
        employeeJapaneseLevels: [],
        employeeWorkExperience: null,
      },
      loading: false,
      total: 0,
      dialogVisible: false,
      isEditMode: false,
      submitLoading: false,
      customerLoading: false,
      customerOptions: [],
      form: {},
      employeeFreeList: [],
      rules: {
        customerId: [
          {
            required: true,
            message: "お客様を選択してください",
            trigger: "change",
          },
        ],
        caseName: [
          {
            required: true,
            message: "案件名を入力してください",
            trigger: "blur",
          },
        ],
        companyStaffCount: [
          {
            type: "number",
            message: "数字で入力してください",
            trigger: "blur",
          },
        ],
      },
    };
  },
  created() {
    const caseId = this.$route.params.caseId;
    if (caseId) {
      this.isEditMode = true;
      this.loadCase(caseId);
    } else {
      this.initForm();
    }
    this.getTechnologyList();
  },
  methods: {
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        technologyIds: [],
        employeeJapaneseLevels: [],
        employeeWorkExperience: null,
      },
        this.handleQuery();
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getFreeList();
    },
    getTechnologyList() {
      getAllTechnology().then((response) => {
        this.technologyList = response.rows;
      });
    },
    getFreeList() {
      getFreeEmployeeList(this.queryParams).then((response) => {
        this.employeeFreeList = response.rows || [];
        this.total = response.total || 0;
      });
    },
    initForm() {
      this.form = {
        customerId: null,
        caseName: "",
        siteLocation: "",
        caseStartTime: "",
        caseEndTime: "",
        companyStaffCount: null,
        caseWorkStyle: "",
        caseStation: "",
        caseSummary: "",
        employeeList: [],
      };
    },
    handleAddEmployee() {
      this.queryParams.pageNum = 1;
      this.queryParams.pageSize = 10;
      this.getFreeList();
      this.dialogVisible = true;
      // this.form.employeeList.push({
      //   employeeTechnologyId: null,
      //   technologyId: null,
      //   proficiencyLevel: null,
      //   experienceYears: 0,
      // });
    },
    loadCase(id) {
      this.loading = true;
      getCase(id).then((res) => {
        this.form = res.data;
        this.loading = false;
      });
    },
    queryCustomer(query) {
      if (!query) return;
      this.customerLoading = true;
      getCustomersByName({ name: query }).then((res) => {
        this.customerOptions = res.rows;
        this.customerLoading = false;
      });
    },
    handleCreate() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;
        this.submitLoading = true;
        addCase(this.form).then(() => {
          this.submitLoading = false;
          this.$modal.msgSuccess("登録しました");
          this.handleBack();
        });
      });
    },
    handleUpdate() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;
        this.submitLoading = true;
        updateCase(this.form).then(() => {
          this.submitLoading = false;
          this.$modal.msgSuccess("更新しました");
        });
      });
    },
    handleBack() {
      this.$tab.closePage();
    },
  },
};
</script>

<style scoped>
.case-detail {
  background-color: #fafbfc;
  padding: 24px;
}

.case-form /deep/ .el-input,
.case-form /deep/ .el-select,
.case-form /deep/ .el-date-editor,
.case-form /deep/ .el-input-number {
  width: 100%;
}
/* 底部操作按钮区域 */
.form-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 10px 0;
  margin-top: 24px;
}

.form-actions .el-button {
  min-width: 120px;
  height: 40px;
  font-size: 15px;
  font-weight: 500;
}
.employee-table {
  margin-top: 16px;
}

.employee-table /deep/ .el-table__header th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
  font-size: 14px;
}

.employee-table /deep/ .el-table__body td {
  padding: 12px 0;
}

.employee-table /deep/ .el-input__inner {
  height: 32px;
  line-height: 32px;
}

.employee-table /deep/ .el-input-number {
  width: 100%;
}

.employee-table /deep/ .el-input-number .el-input__inner {
  height: 32px;
  line-height: 32px;
  text-align: left;
  padding-left: 10px;
  padding-right: 45px;
}

.employee-table /deep/ .el-input-number__decrease,
.employee-table /deep/ .el-input-number__increase {
  width: 32px;
  line-height: 30px;
}
.add-employee-btn {
  margin-left: auto;
}
.info-card {
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  margin-bottom: 24px;
}

.info-card:last-child {
  margin-bottom: 0;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #d3d6db;
}

.card-header {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  padding: 4px 0;
  border-bottom: 2px solid #f0f2f5;
  padding-bottom: 12px;
}

.card-header i {
  margin-right: 10px;
  font-size: 20px;
  color: #409eff;
}
.fixed-height-dialog ::v-deep .el-dialog {
  height: 810px;
}
.fixed-height-dialog ::v-deep .el-dialog {
  position: relative;
}

/* footer 固定在 dialog 右下角，高度 50px */
.fixed-height-dialog ::v-deep .el-dialog__footer {
  position: absolute;
  right: 24px;
  bottom: 16px;
  padding: 0;
}
</style>

