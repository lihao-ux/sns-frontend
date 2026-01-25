<template>
  <div class="app-container case-detail">
    <!-- 案件基本信息 -->
    <el-card class="info-card" shadow="hover">
      <div slot="header" class="card-header">
        <i class="el-icon-document"></i>
        <span>案件基本情報</span>
        <el-button
          type="primary"
          size="small"
          class="add-employee-btn"
          v-if="isEditMode"
          :loading="aiLoading"
          @click="toAiMatching"
        >
          AI推薦
        </el-button>
      </div>

      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="140px"
        class="case-form"
      >
        <el-row :gutter="20">
          <!-- 左侧：其他字段 -->
          <el-col :span="12">
            <el-row :gutter="20">
              <!-- お客様 -->
              <el-col :span="24">
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
              <el-col :span="24">
                <el-form-item label="案件名" prop="caseName">
                  <el-input
                    v-model="form.caseName"
                    placeholder="案件名を入力"
                    maxlength="50"
                  />
                </el-form-item>
              </el-col>

              <!-- 現場地 -->
              <el-col :span="24">
                <el-form-item label="現場地" prop="siteLocation">
                  <el-input
                    v-model="form.siteLocation"
                    placeholder="現場地を入力"
                    maxlength="100"
                  />
                </el-form-item>
              </el-col>

              <!-- 案件開始日 -->
              <el-col :span="24">
                <el-form-item label="案件開始日" prop="caseStartTime">
                  <el-date-picker
                    v-model="form.caseStartTime"
                    type="date"
                    value-format="yyyy-MM-dd"
                    placeholder="日付を選択"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>

              <!-- 案件終了日 -->
              <el-col :span="24">
                <el-form-item label="案件終了日" prop="caseEndTime">
                  <el-date-picker
                    v-model="form.caseEndTime"
                    type="date"
                    value-format="yyyy-MM-dd"
                    placeholder="日付を選択"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>

              <!-- 自社人数 -->
              <el-col :span="24">
                <el-form-item label="自社人数" prop="companyStaffCount">
                  <el-input
                    :value="form.employeeList ? form.employeeList.length : 0"
                    readonly
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>

              <!-- 勤務形態 -->
              <el-col :span="24">
                <el-form-item label="勤務形態" prop="caseWorkStyle">
                  <el-select
                    v-model="form.caseWorkStyle"
                    placeholder="選択してください"
                    style="width: 100%"
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
              <el-col :span="24">
                <el-form-item label="最寄り駅" prop="caseStation">
                  <el-input
                    v-model="form.caseStation"
                    placeholder="駅名を入力"
                    maxlength="20"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>

          <!-- 右侧：案件概要 -->
          <el-col :span="12">
            <el-form-item
              label="案件概要"
              prop="caseSummary"
              label-width="80px"
            >
              <el-input
                type="textarea"
                :rows="20"
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

        <el-table-column label="社員ID" min-width="100" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.employeeId || "-" }}</span>
          </template>
        </el-table-column>

        <el-table-column label="社員名" min-width="150" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.employeeName || "-" }}</span>
          </template>
        </el-table-column>

        <el-table-column label="案件内役割" min-width="120" align="center">
          <template slot-scope="scope">
            <el-select
              v-model="scope.row.role"
              placeholder="選択してください"
              :disabled="scope.row.id != null"
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

        <el-table-column label="参画開始日" min-width="150" align="center">
          <template slot-scope="scope">
            <el-date-picker
              v-model="scope.row.joinDate"
              type="date"
              placeholder="日付を選択"
              :disabled="scope.row.id != null"
              style="width: 100%"
            />
          </template>
        </el-table-column>

        <el-table-column
          label="アクション"
          width="200"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              icon="el-icon-back"
              class="delete-btn"
              @click="handleExit(scope.$index)"
            >
              退場
            </el-button>
            <el-button
              type="text"
              size="small"
              icon="el-icon-delete"
              class="delete-btn"
              @click="handleDeleteEmployee(scope.$index)"
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
        :title="aiFlag ? 'AI推薦社員' : '待機社員一覧'"
        :visible.sync="dialogVisible"
        width="1400px"
        append-to-body
        :class="['fixed-height-dialog', { 'ai-dialog': aiFlag }]"
      >
        <el-form
          v-if="!aiFlag"
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
        <div
          style="
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
          "
        >
          <span style="margin-right: 4px; font-weight: bold">※技術能力：</span>
          <div style="display: flex; align-items: center; gap: 4px">
            <span
              style="
                display: inline-block;
                width: 16px;
                height: 16px;
                background-color: gold;
              "
            ></span>
            <span>得意</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px">
            <span
              style="
                display: inline-block;
                width: 16px;
                height: 16px;
                background-color: red;
              "
            ></span>
            <span>独立作業可</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px">
            <span
              style="
                display: inline-block;
                width: 16px;
                height: 16px;
                background-color: blue;
              "
            ></span>
            <span>経験有</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px">
            <span
              style="
                display: inline-block;
                width: 16px;
                height: 16px;
                background-color: gray;
              "
            ></span>
            <span>知識有</span>
          </div>
        </div>
        <el-table
          v-loading="loading"
          :data="employeeFreeList"
          border
          style="width: 100%"
        >
          <el-table-column
            label="従業員ID"
            align="center"
            prop="staffId"
            width="100"
          />
          <el-table-column
            label="従業員名"
            align="center"
            prop="employeeName"
            width="150"
          />
          <el-table-column
            label="性別"
            align="center"
            prop="employeeGender"
            width="90"
          >
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
            width="100"
          >
            <template slot-scope="scope">
              <dict-tag
                :options="dict.type.employee_status"
                :value="scope.row.employeeWorkStatus"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="年齢"
            align="center"
            prop="employeeAge"
            width="60"
          />
          <el-table-column
            label="日本語レベル"
            align="center"
            prop="employeeJapaneseLevel"
            width="100"
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
            width="80"
          />
          <el-table-column
            label="通勤時間(電車)"
            align="center"
            width="120"
            v-if="aiFlag"
          >
            <template slot-scope="scope">
              {{
                scope.row.commuteTime !== null &&
                scope.row.commuteTime !== undefined &&
                scope.row.commuteTime !== 0
                  ? scope.row.commuteTime + "分"
                  : "-"
              }}
            </template>
          </el-table-column>
          <el-table-column label="駅" align="center" width="180" v-if="aiFlag">
            <template slot-scope="scope">
              {{
                scope.row.commuteTime !== null &&
                scope.row.commuteTime !== undefined &&
                scope.row.commuteTime !== 0
                  ? scope.row.station + "->" + form.caseStation
                  : "-"
              }}
            </template>
          </el-table-column>
          <el-table-column label="技術能力" align="center" :width="aiFlag ? '400' : '600'">
            <template #default="scope">
              <span
                v-if="
                  scope.row.employeeSkills &&
                  scope.row.employeeSkills.length > 0
                "
              >
                <span
                  v-for="(skill, index) in scope.row.employeeSkills"
                  :key="skill.employeeTechnologyId"
                  :style="{
                    color: getProficiencyColor(skill.proficiencyLevel),
                  }"
                >
                  {{ getSkillLabel(skill) }}
                  <span v-if="index < scope.row.employeeSkills.length - 1"
                    >,
                  </span>
                </span>
              </span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column
            label="アクション"
            align="center"
            width="100"
            fixed="right"
          >
            <template #default="scope">
              <el-button
                type="primary"
                size="mini"
                @click="handleEnter(scope.row)"
              >
                入場
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getFreeList"
        />
        <span slot="footer" class="dialog-footer">
          <el-button @click="handleToJiRu"> 閉じる </el-button>
        </span>
      </el-dialog>
      <el-dialog
        title="退場情報入力"
        :visible.sync="leaveDialogVisible"
        width="420px"
        append-to-body
      >
        <el-form :model="exitParams" label-width="100px">
          <el-form-item label="社員名">
            <el-input v-model="exitParams.employeeName" disabled />
          </el-form-item>

          <el-form-item label="入場日時">
            <el-date-picker
              v-model="exitParams.joinDate"
              type="date"
              style="width: 100%"
              disabled
            />
          </el-form-item>

          <el-form-item label="退場日時" required>
            <el-date-picker
              v-model="exitParams.exitDate"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="退場日時を選択してください"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="役割">
            <el-input :value="getRoleLabel(exitParams.role)" disabled />
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="leaveDialogVisible = false">
            キャンセル
          </el-button>
          <el-button type="primary" @click="confirmLeave"> 確定 </el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { getAllTechnology } from "@/api/technology/technology";
import {
  getCase,
  addCase,
  updateCase,
  delCaseEmployee,
  exitCaseEmployee,
  aiMatching,
} from "@/api/case/case";
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
      aiFlag: false,
      aiLoading: false,
      leaveDialogVisible: false,
      technologyList: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        technologyIds: [],
        employeeJapaneseLevels: [],
        employeeWorkExperience: null,
      },
      exitParams: {
        id: null,
        employeeName: "",
        caseId: null,
        employeeId: null,
        role: "",
        joinDate: null,
        exitDate: null,
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
        caseSummary: [
          {
            required: true,
            message: "案件概要を入力してください",
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
      this.loadCase();
    } else {
      this.initForm();
    }
    this.getTechnologyList();
  },
  methods: {
    handleToJiRu(){
      this.dialogVisible=false
      this.aiFlag = false
    },
    toAiMatching() {
      this.$confirm(
        "案件概要を編集した場合は、AI推薦を実行する前に必ず「保存」を行ってください。未保存の内容は反映されません。",
        "確認",
        {
          confirmButtonText: "確定",
          cancelButtonText: "キャンセル",
          type: "warning",
        }
      )
        .then(() => {
          this.$refs.form.validate((valid) => {
            if (!valid) return;
            if (!this.validEmployee()) return;
            this.employeeFreeList = [];
            this.aiLoading = true;

            aiMatching(this.form)
              .then((response) => {
                this.aiLoading = false;

                // 正常情况下的处理
                if (response.code === 200) {
                  this.employeeFreeList = response.data || [];
                  this.total = response.total || 0;
                  (this.aiFlag = true), (this.dialogVisible = true);
                } else {
                  // 处理其他错误码（非200的情况）
                  this.$modal.msgError(response.msg || "操作失败");
                }
              })
              .catch((error) => {
                this.aiLoading = false;
              });
          });
        })
        .catch(() => {});
    },
    getRoleLabel(value) {
      if (!value) {
        return "";
      }
      const item = this.dict.type.case_role.find((d) => d.value === value);
      return item ? item.label : value;
    },
    confirmLeave() {
      if (this.exitParams.exitDate == null) {
        this.$message({
          message: "社員退場日時を入力してください",
          type: "warning",
        });
      } else {
        exitCaseEmployee(this.exitParams).then((response) => {
          this.leaveDialogVisible = false;
          this.loadCase();
          this.$message.success("社員の退場処理が正常に完了しました");
        });
      }
    },
    //社員退場
    handleExit(index) {
      if (
        this.form.employeeList[index] &&
        this.form.employeeList[index].id != null
      ) {
        this.exitParams = {
          id: this.form.employeeList[index].id,
          employeeName: this.form.employeeList[index].employeeName,
          caseId: this.$route.params.caseId,
          employeeId: this.form.employeeList[index].employeeId,
          role: this.form.employeeList[index].role,
          joinDate: this.form.employeeList[index].joinDate,
          exitDate: null,
        };
        this.leaveDialogVisible = true;
      } else {
        this.$message({
          message: "この社員はまだ入場していません",
          type: "warning",
        });
      }
    },
    //社員削除
    handleDeleteEmployee(index) {
      if (
        this.form.employeeList[index] &&
        this.form.employeeList[index].id != null
      ) {
        this.$confirm(
          "本削除操作は誤操作防止のための処理です。削除後は当該社員の案件履歴は保持されず、出勤状態は「現場出勤」から「待機中」へ変更されます。こちらのデータを削除してもよろしいでしょうか？",
          "確認",
          {
            confirmButtonText: "確定",
            cancelButtonText: "キャンセル",
            type: "warning",
          }
        )
          .then(() => {
            delCaseEmployee({
              id: this.form.employeeList[index].id,
              employeeId: this.form.employeeList[index].employeeId,
            }).then((response) => {
              const caseId = this.$route.params.caseId;
              this.loadCase();
              this.$message.success("削除しました");
            });
          })
          .catch(() => {});
      } else {
        this.form.employeeList.splice(index, 1);
      }
    },
    handleEnter(employee) {
      console.log(employee);
      this.form.employeeList.push({
        id: null,
        caseId: this.isEditMode ? this.$route.params.caseId : null,
        employeeId: employee.employeeId,
        employeeName: employee.employeeName,
      });
      this.dialogVisible = false;
    },
    // 获取技能显示文字：技能名 + 经验年数
    getSkillLabel(skill) {
      const tech = this.technologyList.find(
        (t) => t.technologyId === skill.technologyId
      );
      return tech.technologyName;
    },

    // 根据熟练度返回颜色
    getProficiencyColor(level) {
      const map = {
        3: "gold",
        2: "red",
        1: "blue",
        0: "gray",
      };
      return map[level];
    },
    resetQuery() {
      (this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        technologyIds: [],
        employeeJapaneseLevels: [],
        employeeWorkExperience: null,
      }),
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
    },
    loadCase() {
      const id = this.$route.params.caseId;
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
    //案件登録
    handleCreate() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;
        if (!this.validEmployee()) return;
        this.submitLoading = true;
        addCase(this.form).then(() => {
          this.submitLoading = false;
          this.$modal.msgSuccess("登録しました");
          this.handleBack();
        });
      });
    },
    validEmployee() {
      for (let i = 0; i < this.form.employeeList.length; i++) {
        const row = this.form.employeeList[i];
        if (!row.role) {
          this.$message({
            message: `社員 ${i + 1} の案件内役割を選択してください`,
            type: "warning",
          });
          return false;
        }
        if (!row.joinDate) {
          this.$message({
            message: `社員 ${i + 1} の参画開始日を選択してください`,
            type: "warning",
          });
          return false;
        }
      }
      return true; // 全部通过
    },
    handleUpdate() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;
        if (!this.validEmployee()) return;
        this.submitLoading = true;
        updateCase(this.form).then(() => {
          this.submitLoading = false;
          this.$modal.msgSuccess("更新しました");
          this.loadCase();
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
  height: 840px;
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
/* AI对话框 - 简洁高级感 */
.ai-dialog >>> .el-dialog {
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8e8e8;
}

.ai-dialog >>> .el-dialog__header {
  border-bottom: 1px solid #f0f0f0;
  padding: 20px 24px;
}

.ai-dialog >>> .el-dialog__title {
  font-family: "Helvetica Neue", Arial, sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: #1890ff;
  letter-spacing: 0.5px;
}

.ai-dialog >>> .el-dialog__body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}
</style>

