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
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['employee:employee:remove']"
          >删除</el-button
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
      <el-table-column label="従業員ID" align="center" prop="employeeId" />
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

    <!-- 添加或修改社員情報管理对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="従業員名" prop="employeeName">
          <el-input v-model="form.employeeName" placeholder="请输入従業員名" />
        </el-form-item>
        <el-form-item label="性別" prop="employeeGender">
          <el-select v-model="form.employeeGender" placeholder="请选择性別">
            <el-option
              v-for="dict in dict.type.sys_user_sex"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="ステータス" prop="employeeWorkStatus">
          <el-select
            v-model="form.employeeWorkStatus"
            placeholder="请选择ステータス"
          >
            <el-option
              v-for="dict in dict.type.employee_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="年齢" prop="employeeAge">
          <el-input v-model="form.employeeAge" placeholder="请输入年齢" />
        </el-form-item>
        <el-form-item label="日本語レベル" prop="employeeJapaneseLevel">
          <el-select
            v-model="form.employeeJapaneseLevel"
            placeholder="请选择日本語レベル"
          >
            <el-option
              v-for="dict in dict.type.japanese_level"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="社員メール" prop="employeeMail">
          <el-input
            v-model="form.employeeMail"
            placeholder="请输入社員メール"
          />
        </el-form-item>
        <el-form-item label="社員誕生日" prop="employeeBirthday">
          <el-date-picker
            clearable
            v-model="form.employeeBirthday"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择社員誕生日"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="職務経験" prop="employeeWorkExperience">
          <el-input
            v-model="form.employeeWorkExperience"
            placeholder="请输入職務経験"
          />
        </el-form-item>
        <el-form-item label="案件名" prop="employeeEvent">
          <el-input v-model="form.employeeEvent" placeholder="请输入案件名" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
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
      this.title = "添加社員情報管理";
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
          if (this.form.employeeId != null) {
            updateEmployee(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addEmployee(this.form).then((response) => {
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
