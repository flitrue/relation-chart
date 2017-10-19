<template>
    <div>
        <Row>
            <Col span="20" style="background-color: #EEE8CD;padding-top: 10px;">
            <div id="graphChart"></div>
            </Col>
        </Row>
        <div class="legend">
            <div v-for="(item,$index) in legend">
                <span class="rect" :style="'background-color: '+item.color"></span><span class="text">{{item.name}}</span>
            </div>
            <div class="btn" @click="downImg">导出为图片</div>
        </div>
    </div>
</template>

<script type="text/javascript">
    import _ from "underscore"
    import echarts from 'echarts'

    export default {
        data(){
            return {
                legend: [
                    {"name": "赞", "color": "red"},
                    {"name": "评", "color": "blue"},
                    {"name": "转", "color": "green"},
                    {"name": "评赞", "color": "black"},
                    {"name": "转赞", "color": "orange"},
                    {"name": "评转", "color": "gray"},
                    {"name": "转评赞","color": "greenyellow"}
                    ],
                windowH: 560,
                relation: [],
                chart: {},
                graphChartOption: {
                    tooltip: {
                        formatter: '{C}',
                        show: false
                    },
                    toolbox: {
                        orient: "vertical",
                        show: false,
                        right: 45,
                        top: "28.5%",
                        feature: {
                            saveAsImage: {
                                type: 'png',
                                name: "转评赞关系图",
                                show: true,
                                title: '保存为图片',
                                pixelRatio: 2
                            }
                        }
                    },
                    color: ["red", "blue", "green", "black", "orange", "gray", "greenyellow"],
                    legend: {
                        show: false,
                        top: "20%",
                        right: "right",
                        selectedMode: false,
                        data: [
                            {"name": "赞", "icon": "rect"},
                            {"name": "评", "icon": "rect"},
                            {"name": "转", "icon": "rect"},
                            {"name": "评赞", "icon": "rect"},
                            {"name": "转赞", "icon": "rect"},
                            {"name": "评转", "icon": "rect"},
                            {
                                "name": "转评赞",
                                "icon": "image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAQCAIAAABhmjO7AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAIElEQVQ4jWNc+1+fgWaAiXZGj5o+avqo6aOmj5qOFwAAR+0B+9+OXN8AAAAASUVORK5CYII="
                            }],
                    },
                    series: [
                        {
                            name: '转评赞',
                            type: 'graph',
                            layout: 'force',
                            force: {
                                repulsion: 100,
                                gravity: 0.2,
                                layoutAnimation: true
                            },
                            focusNodeAdjacency: true,
                            draggable: true,
                            symbol: "circle",
                            symbolSize: [40, 40],
                            edgeSymbol: ['circle', 'arrow'],
                            edgeSymbolSize: [0, 5],
                            lineStyle: {
                                normal: {
                                    curveness: 0.3,
                                    width: 1,
                                    color: '#38f'
                                }
                            },
                            data: [],
                            links: [],
                            categories: [{"name": "赞"}, {"name": "评"}, {"name": "转"}, {"name": "评赞"}, {"name": "转赞"}, {"name": "评转"}, {"name": "转评赞"}],
                            roam: true,
                            label: {
                                normal: {
                                    show: true,
                                    position: 'inside',
                                    textStyle: {
                                        color: '#2F4554',
                                        fontSize: 9
                                    }
                                }

                            },
                            edgeLabel: {
                                normal: {
                                    show: false,
                                    textStyle: {
                                        fontSize: 9
                                    },
                                    formatter: "{c}"
                                }
                            }
                        }
                    ]
                }
            }
        },
        methods: {
            drawChart(){
                this.chart = echarts.init(document.getElementById('graphChart'));
                this.chart.showLoading();
                this.chart.setOption(this.graphChartOption);
                this.chart.hideLoading();
            },
            getData(){
//                Api.relation().then((resp)=>{
//                    console.log(resp);
//                });
                this.windowH = window.screen.height - 80;
                this.$http.get("/static/fb_flg.txt").then((resp) => {
                    console.log(resp)
                    this.relation = resp.data;
                    let data = _.map(this.relation.datas, (item) => {
                        item.name = item.uName;
                        item.id = item.uid;
                        item.itemStyle = {
                            normal: {
                                color: "#CA8622"
                            }
                        };
                        return item;
                    });
                    // 1  2  3  12  13   23   123
                    // 赞 评 转 评赞 转赞  评转  转评赞
                    let links = [], colors = ["red", "blue", "green", "black", "orange", "gray", "greenyellow"];
                    let arr = [];
                    _.map(this.relation.l, (itemL) => {
                        let obj = {
                            value: "",
                            source: "",
                            target: "",
                            lineStyle: {
                                normal: {
                                    color: ""
                                }
                            }
                        };
                        obj.value = "赞";
                        obj.source = itemL.src.toString();
                        obj.target = itemL.dst.toString();
                        obj.lineStyle.normal.color = colors[0];
                        _.map(this.relation.c, (itemC) => {
                            if (_.isEqual(itemL, itemC)) {
                                obj.value = "评赞";
                                obj.lineStyle.normal.color = colors[3];
                                _.map(this.relation.s, (itemS) => {
                                    if (_.isEqual(itemS, itemC)) {
                                        obj.value = "转评赞";
                                        obj.lineStyle.normal.color = colors[6]
                                    }
                                })
                            } else {
                                _.map(this.relation.s, (itemS) => {
                                    if (_.isEqual(itemL, itemS)) {
                                        obj.value = "转赞";
                                        obj.lineStyle.normal.color = colors[4]
                                    }
                                })
                            }
                        })
                        arr.push(obj);
                    });
                    _.map(this.relation.c, (itemC) => {
                        let obj = {
                            name: "",
                            source: "",
                            target: "",
                            lineStyle: {
                                normal: {
                                    color: ""
                                }
                            }
                        };
                        obj.value = "评";
                        obj.source = itemC.src.toString();
                        obj.target = itemC.dst.toString();
                        obj.lineStyle.normal.color = colors[1];
                        _.map(this.relation.s, (itemS) => {
                            if (_.isEqual(itemS, itemC)) {
                                obj.value = "转评";
                                obj.lineStyle.normal.color = colors[5];
                                _.map(this.relation.l, (itemL) => {
                                    if (_.isEqual(itemL, itemS)) {
                                        obj.value = "转评赞";
                                        obj.lineStyle.normal.color = colors[6];
                                    }
                                });
                            } else {
                                _.map(this.relation.l, (itemL) => {
                                    if (_.isEqual(itemL, itemC)) {
                                        obj.value = "评赞";
                                        obj.lineStyle.normal.color = colors[3];
                                    }
                                });
                            }

                        });
                        arr.push(obj);
                    });
                    _.map(this.relation.s, (itemS) => {
                        let obj = {
                            name: "",
                            source: "",
                            target: "",
                            lineStyle: {
                                normal: {
                                    color: ""
                                }
                            }
                        };
                        obj.value = "转";
                        obj.source = itemS.src.toString();
                        obj.target = itemS.dst.toString();
                        obj.lineStyle.normal.color = colors[2];
                        _.map(this.relation.c, (itemC) => {
                            if (_.isEqual(itemS, itemC)) {
                                obj.value = "转评";
                                obj.lineStyle.normal.color = colors[5];
                                _.map(this.relation.l, (itemL) => {
                                    if (_.isEqual(itemL, itemC)) {
                                        obj.value = "转评赞";
                                        obj.lineStyle.normal.color = colors[6];
                                    }
                                });
                            } else {
                                _.map(this.relation.l, (itemL) => {
                                    if (_.isEqual(itemL, itemS)) {
                                        obj.value = "转赞";
                                        obj.lineStyle.normal.color = colors[4];
                                    }
                                })
                            }
                        });
                        arr.push(obj);
                    });

                    this.graphChartOption.series[0].data = data;
                    this.graphChartOption.series[0].links = arr;
                    console.log("flitrue", this.graphChartOption);
                    this.drawChart();
                });

            },
            downImg(){
                let img = this.chart.getDataURL({
                    backgroundColor: "white",
                    pixelRatio: 2,
                    type: "png"
                });
                console.log("img", img);
                function down(src) {
                    let $a = document.createElement('a');
                    $a.setAttribute("href", src);
                    $a.setAttribute("download", "转评赞关系图");
                    let evObj = document.createEvent('MouseEvents');
                    evObj.initMouseEvent( 'click', true, true, window, 0, 0, 0, 0, 0, false, false, true, false, 0, null);
                    $a.dispatchEvent(evObj);
                }
                down(img);
            }
        },
        mounted(){
            this.getData();
            document.body.scrollTop = "700"
        }
    }

</script>

<style scoped>
    #graphChart {
        height: 1500px;
    }

    .legend {
        position: fixed;
        right: 10px;
        top: 10px;
        font-size: 9px;
        z-index: 999;
    }

    .rect {
        width: 25px;
        height: 15px;
        display: inline-block;
        margin-bottom: 8px;
    }

    .text {
        position: relative;
        top: -11px;
        margin-left: 5px;
    }
    .btn{
        background-color: transparent;
        border: 1px solid black;
        padding: 5px;
        border-radius: 5px;
        cursor: pointer;
    }
    .btn:hover{
        background-color: rgba(255,255,255,0.3);
    }

</style>