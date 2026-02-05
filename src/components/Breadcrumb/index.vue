<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.path">
        <span
          v-if="item.redirect === 'noRedirect' || index == levelList.length - 1"
          class="no-redirect"
          >{{ item.meta.title }}</span
        >
        <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script>
export default {
  data() {
    return {
      levelList: null,
    };
  },
  watch: {
    $route(route) {
      // if you go to the redirect page, do not update the breadcrumbs
      if (route.path.startsWith("/redirect/")) {
        return;
      }
      this.getBreadcrumb();
    },
  },
  created() {
    this.getBreadcrumb();
  },
  methods: {
getBreadcrumb() {
  // 1. 获取当前匹配的所有层级
  let matched = this.$route.matched.filter(item => item.meta && item.meta.title)
  
  // 2. 获取当前角色
  const roles = this.$store.getters.roles

  // 3. 【核心逻辑】如果不是 admin，强制过滤掉所有带有“首页”特征的节点
  if (roles && !roles.includes('admin')) {
    matched = matched.filter(item => {
      // 检查路径、名称或标题是否包含首页关键词
      const isIndex = item.path === '/index' || 
                      item.path === '' || 
                      item.name === 'Index' || 
                      item.meta.title === 'トップページ';
      return !isIndex;
    })
  }

  // 4. 过滤掉不显示面包屑的配置
  this.levelList = matched.filter(item => item.meta && item.meta.title && item.meta.breadcrumb !== false)
},
    findPathNum(str, char = "/") {
      let index = str.indexOf(char);
      let num = 0;
      while (index !== -1) {
        num++;
        index = str.indexOf(char, index + 1);
      }
      return num;
    },
    getMatched(pathList, routeList, matched) {
      let data = routeList.find(
        (item) =>
          item.path == pathList[0] ||
          (item.name += "").toLowerCase() == pathList[0]
      );
      if (data) {
        matched.push(data);
        if (data.children && pathList.length) {
          pathList.shift();
          this.getMatched(pathList, data.children, matched);
        }
      }
    },
    isDashboard(route) {
      const name = route && route.name;
      if (!name) {
        return false;
      }
      return name.trim() === "Index";
    },
    handleLink(item) {
      const { redirect, path } = item;
      if (redirect) {
        this.$router.push(redirect);
        return;
      }
      this.$router.push(path);
    },
  },
};
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;
  .no-redirect {
    color: #97a8be;
    cursor: text;
  }
}
</style>
