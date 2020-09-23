<template>
<el-container>
    <el-header>
        <span>{{administrator}} {{time}}</span>
        <el-card shadow="always">
            <span class="weather">{{weather.city}}当前天气：{{weather.weather}} | 当前温度：{{weather.temperature}}°C | 湿度：{{weather.humidity}}% | 更新时间：{{weather.reporttime}}</span>
        </el-card>
    </el-header>
    <el-main>
        <el-calendar v-model="date"></el-calendar>
    </el-main>
</el-container>
</template>

<script>
export default {
    data() {
        return {
            administrator: '',
            time: '',
            date: new Date(),
            weather: {},
        }
    },
    created: function () {
        this.administrator = window.sessionStorage.getItem('username');
        this.changeTime();
        this.getWeather();
    },
    methods: {
        //跨域高德请求天气
        getWeather: async function () {
            let mes = window.location;
            let _baseurl = `//${mes.hostname}:${mes.port}`;
            let {
                data: res
            } = await this.$axios({
                //由于设置了baseUrl，天气跨域请求需要重写axios的baseURL
                baseURL: _baseurl,
                method: 'get',
                url: '/amap/weather/weatherInfo',
                params: {
                    key: 'c1b41b8aaed225c4bd3a83b8a1c9c08c',
                    city: '440300',
                    extensions: 'base'
                }
            });
            this.weather = res.lives[0];
        },
        changeTime() {
            if (this.date.getHours() >= 18) this.time = '晚上好~ 早点结束工作休息吧！'
            else if (this.date.getHours() >= 12) this.time = '下午好~ 来杯下午茶吧！'
            else if (this.date.getHours() >= 8) this.time = '上午好~ 又是元气满满的一天呢'
            else this.time = '凌晨了！早点休息~'
        }
    }
}
</script>

<style lang="less" scoped>
.el-header {
    background-color: rgba(255, 255, 255, 0);
    .weather {
        font-size: 14px;
    }
}
</style>
