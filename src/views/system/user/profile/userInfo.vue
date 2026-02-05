<template>
  <el-form ref="form" :model="form" :rules="rules" label-width="80px">
    <el-form-item label="アイコン" class="avatar-form-item">
      <userAvatar :user="user" />
    </el-form-item>

    <el-form-item label="社員名" prop="nickName">
      <el-input v-model="form.nickName" maxlength="40" />
    </el-form-item>

    <el-form-item label="電話番号" prop="phonenumber">
      <el-input v-model="form.phonenumber" maxlength="11" />
    </el-form-item>

    <el-form-item label="メール" prop="email">
      <el-input v-model="form.email" maxlength="50" />
    </el-form-item>

    <el-form-item label="性别">
      <el-radio-group v-model="form.sex">
        <el-radio label="0">男</el-radio>
        <el-radio label="1">女</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" size="mini" @click="submit">保存</el-button>
      <el-button type="danger" size="mini" @click="close">閉じる</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { updateUserProfile } from "@/api/system/user";
import userAvatar from "./userAvatar";
export default {
  components: { userAvatar },
  props: {
    user: {
      type: Object,
    },
  },
  data() {
    return {
      form: {},
      // 表单校验
      rules: {
        nickName: [
          {
            required: true,
            message: "社員名を入力してください",
            trigger: "blur",
          },
        ],
        email: [
          {
            required: true,
            message: "メールを入力してください",
            trigger: "blur",
          },
          {
            type: "email",
            message: "正しいメールを入力してください",
            trigger: ["blur", "change"],
          },
        ],
        phonenumber: [
          {
            required: true,
            message: "電話番号を入力してください。",
            trigger: "blur",
          },
          {
            pattern: /^0[789]0\d{8}$/,
            message:
              "正しい電話番号（070/080/090で始まる11桁）を入力してください",
            trigger: "blur",
          },
        ],
      },
    };
  },
  watch: {
    user: {
      handler(user) {
        if (user) {
          this.form = {
            nickName: user.nickName,
            phonenumber: user.phonenumber,
            email: user.email,
            sex: user.sex,
          };
        }
      },
      immediate: true,
    },
  },
  methods: {
    submit() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          updateUserProfile(this.form).then((response) => {
            this.$modal.msgSuccess("修改成功");
            this.user.phonenumber = this.form.phonenumber;
            this.user.email = this.form.email;
          });
        }
      });
    },
    close() {
      this.$tab.closePage();
    },
  },
};
</script>
<style scoped>
/* 调整头像这一行的对齐方式 */
.avatar-form-item :deep(.el-form-item__label) {
  height: 120px; /* 根据头像高度调整，确保文字居中 */
  line-height: 120px; /* 让标签文字垂直居中 */
}

.avatar-form-item :deep(.el-form-item__content) {
  display: flex;
  align-items: center; /* 确保头像在内容区也垂直居中 */
  padding-top: 5px; /* 补一点顶部间距，防止贴着分割线 */
}

/* 缩小头像行与下方输入框的距离 */
.el-form-item {
  margin-bottom: 22px;
}

.avatar-form-item {
  margin-bottom: 10px; /* 头像行稍微离近一点点，看起来更紧凑 */
}
</style>
