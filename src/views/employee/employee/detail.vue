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
        class="employee-form-readonly"
      >
        <el-row :gutter="20">
          <!-- 従業員名 -->
          <el-col :span="8">
            <el-form-item label="従業員名" prop="employeeName">
              <el-input
                v-model="form.employeeName"
                placeholder="未記入"
                disabled
              />
            </el-form-item>
          </el-col>
          <!-- 年齢 -->
          <el-col :span="8">
            <el-form-item label="年齢" prop="employeeAge">
              <el-input
                :value="form.employeeAge != null ? form.employeeAge + '歳' : ''"
                placeholder="未記入"
                disabled
              />
            </el-form-item>
          </el-col>

          <!-- 性別 -->
          <el-col :span="8">
            <el-form-item label="性別" prop="employeeGender">
              <el-select
                v-model="form.employeeGender"
                placeholder="未記入"
                disabled
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

          <!-- 生年月日 -->
          <el-col :span="8">
            <el-form-item label="生年月日" prop="employeeBirthday">
              <el-input
                v-model="form.employeeBirthday"
                placeholder="未記入"
                disabled
              />
            </el-form-item>
          </el-col>

          <!-- 日本語レベル -->
          <el-col :span="8">
            <el-form-item label="日本語レベル" prop="employeeJapaneseLevel">
              <el-select
                v-model="form.employeeJapaneseLevel"
                placeholder="未記入"
                disabled
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
            <el-form-item label="職務経験" prop="employeeWorkExperience">
              <el-input
                :value="
                  form.employeeWorkExperience != null
                    ? form.employeeWorkExperience + '年'
                    : ''
                "
                placeholder="未記入"
                disabled
              />
            </el-form-item>
          </el-col>

          <!-- メール -->
          <el-col :span="8">
            <el-form-item label="メールアドレス" prop="employeeMail">
              <el-input
                v-model="form.employeeMail"
                placeholder="未記入"
                disabled
              />
            </el-form-item>
          </el-col>

          <!-- 在職ステータス -->
          <el-col :span="8">
            <el-form-item label="在職ステータス" prop="employeeWorkStatus">
              <el-select
                v-model="form.employeeWorkStatus"
                placeholder="未記入"
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

          <!-- 案件名 -->
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
              <span v-else class="empty-text">現場なし</span>
            </el-form-item>
          </el-col>

          <!-- 最寄り駅 -->
          <el-col :span="8">
            <el-form-item label="最寄り駅" prop="station">
              <el-input
                v-model="form.station"
                placeholder="未記入"
                disabled
              />
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
    <el-card :data="form.employeeSkills" class="info-card" shadow="hover">
      <div slot="header" class="card-header">
        <i class="el-icon-setting"></i>
        <span>技能情報管理</span>
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
              placeholder="未記入"
              style="width: 100%"
              disabled
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
              placeholder="未記入"
              style="width: 100%"
              disabled
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
            <el-input
              :value="
                scope.row.experienceYears != null
                  ? scope.row.experienceYears + '年'
                  : ''
              "
              placeholder="未記入"
              style="width: 100%"
              disabled
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 操作ボタン -->
    <div class="form-actions">
      <el-button @click="handleBack"> キャンセル </el-button>
    </div>
  </div>
</template>

<script>
import { getEmployee, getCaseHistory } from "@/api/employee/employee";
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
    };
  },
  created() {
    this.getTechnologyList();
    const id = this.$route.params.employeeId;
    this.employeeId = this.$route.params.employeeId;
    // 判断是编辑模式还是新增模式
    if (id) {
      // 编辑模式：加载员工数据
      this.getEmployeeById();
      this.getCaseHistoryList();
    } else {
      // 新增模式：初始化空表单
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

<<style scoped>
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

/* ========== 表单宽度修复 - 核心部分开始 ========== */
.employee-form-readonly {
  padding: 16px 0;
}

/* 关键：确保所有el-col内的表单项宽度一致 */
.employee-form-readonly >>> .el-row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10px;
}

.employee-form-readonly >>> .el-col {
  width: 33.333333%;
  padding: 0 10px;
  box-sizing: border-box;
  margin-bottom: 24px;
}

/* 强制表单项占满容器宽度 */
.employee-form-readonly >>> .el-form-item {
  display: flex;
  flex-direction: column;
  margin: 0;
  width: 100%;
}

/* 标签样式 */
.employee-form-readonly >>> .el-form-item__label {
  text-align: left;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  line-height: 1.5;
  width: 100% !important;
  float: none;
}

/* 内容区域 - 关键：100%宽度 */
.employee-form-readonly >>> .el-form-item__content {
  margin-left: 0 !important;
  width: 100%;
  line-height: 36px;
  flex: 1;
}

/* 强制所有输入控件100%宽度 */
.employee-form-readonly >>> .el-input,
.employee-form-readonly >>> .el-select {
  width: 100% !important;
  display: block;
}

/* 确保内部输入框也100%宽度 */
.employee-form-readonly >>> .el-input .el-input__inner,
.employee-form-readonly >>> .el-select .el-input__inner {
  width: 100% !important;
  box-sizing: border-box;
  height: 36px;
  line-height: 36px;
}

/* 链接样式 */
.employee-form-readonly >>> .el-link {
  display: block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  height: 36px;
  line-height: 36px;
}
/* ========== 表单宽度修复 - 核心部分结束 ========== */

/* 原有样式继续 */
.empty-text {
  display: inline-block;
  width: 100%;
  color: #909399;
  height: 36px;
  line-height: 36px;
}

/* 只读模式下的样式 */
.employee-form-readonly >>> .el-input.is-disabled .el-input__inner,
.employee-form-readonly >>> .el-select.is-disabled .el-input__inner {
  background-color: #ffffff;
  color: #606266;
  border-color: #e4e7ed;
  cursor: default;
}

/* 可选：如果希望有更明显的禁用状态 */
.employee-form-readonly >>> .el-input.is-disabled .el-input__inner {
  background-color: #f5f7fa;
}

/* 技能表格样式 */
.skill-card {
  margin-top: 24px;
}

.skill-table {
  margin-top: 16px;
}

.skill-table >>> .el-table__header th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
  font-size: 14px;
}

.skill-table >>> .el-table__body td {
  padding: 12px 0;
}

.skill-table >>> .el-input__inner {
  height: 32px;
  line-height: 32px;
}

.skill-table >>> .el-input-number {
  width: 100%;
}

.skill-table >>> .el-input-number .el-input__inner {
  height: 32px;
  line-height: 32px;
  text-align: left;
  padding-left: 10px;
  padding-right: 45px;
}

.skill-table >>> .el-input-number__decrease,
.skill-table >>> .el-input-number__increase {
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
  color: #606266;
}

.empty-text {
  color: #909399;
}

.employee-form-readonly >>> .el-input.is-disabled .el-input__inner {
  background-color: #ffffff;
  color: #606266;
}

.employee-form-readonly >>> .el-select.is-disabled .el-input__inner {
  background-color: #ffffff;
  color: #606266;
}

/* 従業員基本情報 - 深蓝色 */
.info-card:nth-child(1) .card-header {
  background-color: #bbdefb;
  padding: 12px 20px;
  margin: -20px -20px 20px -20px;
  border-radius: 12px 12px 0 0;
}

/* 社員案件履歴 - 淡黄色 */
.info-card:nth-child(2) .card-header {
  background-color: #fff9c4;
  padding: 12px 20px;
  margin: -20px -20px 20px -20px;
  border-radius: 12px 12px 0 0;
}

/* 技能情報管理 - 成功绿 */
.info-card:nth-child(3) .card-header {
  background-color: #d4edda;
  padding: 12px 20px;
  margin: -20px -20px 20px -20px;
  border-radius: 12px 12px 0 0;
}

.info-card:nth-child(3) >>> .el-input.is-disabled .el-input__inner,
.info-card:nth-child(3) >>> .el-select.is-disabled .el-input__inner {
  background-color: #ffffff;
  color: #606266;
}

/* 案件履歴折叠面板样式 */
.case-history-collapse >>> .el-collapse-item__header {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  background-color: #f5f7fa;
  border-radius: 6px;
  padding: 0 16px;
}

.case-history-collapse >>> .el-collapse-item__wrap {
  background-color: transparent;
  border: none;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .employee-form-readonly >>> .el-col {
    width: 50%;
  }
}

@media (max-width: 768px) {
  .employee-form-readonly >>> .el-col {
    width: 100%;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .form-actions .el-button {
    width: 100%;
  }
}
</style>