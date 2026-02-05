<template>
  <el-form ref="form" :model="user" :rules="rules" label-width="200px">
    <el-form-item label="旧パスワード" prop="oldPassword">
      <el-input
        v-model="user.oldPassword"
        placeholder="旧パスワードを入力してください"
        type="password"
        show-password
      />
    </el-form-item>

    <el-form-item label="新パスワード" prop="newPassword">
      <el-input
        v-model="user.newPassword"
        placeholder="新パスワードを入力してください"
        type="password"
        show-password
      />
    </el-form-item>

    <el-form-item label="新しいパスワード（確認）" prop="confirmPassword">
      <el-input
        v-model="user.confirmPassword"
        placeholder="新しいパスワード（確認）を入力してください"
        type="password"
        show-password
      />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" size="mini" @click="submit">保存</el-button>
      <el-button type="danger" size="mini" @click="close">キャンセル</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { updateUserPwd } from "@/api/system/user";

export default {
  data() {
    const equalToPassword = (rule, value, callback) => {
      if (this.user.newPassword !== value) {
        callback(new Error("入力したパスワードが一致しません"));
      } else {
        callback();
      }
    };
    return {
      user: {
        oldPassword: undefined,
        newPassword: undefined,
        confirmPassword: undefined,
      },
      // 表单校验
      rules: {
        oldPassword: [
          {
            required: true,
            message: "旧パスワードを入力してください",
            trigger: "blur",
          },
        ],
        newPassword: [
          {
            required: true,
            message: "新パスワードを入力してください",
            trigger: "blur",
          },
          {
            min: 6,
            max: 20,
            message: "パスワードは6～20文字で入力してください",
            trigger: "blur",
          },
          {
            pattern: /^[^<>"'|\\]+$/,
            message: "使用できない文字が含まれています：< > \" ' \\ |",
            trigger: "blur",
          },
        ],
        confirmPassword: [
          {
            required: true,
            message: "新しいパスワード（確認）を入力してください",
            trigger: "blur",
          },
          { required: true, validator: equalToPassword, trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    submit() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          updateUserPwd(this.user.oldPassword, this.user.newPassword).then(
            (response) => {
              this.$modal.msgSuccess("更新成功");
            }
          );
        }
      });
    },
    close() {
      this.$tab.closePage();
    },
  },
};
</script>
