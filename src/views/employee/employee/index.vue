<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
      label-width="100px"
    >
      <el-form-item
        label="従業員名"
        prop="employeeName"
        style="margin-right: 16px"
      >
        <el-input
          v-model="queryParams.employeeName"
          placeholder="请输入従業員名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="ステータス"
        prop="employeeWorkStatus"
        style="margin-right: 16px"
      >
        <el-select
          v-model="queryParams.employeeWorkStatus"
          placeholder="请选择ステータス"
          clearable
        >
          <el-option
            v-for="dict in dict.type.employee_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="日本語レベル"
        prop="employeeJapaneseLevels"
        style="margin-right: 16px"
      >
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
      <el-form-item label="案件名" prop="caseName" style="margin-right: 16px">
        <el-input
          v-model="queryParams.caseName"
          placeholder="请输入案件名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="技術" style="margin-right: 16px">
        <el-select
          v-model="queryParams.technologyIds"
          multiple
          placeholder="技術を選択してください"
        >
          <el-option
            v-for="tech in technologyList"
            :key="tech.technologyId"
            :label="tech.technologyName"
            :value="tech.technologyId"
          />
        </el-select>
      </el-form-item>
      <el-form-item style="margin-left: 16px">
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >検索</el-button
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
          v-hasPermi="['employee:employee:add']"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['employee:employee:export']"
          >导出</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="employeeList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="従業員ID" align="center" prop="staffId" />
      <el-table-column label="従業員名" align="center" prop="employeeName" />
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
        label="社員メール"
        align="center"
        prop="employeeMail"
        width="220"
        show-overflow-tooltip
      />
      <el-table-column
        label="社員誕生日"
        align="center"
        prop="employeeBirthday"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{
            parseTime(scope.row.employeeBirthday, "{y}-{m}-{d}")
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="職務経験"
        align="center"
        prop="employeeWorkExperience"
      />
      <el-table-column label="案件名" align="center" prop="caseName">
        <template #default="scope">
          <el-link
            v-if="scope.row.caseName"
            type="primary"
            :underline="false"
            @click="toCaseDetail(scope.row)"
          >
            {{ scope.row.caseName }}
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        label="アクション"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['employee:employee:edit']"
            >詳細</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['employee:employee:remove']"
            >削除</el-button
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

    <!-- 新規社員ダイアログ -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="社員ID" prop="staffId">
          <el-input
            v-model="form.staffId"
            placeholder="社員IDは、社員ログイン用のアカウントです。"
          />
        </el-form-item>
        <el-form-item label="社員名" prop="employeeName">
          <el-input
            v-model="form.employeeName"
            placeholder="社員名を入力してください"
          />
        </el-form-item>
        <el-form-item label="性別" prop="employeeGender">
          <el-select
            v-model="form.employeeGender"
            placeholder="性別を選択してください"
          >
            <el-option
              v-for="dict in dict.type.sys_user_sex"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="電話番号" prop="phoneNumber">
          <el-input
            v-model="form.phoneNumber"
            placeholder="社員電話番号を入力してください"
          />
        </el-form-item>
        <el-form-item label="メール" prop="employeeMail">
          <el-input
            v-model="form.employeeMail"
            placeholder="社員メールを選択してください"
          />
        </el-form-item>
        <el-form-item label="年齢" prop="employeeAge">
          <el-input
            v-model="form.employeeAge"
            placeholder="年齢を入力してください"
          />
        </el-form-item>
        <el-form-item label="誕生日" prop="employeeBirthday">
          <el-date-picker
            clearable
            v-model="form.employeeBirthday"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="社員誕生日を選択してください"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">登　録</el-button>
        <el-button @click="cancel">キャンセル</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listEmployee,
  getEmployee,
  delEmployee,
  addEmployee,
  updateEmployee,
} from "@/api/employee/employee";
import { getAllTechnology } from "@/api/technology/technology";
export default {
  name: "Employee",
  dicts: ["employee_status", "japanese_level", "sys_user_sex"],
  activated() {
    this.getList();
  },
  data() {
    return {
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
      // 总条数
      total: 0,
      // 社員情報管理表格数据
      employeeList: [],
      // 社員管理情報リスト
      technologyList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        employeeName: null,
        employeeWorkStatus: null,
        employeeJapaneseLevels: [],
        caseNmae: null,
        technologyIds: [],
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        staffId: [
          {
            required: true,
            message: "社員ID入力してください",
            trigger: "blur",
          },
        ],
        phoneNumber: [
          {
            required: true,
            message: "社員の電話番号入力してください",
            trigger: "blur",
          },
          {
            validator: (rule, value, callback) => {
              // 半角数字のみ
              if (!/^\d+$/.test(value)) {
                callback(new Error("電話番号は半角数字のみで入力してください"));
                return;
              }

              // 11桁
              if (value.length !== 11) {
                callback(new Error("電話番号は11桁で入力してください"));
                return;
              }

              // 日本携帯番号
              if (!/^(070|080|090)\d{8}$/.test(value)) {
                callback(
                  new Error(
                    "日本の携帯電話番号（070/080/090）を入力してください"
                  )
                );
                return;
              }

              callback();
            },
            trigger: "blur",
          },
        ],
        employeeMail: [
          {
            required: true,
            message: "社員メール入力してください",
            trigger: "blur",
          },
        ],
        employeeName: [
          {
            required: true,
            message: "社員名入力してください",
            trigger: "blur",
          },
        ],
        employeeGender: [
          {
            required: true,
            message: "社員性別入力してください",
            trigger: "change",
          },
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
    this.getList();
    this.getTechnologyList();
  },
  methods: {
    /** 查询社員情報管理列表 */
    getList() {
      this.loading = true;
      listEmployee(this.queryParams).then((response) => {
        this.employeeList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    getTechnologyList() {
      getAllTechnology().then((response) => {
        this.technologyList = response.rows;
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
        employeeId: null,
        staffId: null,
        employeeName: null,
        employeeGender: null,
        employeeWorkStatus: null,
        employeeAge: null,
        employeeJapaneseLevel: null,
        employeeMail: null,
        employeeBirthday: null,
        employeeWorkExperience: null,
        caseId: null,
        caseName: null,
        phoneNumber: null,
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
      this.ids = selection.map((item) => item.employeeId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "新規社員";
    },
    toCaseDetail(row) {
      this.$router.push({
        name: "CaseDetail",
        params: {
          caseId: row.caseId,
        },
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      const employeeId = row.employeeId;
      this.$router.push({
        name: "EmployeeDetail",
        params: { employeeId },
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.form.employeeWorkStatus = "1";
          addEmployee(this.form).then((response) => {
            this.$modal.msgSuccess("社員が追加成功しました!");
            this.open = false;
            this.getList();
          });
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const employeeIds = row.employeeId || this.ids;
      this.$modal
        .confirm(
          '是否确认删除社員情報管理编号为"' + employeeIds + '"的数据项？'
        )
        .then(function () {
          return delEmployee(employeeIds);
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
        "employee/employee/export",
        {
          ...this.queryParams,
        },
        `employee_${new Date().getTime()}.xlsx`
      );
    },
  },
};
</script>
