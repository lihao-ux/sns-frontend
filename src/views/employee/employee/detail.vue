<template>
  <div class="app-container employee-detail">
    <!-- 従業員基本情報 -->
    <el-card class="info-card" shadow="hover">
      <div slot="header" class="card-header">
        <i class="el-icon-user-solid"></i>
        <span>従業員基本情報</span>
      </div>

      <el-form
        ref="form"
        :model="form"
        label-width="140px"
        class="employee-form"
        :rules="rules"
      >
        <el-row :gutter="20">
          <!-- 従業員名 -->
          <el-col :span="8">
            <el-form-item label="従業員名" prop="employeeName">
              <el-input
                v-model="form.employeeName"
                placeholder="従業員名を入力"
              />
            </el-form-item>
          </el-col>

          <!-- 性別 -->
          <el-col :span="8">
            <el-form-item label="性別" prop="employeeGender">
              <el-select
                v-model="form.employeeGender"
                placeholder="選択してください"
              >
                <el-option
                  v-for="dict in dict.type.sys_user_sex"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 年齢 -->
          <el-col :span="8">
            <el-form-item label="年齢" prop="employeeAge">
              <el-input-number
                v-model="form.employeeAge"
                :min="0"
                controls-position="right"
              />
            </el-form-item>
          </el-col>

          <!-- 生年月日 -->
          <el-col :span="8">
            <el-form-item label="生年月日" prop="employeeBirthday">
              <el-date-picker
                v-model="form.employeeBirthday"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="日付を選択"
              />
            </el-form-item>
          </el-col>

          <!-- 日本語レベル -->
          <el-col :span="8">
            <el-form-item label="日本語レベル" prop="employeeJapaneseLevel">
              <el-select
                v-model="form.employeeJapaneseLevel"
                placeholder="選択してください"
              >
                <el-option
                  v-for="dict in dict.type.japanese_level"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 職務経験 -->
          <el-col :span="8">
            <el-form-item label="職務経験（年）" prop="employeeWorkExperience">
              <el-input-number
                v-model="form.employeeWorkExperience"
                :min="0"
                controls-position="right"
              />
            </el-form-item>
          </el-col>

          <!-- メール -->
          <el-col :span="8">
            <el-form-item label="メールアドレス" prop="employeeMail">
              <el-input
                v-model="form.employeeMail"
                placeholder="メールアドレスを入力"
              />
            </el-form-item>
          </el-col>

          <!-- 在職ステータス -->
          <el-col :span="8">
            <el-form-item label="在職ステータス" prop="employeeWorkStatus">
              <el-select
                v-model="form.employeeWorkStatus"
                placeholder="選択してください"
                disabled
              >
                <el-option
                  v-for="dict in dict.type.employee_status"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="案件名">
              <el-link
                v-if="form.caseName"
                type="primary"
                :underline="false"
                @click="toCaseDetail(form)"
              >
                {{ form.caseName }}
              </el-link>

              <span v-else class="case-name-text empty-text"> 現場なし </span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    <!-- 社員案件履歴（閲覧のみ） -->
    <el-card v-if="employeeId" class="info-card" shadow="hover">
      <div slot="header" class="card-header">
        <i class="el-icon-document"></i>
        <span>社員案件履歴</span>
      </div>

      <el-collapse v-model="activeHistoryNames">
        <el-collapse-item title="案件履歴一覧" name="1">
          <!-- 有履歴：才渲染表格 -->
          <el-table :data="caseHistoryList" border style="width: 100%">
            <!-- 自定义空状态（关键） -->
            <template #empty>
              <span>案件履歴が登録されていません</span>
            </template>

            <el-table-column
              type="index"
              label="No."
              width="60"
              align="center"
            />

            <el-table-column prop="caseName" label="案件名" min-width="200" />

            <el-table-column label="役割" min-width="120">
              <template slot-scope="scope">
                <dict-tag
                  :options="dict.type.case_role"
                  :value="scope.row.role"
                />
              </template>
            </el-table-column>

            <el-table-column prop="joinDate" label="開始日" min-width="120" />

            <el-table-column prop="exitDate" label="終了日" min-width="120" />
          </el-table>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <!-- 技能情報管理 -->
    <el-card
      :data="form.employeeSkills"
      class="info-card skill-card"
      shadow="hover"
    >
      <div slot="header" class="card-header">
        <i class="el-icon-setting"></i>
        <span>技能情報管理</span>
        <el-button
          type="primary"
          size="small"
          icon="el-icon-plus"
          class="add-skill-btn"
          @click="handleAddSkill"
        >
          追加
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="form.employeeSkills"
        empty-text="データがありません"
        border
        style="width: 100%"
        class="skill-table"
      >
        <el-table-column type="index" label="No." width="60" align="center" />

        <el-table-column label="技能" min-width="200">
          <template slot-scope="scope">
            <el-select
              v-model="scope.row.technologyId"
              placeholder="技術を選択してください"
              style="width: 100%"
            >
              <el-option
                v-for="tech in technologyList"
                :key="tech.technologyId"
                :label="tech.technologyName"
                :value="tech.technologyId"
              />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="熟練度" min-width="150">
          <template slot-scope="scope">
            <el-select
              v-model="scope.row.proficiencyLevel"
              placeholder="選択してください"
              style="width: 100%"
            >
              <el-option
                v-for="dict in dict.type.skill_level"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="実際経験年限（年）" min-width="180">
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.experienceYears"
              :min="0"
              :max="50"
              :precision="1"
              :step="0.5"
              controls-position="right"
              style="width: 100%"
            />
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
        @click="handleUpdate"
        :loading="submitLoading"
      >
        更新
      </el-button>
      <el-button
        v-if="!isEditMode"
        type="success"
        @click="handleRegister"
        :loading="submitLoading"
      >
        登録
      </el-button>
      <el-button @click="handleBack" type="default"> キャンセル </el-button>
    </div>
  </div>
</template>

<script>
import {
  getEmployee,
  updateEmployee,
  addEmployee,
  delEmployeeSkill,
  getCaseHistory,
} from "@/api/employee/employee";
import { getAllTechnology } from "@/api/technology/technology";
export default {
  name: "EmployeeDetail",
  dicts: [
    "sys_user_sex",
    "employee_status",
    "japanese_level",
    "skill_level",
    "case_role",
  ],
  data() {
    return {
      activeHistoryNames: ["0"],
      employeeId: null,
      loading: false,
      submitLoading: false,
      form: {},
      technologyList: [],
      caseHistoryList: [],
      rules: {
        employeeName: [
          { required: true, message: "従業員名不能为空", trigger: "blur" },
        ],
        employeeGender: [
          { required: true, message: "性別不能为空", trigger: "change" },
        ],
        employeeWorkStatus: [
          { required: true, message: "ステータス不能为空", trigger: "change" },
        ],
        employeeWorkExperience: [
          {
            validator: (rule, value, callback) => {
              if (!value) {
                callback();
              } else if (!/^\d+$/.test(value)) {
                callback(new Error("職務経験は数字で入力してください"));
              } else {
                callback();
              }
            },
            trigger: "blur",
          },
        ],
        employeeAge: [
          {
            validator: (rule, value, callback) => {
              if (!value) {
                callback();
              } else if (!/^\d+$/.test(value)) {
                callback(new Error("年齢は数字で入力してください"));
              } else {
                const age = parseInt(value, 10);
                if (age < 18 || age > 65) {
                  callback(
                    new Error("年齢は18歳から65歳までで入力してください")
                  );
                } else {
                  callback();
                }
              }
            },
            trigger: "blur",
          },
        ],
      },
    };
  },
  created() {
    this.getTechnologyList();
    const id = this.$route.params.employeeId;
    this.employeeId = this.$route.params.employeeId;
    // 判断是编辑模式还是新增模式
    if (id) {
      this.isEditMode = true;
      // 编辑模式：加载员工数据
      this.getEmployeeById();
      this.getCaseHistoryList();
    } else {
      // 新增模式：初始化空表单
      this.isEditMode = false;
      this.form = {
        employeeName: "",
        employeeGender: "",
        employeeAge: null,
        employeeBirthday: "",
        employeeJapaneseLevel: "",
        employeeWorkExperience: null,
        employeeWorkStatus: "",
        employeeMail: "",
        employeeSkills: [],
      };
    }
  },
  methods: {
    async getCaseHistoryList() {
      try {
        const employeeId = this.$route.params.employeeId;
        const { data } = await getCaseHistory(employeeId);
        this.caseHistoryList = data;
      } catch (e) {
        this.$message.error("案件履歴の取得に失敗しました");
      }
    },
    getEmployeeById() {
      this.loading = true;
      const id = this.$route.params.employeeId;
      getEmployee(id).then((res) => {
        this.form = res.data;
        if (!this.form.employeeSkills) {
          this.form.employeeSkills = [];
        }
        this.loading = false;
      });
    },
    // 更新ボタン
    handleUpdate() {
      this.submitLoading = true;
      this.$refs["form"].validate((valid) => {
        if (!valid) {
          this.submitLoading = false;
          return;
        }
        if (!this.validateEmployeeSkills()) {
          this.submitLoading = false;
          return;
        }

        updateEmployee(this.form).then((response) => {
          this.getEmployeeById();
          this.submitLoading = false;
          this.$modal.msgSuccess("更新成功しました");
        });
      });
    },
    // 登録ボタン
    handleRegister() {},
    // 返回上一页
    handleBack() {
      this.$tab.closePage();
    },
    getTechnologyList() {
      console.log(6666);
      getAllTechnology().then((response) => {
        this.technologyList = response.rows;
      });
    },
    toCaseDetail(row) {
      this.$router.push({
        name: "CaseDetail",
        params: {
          caseId: row.caseId,
        },
      });
    },
    // 添加技能
    handleAddSkill() {
      this.form.employeeSkills.push({
        employeeTechnologyId: null,
        technologyId: null,
        proficiencyLevel: null,
        experienceYears: 0,
      });
    },
    // 删除技能
    handleDeleteSkill(index) {
      if (
        this.form.employeeSkills[index] &&
        this.form.employeeSkills[index].employeeTechnologyId != null
      ) {
        this.$confirm("この技能情報を削除してもよろしいですか？", "確認", {
          confirmButtonText: "確定",
          cancelButtonText: "キャンセル",
          type: "warning",
        })
          .then(() => {
            const id = this.form.employeeSkills[index].employeeTechnologyId;
            delEmployeeSkill(id).then((response) => {
              this.getEmployeeById();
              this.$message.success("削除しました");
            });
          })
          .catch(() => {});
      } else {
        this.form.employeeSkills.splice(index, 1);
      }
    },
    validateEmployeeSkills() {
      const techIdSet = new Set();
      for (let i = 0; i < this.form.employeeSkills.length; i++) {
        const skill = this.form.employeeSkills[i];
        if (!skill.technologyId) {
          this.$message.error(` ${i + 1} 行目：技能を選択してください`);
          return false;
        }

        if (!skill.proficiencyLevel) {
          this.$message.error(` ${i + 1} 行目：熟練度を選択してください`);
          return false;
        }
        if (
          skill.experienceYears === null ||
          skill.experienceYears === undefined
        ) {
          this.$message.error(` ${i + 1} 行目：実際経験年限を入力してください`);
          return false;
        }
        if (techIdSet.has(skill.technologyId)) {
          this.$message.error(
            `${i + 1} 行目：同じ技能は重複して選択できません`
          );
          return false;
        }

        techIdSet.add(skill.technologyId);
      }
      return true;
    },
  },
};
</script>

<style scoped>
.employee-detail {
  background-color: #fafbfc;
  padding: 24px;
  min-height: calc(100vh - 84px);
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

.add-skill-btn {
  margin-left: auto;
}

/* 表单整体样式 */
.employee-form {
  padding: 16px 8px 8px;
}

.employee-form /deep/ .el-row {
  display: flex;
  flex-wrap: wrap;
}

.employee-form /deep/ .el-col-8 {
  width: 33.333333%;
  padding-left: 10px;
  padding-right: 10px;
  box-sizing: border-box;
}

/* 表单项样式 */
.employee-form /deep/ .el-form-item {
  margin-bottom: 24px;
}

/* Label 固定宽度 */
.employee-form /deep/ .el-form-item__label {
  width: 140px !important;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  line-height: 36px;
  text-align: left;
  padding-right: 12px;
  float: left;
}

/* 输入框容器 */
.employee-form /deep/ .el-form-item__content {
  margin-left: 140px !important;
  line-height: 36px;
}

/* 关键：所有输入组件强制100%宽度 */
.employee-form /deep/ .el-input,
.employee-form /deep/ .el-select,
.employee-form /deep/ .el-date-editor,
.employee-form /deep/ .el-input-number {
  width: 100% !important;
}

/* 输入框内部样式 */
.employee-form /deep/ .el-input__inner {
  width: 100% !important;
  font-size: 14px;
  color: #303133;
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s ease;
  height: 36px;
  line-height: 36px;
}

.employee-form /deep/ .el-input__inner:focus,
.employee-form /deep/ .el-input__inner:hover {
  border-color: #409eff;
}

/* Select 下拉框样式 */
.employee-form /deep/ .el-select {
  display: block;
  width: 100% !important;
}

.employee-form /deep/ .el-select .el-input {
  width: 100% !important;
}

.employee-form /deep/ .el-select .el-input__inner {
  cursor: pointer;
}

/* Date Picker 样式 */
.employee-form /deep/ .el-date-editor {
  display: block;
  width: 100% !important;
}

.employee-form /deep/ .el-date-editor .el-input__inner {
  padding-left: 30px;
}

.employee-form /deep/ .el-date-editor .el-input__prefix {
  left: 8px;
}

/* Input Number 样式 */
.employee-form /deep/ .el-input-number {
  display: block;
  width: 100% !important;
}

.employee-form /deep/ .el-input-number .el-input {
  width: 100% !important;
}

.employee-form /deep/ .el-input-number .el-input__inner {
  width: 100% !important;
  text-align: left;
  padding-left: 12px;
  padding-right: 50px;
}

.employee-form /deep/ .el-input-number__decrease,
.employee-form /deep/ .el-input-number__increase {
  background: #f5f7fa;
  border-left: 1px solid #dcdfe6;
  width: 36px;
}

.employee-form /deep/ .el-input-number__decrease:hover,
.employee-form /deep/ .el-input-number__increase:hover {
  color: #409eff;
  background: #ecf5ff;
}

/* Placeholder 样式 */
.employee-form /deep/ .el-input__inner::placeholder {
  color: #c0c4cc;
  font-size: 13px;
}

/* 技能表格样式 */
.skill-card {
  margin-top: 24px;
}

.skill-table {
  margin-top: 16px;
}

.skill-table /deep/ .el-table__header th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
  font-size: 14px;
}

.skill-table /deep/ .el-table__body td {
  padding: 12px 0;
}

.skill-table /deep/ .el-input__inner {
  height: 32px;
  line-height: 32px;
}

.skill-table /deep/ .el-input-number {
  width: 100%;
}

.skill-table /deep/ .el-input-number .el-input__inner {
  height: 32px;
  line-height: 32px;
  text-align: left;
  padding-left: 10px;
  padding-right: 45px;
}

.skill-table /deep/ .el-input-number__decrease,
.skill-table /deep/ .el-input-number__increase {
  width: 32px;
  line-height: 30px;
}

.delete-btn {
  color: #f56c6c;
}

.delete-btn:hover {
  color: #f56c6c;
  text-decoration: underline;
}

/* 空数据样式 */
.empty-data {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-data i {
  font-size: 64px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.empty-data p {
  font-size: 14px;
  margin: 0;
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
.case-history-empty {
  padding: 24px 0;
  text-align: center;
  color: #909399;
  font-size: 14px;
}
.case-name-text {
  display: inline-block;
  height: 32px;
  line-height: 32px;
  color: #606266; /* Element UI 默认深灰 */
}

.empty-text {
  color: #909399; /* 比 placeholder 深一点的灰 */
}
</style>