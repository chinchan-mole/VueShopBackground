<template>
<el-container class="home_container">
    <!-- 头部 -->
    <el-header>
        <div class="left">
            <img src="../assets/header.gif" alt="">
            <span>后台管理系统</span>
        </div>
        <div class="right">
            <span class="clock">当前时间： {{dateForm.hour}}:{{dateForm.minute}}:{{dateForm.second}}</span>
            <span class="adminName">当前管理员：{{administrator}}</span>
            <el-button type="info" @click.native="logout">退出</el-button>
        </div>
    </el-header>
    <el-container>
        <!-- 侧边栏 -->
        <el-aside :width="asideWidth +'px'">
            <div class="toggle_button" @click="toggleShow">
                <i :class="isCollapse ? 'el-icon-d-arrow-right' : 'el-icon-d-arrow-left'"></i>
            </div>
            <el-menu :router="true" background-color="#333744" text-color="#fff" active-text-color="#409eff" unique-opened :collapse="isCollapse" :collapse-transition="false" :default-active="defaultActive">
                <!-- 一级菜单 -->
                <el-submenu :index="item.id +''" v-bind:key="item.id" v-for="item in menus">
                    <template slot="title">
                        <i :class="icons[item.id+'']"></i>
                        <span>{{item.authName}}</span>
                    </template>
                    <!-- 二级菜单 -->
                    <el-menu-item :index="'/' + item1.path" v-bind:key="item1.id" v-for="item1 in item.children" @click.native="changeActive('/' + item1.path)">
                        <template slot="title">
                            <i class="el-icon-menu"></i>
                            <span>{{item1.authName}}</span>
                        </template>
                    </el-menu-item>
                </el-submenu>
            </el-menu>
        </el-aside>
        <!-- 主体内容 -->
        <el-main>
            <router-view></router-view>
        </el-main>
    </el-container>
</el-container>
</template>

<script>
export default {
    data () {
        var checkEmail = () => {

        }
        var checkM0bile = () => {

        }
        return {
            // 当前的管理员
            administrator: '',
            menus: [],
            // 通过访问状态对象属性的方法取得字体图标的class类名
            icons: {
                125: 'iconfont icon-user',
                103: 'iconfont icon-tijikongjian',
                101: 'iconfont icon-shangpin',
                102: 'iconfont icon-danju',
                145: 'iconfont icon-baobiao'
            },
            isCollapse: false,
            asideWidth: 200,
            defaultActive: '',
            date: new Date(),
            dateForm: {
                hour: '',
                minute: '',
                second: ''
            }
        }
    },
    created: function () {
        // 读取当前登录的用户名
        this.administrator = window.sessionStorage.getItem('username')
        this.getMenu()
        // 读取默认激活菜单
        this.defaultActive = window.sessionStorage.getItem('active')
        window.setInterval(this.timer, 1000)
    },
    methods: {
        // 当前时间
        timer () {
            const currentTime = new Date()
            this.dateForm.hour = this.dateFormat(currentTime.getHours())
            this.dateForm.minute = this.dateFormat(currentTime.getMinutes())
            this.dateForm.second = this.dateFormat(currentTime.getSeconds())
        },
        // 补零方法
        dateFormat (num) {
            return num < 10 ? '0' + num : '' + num
        },
        // 退出登录并返回登录界面，删除本站的token,使用clear会清除其他token
        logout: function () {
            window.sessionStorage.removeItem('token')
            this.$message({
                message: '退出登录成功',
                type: 'warning'
            })
            this.$router.push('/login')
        },
        // 获取左侧菜单
        getMenu: async function () {
            const {
                data: res
            } = await this.$axios.get('/menus')
            if (res.meta.status != 200) return this.$message.error(res.meta.msg)
            this.menus = res.data
        },
        // 菜单的折叠展开
        toggleShow: function () {
            this.isCollapse = !this.isCollapse
            this.asideWidth = this.asideWidth == 200 ? 64 : 200
        },
        // 更改点击后的激活菜单
        changeActive: function (index) {
            window.sessionStorage.setItem('active', index)
            this.defaultActive = index
        }
    }
}
</script>

<style lang="less" scoped>
.home_container {
    height: 100%;

    .el-header {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: #373d41;

        .left {
            display: flex;
            align-items: center;

            img {
                border-radius: 50px;
                height: 50px;
            }

            span {
                margin-left: 20px;
                font-size: 24px;
                color: #fff;
            }
        }

        .right {
            font-size: 14px;

            .adminName {
                margin-right: 20px;
                color: #fff;
            }

            .clock {
                margin-right: 20px;
                color: #fff;
            }
        }
    }
}

.el-aside {
    background-color: #333744;
    color: #eee;
    line-height: 200px;

    .toggle_button {
        height: 50px;
        line-height: 50px;
        font-size: 12px;
        text-align: center;
        background-color: #4a5064;
        color: #fff;
        cursor: pointer;
        letter-spacing: 3px;
    }

    .el-menu {
        border-right: none;
    }
}

.el-main {
    background-color: #E9EEF3;
    color: #333;
}

body>.el-container {
    height: 100%;
    margin-bottom: 40px;
}

.el-container:nth-child(5) .el-aside,
.el-container:nth-child(6) .el-aside {
    line-height: 260px;
}

.el-container:nth-child(7) .el-aside {
    line-height: 320px;
}

.iconfont {
    margin-right: 15px;
}
</style>
